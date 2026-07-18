/* ─────────────────────────────────────
   iCreate · Live Chat Widget
   Client ↔ Freelancer messaging.
   Self-contained: injects its own styles
   and markup. Uses the Supabase table
   `chat_messages` with realtime + polling,
   and localStorage as an offline fallback
   (same pattern as commissions/freelancers).
───────────────────────────────────── */
(function () {
  'use strict';

  const POLL_MS = 8000;

  const state = {
    me: null,              // { email, name, type }
    open: false,
    view: 'list',          // 'list' | 'new' | 'thread' | 'login'
    activeConv: null,      // { id, otherEmail, otherName }
    allMessages: [],       // every message involving me, sorted asc
    conversations: [],     // derived summaries
    talents: null,         // cached freelancer directory
    pollTimer: null,
    lastSignature: ''
  };

  /* ── HELPERS ── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function normEmail(e) { return String(e || '').toLowerCase().trim(); }
  function convIdFor(a, b) { return [normEmail(a), normEmail(b)].sort().join('|'); }
  // Key by epoch ms (not the raw string) — Supabase returns timestamps in a
  // different ISO format than the browser writes, which must not break dedupe
  function msgKey(m) { return `${normEmail(m.sender_email)}|${new Date(m.created_at).getTime()}|${m.content}`; }

  function fmtTime(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const sameYear = d.getFullYear() === now.getFullYear();
    return d.toLocaleDateString([], sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function readMap() {
    try { return JSON.parse(localStorage.getItem('chatReadState') || '{}'); } catch { return {}; }
  }
  function markRead(convId) {
    const m = readMap();
    m[convId] = new Date().toISOString();
    localStorage.setItem('chatReadState', JSON.stringify(m));
  }
  function localMsgs() {
    try { return JSON.parse(localStorage.getItem('localChatMessages') || '[]'); } catch { return []; }
  }
  function saveLocalMsg(msg) {
    const arr = localMsgs();
    arr.push(msg);
    localStorage.setItem('localChatMessages', JSON.stringify(arr));
  }

  function getMe() {
    if (localStorage.getItem('isLoggedIn') !== 'true') return null;
    const email = normEmail(localStorage.getItem('userEmail'));
    if (!email) return null;
    return {
      email: email,
      name: localStorage.getItem('userName') || email.split('@')[0],
      type: localStorage.getItem('userType') || 'client'
    };
  }

  /* ── STYLES ── */
  const CSS = `
  .icc-fab {
    position:fixed; right:24px; bottom:24px; z-index:1300;
    width:60px; height:60px; border-radius:50%; border:none; cursor:pointer;
    background:linear-gradient(135deg,var(--blue-mid,#004a9f),var(--blue-light,#1a6fd4));
    color:#fff; display:flex; align-items:center; justify-content:center;
    box-shadow:0 8px 26px rgba(0,74,159,.38);
    transition:all .28s cubic-bezier(.4,0,.2,1);
  }
  .icc-fab:hover { transform:translateY(-3px) scale(1.04); box-shadow:0 12px 32px rgba(0,74,159,.45); }
  .icc-fab svg { width:26px; height:26px; }
  .icc-badge {
    position:absolute; top:-3px; right:-3px; min-width:21px; height:21px;
    border-radius:100px; background:#e5484d; color:#fff;
    font-size:.7rem; font-weight:700; font-family:'DM Sans',sans-serif;
    display:none; align-items:center; justify-content:center; padding:0 6px;
    border:2px solid #fff; box-sizing:border-box;
  }
  .icc-badge.show { display:flex; }
  @keyframes icc-pop { 0%{transform:scale(.6)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
  .icc-badge.show { animation:icc-pop .3s ease; }

  .icc-panel {
    position:fixed; right:24px; bottom:98px; z-index:1300;
    width:380px; max-width:calc(100vw - 32px);
    height:min(600px, calc(100vh - 130px));
    background:#fff; border-radius:20px; overflow:hidden;
    border:1px solid var(--gray-light,#eaeef6);
    box-shadow:0 20px 60px rgba(0,60,160,.22);
    display:none; flex-direction:column;
    font-family:'DM Sans',sans-serif;
  }
  .icc-panel.open { display:flex; animation:icc-slide .3s cubic-bezier(.4,0,.2,1); }
  @keyframes icc-slide { from{opacity:0; transform:translateY(18px)} to{opacity:1; transform:translateY(0)} }

  .icc-head {
    background:linear-gradient(135deg,var(--blue-deep,#003a8c),var(--blue-light,#1a6fd4));
    color:#fff; padding:16px 18px; display:flex; align-items:center; gap:12px; flex-shrink:0;
  }
  .icc-head-avatar { width:38px; height:38px; border-radius:50%; flex-shrink:0; object-fit:cover; border:2px solid rgba(255,255,255,.35); }
  .icc-head-info { flex:1; min-width:0; }
  .icc-head-title { font-weight:700; font-size:1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .icc-head-sub { font-size:.75rem; opacity:.8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:flex; align-items:center; gap:5px; }
  .icc-dot { width:7px; height:7px; border-radius:50%; background:#5af5a0; flex-shrink:0; }
  .icc-iconbtn {
    background:rgba(255,255,255,.14); border:none; color:#fff; cursor:pointer;
    width:32px; height:32px; border-radius:9px; font-size:1rem; line-height:1;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    transition:background .2s; font-family:'DM Sans',sans-serif;
  }
  .icc-iconbtn:hover { background:rgba(255,255,255,.28); }

  .icc-body { flex:1; overflow-y:auto; background:var(--off-white,#f5f7fc); }

  /* conversation list */
  .icc-conv {
    display:flex; gap:12px; align-items:center; padding:14px 18px; cursor:pointer;
    background:#fff; border-bottom:1px solid var(--gray-light,#eaeef6); transition:background .18s;
  }
  .icc-conv:hover { background:var(--blue-pale,#e8f0fb); }
  .icc-conv-avatar { width:44px; height:44px; border-radius:50%; object-fit:cover; flex-shrink:0; }
  .icc-conv-main { flex:1; min-width:0; }
  .icc-conv-name { font-weight:700; font-size:.9rem; color:var(--text,#1c2033); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .icc-conv-preview { font-size:.8rem; color:var(--gray-mid,#8a94a6); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px; }
  .icc-conv-meta { display:flex; flex-direction:column; align-items:flex-end; gap:5px; flex-shrink:0; }
  .icc-conv-time { font-size:.7rem; color:var(--gray-mid,#8a94a6); }
  .icc-conv-unread {
    min-width:19px; height:19px; border-radius:100px; background:var(--blue-mid,#004a9f);
    color:#fff; font-size:.68rem; font-weight:700;
    display:flex; align-items:center; justify-content:center; padding:0 5px;
  }
  .icc-conv.unread .icc-conv-name, .icc-conv.unread .icc-conv-preview { color:var(--blue-deep,#003a8c); font-weight:700; }

  /* empty / login states */
  .icc-empty { text-align:center; padding:56px 30px; color:var(--gray-mid,#8a94a6); }
  .icc-empty-icon { font-size:2.6rem; margin-bottom:14px; }
  .icc-empty h4 { color:var(--text,#1c2033); font-size:1rem; font-weight:700; margin-bottom:6px; }
  .icc-empty p { font-size:.85rem; line-height:1.6; margin-bottom:20px; }
  .icc-cta {
    padding:11px 24px; border-radius:9px; border:none; cursor:pointer;
    background:linear-gradient(135deg,var(--blue-mid,#004a9f),var(--blue-light,#1a6fd4));
    color:#fff; font-weight:700; font-size:.875rem; font-family:'DM Sans',sans-serif;
    box-shadow:0 5px 16px rgba(0,74,159,.28); transition:all .25s;
  }
  .icc-cta:hover { transform:translateY(-1px); }

  /* new chat view */
  .icc-search-wrap { padding:14px 16px 10px; background:#fff; border-bottom:1px solid var(--gray-light,#eaeef6); position:sticky; top:0; }
  .icc-search {
    width:100%; padding:10px 14px; border-radius:9px; box-sizing:border-box;
    border:1.5px solid var(--gray-light,#eaeef6); background:#fafbfd; outline:none;
    font-family:'DM Sans',sans-serif; font-size:.875rem; color:var(--text,#1c2033);
    transition:all .2s;
  }
  .icc-search:focus { border-color:var(--blue-mid,#004a9f); background:#fff; box-shadow:0 0 0 3px rgba(0,74,159,.08); }
  .icc-talent-role { font-size:.76rem; color:var(--blue-mid,#004a9f); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px; }

  /* thread */
  .icc-thread { padding:18px 16px 10px; display:flex; flex-direction:column; gap:4px; }
  .icc-day {
    align-self:center; font-size:.7rem; font-weight:600; color:var(--gray-mid,#8a94a6);
    background:var(--gray-light,#eaeef6); border-radius:100px; padding:3px 12px; margin:10px 0 8px;
  }
  .icc-msg { max-width:78%; display:flex; flex-direction:column; margin-bottom:6px; }
  .icc-msg .icc-bubble {
    padding:10px 14px; font-size:.875rem; line-height:1.55; word-wrap:break-word; white-space:pre-wrap;
  }
  .icc-msg.mine { align-self:flex-end; align-items:flex-end; }
  .icc-msg.mine .icc-bubble {
    background:linear-gradient(135deg,var(--blue-mid,#004a9f),var(--blue-light,#1a6fd4));
    color:#fff; border-radius:16px 16px 4px 16px;
  }
  .icc-msg.theirs { align-self:flex-start; align-items:flex-start; }
  .icc-msg.theirs .icc-bubble {
    background:#fff; color:var(--text,#1c2033);
    border:1px solid var(--gray-light,#eaeef6); border-radius:16px 16px 16px 4px;
    box-shadow:0 2px 8px rgba(0,60,160,.05);
  }
  .icc-msg-time { font-size:.68rem; color:var(--gray-mid,#8a94a6); margin-top:4px; padding:0 4px; }

  /* composer */
  .icc-foot {
    display:none; gap:10px; align-items:flex-end; padding:12px 14px;
    background:#fff; border-top:1px solid var(--gray-light,#eaeef6); flex-shrink:0;
  }
  .icc-foot.show { display:flex; }
  .icc-input {
    flex:1; resize:none; max-height:110px; padding:11px 14px; box-sizing:border-box;
    border:1.5px solid var(--gray-light,#eaeef6); border-radius:12px; background:#fafbfd;
    font-family:'DM Sans',sans-serif; font-size:.875rem; color:var(--text,#1c2033);
    outline:none; line-height:1.5; transition:all .2s;
  }
  .icc-input:focus { border-color:var(--blue-mid,#004a9f); background:#fff; box-shadow:0 0 0 3px rgba(0,74,159,.08); }
  .icc-send {
    width:42px; height:42px; border-radius:12px; border:none; cursor:pointer; flex-shrink:0;
    background:linear-gradient(135deg,var(--blue-mid,#004a9f),var(--blue-light,#1a6fd4));
    color:#fff; display:flex; align-items:center; justify-content:center;
    box-shadow:0 4px 14px rgba(0,74,159,.3); transition:all .25s;
  }
  .icc-send:hover { transform:translateY(-1px); }
  .icc-send:disabled { opacity:.5; cursor:default; transform:none; }
  .icc-send svg { width:18px; height:18px; }

  @media (max-width:480px) {
    .icc-panel { right:0; bottom:0; width:100%; max-width:100%; height:100%; border-radius:0; }
    .icc-fab { right:16px; bottom:16px; }
  }`;

  /* ── MARKUP ── */
  function buildDom() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const root = document.createElement('div');
    root.id = 'ic-chat-root';
    root.innerHTML = `
      <button class="icc-fab" id="icc-fab" aria-label="Open messages">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <span class="icc-badge" id="icc-badge"></span>
      </button>
      <div class="icc-panel" id="icc-panel" role="dialog" aria-label="Messages">
        <div class="icc-head">
          <button class="icc-iconbtn" id="icc-back" style="display:none;">←</button>
          <img class="icc-head-avatar" id="icc-head-avatar" style="display:none;" alt="" />
          <div class="icc-head-info">
            <div class="icc-head-title" id="icc-title">Messages</div>
            <div class="icc-head-sub" id="icc-sub"></div>
          </div>
          <button class="icc-iconbtn" id="icc-new" title="New message" style="display:none;">✎</button>
          <button class="icc-iconbtn" id="icc-close" title="Close">✕</button>
        </div>
        <div class="icc-body" id="icc-body"></div>
        <div class="icc-foot" id="icc-foot">
          <textarea class="icc-input" id="icc-input" rows="1" placeholder="Type a message…"></textarea>
          <button class="icc-send" id="icc-send" aria-label="Send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>`;
    document.body.appendChild(root);

    document.getElementById('icc-fab').addEventListener('click', togglePanel);
    document.getElementById('icc-close').addEventListener('click', closePanel);
    document.getElementById('icc-back').addEventListener('click', () => showView(state.view === 'thread' ? 'list' : 'list'));
    document.getElementById('icc-new').addEventListener('click', () => showView('new'));
    document.getElementById('icc-send').addEventListener('click', handleSend);

    const input = document.getElementById('icc-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 110) + 'px';
    });
  }

  /* ── DATA LAYER ── */
  async function fetchRemoteMine() {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_email.eq.${state.me.email},recipient_email.eq.${state.me.email}`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      return null; // table missing / offline → caller falls back to localStorage only
    }
  }

  function involvesMe(m) {
    const me = state.me.email;
    return normEmail(m.sender_email) === me || normEmail(m.recipient_email) === me;
  }

  async function refreshMessages() {
    if (!state.me) return;
    const remote = await fetchRemoteMine();
    const merged = new Map();
    (remote || []).forEach(m => merged.set(msgKey(m), m));
    localMsgs().filter(involvesMe).forEach(m => {
      if (!merged.has(msgKey(m))) merged.set(msgKey(m), m);
    });
    state.allMessages = Array.from(merged.values())
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    rebuildConversations();

    const signature = state.allMessages.length + '|' + (state.allMessages.length ? msgKey(state.allMessages[state.allMessages.length - 1]) : '');
    if (signature !== state.lastSignature) {
      state.lastSignature = signature;
      updateBadge();
      if (state.open) renderView();
    }
  }

  function rebuildConversations() {
    const me = state.me.email;
    const reads = readMap();
    const map = new Map();
    state.allMessages.forEach(m => {
      const otherIsSender = normEmail(m.sender_email) !== me;
      const otherEmail = otherIsSender ? normEmail(m.sender_email) : normEmail(m.recipient_email);
      const otherName = otherIsSender ? (m.sender_name || otherEmail) : (m.recipient_name || otherEmail);
      const id = m.conversation_id || convIdFor(me, otherEmail);
      let c = map.get(id);
      if (!c) { c = { id, otherEmail, otherName, lastMessage: '', lastAt: '', unread: 0 }; map.set(id, c); }
      if (otherIsSender && m.sender_name) c.otherName = m.sender_name;
      c.lastMessage = (normEmail(m.sender_email) === me ? 'You: ' : '') + m.content;
      c.lastAt = m.created_at;
      if (otherIsSender && (!reads[id] || new Date(m.created_at) > new Date(reads[id]))) c.unread++;
    });
    state.conversations = Array.from(map.values())
      .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
  }

  async function subscribeRealtime() {
    try {
      const supabase = await getSupabase();
      supabase
        .channel('icc-chat-messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
          const m = payload.new;
          if (m && involvesMe(m)) refreshMessages();
        })
        .subscribe();
    } catch (err) {
      // realtime unavailable — polling covers it
    }
  }

  async function persistMessage(msg) {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.from('chat_messages').insert([msg]);
      if (error) throw error;
    } catch (err) {
      console.warn('Chat: failed to save message to Supabase — keeping it locally.', err);
      saveLocalMsg(msg);
    }
  }

  async function loadTalents() {
    if (state.talents) return state.talents;
    const byEmail = new Map();
    const add = (f) => {
      const email = normEmail(f.email);
      if (!email || email === state.me.email || byEmail.has(email)) return;
      byEmail.set(email, {
        email,
        name: `${f.first_name || ''} ${f.last_name || ''}`.trim() || email,
        headline: f.headline || 'iAcademy Freelancer'
      });
    };
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('freelancers')
        .select('first_name,last_name,email,headline')
        .order('created_at', { ascending: false });
      if (!error && data) data.forEach(add);
    } catch (err) { /* fall through to local */ }
    try {
      JSON.parse(localStorage.getItem('localFreelancers') || '[]').forEach(add);
    } catch (err) { /* ignore corrupt local data */ }
    state.talents = Array.from(byEmail.values());
    return state.talents;
  }

  /* ── UI ── */
  function togglePanel() {
    state.open ? closePanel() : openPanel();
  }

  function openPanel() {
    state.me = getMe();
    state.open = true;
    document.getElementById('icc-panel').classList.add('open');
    if (!state.me) {
      showView('login');
    } else {
      showView(state.view === 'thread' && state.activeConv ? 'thread' : 'list');
      refreshMessages();
    }
  }

  function closePanel() {
    state.open = false;
    document.getElementById('icc-panel').classList.remove('open');
  }

  function showView(view) {
    state.view = view;
    renderView();
  }

  function setHeader(opts) {
    document.getElementById('icc-title').textContent = opts.title;
    const sub = document.getElementById('icc-sub');
    sub.innerHTML = opts.sub || '';
    document.getElementById('icc-back').style.display = opts.back ? 'flex' : 'none';
    document.getElementById('icc-new').style.display = opts.newBtn ? 'flex' : 'none';
    const avatar = document.getElementById('icc-head-avatar');
    if (opts.avatarName && window.generateInitialsAvatar) {
      avatar.src = window.generateInitialsAvatar(opts.avatarName);
      avatar.style.display = 'block';
    } else {
      avatar.style.display = 'none';
    }
    document.getElementById('icc-foot').classList.toggle('show', !!opts.composer);
  }

  function renderView() {
    if (!state.open) return;
    const body = document.getElementById('icc-body');
    if (state.view === 'login') {
      setHeader({ title: 'Messages', sub: 'iCreate Live Chat' });
      body.innerHTML = `
        <div class="icc-empty">
          <div class="icc-empty-icon">💬</div>
          <h4>Log in to start chatting</h4>
          <p>Connect with clients and iAcademy freelancers in real time.</p>
          <button class="icc-cta" onclick="location.href='login.html'">Log In</button>
        </div>`;
    } else if (state.view === 'list') {
      renderList(body);
    } else if (state.view === 'new') {
      renderNewChat(body);
    } else if (state.view === 'thread') {
      renderThread(body);
    }
  }

  function renderList(body) {
    setHeader({ title: 'Messages', sub: `Signed in as ${esc(state.me.name)}`, newBtn: true });
    if (!state.conversations.length) {
      body.innerHTML = `
        <div class="icc-empty">
          <div class="icc-empty-icon">📨</div>
          <h4>No conversations yet</h4>
          <p>Start a conversation with an iAcademy freelancer — or wait for a client to reach out.</p>
          <button class="icc-cta" id="icc-empty-new">Start a Conversation</button>
        </div>`;
      body.querySelector('#icc-empty-new').addEventListener('click', () => showView('new'));
      return;
    }
    body.innerHTML = state.conversations.map(c => `
      <div class="icc-conv ${c.unread ? 'unread' : ''}" data-conv="${esc(c.id)}">
        <img class="icc-conv-avatar" src="${window.generateInitialsAvatar ? window.generateInitialsAvatar(c.otherName) : ''}" alt="" />
        <div class="icc-conv-main">
          <div class="icc-conv-name">${esc(c.otherName)}</div>
          <div class="icc-conv-preview">${esc(c.lastMessage)}</div>
        </div>
        <div class="icc-conv-meta">
          <span class="icc-conv-time">${fmtTime(c.lastAt)}</span>
          ${c.unread ? `<span class="icc-conv-unread">${c.unread}</span>` : ''}
        </div>
      </div>`).join('');
    body.querySelectorAll('.icc-conv').forEach(el => {
      el.addEventListener('click', () => {
        const conv = state.conversations.find(c => c.id === el.dataset.conv);
        if (conv) openThread(conv.otherName, conv.otherEmail);
      });
    });
  }

  async function renderNewChat(body) {
    setHeader({ title: 'New Message', sub: 'Choose a freelancer to chat with', back: true });
    body.innerHTML = `<div class="icc-empty"><div class="icc-empty-icon">⏳</div><p>Loading freelancers…</p></div>`;
    const talents = await loadTalents();
    if (state.view !== 'new') return; // user navigated away while loading
    if (!talents.length) {
      body.innerHTML = `
        <div class="icc-empty">
          <div class="icc-empty-icon">🔍</div>
          <h4>No freelancers found</h4>
          <p>Once freelancers register on iCreate, they'll appear here.</p>
          <button class="icc-cta" onclick="location.href='find-talent.html'">Browse Talent</button>
        </div>`;
      return;
    }
    body.innerHTML = `
      <div class="icc-search-wrap">
        <input class="icc-search" id="icc-search" type="text" placeholder="Search by name or skill…" />
      </div>
      <div id="icc-talent-list"></div>`;
    const listEl = body.querySelector('#icc-talent-list');
    const draw = (filter) => {
      const q = (filter || '').toLowerCase();
      const items = talents.filter(t => !q || t.name.toLowerCase().includes(q) || t.headline.toLowerCase().includes(q));
      listEl.innerHTML = items.length ? items.map(t => `
        <div class="icc-conv" data-email="${esc(t.email)}" data-name="${esc(t.name)}">
          <img class="icc-conv-avatar" src="${window.generateInitialsAvatar ? window.generateInitialsAvatar(t.name) : ''}" alt="" />
          <div class="icc-conv-main">
            <div class="icc-conv-name">${esc(t.name)}</div>
            <div class="icc-talent-role">${esc(t.headline)}</div>
          </div>
        </div>`).join('')
        : `<div class="icc-empty"><p>No match found.</p></div>`;
      listEl.querySelectorAll('.icc-conv').forEach(el => {
        el.addEventListener('click', () => openThread(el.dataset.name, el.dataset.email));
      });
    };
    draw('');
    body.querySelector('#icc-search').addEventListener('input', (e) => draw(e.target.value));
  }

  function renderThread(body) {
    const conv = state.activeConv;
    if (!conv) { showView('list'); return; }
    setHeader({
      title: conv.otherName,
      sub: `<span class="icc-dot"></span>${esc(conv.otherEmail)}`,
      back: true,
      composer: true,
      avatarName: conv.otherName
    });

    const msgs = state.allMessages.filter(m =>
      (m.conversation_id || convIdFor(m.sender_email, m.recipient_email)) === conv.id);

    if (!msgs.length) {
      body.innerHTML = `
        <div class="icc-empty">
          <div class="icc-empty-icon">👋</div>
          <h4>Say hello to ${esc(conv.otherName)}</h4>
          <p>This is the beginning of your conversation. Introduce yourself and your project!</p>
        </div>`;
    } else {
      let lastDay = '';
      const parts = ['<div class="icc-thread">'];
      msgs.forEach(m => {
        const d = new Date(m.created_at);
        const day = d.toDateString();
        if (day !== lastDay) {
          lastDay = day;
          const today = new Date().toDateString() === day;
          parts.push(`<div class="icc-day">${today ? 'Today' : d.toLocaleDateString([], { month: 'long', day: 'numeric' })}</div>`);
        }
        const mine = normEmail(m.sender_email) === state.me.email;
        parts.push(`
          <div class="icc-msg ${mine ? 'mine' : 'theirs'}">
            <div class="icc-bubble">${esc(m.content)}</div>
            <div class="icc-msg-time">${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
          </div>`);
      });
      parts.push('</div>');
      body.innerHTML = parts.join('');
    }
    body.scrollTop = body.scrollHeight;
    markRead(conv.id);
    rebuildConversations();
    updateBadge();
  }

  function openThread(name, email) {
    state.activeConv = {
      id: convIdFor(state.me.email, email),
      otherEmail: normEmail(email),
      otherName: name
    };
    showView('thread');
    const input = document.getElementById('icc-input');
    if (input) input.focus();
  }

  async function handleSend() {
    const input = document.getElementById('icc-input');
    const text = input.value.trim();
    if (!text || !state.activeConv || !state.me) return;
    const conv = state.activeConv;
    const msg = {
      conversation_id: conv.id,
      sender_email: state.me.email,
      sender_name: state.me.name,
      recipient_email: conv.otherEmail,
      recipient_name: conv.otherName,
      content: text,
      created_at: new Date().toISOString()
    };
    input.value = '';
    input.style.height = 'auto';

    // optimistic render
    state.allMessages.push(msg);
    state.lastSignature = state.allMessages.length + '|' + msgKey(msg);
    rebuildConversations();
    renderView();

    await persistMessage(msg);
  }

  function updateBadge() {
    const badge = document.getElementById('icc-badge');
    if (!badge) return;
    const total = state.conversations.reduce((sum, c) => sum + c.unread, 0);
    badge.textContent = total > 99 ? '99+' : String(total);
    badge.classList.toggle('show', total > 0);
  }

  /* ── PUBLIC API (used by profile modal "Message" button) ── */
  window.openChatWith = function (name, email) {
    if (typeof closeModal === 'function') {
      const modal = document.getElementById('profile-modal');
      if (modal && modal.style.display !== 'none') closeModal();
    }
    state.me = getMe();
    if (!state.me) {
      state.open = true;
      document.getElementById('icc-panel').classList.add('open');
      showView('login');
      return;
    }
    if (normEmail(email) === state.me.email) {
      alert('This is your own profile — you cannot message yourself.');
      return;
    }
    state.open = true;
    document.getElementById('icc-panel').classList.add('open');
    openThread(name, email);
    refreshMessages(); // pulls history for this thread in the background
  };

  /* ── INIT ── */
  function init() {
    buildDom();
    state.me = getMe();
    if (state.me) {
      refreshMessages();
      subscribeRealtime();
      state.pollTimer = setInterval(refreshMessages, POLL_MS);
      // cross-tab liveness for the localStorage fallback
      window.addEventListener('storage', (e) => {
        if (e.key === 'localChatMessages') refreshMessages();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
