// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Get programme recommendations (optional – keep if needed)
export async function getRecommendations(query, k = 10) {
  const response = await fetch(`${API_URL}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, k, graph_weight: 0.6 }),
  });
  if (!response.ok) throw new Error("Recommendation request failed");
  return await response.json();
}

// Save a student profile
export async function saveStudentProfile(profile) {
  const response = await fetch(`${API_URL}/api/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error("Saving profile failed");
  return await response.json();
}

// Fetch all programmes from the backend
export async function fetchProgrammes() {
  const response = await fetch(`${API_URL}/api/programmes`);
  if (!response.ok) throw new Error("Fetching programmes failed");
  return await response.json();
}

// Alias for saveStudentProfile (for existing Onboarding code)
export const saveOnboardingData = saveStudentProfile;

export default { getRecommendations, saveStudentProfile, fetchProgrammes, saveOnboardingData };

// Fetch a student profile by ID (or email)
export async function fetchStudentProfile(studentId) {
  const response = await fetch(`${API_URL}/api/students/${encodeURIComponent(studentId)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to fetch student profile");
  return await response.json();
}

// Fetch all student profiles (optionally by stage)
export async function fetchAllStudents(stage = null) {
  const url = stage ? `${API_URL}/api/students?stage=${encodeURIComponent(stage)}` : `${API_URL}/api/students`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch students');
  return await response.json();
}