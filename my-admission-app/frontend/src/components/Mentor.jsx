// src/components/Mentor.jsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { useProgrammes } from './context/ProgrammesContext';

const aiReplies = [
  "That's interesting — most students I talk to don't notice that pattern until much later. What do you think it means for where you're heading?",
  "You've mentioned uncertainty twice now. That's not a problem — it's actually useful data. What would make things feel less uncertain?",
  "Matematik B is required for Psychology at every university in Denmark. That's the one subject that's blocking the most paths right now — worth treating it as a priority.",
  "The open day at KU is coming up fast. Have you thought about what questions you'd actually want answered while you're there?",
  "KU Psychology cuts off at 11.0. SDU is 9.9, AAU is 10.1. The question isn't just 'can I get in' — it's which programme actually fits what you want from the degree.",
  "Let's think about your personal statement early. Not to write it now — just to notice what you'd actually want to say. What comes up?",
  "You mentioned psychology three times in your reflection, but you didn't put it as your first choice. What's the hesitation?",
  "You're 2.5 points below KU's cutoff right now. That's a lot — but you have two years of gymnasium left. The students who close that gap usually change one specific habit, not everything at once. What's the one subject you know you're underperforming in?"
];

const Mentor = ({ userData, onOpenExploration, onAddToRoadmap }) => {
  const { getProgrammeById } = useProgrammes();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [contextExpanded, setContextExpanded] = useState(false);
  const [proposal, setProposal] = useState(null);
  const replyIndex = useRef(0);
  const messagesEndRef = useRef(null);

  const targetProg = userData?.selectedProgrammes?.[0];
  const targetFull = targetProg?.id ? getProgrammeById(targetProg.id) : null;
  const userGpa = useMemo(() => {
    const grades = userData?.grades || {};
    const vals = Object.values(grades).filter(v => v !== '' && !isNaN(parseFloat(v)));
    return vals.length ? parseFloat((vals.reduce((a,b)=>a+parseFloat(b),0)/vals.length).toFixed(1)) : null;
  }, [userData?.grades]);

  useEffect(() => {
    if (messages.length === 0 && userData?.name) {
      setMessages([{ role: 'ai', text: `Hey ${userData.name}. You've told me you're interested in ${userData?.workType || 'something'} — and you've mentioned ${targetProg?.name || 'a target programme'}. What's on your mind today?`, time: getTime() }]);
    } else if (messages.length === 0) {
      setMessages([{ role: 'ai', text: 'What’s on your mind today?', time: getTime() }]);
    }
  }, [userData]);

  useEffect(() => {
    if (!proposal && targetProg) {
      const uniShort = targetProg.uni?.split(' ')[0] || '';
      setProposal({ id: 'chat-proposal-1', text: `Attend ${targetProg.name?.split(' ')[0]} open day at ${uniShort}`, when: 'This week · Application' });
    }
  }, [targetProg, proposal]);

  const getTime = () => new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input, time: getTime() }]);
    setInput('');
    setTimeout(() => {
      const reply = aiReplies[replyIndex.current % aiReplies.length];
      replyIndex.current++;
      setMessages(prev => [...prev, { role: 'ai', text: reply, time: getTime() }]);
    }, 900);
  };
  const confirmProposal = () => { onAddToRoadmap?.(proposal.text, 'This week'); setProposal(null); };
  const editProposal = () => { /* toggle contentEditable or open modal */ };
  const declineProposal = () => { setProposal(null); };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="page-header"><div className="page-title font-serif">Mentor</div></div>

      <div className="explore-entry" onClick={onOpenExploration}>
        <div className="explore-entry-icon">◎</div>
        <div className="explore-entry-body">
          <span className="explore-entry-label">New session</span>
          <div className="explore-entry-title">Self-Exploration</div>
          <span className="explore-entry-desc">7 themes · ~15 min · figure out what actually fits you</span>
        </div>
        <span className="explore-entry-cta">Begin →</span>
      </div>

      <div className="chat-layout">
        <div className="context-strip">
          <button className="context-toggle" onClick={() => setContextExpanded(!contextExpanded)}>
            <span className="font-mono">{targetProg ? `${targetProg.name} · ${targetProg.uni} · cutoff ${targetProg.cutoff ?? '—'} · your GPA ${userGpa ?? '—'}` : 'No target set'}</span>
            <span className="context-chevron" style={{transform: contextExpanded ? 'rotate(180deg)' : 'none'}}>↓</span>
          </button>
          {contextExpanded && (
            <div className="context-expanded">
              <div className="context-row"><span className="font-mono">Target:</span> {targetProg?.name || '—'} · {targetProg?.uni || '—'}</div>
              <div className="context-row"><span className="font-mono">Q1 cutoff:</span> {targetProg?.cutoff ?? '—'} · Your GPA: {userGpa ?? '—'}</div>
              <div className="context-row"><span className="font-mono">Req. subjects:</span> {targetFull?.eligibility_gatekeeper?.mandatory_subjects?.map(s=>`${s.subject} (${s.level})`).join(', ') || 'None'}</div>
              <div className="context-row"><span className="font-mono">Next:</span> {proposal?.text || 'Set a target to see suggestions'}</div>
            </div>
          )}
        </div>

        <div className="chat-messages" id="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message message--${msg.role}`}>
              <div className="message-bubble"><p className={msg.role === 'ai' ? 'font-serif' : ''}>{msg.text}</p></div>
              <span className="message-time font-mono">{msg.time}</span>
            </div>
          ))}
          {proposal && (
            <div className="proposal-card-v2" id="chat-proposal-1">
              <span className="proposal-v2-badge">Roadmap change</span>
              <div className="proposal-v2-type font-mono">Add milestone · This week</div>
              <div className="proposal-v2-text">{proposal.text}</div>
              <div className="proposal-v2-when font-mono">{proposal.when}</div>
              <div className="proposal-v2-actions">
                <button className="proposal-v2-confirm" onClick={confirmProposal}>Confirm</button>
                <button className="proposal-v2-edit" onClick={editProposal}>Edit</button>
                <button className="proposal-v2-decline" onClick={declineProposal}>Decline</button>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-composer">
          <div className="composer-inner">
            <textarea className="composer-input" id="chat-input" placeholder="Talk it through..." rows="1" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} />
            <button className="composer-send" onClick={sendMessage}>→</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mentor;