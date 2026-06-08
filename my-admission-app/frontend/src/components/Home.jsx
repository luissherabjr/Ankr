// src/components/Home.jsx
import { useState, useMemo } from 'react';

const PROG_THRESHOLDS = [6.3,8.0,8.5,9.2,9.3,9.5,9.9,9.9,10.1,10.3,10.4,10.7,10.9,10.9,11.0];

const Home = ({ userData }) => {
  const [checkinVisible, setCheckinVisible] = useState(true);
  const [checkinStep, setCheckinStep] = useState(1);
  const [checkinAnswers, setCheckinAnswers] = useState({});

  // Derived values
  const userGpa = useMemo(() => {
    const grades = userData?.grades || {};
    const vals = Object.values(grades).filter(v => v !== '' && !isNaN(parseFloat(v)));
    if (vals.length === 0) return null;
    const avg = vals.reduce((a, b) => a + parseFloat(b), 0) / vals.length;
    return parseFloat(avg.toFixed(1));
  }, [userData?.grades]);

  const targetProgrammes = userData?.selectedProgrammes || [];
  const topTarget = targetProgrammes[0];
  const reachCount = useMemo(() => {
    if (!userGpa) return 0;
    return targetProgrammes.filter(p => p.cutoff !== null && p.cutoff <= userGpa).length;
  }, [targetProgrammes, userGpa]);

  const roadmapProgress = useMemo(() => {
    if (!userGpa || !topTarget?.cutoff) return 0;
    const progress = (userGpa / topTarget.cutoff) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
  }, [userGpa, topTarget]);

  const subjectsCount = Object.keys(userData?.grades || {}).length;

  const selectCheckin = (step, idx) => setCheckinAnswers(prev => ({ ...prev, [step]: idx }));
  const nextCheckinStep = () => setCheckinStep(s => s + 1);
  const dismissCheckin = () => setCheckinVisible(false);
  const doneCheckin = () => setCheckinVisible(false);

  return (
    <div className="bg-cream min-h-screen pb-20 md:pb-0">
      {/* Page header */}
      <div className="page-header">
        <div className="home-greeting">Good morning.</div>
        {!checkinVisible && (
          <button className="checkin-nudge font-mono" onClick={() => setCheckinVisible(true)}>
            Weekly check-in ↓
          </button>
        )}
      </div>

      {/* Able vs Want position strip */}
      <div className="home-position">
        <div>
          <span className="home-pos-label">What you want</span>
          <div className="home-pos-val">{userData?.workType || 'People & ideas'}</div>
         <div className="home-pos-sub">
            {topTarget
              ? `${topTarget.name?.split(' ')[0]} · ${topTarget.uni?.split(' ')[0] || ''}`
              : 'Add target'}
          </div>
        </div>
        <div className="home-pos-divider"></div>
        <div>
          <span className="home-pos-label">What you can reach</span>
          <div className="home-pos-val">{reachCount} programme{reachCount !== 1 ? 's' : ''}</div>
          <div className="home-pos-sub">
            {topTarget ? `Gap to ${topTarget.name?.split(' ')[0]}: ${(topTarget.cutoff - userGpa).toFixed(1)} pts` : 'Add grades & target'}
          </div>
        </div>
      </div>

      {/* Weekly check-in card */}
      {checkinVisible && (
        <div className="checkin-card" id="checkin-card">
          <button className="checkin-dismiss" onClick={dismissCheckin}>×</button>
          <span className="checkin-label">Weekly check-in</span>
          <div id="checkin-body">
            {checkinStep === 1 && (
              <div id="checkin-step-1">
                <p className="checkin-q">How clear does your direction feel right now?</p>
                <div className="checkin-scale">
                  {['😶','😕','😐','🙂','😌'].map((emoji, idx) => (
                    <button key={idx} className="checkin-opt" onClick={() => selectCheckin(1, idx)}>{emoji}</button>
                  ))}
                </div>
                <button className="checkin-next" onClick={nextCheckinStep}>Next →</button>
              </div>
            )}
            {checkinStep === 2 && (
              <div id="checkin-step-2">
                <p className="checkin-q">How's your energy for school this week?</p>
                <div className="checkin-scale">
                  {['😶','😕','😐','🙂','😌'].map((emoji, idx) => (
                    <button key={idx} className="checkin-opt" onClick={() => selectCheckin(2, idx)}>{emoji}</button>
                  ))}
                </div>
                <button className="checkin-next" onClick={nextCheckinStep}>Next →</button>
              </div>
            )}
            {checkinStep === 3 && (
              <div id="checkin-step-3">
                <p className="checkin-q">Do you feel like you belong where you're headed?</p>
                <div className="checkin-scale">
                  {['😶','😕','😐','🙂','😌'].map((emoji, idx) => (
                    <button key={idx} className="checkin-opt" onClick={() => selectCheckin(3, idx)}>{emoji}</button>
                  ))}
                </div>
                <button className="checkin-next ready" onClick={doneCheckin}>Done ✓</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* This week focus row */}
      <div className="home-focus">
        <span className="home-focus-hd">This week</span>
        <div className="home-focus-row">
          <div style={{flex:1}}>
            <div className="home-focus-task">Book open day at KU</div>
            <div className="home-focus-sub">Application · Closes Friday</div>
          </div>
          <span className="home-focus-due">3 days</span>
        </div>
      </div>

      {/* Bento card grid */}
      <div className="home-card-grid">
        {/* Roadmap featured card */}
        <div className="home-card home-card--clay home-card--featured" onClick={() => window.location.hash = '#roadmap'}>
          <span className="home-card-num">Roadmap</span>
          <div className="home-card-body">
            <div>
              <div className="home-card-stat">{roadmapProgress}%</div>
              <div className="home-card-cat">To your goal</div>
              <div className="home-card-meta">Next: {topTarget ? `Improve to ${topTarget.cutoff}` : 'Select a target'}</div>
            </div>
            <div className="home-card-vis">
              <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
                <circle cx="29" cy="29" r="22" stroke="#E4E4E4" strokeWidth="4"/>
                <circle cx="29" cy="29" r="22" stroke="#537CDE" strokeWidth="4"
                        strokeDasharray={`${(roadmapProgress/100)*138} 138`} strokeLinecap="round"
                        transform="rotate(-90 29 29)"/>
                <text x="29" y="33" textAnchor="middle" fontFamily="'DM Mono',monospace" fontSize="9" fill="#537CDE" fontWeight="600">{roadmapProgress}%</text>
              </svg>
            </div>
          </div>
          <div className="home-card-bar"><div className="home-card-bar-fill" style={{width:`${roadmapProgress}%`}}></div></div>
        </div>

        {/* Mentor card */}
        <div className="home-card home-card--dark" onClick={() => window.location.hash = '#chat'}>
          <span className="home-card-num">Mentor</span>
          <div className="home-card-stat">1</div>
          <div className="home-card-cat">New message</div>
          <div className="home-card-ping"></div>
        </div>

        {/* Compass card */}
        <div className="home-card home-card--mint" onClick={() => window.location.hash = '#compass'}>
          <span className="home-card-num">Compass</span>
          <div className="home-card-stat">{reachCount}</div>
          <div className="home-card-cat">In reach</div>
          <div className="home-card-meta">{targetProgrammes.slice(0,2).map(p => p.name?.split(' ')[0]).join(' · ') || 'No targets'}</div>
        </div>

        {/* Profile slim card */}
        <div className="home-card home-card--light home-card--slim home-card--featured" onClick={() => window.location.hash = '#profile'}>
          <div className="home-card-slim-stats">
            <div className="home-card-slim-cell">
              <span className="home-card-slim-val">{userGpa !== null ? userGpa.toFixed(1) : '—'}</span>
              <span className="home-card-slim-lbl">GPA</span>
            </div>
            <div className="home-card-slim-sep"></div>
            <div className="home-card-slim-cell">
              <span className="home-card-slim-val">14</span>
              <span className="home-card-slim-lbl">Day streak</span>
            </div>
            <div className="home-card-slim-sep"></div>
            <div className="home-card-slim-cell">
              <span className="home-card-slim-val">{subjectsCount}</span>
              <span className="home-card-slim-lbl">Subjects</span>
            </div>
          </div>
          <span className="home-card-slim-arrow">Profile ↗</span>
        </div>
      </div>
    </div>
  );
};

export default Home;