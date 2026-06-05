import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from ai_engine.graph_knn import GraphKNNEngine
from ai_engine.content_engine import ContentEngine

app = FastAPI(title="Admission AI Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UNI_DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "ug_educations.json")
STUDENT_DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "test_students.json")
CACHE_DIR = os.path.join(os.path.dirname(__file__), "ai_engine", "model_cache")

graph_engine = None
content_engine = None

@app.on_event("startup")
def startup_event():
    global graph_engine, content_engine
    print("Booting AI Recommendation Engines into memory...")
    graph_engine = GraphKNNEngine(STUDENT_DATA_PATH, UNI_DATA_PATH, CACHE_DIR)
    content_engine = ContentEngine(UNI_DATA_PATH, CACHE_DIR)
    print("Both engines loaded.")

class StudentProfileInput(BaseModel):
    student_id: str
    interests: str
    accepted_or_saved_programs: List[str]
    preferred_sports: Optional[List[str]] = None
    lifestyle_notes: Optional[str] = None

class QueryInput(BaseModel):
    query: str
    k: Optional[int] = 3
    graph_weight: Optional[float] = 0.6  # tunable blend

@app.get("/")
def read_root():
    return {
        "status": "Backend is running!",
        "graph_engine_loaded": graph_engine is not None,
        "content_engine_loaded": content_engine is not None,
    }

@app.post("/api/students")
def add_or_update_student_profile(profile: StudentProfileInput):
    global graph_engine
    try:
        with open(STUDENT_DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        data = {"student_profiles": []}

    profiles = data.get("student_profiles", [])
    existing_index = next((i for i, p in enumerate(profiles) if p["student_id"] == profile.student_id), None)
    new_profile_dict = profile.dict(exclude_none=True)

    if existing_index is not None:
        profiles[existing_index] = new_profile_dict
        message = f"Profile {profile.student_id} updated successfully."
    else:
        profiles.append(new_profile_dict)
        message = f"Profile {profile.student_id} created and integrated into graph."

    data["student_profiles"] = profiles
    with open(STUDENT_DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Only graph engine needs reload — content engine is student-independent
    graph_engine.load_data_and_build_graph(STUDENT_DATA_PATH, UNI_DATA_PATH)

    return {"status": "success", "message": message}

@app.post("/api/recommend")
def get_recommendations(input_data: QueryInput):
    if not graph_engine or not content_engine:
        raise HTTPException(status_code=503, detail="AI engines are offline.")

    graph_scores = graph_engine.get_recommendations(input_data.query, k=input_data.k)
    content_scores = content_engine.get_content_scores(input_data.query)

    gw = input_data.graph_weight
    cw = 1.0 - gw

    all_ids = set(graph_scores) | set(content_scores)
    merged = {}
    for uni_id in all_ids:
        g = graph_scores.get(uni_id, 0.0)
        c = content_scores.get(uni_id, 0.0)
        merged[uni_id] = (gw * g) + (cw * c)

    top_k = sorted(merged.items(), key=lambda x: x[1], reverse=True)[:input_data.k]

    return {
        "query": input_data.query,
        "recommendations": [
            {"program_id": pid, "score": round(score, 4)}
            for pid, score in top_k
        ]
    }