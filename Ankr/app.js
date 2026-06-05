/* ═══════════════════════════════════════════════════════════════
   ANKR  —  app.js
   Navigation, onboarding, interactions
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── State ─────────────────────────────────────────────────── */
const state = {
  currentView: 'landing',
  currentPage: 'home',
  obStep: 1,
  userName: 'Sofie',
  checkinDone: false,
};

/* ═══════════════════════════════════════════════════════════════
   VIEW ROUTING  (landing / onboarding / app)
   ═══════════════════════════════════════════════════════════════ */

function showView(id) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
    v.style.display = 'none';
  });

  const target = document.getElementById(id);
  if (!target) return;
  target.style.display = '';
  // tiny rAF so display:block settles before adding active (enables CSS transitions)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => target.classList.add('active'));
  });

  state.currentView = id;
  window.scrollTo(0, 0);

  if (id === 'onboarding') {
    initOnboarding();
  }
  if (id === 'app') {
    showPage(state.currentPage, null);
  }
}

function showCounsellor() {
  showView('app');
  setTimeout(() => showPage('dashboard', null), 80);
}

/* ═══════════════════════════════════════════════════════════════
   APP PAGES  (inner navigation within #app)
   ═══════════════════════════════════════════════════════════════ */

function showPage(id, navEl) {
  // Deactivate all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const page = document.getElementById('p-' + id);
  if (page) page.classList.add('active');

  // Update sidebar nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) {
    navEl.classList.add('active');
  } else {
    // find by matching onclick text
    document.querySelectorAll('.nav-item').forEach(n => {
      if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'" + id + "'")) {
        n.classList.add('active');
      }
    });
  }

  state.currentPage = id;
  const mainArea = document.querySelector('.main-area');
  if (mainArea) mainArea.scrollTop = 0;

  // Update mobile tab bar
  document.querySelectorAll('.m-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll(`.m-tab[data-page="${id}"]`).forEach(t => t.classList.add('active'));
}

/* ═══════════════════════════════════════════════════════════════
   GLOBAL SHEET
   ═══════════════════════════════════════════════════════════════ */

function openSheet(html) {
  const body = document.getElementById('sheet-body');
  const sheet = document.getElementById('sheet');
  if (body) body.innerHTML = html;
  if (sheet) sheet.setAttribute('aria-hidden', 'false');
  document.body.classList.add('sheet-open');
}

function closeSheet() {
  const sheet = document.getElementById('sheet');
  if (sheet) sheet.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('sheet-open');
}

/* ═══════════════════════════════════════════════════════════════
   ONBOARDING
   ═══════════════════════════════════════════════════════════════ */

const OB_STEPS = [
  { label: 'Welcome',        act: 1 },
  { label: 'Your name',      act: 1 },
  { label: 'Where you are',  act: 1 },
  { label: 'Programme',      act: 1 },
  { label: 'Aspirations',    act: 1 },
  { label: 'Barriers',       act: 1 },
  { label: 'Open question',  act: 1 },
  { label: 'Your picture',   act: 2 },
  { label: 'Data intro',     act: 2 },
  { label: 'Transcripts',    act: 2 },
  { label: 'Extracurriculars', act: 2 },
  { label: 'Test scores',    act: 2 },
  { label: 'Building…',      act: 3 },
  { label: 'Your roadmap',   act: 3 },
];

const ACT_LABELS = {
  1: 'Who you are',
  2: 'Your data',
  3: 'Your roadmap',
};

function initOnboarding() {
  buildStepSidebar();
  obGo(state.obStep);
}

function buildStepSidebar() {
  const container = document.getElementById('ob-steps');
  if (!container) return;

  let html = '';
  let lastAct = null;

  OB_STEPS.forEach((s, i) => {
    const num = i + 1;

    if (s.act !== lastAct) {
      lastAct = s.act;
      html += `<div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:rgba(250,248,244,.3);padding:var(--sp-16) var(--sp-16) var(--sp-4);font-family:'DM Mono',monospace;">${ACT_LABELS[s.act]}</div>`;
    }

    html += `
      <div class="ob-step" id="ob-step-${num}" data-step="${num}">
        <span class="ob-step-num">${num}</span>
        <span class="ob-step-title">${s.label}</span>
      </div>`;
  });

  container.innerHTML = html;
}

function updateStepSidebar(step) {
  // Act 1 should feel like a conversation, not a form.
  const stepsWrap = document.getElementById('ob-steps');
  if (stepsWrap) stepsWrap.style.display = step <= 8 ? 'none' : '';

  OB_STEPS.forEach((s, i) => {
    const num = i + 1;
    const el = document.getElementById('ob-step-' + num);
    if (!el) return;
    el.classList.remove('active', 'done');
    const numEl = el.querySelector('.ob-step-num');
    if (num < step) {
      el.classList.add('done');
      if (numEl) numEl.textContent = '✓';
    } else {
      if (numEl) numEl.textContent = num;
      if (num === step) el.classList.add('active');
    }
  });
}

function obGo(step) {
  // Bounds
  if (step < 1) step = 1;
  if (step > 14) { showView('app'); return; }

  // Hide all ob-screens
  document.querySelectorAll('.ob-screen').forEach(s => s.classList.remove('active'));

  const target = document.getElementById('ob-s' + step);
  if (target) target.classList.add('active');

  state.obStep = step;
  updateStepSidebar(step);

  // Scroll to top of right panel
  const obMain = document.querySelector('.ob-main');
  if (obMain) obMain.scrollTop = 0;

  // Step-specific side effects
  if (step === 2) {
    setTimeout(() => {
      const inp = document.getElementById('ob-name');
      if (inp) inp.focus();
    }, 100);
  }

  if (step === 7) {
    initWordCount();
  }

  if (step === 13) {
    startLoadingAnimation();
  }

  if (step === 14) {
    personaliseRoadmapHeading();
  }
}

/* ─── Chip selectors ───────────────────────────────────────── */

// Single-select (life stage)
function selectChip(el, group) {
  const parent = el.closest('.ob-chips');
  if (!parent) return;
  parent.querySelectorAll('.ob-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

// Multi-select max 3 (aspirations / barriers)
function toggleObOption(el, group) {
  const screen = el.closest('.ob-screen');
  if (!screen) return;
  const selected = screen.querySelectorAll(`.ob-option.selected[data-group="${group}"]`);

  if (el.classList.contains('selected')) {
    el.classList.remove('selected');
    el.removeAttribute('data-group');
  } else {
    if (selected.length >= 3) {
      // Shake the clicked one briefly
      el.style.transform = 'translateX(-4px)';
      setTimeout(() => el.style.transform = '', 150);
      return;
    }
    el.classList.add('selected');
    el.setAttribute('data-group', group);
  }
}

// Multi-select chips (extracurriculars)
function toggleObChip(el) {
  el.classList.toggle('selected');
}

/* ─── Word count ───────────────────────────────────────────── */

function initWordCount() {
  const textarea = document.getElementById('ob-open');
  const counter = document.getElementById('ob-word-count');
  if (!textarea || !counter) return;

  function update() {
    const words = textarea.value.trim() ? textarea.value.trim().split(/\s+/).length : 0;
    counter.textContent = words + (words === 1 ? ' word' : ' words');
  }

  textarea.removeEventListener('input', update);
  textarea.addEventListener('input', update);
  update();
}

/* ─── S13 Loading animation ────────────────────────────────── */

function startLoadingAnimation() {
  const steps = ['ls-1', 'ls-2', 'ls-3', 'ls-4'];
  const icons = { pending: '◯', active: '◌', done: '✓' };

  // Reset all steps
  steps.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('done', 'active');
    el.querySelector('.ob-ls-icon').textContent = icons.pending;
  });

  let i = 0;

  function runNext() {
    if (i >= steps.length) {
      // All done — advance to S14 after a short pause
      setTimeout(() => obGo(14), 600);
      return;
    }

    const el = document.getElementById(steps[i]);
    if (!el) { i++; runNext(); return; }

    // Mark current as active
    el.classList.add('active');
    el.querySelector('.ob-ls-icon').textContent = icons.active;

    setTimeout(() => {
      el.classList.remove('active');
      el.classList.add('done');
      el.querySelector('.ob-ls-icon').textContent = icons.done;
      i++;
      setTimeout(runNext, 250);
    }, 1100 + Math.random() * 600);
  }

  // Small initial delay so user sees the screen
  setTimeout(runNext, 800);
}

/* ─── S14 personalise heading ──────────────────────────────── */

function personaliseRoadmapHeading() {
  const nameEl = document.getElementById('ob-name');
  const heading = document.getElementById('ob-reveal-heading');
  if (!heading) return;

  const name = nameEl ? nameEl.value.trim() : '';
  state.userName = name || state.userName;

  if (state.userName) {
    heading.textContent = `Here's where you stand, ${state.userName}.`;
  } else {
    heading.textContent = 'Here\'s where you stand.';
  }
}

/* ═══════════════════════════════════════════════════════════════
   CHAT
   ═══════════════════════════════════════════════════════════════ */

const MENTOR_REPLIES = [
  "That makes sense. Can you say more about what's underneath that feeling?",
  "I noticed you've mentioned that a few times now. What do you think it means?",
  "That's worth sitting with. There's no rush to resolve it right now.",
  "Let's separate the two parts of that — what you want and what you think you should want.",
  "What would you do if you weren't worried about what other people thought?",
  "You're being harder on yourself than the evidence suggests. What's driving that?",
  "I want to check something — you said you were scared. Is that fear about the decision, or the consequences of getting it wrong?",
  "If you imagine yourself two years from now looking back, what do you hope you did?",
];

let replyIndex = 0;

function sendMsg() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const messages = document.getElementById('chat-messages');
  if (!messages) return;

  // Append user message
  const userMsg = document.createElement('div');
  userMsg.className = 'msg user';
  userMsg.style.maxWidth = '70%';
  userMsg.innerHTML = `
    <div class="avatar avatar-sm" style="background:var(--clay);">S</div>
    <div>
      <div class="msg-bubble">${escapeHtml(text)}</div>
      <div class="msg-time" style="text-align:right;">${now()}</div>
    </div>`;
  messages.appendChild(userMsg);

  input.value = '';
  input.style.height = 'auto';

  scrollChat(messages);

  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'msg';
  typing.style.maxWidth = '80%';
  typing.id = 'typing-indicator';
  typing.innerHTML = `
    <div style="width:32px;height:32px;border-radius:50%;background:var(--ink);display:grid;place-items:center;font-size:14px;flex-shrink:0;">🧭</div>
    <div class="msg-bubble" style="display:flex;align-items:center;gap:5px;padding:12px 16px;">
      <span style="display:inline-flex;gap:4px;align-items:center;">
        <span class="typing-dot" style="width:6px;height:6px;border-radius:50%;background:var(--ink-4);animation:typingBounce .9s infinite .0s ease;display:inline-block;"></span>
        <span class="typing-dot" style="width:6px;height:6px;border-radius:50%;background:var(--ink-4);animation:typingBounce .9s infinite .15s ease;display:inline-block;"></span>
        <span class="typing-dot" style="width:6px;height:6px;border-radius:50%;background:var(--ink-4);animation:typingBounce .9s infinite .3s ease;display:inline-block;"></span>
      </span>
    </div>`;
  messages.appendChild(typing);
  scrollChat(messages);

  // Inject keyframe once
  injectTypingKeyframe();

  // Mentor reply after delay
  const delay = 1200 + Math.random() * 1200;
  setTimeout(() => {
    const ind = document.getElementById('typing-indicator');
    if (ind) ind.remove();

    const reply = MENTOR_REPLIES[replyIndex % MENTOR_REPLIES.length];
    replyIndex++;

    const mentorMsg = document.createElement('div');
    mentorMsg.className = 'msg';
    mentorMsg.style.maxWidth = '80%';
    mentorMsg.innerHTML = `
      <div style="width:32px;height:32px;border-radius:50%;background:var(--ink);display:grid;place-items:center;font-size:14px;flex-shrink:0;">🧭</div>
      <div>
        <div class="msg-bubble">
          <span class="serif-i" style="display:block;font-size:15px;color:var(--ink);">${escapeHtml(reply)}</span>
        </div>
        <div class="msg-time">${now()}</div>
      </div>`;
    messages.appendChild(mentorMsg);
    scrollChat(messages);
  }, delay);
}

function scrollChat(container) {
  setTimeout(() => { container.scrollTop = container.scrollHeight; }, 30);
}

function injectTypingKeyframe() {
  if (document.getElementById('typing-kf')) return;
  const style = document.createElement('style');
  style.id = 'typing-kf';
  style.textContent = `
    @keyframes typingBounce {
      0%, 60%, 100% { transform: translateY(0); opacity: .4; }
      30% { transform: translateY(-4px); opacity: 1; }
    }`;
  document.head.appendChild(style);
}

function now() {
  const d = new Date();
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h > 12 ? h - 12 : h || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ═══════════════════════════════════════════════════════════════
   ROADMAP PROPOSALS
   ═══════════════════════════════════════════════════════════════ */

function acceptProposal(btn) {
  const proposal = btn.closest('.proposal-card') || btn.closest('[style*="dashed"]');
  if (!proposal) return;

  // Replace with accepted state
  const accepted = document.createElement('div');
  accepted.style.cssText = 'border:1.5px solid rgba(47,107,90,.25);border-radius:var(--r-sm);padding:10px 14px;background:var(--mint-l);display:flex;align-items:center;gap:10px;animation:fadeUp .3s ease both;';
  accepted.innerHTML = `
    <span style="width:20px;height:20px;border-radius:50%;background:var(--mint);display:grid;place-items:center;font-size:10px;color:white;flex-shrink:0;font-weight:700;">✓</span>
    <div style="font-size:13px;color:var(--mint-d);font-weight:500;">Added to your roadmap</div>`;

  proposal.parentNode.replaceChild(accepted, proposal);

  // Also update the roadmap overview count
  const pendingNum = document.querySelector('.rm-ov-card .rm-ov-num[style*="yell-d"]');
  if (pendingNum) {
    const cur = parseInt(pendingNum.textContent, 10) || 0;
    if (cur > 0) pendingNum.textContent = cur - 1;
  }
}

/* ═══════════════════════════════════════════════════════════════
   CHECK-IN
   ═══════════════════════════════════════════════════════════════ */

function submitCheckin() {
  const energy = document.getElementById('s-energy')?.value || 6;
  const direction = document.getElementById('s-dir')?.value || 5;
  const belonging = document.getElementById('s-belong')?.value || 7;

  const content = document.getElementById('checkin-content');
  if (!content) return;

  content.style.opacity = '0';
  content.style.transition = 'opacity .25s ease';

  setTimeout(() => {
    content.innerHTML = `
      <div style="text-align:center;padding:var(--sp-80) 0;animation:fadeUp .4s .1s ease both;opacity:0;animation-fill-mode:both;">
        <div style="font-size:48px;margin-bottom:var(--sp-24);">✦</div>
        <h2 style="font-family:'Instrument Serif',Georgia,serif;font-size:2rem;margin-bottom:var(--sp-16);">
          Saved. Thanks, ${state.userName || 'Sofie'}.
        </h2>
        <p style="font-size:15px;color:var(--ink-3);line-height:1.7;max-width:380px;margin:0 auto var(--sp-32);">
          Your scores have been added to your objective model. You'll see the trend on your home page.
        </p>
        <div style="display:inline-grid;grid-template-columns:repeat(3,1fr);gap:var(--sp-12);margin-bottom:var(--sp-40);max-width:400px;width:100%;">
          <div style="background:var(--cream-2);border-radius:var(--r-xl);padding:var(--sp-16);text-align:center;">
            <div style="font-family:'Instrument Serif',Georgia,serif;font-size:2rem;line-height:1;color:var(--clay);">${energy}</div>
            <div style="font-size:11px;color:var(--ink-3);margin-top:4px;font-family:'DM Mono',monospace;">ENERGY</div>
          </div>
          <div style="background:var(--cream-2);border-radius:var(--r-xl);padding:var(--sp-16);text-align:center;">
            <div style="font-family:'Instrument Serif',Georgia,serif;font-size:2rem;line-height:1;color:var(--blue-d);">${direction}</div>
            <div style="font-size:11px;color:var(--ink-3);margin-top:4px;font-family:'DM Mono',monospace;">DIRECTION</div>
          </div>
          <div style="background:var(--cream-2);border-radius:var(--r-xl);padding:var(--sp-16);text-align:center;">
            <div style="font-family:'Instrument Serif',Georgia,serif;font-size:2rem;line-height:1;color:var(--mint-d);">${belonging}</div>
            <div style="font-size:11px;color:var(--ink-3);margin-top:4px;font-family:'DM Mono',monospace;">BELONGING</div>
          </div>
        </div>
        <button class="btn btn-dark" onclick="showPage('home',null)" style="min-width:200px;">Back to home →</button>
      </div>`;
    content.style.opacity = '1';
    state.checkinDone = true;

    // Update home nudge card
    updateCheckinNudge();
  }, 300);
}

function updateCheckinNudge() {
  const nudge = document.querySelector('.nudge-card');
  if (!nudge) return;
  nudge.innerHTML = `
    <div>
      <div style="font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--mint-d);margin-bottom:4px;">Check-in done ✓</div>
      <div style="font-size:14px;color:var(--ink-2);">Next check-in in 7 days</div>
    </div>
    <span style="font-size:20px;">✦</span>`;
  nudge.style.cursor = 'default';
  nudge.onclick = null;
}

/* ═══════════════════════════════════════════════════════════════
   SEARCH
   ═══════════════════════════════════════════════════════════════ */

const SEARCH_DATA = [
  { type: 'career', title: 'UX Designer', meta: 'Design · High demand · Avg. DKK 580k/yr', tag: 'Career path', color: 'lav' },
  { type: 'career', title: 'Clinical Psychologist', meta: 'Healthcare · Requires MSc · Avg. DKK 620k/yr', tag: 'Career path', color: 'mint' },
  { type: 'career', title: 'UX Researcher', meta: 'Design · Research methods apply · Growing field', tag: 'Career path', color: 'lav' },
  { type: 'career', title: 'Research Assistant', meta: 'Academia · Entry level · Competitive', tag: 'Career path', color: 'clay' },
  { type: 'career', title: 'Organisational Psychologist', meta: 'HR / Business · BSc + MSc typical', tag: 'Career path', color: 'yell' },
  { type: 'programme', title: 'BSc Psychology – KU', meta: 'Copenhagen · 180 ECTS · Average GPA: 9.2', tag: 'Programme', color: 'mint' },
  { type: 'programme', title: 'BSc Cognitive Science – KU', meta: 'Copenhagen · 180 ECTS · Interdisciplinary', tag: 'Programme', color: 'mint' },
  { type: 'programme', title: 'BSc Social Psychology – SDU', meta: 'Odense · 180 ECTS', tag: 'Programme', color: 'mint' },
  { type: 'info', title: 'What is a gap year?', meta: 'Common questions · Taking time before university', tag: 'Info', color: 'yell' },
  { type: 'info', title: 'Gap year options in Denmark', meta: 'Højskole, travel, work, voluntary service', tag: 'Info', color: 'yell' },
  { type: 'info', title: 'Statistics for psychology students', meta: 'Why it matters · What to study · Recommended courses', tag: 'Info', color: 'mint' },
  { type: 'info', title: 'Clinical placement — what to expect', meta: 'First placement guide · BSc Year 3', tag: 'Info', color: 'clay' },
  { type: 'info', title: 'Research assistant positions', meta: 'How to find them · What they look for · When to apply', tag: 'Info', color: 'clay' },
];

let searchDebounce;

function handleSearch(val) {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => doSearch(val), 220);
}

function doSearch(val) {
  const empty = document.getElementById('search-empty');
  const results = document.getElementById('search-results');
  const list = document.getElementById('search-results-list');
  if (!empty || !results || !list) return;

  const q = val.trim().toLowerCase();
  if (!q) {
    empty.style.display = '';
    results.style.display = 'none';
    return;
  }

  const matches = SEARCH_DATA.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.meta.toLowerCase().includes(q) ||
    item.tag.toLowerCase().includes(q)
  );

  list.innerHTML = matches.length
    ? matches.map(item => `
        <div class="card" style="padding:var(--sp-16) var(--sp-20);cursor:pointer;transition:var(--t);"
          onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">
          <div class="flex justify-between items-start gap-16">
            <div>
              <div style="font-weight:600;font-size:14px;margin-bottom:3px;">${escapeHtml(item.title)}</div>
              <div style="font-size:12px;color:var(--ink-3);">${escapeHtml(item.meta)}</div>
            </div>
            <span class="badge badge-${item.color}" style="flex-shrink:0;">${escapeHtml(item.tag)}</span>
          </div>
        </div>`)
      .join('')
    : `<div style="font-size:14px;color:var(--ink-3);padding:var(--sp-24) 0;">No results for "<strong>${escapeHtml(q)}</strong>". Try a different term.</div>`;

  empty.style.display = 'none';
  results.style.display = '';
}

function fillSearch(term) {
  const input = document.getElementById('search-input');
  if (input) {
    input.value = term;
    input.focus();
  }
  doSearch(term);
}

/* ═══════════════════════════════════════════════════════════════
   LANDING NAV  — scroll effect
   ═══════════════════════════════════════════════════════════════ */

function initScrollEffect() {
  const nav = document.getElementById('l-nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════
   PAGE TABS  (roadmap / compass / profile / dashboard)
   ═══════════════════════════════════════════════════════════════ */

function initPageTabs() {
  document.querySelectorAll('.page-tabs').forEach(tabBar => {
    tabBar.querySelectorAll('.p-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabBar.querySelectorAll('.p-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   PRIVACY TOGGLES
   ═══════════════════════════════════════════════════════════════ */

function initPrivacyToggles() {
  document.querySelectorAll('.profile-content [style*="border-radius:var(--r-pill)"][style*="cursor:pointer"]').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const isOn = toggle.style.background === 'var(--mint)' || toggle.style.background.includes('mint');
      const dot = toggle.querySelector('div');
      if (isOn) {
        toggle.style.background = 'var(--cream-3)';
        if (dot) { dot.style.right = ''; dot.style.left = '3px'; }
      } else {
        toggle.style.background = 'var(--mint)';
        if (dot) { dot.style.left = ''; dot.style.right = '3px'; }
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure only landing is visible on load
  document.querySelectorAll('.view').forEach(v => {
    if (v.id !== 'landing') {
      v.style.display = 'none';
    }
  });
  document.getElementById('landing')?.classList.add('active');

  initScrollEffect();
  initPageTabs();
  initPrivacyToggles();

  // Chat: auto-grow textarea
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
    });
  }
});
