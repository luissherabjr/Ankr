// src/components/Compass.jsx
import { useState, useEffect, useMemo } from 'react';
import { getRecommendations } from '../services/api';
import { useProgrammes } from './context/ProgrammesContext';

const Compass = ({ userData }) => {
  const [activeTab, setActiveTab] = useState('outcomes');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const { getProgrammeById } = useProgrammes();

  const userGpa = useMemo(() => {
    const grades = userData?.grades || {};
    const vals = Object.values(grades).filter(v => v !== '' && !isNaN(parseFloat(v)));
    return vals.length ? parseFloat((vals.reduce((a,b)=>a+parseFloat(b),0)/vals.length).toFixed(1)) : null;
  }, [userData?.grades]);

  const targetProg = userData?.selectedProgrammes?.[0];
  const targetFull = targetProg?.id ? getProgrammeById(targetProg.id) : null;
  const gap = (userGpa && targetProg?.cutoff) ? (targetProg.cutoff - userGpa).toFixed(1) : null;
  const reachCount = userData?.selectedProgrammes?.filter(p => p.cutoff !== null && p.cutoff <= (userGpa || 0)).length || 0;

  useEffect(() => {
    if (userData?.reflection) {
      getRecommendations(userData.reflection, 10).then(res => {
        const recs = res.recommendations || [];
        setRecommendations(recs.map(rec => ({ ...rec, ...getProgrammeById(rec.program_id) })));
      }).catch(console.error);
    }
  }, [userData?.reflection, getProgrammeById]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await getRecommendations(query, 10);
      const recs = res.recommendations || [];
      setRecommendations(recs.map(rec => ({ ...rec, ...getProgrammeById(rec.program_id) })));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // Outcomes data – from programme's ai_semantic_data if available
  const outcomes = targetFull?.ai_semantic_data?.career_outcomes || ['Clinical Psychologist', 'HR / Org Psychology', 'Research / Academia', 'Consulting', 'Other'];
  const outcomePercentages = [34,22,18,14,12]; // placeholder

  // Requirements data
  const cutoffs = targetFull?.eligibility_gatekeeper?.gpa_by_institution?.map(inst => ({ university: inst.university, cutoff: inst.quota_1_gpa_2025 })) || [];
  const mandatory = targetFull?.eligibility_gatekeeper?.mandatory_subjects?.map(s => `${s.subject} (${s.level})`).join(' · ') || 'Dansk A · Engelsk B · Matematik B · Samfundsfag B · Historie B';

  return (
    <div className="bg-cream min-h-screen">
      <div className="page-header">
        <div className="page-title font-serif">Career Compass</div>
        <img src="/Photos/Compass.svg" className="compass-hd-illo" alt="" />
      </div>

      <div className="compass-insight-row">
        <div className="compass-insight-cell compass-insight-cell--clay">
          <span className="compass-insight-lbl">Target</span>
          <span className="compass-insight-val">{targetProg ? `${targetProg.name?.split(' ')[0]} · ${targetProg.uni?.split(' ')[0]}` : 'Not set'}</span>
        </div>
        <div className="compass-insight-cell">
          <span className="compass-insight-lbl">Gap to go</span>
          <span className="compass-insight-val">{gap ? (gap >= 0 ? `+${gap}` : gap) : '—'} pts</span>
        </div>
        <div className="compass-insight-cell compass-insight-cell--mint">
          <span className="compass-insight-lbl">In reach</span>
          <span className="compass-insight-val">{reachCount} programme{reachCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="compass-tabs">
        <button className={`compass-tab ${activeTab === 'outcomes' ? 'active' : ''}`} onClick={() => setActiveTab('outcomes')}>Outcomes</button>
        <button className={`compass-tab ${activeTab === 'requirements' ? 'active' : ''}`} onClick={() => setActiveTab('requirements')}>Requirements</button>
        <button className={`compass-tab ${activeTab === 'alumni' ? 'active' : ''}`} onClick={() => setActiveTab('alumni')}>Alumni</button>
        <button className={`compass-tab ${activeTab === 'aipicks' ? 'active' : ''}`} onClick={() => setActiveTab('aipicks')}>AI Picks</button>
      </div>

      {activeTab === 'outcomes' && (
        <div className="compass-panel active">
          <div className="uni-filter">
            {['KU','AU','SDU','RUC','CBS'].map(u => <span key={u} className="uni-chip" onClick={()=>{}}>{u}</span>)}
          </div>
          <div className="zone-label font-mono" style={{marginBottom:'12px'}}>{targetProg?.name || 'Programme'} graduates</div>
          <div className="compass-card">
            <div className="bar-chart">
              {outcomes.map((label, idx) => (
                <div key={label} className="bar-row">
                  <span className="bar-label">{label}</span>
                  <div className="bar-track"><div className="bar-fill" style={{width:`${outcomePercentages[idx]}%`}}></div></div>
                  <span className="bar-pct font-mono">{outcomePercentages[idx]}%</span>
                </div>
              ))}
            </div>
            <div className="compass-stat font-mono">Median time to first job: 4.2 months</div>
          </div>
        </div>
      )}

      {activeTab === 'requirements' && (
        <div className="compass-panel">
          <div className="zone-label font-mono" style={{marginBottom:'12px'}}>Admission cutoffs (Q1 2025)</div>
          <div className="compass-card" style={{padding:0,overflow:'hidden'}}>
            <table className="req-table">
              <thead><tr><th>Programme</th><th>Cutoff</th><th>Yours</th><th>Gap</th><th>Status</th></tr></thead>
              <tbody>
                {cutoffs.length ? cutoffs.map(inst => {
                  const cutoffNum = typeof inst.cutoff === 'number' ? inst.cutoff : parseFloat(inst.cutoff);
                  const diff = (userGpa && !isNaN(cutoffNum)) ? (cutoffNum - userGpa).toFixed(1) : null;
                  let status = 'Out of range';
                  let statusClass = 'status-outrange';
                  if (diff && diff <= 0) { status = 'In range'; statusClass = 'status-inrange'; }
                  else if (diff && diff <= 1.5) { status = 'Borderline'; statusClass = 'status-borderline'; }
                  return (
                    <tr key={inst.university}>
                      <td>{targetProg?.name} · {inst.university}</td>
                      <td>{cutoffNum}</td>
                      <td>{userGpa ?? '—'}</td>
                      <td>{diff ? (diff >=0 ? `+${diff}` : diff) : '—'}</td>
                      <td><span className={`status-dot ${statusClass}`}></span>{status}</td>
                    </tr>
                  );
                }) : <tr><td colSpan="5" className="text-center">No cutoff data available</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="compass-stat font-mono" style={{borderTop:'none',paddingTop:'10px'}}>Req: {mandatory}</div>
        </div>
      )}

      {activeTab === 'alumni' && (
        <div className="compass-panel">
          <div className="alumni-card alumni-card--relevant">
            <div className="alumni-relevant-tag font-mono">Relevant to you</div>
            <div className="alumni-header"><div className="alumni-avatar">M</div><div><div className="alumni-role">Clinical Psychologist</div><div className="alumni-year font-mono">Graduated 2021 · KU Psychology</div></div></div>
            <p className="alumni-quote font-serif">"I had no idea what I actually wanted until I started talking to people already doing it."</p>
            <div className="alumni-tags"><span className="alumni-tag">BSc Psychology</span><span className="alumni-tag">Clinical</span><span className="alumni-tag">KU</span></div>
          </div>
          <div className="alumni-card"><div className="alumni-header"><div className="alumni-avatar">S</div><div><div className="alumni-role">Organisational Psychologist</div><div className="alumni-year font-mono">Graduated 2019 · KU Psychology</div></div></div><p className="alumni-quote font-serif">"People underestimate how quantitative the bachelor's is."</p><div className="alumni-tags"><span className="alumni-tag">BSc Psychology</span><span className="alumni-tag">HR</span><span className="alumni-tag">KU</span></div></div>
          <div className="alumni-card"><div className="alumni-header"><div className="alumni-avatar">L</div><div><div className="alumni-role">Researcher, Aarhus University</div><div className="alumni-year font-mono">Graduated 2020 · KU Psychology</div></div></div><p className="alumni-quote font-serif">"The gap year before I applied was the best decision I made."</p><div className="alumni-tags"><span className="alumni-tag">Research</span><span className="alumni-tag">Academia</span><span className="alumni-tag">KU</span></div></div>
        </div>
      )}

      {activeTab === 'aipicks' && (
        <div className="compass-panel">
          <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
            <input type="text" placeholder="Describe what you're looking for..." className="flex-1 border border-ink/20 rounded-xl px-4 py-2" value={query} onChange={e => setQuery(e.target.value)} />
            <button className="bg-ink text-white px-4 py-2 rounded-xl" onClick={handleSearch}>Find matches</button>
          </div>
          {loading && <div className="text-center py-8">Loading recommendations...</div>}
          {!loading && recommendations.length === 0 && <div className="text-center py-8 text-ink-3">Enter your interests above to see AI‑powered programme matches.</div>}
          {!loading && recommendations.length > 0 && recommendations.map(rec => (
            <div key={rec.program_id} className="bg-white border border-ink/10 rounded-xl p-4 mb-3">
              <div className="font-medium text-ink">{rec.name}</div>
              <div className="text-sm text-ink-3">{rec.uni}</div>
              <div className="mt-2 text-xs font-mono text-ink-4">Match score: {(rec.score * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Compass;