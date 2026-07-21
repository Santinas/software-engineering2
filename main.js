/* ─────────────────────────────────────
   iCreate · Main JavaScript
───────────────────────────────────── */

/* ── VECTOR AVATAR & COVER GENERATORS ── */
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

function generateInitialsAvatar(name) {
  const initials = getInitials(name);
  const colors = [
    '#004a9f', // iAcademy Blue
    '#1e293b', // Slate
    '#0f766e', // Teal
    '#4338ca', // Indigo
    '#b45309', // Amber
    '#15803d', // Green
    '#be123c', // Rose
    '#6d28d9', // Violet
  ];
  let charCodeSum = 0;
  for (let i = 0; i < name.length; i++) {
    charCodeSum += name.charCodeAt(i);
  }
  const color = colors[charCodeSum % colors.length];
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100%" height="100%" fill="${color}" />
    <text x="50%" y="54%" font-family="'DM Sans', sans-serif" font-weight="700" font-size="38" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;
  
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function generateCoverBanner(name) {
  const colors = [
    ['#002b66', '#004a9f'],
    ['#0f172a', '#1e293b'],
    ['#0d0e12', '#1a2238'],
    ['#0f3443', '#34e89e'],
    ['#111827', '#374151']
  ];
  let charCodeSum = 0;
  for (let i = 0; i < name.length; i++) {
    charCodeSum += name.charCodeAt(i);
  }
  const gradient = colors[charCodeSum % colors.length];
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200" width="600" height="200">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${gradient[0]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${gradient[1]};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" />
    <path d="M 0,100 Q 150,50 300,150 T 600,100" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="4" />
    <path d="M 0,150 Q 200,200 400,50 T 600,150" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="3" />
    <circle cx="550" cy="50" r="40" fill="rgba(255,255,255,0.02)" />
    <circle cx="100" cy="160" r="25" fill="rgba(255,255,255,0.03)" />
  </svg>`;
  
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

window.getInitials = getInitials;
window.generateInitialsAvatar = generateInitialsAvatar;
window.generateCoverBanner = generateCoverBanner;

//get completed commissions using freelancer email
//TODO: currently this returns accepte commissions as there is no completed status implemented.
async function getCompletedCommissions(freelancerEmail) {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('commissions')
        .select('project_type, project_desc')
        .eq('freelancer_email', freelancerEmail)
        .eq('status', 'accepted');
    return { data, error };
  } catch (error) {
    console.error('Error fetching completed commissions:', error);
    throw error;
  }
}

/* ── FREELANCER DATA ── */
const freelancers = {};

let currentFreelancer = '';

/* ── PROFILE MODAL ── */
async function openProfile(name) {
  const f = freelancers[name];
  if (!f) return;
  currentFreelancer = name;

  document.getElementById('modal-name').textContent = name;
  document.getElementById('modal-role').textContent = f.role;
  
  const modalAvatar = document.getElementById('modal-avatar');
  if (modalAvatar) {
    modalAvatar.src = f.avatar && !f.avatar.includes('unsplash.com') ? f.avatar : generateInitialsAvatar(name);
  }
  
  const modalCover = document.getElementById('modal-cover');
  if (modalCover) {
    modalCover.style.background = `url('${f.cover && !f.cover.includes('unsplash.com') ? f.cover : generateCoverBanner(name)}') center/cover no-repeat`;
  }
  
  document.getElementById('modal-bio').textContent = f.bio;
  document.getElementById('modal-rate').textContent = f.rate;
  document.getElementById('modal-projects').textContent = f.projects;
  document.getElementById('commission-freelancer-name').textContent = name;
  document.getElementById('success-name').textContent = name;

  const skillsEl = document.getElementById('modal-skills');
  skillsEl.innerHTML = f.skills.map(s =>
    `<span style="padding:5px 13px;border-radius:100px;background:#e8f0fb;color:#004a9f;font-size:.8rem;font-weight:600;">${s}</span>`
  ).join('');

  const portEl = document.getElementById('modal-portfolio-grid');
  portEl.innerHTML = f.portfolio.map((src, i) => renderPortfolioItem(src, i)).join('');
  const comms = await getCompletedCommissions(f.email);

  const commEl = document.getElementById('modal-commission-grid');
  commEl.innerHTML = comms.data.map((c, i) => renderCommissionCard('✔️', c.project_type, c.project_desc)).join(''); 
  
  // Inject a "Message" button for the live chat (modal markup is duplicated
  // across pages, so adding it here covers every copy)
  const overviewPanel = document.getElementById('panel-overview');
  if (overviewPanel) {
    let msgBtn = document.getElementById('modal-message-btn');
    if (!msgBtn) {
      msgBtn = document.createElement('button');
      msgBtn.id = 'modal-message-btn';
      msgBtn.style.cssText = "width:100%;padding:14px;margin-top:12px;background:transparent;color:#004a9f;font-size:.95rem;font-weight:700;border:1.5px solid #004a9f;border-radius:12px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .25s;";
      msgBtn.onmouseover = () => { msgBtn.style.background = '#e8f0fb'; };
      msgBtn.onmouseout = () => { msgBtn.style.background = 'transparent'; };
      overviewPanel.appendChild(msgBtn);
    }
    msgBtn.textContent = `💬 Message ${name}`;
    msgBtn.style.display = f.email ? 'block' : 'none';
    msgBtn.onclick = () => { if (window.openChatWith) window.openChatWith(name, f.email); };
  }

  switchTab('overview');
  document.getElementById('commission-step-1').style.display = 'block';
  document.getElementById('commission-step-2').style.display = 'none';
  document.getElementById('commission-step-3').style.display = 'none';
  document.getElementById('upload-success-area').style.display = 'none';
  document.getElementById('upload-icon-area').style.display = 'block';

  document.getElementById('profile-modal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

/* ── PORTFOLIO GRID RENDERING ── */
function isImageEntry(src) {
  if (typeof src !== 'string') return false;
  if (src.startsWith('data:image/')) return true;
  if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(src)) return true;
  if (src.includes('images.unsplash.com')) return true;
  return false;
}
function renderCommissionCard(icon, label, type) {
  return `
    <div
         style="height:130px;border-radius:10px;border:1.5px solid #eaeef6;background:#f5f7fc;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;cursor:pointer;padding:10px;text-align:center;transition:all .2s;"
         onmouseover="this.style.background='#e8f0fb';this.style.borderColor='#004a9f'"
         onmouseout="this.style.background='#f5f7fc';this.style.borderColor='#eaeef6'">
      <div style="font-size:1.8rem;">${icon}</div>
      <div style="font-size:.8rem;font-weight:700;color:#004a9f;">${label}</div>
      <div style="font-size:.7rem;color:#8a94a6;">${type}</div>
    </div>`;
}

function renderPortfolioFileCard(icon, label, i) {
  return `
    <div onclick="openPortfolioItem(${i})"
         style="height:130px;border-radius:10px;border:1.5px solid #eaeef6;background:#f5f7fc;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;cursor:pointer;padding:10px;text-align:center;transition:all .2s;"
         onmouseover="this.style.background='#e8f0fb';this.style.borderColor='#004a9f'"
         onmouseout="this.style.background='#f5f7fc';this.style.borderColor='#eaeef6'">
      <div style="font-size:1.8rem;">${icon}</div>
      <div style="font-size:.8rem;font-weight:700;color:#004a9f;">${label}</div>
      <div style="font-size:.7rem;color:#8a94a6;">Click to open</div>
    </div>`;
}

function renderPortfolioItem(src, i) {
  if (isImageEntry(src)) {
    return `<img src="${src}" alt="portfolio" onclick="openPortfolioItem(${i})" onerror="portfolioImgError(this, ${i})" style="width:100%;height:130px;object-fit:cover;border-radius:10px;cursor:pointer;" />`;
  }
  const isPdf = typeof src === 'string' && src.startsWith('data:application/pdf');
  if (isPdf) return renderPortfolioFileCard('📄', 'PDF Portfolio', i);
  if (typeof src === 'string' && src.startsWith('data:')) return renderPortfolioFileCard('📎', 'Portfolio File', i);
  return renderPortfolioFileCard('🔗', 'Portfolio Link', i);
}

// If an image entry fails to load (corrupt/unsupported), swap it for a file card
window.portfolioImgError = function (imgEl, i) {
  const wrap = document.createElement('div');
  wrap.innerHTML = renderPortfolioFileCard('📎', 'Portfolio File', i);
  imgEl.replaceWith(wrap.firstElementChild);
};

window.openPortfolioItem = function (i) {
  const f = freelancers[currentFreelancer];
  if (!f || !f.portfolio || !f.portfolio[i]) return;
  let src = f.portfolio[i];
  if (src.startsWith('data:')) {
    // Browsers block opening data: URLs in a new tab — convert to a Blob URL first
    try {
      const [meta, b64] = src.split(',');
      const mime = (meta.match(/data:([^;]+)/) || [])[1] || 'application/octet-stream';
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let j = 0; j < bin.length; j++) bytes[j] = bin.charCodeAt(j);
      const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
      window.open(url, '_blank');
    } catch (err) {
      console.error('Could not open portfolio file:', err);
      alert('Sorry, this portfolio file could not be opened.');
    }
  } else {
    if (!/^https?:\/\//i.test(src)) src = 'https://' + src;
    window.open(src, '_blank', 'noopener');
  }
};

function closeModal() {
  document.getElementById('profile-modal').style.display = 'none';
  document.body.style.overflow = '';
}

function switchTab(tab) {
  ['overview','portfolio','commission'].forEach(t => {
    document.getElementById('panel-' + t).style.display = t === tab ? 'block' : 'none';
    document.getElementById('tab-' + t).classList.toggle('active', t === tab);
  });
}

/* ── SUBMIT COMMISSION (no payment step) ── */
async function submitCommissionRequest(btn) {
  const name   = document.getElementById('client-name').value.trim();
  const email  = document.getElementById('client-email').value.trim();
  const type   = document.getElementById('project-type').value;
  const desc   = document.getElementById('project-desc').value.trim();
  const budget = document.getElementById('project-budget').value;
  const deadline = document.getElementById('project-deadline').value;

  if (!name || !email || !type || !desc || !budget) {
    alert('Please fill in all required fields before submitting.');
    return;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(budget) || parseFloat(budget) <= 0) {
    alert('Please enter a valid budget amount (a number greater than 0).');
    return;
  }

  if (deadline) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const chosen = new Date(deadline + 'T00:00:00');
    if (isNaN(chosen.getTime()) || chosen < today) {
      alert('Please choose a deadline that is today or in the future.');
      return;
    }
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

  const f = freelancers[currentFreelancer] || {};
  // The database only accepts bookings made under the logged-in email,
  // so prefer the verified account email over the (editable) form field
  const accountEmail = (localStorage.getItem('userEmail') || '').toLowerCase();
  const commissionData = {
    freelancer_name: currentFreelancer,
    freelancer_email: f.email || null,
    client_name: name,
    client_email: accountEmail || email.toLowerCase(),
    project_type: type,
    project_desc: desc,
    budget: parseFloat(budget),
    deadline: deadline || null
  };

  let savedRemote = false;
  try {
    const supabase = await getSupabase();
    const { error } = await supabase.from('commissions').insert([commissionData]);
    if (error) throw error;
    savedRemote = true;
  } catch (err) {
    console.warn('Failed to insert commission into Supabase. Storing locally as fallback.', err);
  }

  // Local fallback ONLY when the online save failed (saving both would
  // show the booking twice in the notification feed)
  if (!savedRemote) {
    const localCommissions = JSON.parse(localStorage.getItem('localCommissions') || '[]');
    localCommissions.push({ ...commissionData, status: 'pending', created_at: new Date().toISOString() });
    localStorage.setItem('localCommissions', JSON.stringify(localCommissions));
  }

  if (btn) { btn.disabled = false; btn.textContent = 'Submit Commission Request'; }
  document.getElementById('commission-step-1').style.display = 'none';
  document.getElementById('commission-step-3').style.display = 'block';
}

function handleFileUpload(input) {
  if (input.files && input.files[0]) {
    document.getElementById('upload-icon-area').style.display = 'none';
    document.getElementById('upload-success-area').style.display = 'block';
    document.getElementById('upload-filename').textContent = input.files[0].name;
  }
}

/* ── SUPABASE CLIENT CONFIGURATION ── */
function loadSupabase() {
  return new Promise((resolve, reject) => {
    if (window.supabase) {
      resolve(window.supabase);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => resolve(window.supabase);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

let supabaseClient = null;
async function getSupabase() {
  if (supabaseClient) return supabaseClient;
  await loadSupabase();

  // Defaults so the site also works without the Node server
  // (opened as a plain file or served by any static host)
  let config = {
    supabaseUrl: 'https://iswxswoypxyflahrwmgh.supabase.co',
    supabaseAnonKey: 'sb_publishable_tmoF1hgQGT_-bj0MNEuj8Q_Vcyz1qNy'
  };
  try {
    const res = await fetch('/api/config');
    if (res.ok) config = await res.json();
  } catch (err) {
    console.warn('No /api/config endpoint (static hosting) — using built-in Supabase config.');
  }
  
  // Robustly sanitize URL on the frontend
  let url = config.supabaseUrl;
  if (url) {
    url = url.trim();
    // Try to find a match for any Supabase project URL: https://xxxx.supabase.co
    const supabaseMatch = url.match(/https?:\/\/[a-z0-9-]+\.supabase\.(co|net|com)/i);
    if (supabaseMatch) {
      url = supabaseMatch[0].toLowerCase();
    } else {
      const anyUrlMatch = url.match(/https?:\/\/[^\s/]+/i);
      if (anyUrlMatch) {
        url = anyUrlMatch[0].toLowerCase();
      }
    }
  }

  // "Remember me": when unchecked, keep the session only for this browser
  // session (sessionStorage clears on close); otherwise persist it.
  const remember = localStorage.getItem('rememberMe');
  const authStorage = (remember === 'false') ? window.sessionStorage : window.localStorage;

  supabaseClient = window.supabase.createClient(url, config.supabaseAnonKey, {
    auth: {
      storage: authStorage,
      persistSession: true,
      autoRefreshToken: true
    }
  });
  return supabaseClient;
}

// Force the client to be rebuilt (e.g. after the "Remember me" choice changes,
// so the new session lands in the right storage)
window.resetSupabaseClient = function () {
  supabaseClient = null;
}

/* ── PORTFOLIO FILE UPLOAD & DRAG & DROP ── */
let uploadedPortfolioFiles = [];

window.handleDragOver = function(event) {
  event.preventDefault();
  event.stopPropagation();
  const uploadArea = document.getElementById('portfolio-upload-area');
  if (uploadArea) {
    uploadArea.style.borderColor = 'var(--blue-mid)';
    uploadArea.style.background = 'var(--blue-pale)';
  }
};

window.handleDragLeave = function(event) {
  event.preventDefault();
  event.stopPropagation();
  const uploadArea = document.getElementById('portfolio-upload-area');
  if (uploadArea) {
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
  }
};

window.handleDrop = function(event) {
  event.preventDefault();
  event.stopPropagation();
  const uploadArea = document.getElementById('portfolio-upload-area');
  if (uploadArea) {
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
  }

  const files = event.dataTransfer.files;
  if (files && files.length > 0) {
    const fileInput = document.getElementById('signup-portfolio-file');
    if (fileInput) {
      fileInput.files = files;
      window.handlePortfolioFileSelect(fileInput);
    }
  }
};

window.handlePortfolioFileSelect = async function(input) {
  const fileListContainer = document.getElementById('portfolio-file-list');
  if (!fileListContainer) return;

  const files = Array.from(input.files || []);
  for (const file of files) {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
      continue;
    }
    
    // Avoid duplicates
    if (uploadedPortfolioFiles.some(f => f.name === file.name && f.size === file.size)) {
      continue;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      uploadedPortfolioFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: dataUrl
      });
    } catch (err) {
      console.error('Error reading file:', err);
    }
  }

  renderSelectedFilesList();
};

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderSelectedFilesList() {
  const fileListContainer = document.getElementById('portfolio-file-list');
  if (!fileListContainer) return;

  if (uploadedPortfolioFiles.length === 0) {
    fileListContainer.innerHTML = '';
    return;
  }

  fileListContainer.innerHTML = uploadedPortfolioFiles.map((file, index) => {
    const isImage = file.type.startsWith('image/');
    const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const previewHtml = isImage 
      ? `<img src="${file.dataUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid var(--gray-light);" />`
      : `<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:#f1f5f9;border-radius:6px;font-size:1.2rem;border:1px solid var(--gray-light);">📄</div>`;

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid var(--gray-light);border-radius:10px;padding:10px 14px;gap:12px;box-shadow:var(--shadow-sm);">
        <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
          ${previewHtml}
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.88rem;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${file.name}</div>
            <div style="font-size:0.75rem;color:var(--gray-mid);">${sizeStr}</div>
          </div>
        </div>
        <button type="button" onclick="removeSelectedFile(${index})" style="background:none;border:none;color:#ef4444;font-size:1.4rem;cursor:pointer;padding:4px 8px;line-height:1;border-radius:6px;transition:var(--transition);" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='none'">
          &times;
        </button>
      </div>
    `;
  }).join('');
}

window.removeSelectedFile = function(index) {
  uploadedPortfolioFiles.splice(index, 1);
  renderSelectedFilesList();
};

/* ── SUBMIT FREELANCER WITH SUPABASE ── */
// Has this email already registered a freelancer profile?
// Checks Supabase first, then the local fallback list.
async function hasExistingFreelancerProfile(email) {
  const target = (email || '').toLowerCase().trim();
  if (!target) return false;
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('freelancers')
      .select('email')
      .ilike('email', target)
      .limit(1);
    if (!error && data && data.length) return true;
  } catch (err) {
    console.warn('Could not check for an existing freelancer profile.', err);
  }
  try {
    const local = JSON.parse(localStorage.getItem('localFreelancers') || '[]');
    if (local.some(f => (f.email || '').toLowerCase().trim() === target)) return true;
  } catch (err) { /* ignore corrupt local data */ }
  return false;
}

// Replace the freelancer form with a "you already have a profile" notice
function lockFreelancerForm() {
  const btn = document.getElementById('signup-submit-btn');
  const form = btn ? btn.closest('form') : null;
  const card = document.querySelector('.signup-card') || (form && form.parentElement);
  if (!card) {
    if (btn) { btn.disabled = true; btn.textContent = 'Profile Already Submitted'; }
    return;
  }
  card.innerHTML = `
    <div style="text-align:center;padding:20px 10px;">
      <div style="font-size:3rem;margin-bottom:14px;">✅</div>
      <h2 style="font-family:'Playfair Display',serif;font-size:1.6rem;color:var(--text);margin-bottom:10px;">You're already registered</h2>
      <p style="color:var(--gray-mid);font-size:.95rem;max-width:400px;margin:0 auto 26px;line-height:1.6;">
        You've already submitted a freelancer profile. Only one profile is allowed per account.
        You can view your profile on the marketplace.
      </p>
      <a href="find-talent.html"><button class="form-submit" style="max-width:260px;margin:0 auto;">Go to Find Talent</button></a>
    </div>`;
}

window.handleFreelancerSubmit = async function(event) {
  event.preventDefault();

  const submitBtn = document.getElementById('signup-submit-btn');
  if (!submitBtn) return;
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting Profile...';

  try {
    // One profile per account — block a second submission
    const myEmail = (localStorage.getItem('userEmail') || document.getElementById('signup-email').value || '').toLowerCase().trim();
    if (await hasExistingFreelancerProfile(myEmail)) {
      alert('You have already submitted a freelancer profile. Only one profile is allowed per account.');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Profile Already Submitted';
      window.location.href = 'find-talent.html';
      return;
    }

    const firstName = document.getElementById('signup-first-name').value.trim();
    const lastName = document.getElementById('signup-last-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const program = document.getElementById('signup-program').value;
    const year = document.getElementById('signup-year').value;
    const headline = document.getElementById('signup-headline').value.trim();
    const bio = document.getElementById('signup-bio').value.trim();
    const rate = document.getElementById('signup-rate').value;
    const mobile = document.getElementById('signup-mobile').value.trim();
    const location = document.getElementById('signup-location').value.trim();
    const linkedin = document.getElementById('signup-linkedin').value.trim();
    const portfolio = document.getElementById('signup-portfolio').value.trim();

    if (!firstName || !lastName || !email || !program || !year || !headline || !bio || !rate || !mobile || !location) {
      alert('Please fill in all required fields.');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(rate) || parseFloat(rate) <= 0) {
      alert('Please enter a valid starting rate (a number greater than 0).');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }

    // Get selected skills
    const selectedSkills = [];
    document.querySelectorAll('#signup-skills-picker .skill-pick.chosen').forEach(el => {
      selectedSkills.push(el.textContent.trim());
    });

    // Build portfolio array: start with direct link if provided, followed by uploaded files
    const portfolioUrls = [];
    if (portfolio) {
      portfolioUrls.push(portfolio);
    }
    uploadedPortfolioFiles.forEach(f => {
      portfolioUrls.push(f.dataUrl);
    });

    // The database only accepts profiles created under the student's own
    // login email, so prefer the verified account email over the form field
    const accountEmail = (localStorage.getItem('userEmail') || '').toLowerCase();
    const profileData = {
      first_name: firstName,
      last_name: lastName,
      email: accountEmail || email,
      program: `${program} (${year})`,
      headline: headline,
      bio: bio,
      skills: selectedSkills,
      rate: parseFloat(rate),
      mobile: mobile,
      location: location,
      linkedin: linkedin || null,
      portfolio: JSON.stringify(portfolioUrls) // Column is plain text, so store as a JSON string
    };

    // Save to Supabase
    let supabaseSuccess = false;
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from('freelancers').insert([profileData]);
      if (error) throw error;
      supabaseSuccess = true;
      console.log('Freelancer profile saved successfully to Supabase:', data);
    } catch (supabaseErr) {
      console.warn('Failed to insert into Supabase freelancers table. Saving locally.', supabaseErr);
    }

    // Always save to localStorage as fallback
    const localFreelancers = JSON.parse(localStorage.getItem('localFreelancers') || '[]');
    localFreelancers.push(profileData);
    localStorage.setItem('localFreelancers', JSON.stringify(localFreelancers));

    // Reset uploaded files state
    uploadedPortfolioFiles = [];

    alert('Success! Your profile has been registered and is now live on the marketplace!');
    window.location.href = 'find-talent.html';
  } catch (err) {
    console.error('Error submitting profile:', err);
    alert('An unexpected error occurred. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
};

/* ── RENDER FREELANCER CARD ── */
async function renderFreelancerCard(f, grid, pageCategory) {
  // Check if matches category
  const prog = (f.program || f.headline || '').toLowerCase();
  const skills = (f.skills || []).map(s => s.toLowerCase());
  
  let matches = true;
  if (pageCategory === 'engineering') {
    matches = prog.includes('it') || prog.includes('computer') || prog.includes('information') || prog.includes('software') || prog.includes('engineer') || prog.includes('dev') || skills.includes('react') || skills.includes('node.js') || skills.includes('flutter');
  } else if (pageCategory === 'editing') {
    matches = prog.includes('emc') || prog.includes('multimedia') || prog.includes('editor') || prog.includes('video') || skills.includes('premiere') || skills.includes('davinci') || skills.includes('after effects');
  } else if (pageCategory === 'arts') {
    matches = prog.includes('art') || prog.includes('design') || prog.includes('mma') || prog.includes('illustration') || skills.includes('figma') || skills.includes('blender') || skills.includes('photoshop') || skills.includes('illustrator');
  }

  if (!matches) return;

  const fullName = `${f.first_name} ${f.last_name}`;

  // portfolio is stored as a JSON string in the DB (plain text column) — parse it back into an array
  let portfolioArr = [];
  if (Array.isArray(f.portfolio)) {
    portfolioArr = f.portfolio; // already an array (e.g. from localStorage fallback)
  } else if (typeof f.portfolio === 'string' && f.portfolio.trim()) {
    try {
      const parsed = JSON.parse(f.portfolio);
      portfolioArr = Array.isArray(parsed) ? parsed : [f.portfolio];
    } catch {
      portfolioArr = [f.portfolio]; // fallback for old rows saved as a plain string
    }
  }
  const comms = await getCompletedCommissions(f.email);
  const completedProjects = comms.data.length || 0;
  // Register in global object so openProfile works!
  freelancers[fullName] = {
    email: f.email || '',
    role: `${f.headline} · ${f.program}`,
    avatar: f.avatar && !f.avatar.includes('unsplash.com') ? f.avatar : generateInitialsAvatar(fullName),
    cover: f.cover && !f.cover.includes('unsplash.com') ? f.cover : generateCoverBanner(fullName),
    bio: f.bio,
    rate: `₱${f.rate} / hour`,
    projects: `${completedProjects} completed`,
    skills: f.skills || [],
    portfolio: portfolioArr.length > 0 ? portfolioArr : ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=70']
  };

  // Build the element
  const card = document.createElement('div');
  card.className = 'talent-card';
  card.dataset.email = f.email || '';
  card.innerHTML = `
    <div class="talent-body">
      <div class="talent-name">${fullName}</div>
      <div class="talent-role">${f.headline} · ${f.program}</div>
      <div class="talent-skills">
        ${(f.skills || []).slice(0, 3).map(s => `<span class="skill-tag">${s}</span>`).join('')}
      </div>
      <button class="talent-cta" onclick="openProfile('${fullName}')">View Profile</button>
    </div>
  `;
  
  // Prepend so newest is first
  grid.insertBefore(card, grid.firstChild);
}

/* ── FETCH & MERGE ALL FREELANCERS ── */
async function loadAllDynamicProfiles() {
  const grid = document.querySelector('.talent-grid');
  if (!grid) return;

  const pageTitle = document.title.toLowerCase();
  let pageCategory = '';
  if (pageTitle.includes('engineer')) {
    pageCategory = 'engineering';
  } else if (pageTitle.includes('editor')) {
    pageCategory = 'editing';
  } else if (pageTitle.includes('artist') || pageTitle.includes('multimedia')) {
    pageCategory = 'arts';
  }

  // 1. Load local profiles first
  const localList = JSON.parse(localStorage.getItem('localFreelancers') || '[]');
  localList.forEach(f => renderFreelancerCard(f, grid, pageCategory));

  // 2. Load Supabase profiles
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from('freelancers').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase freelancers table not loaded/created yet.', error);
      return;
    }
    
    if (data && data.length > 0) {
      const renderedNames = new Set(localList.map(item => `${item.first_name} ${item.last_name}`));
      data.forEach(f => {
        const fullName = `${f.first_name} ${f.last_name}`;
        if (!renderedNames.has(fullName)) {
          renderFreelancerCard(f, grid, pageCategory);
          renderedNames.add(fullName);
        }
      });
      // Re-initialize click actions on any new dynamic cards
      initTalentCtas();
    }
  } catch (err) {
    console.warn('Supabase connection or table error:', err);
  }

  // If the admin check already resolved, decorate the freshly rendered cards
  applyAdminUI();
}

/* ── ADMIN MODE ── */
window.isAdminUser = false;

async function checkAdminStatus() {
  if (localStorage.getItem('isLoggedIn') !== 'true') return false;
  const email = (localStorage.getItem('userEmail') || '').toLowerCase().trim();
  if (!email) return false;
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from('admins').select('email').eq('email', email).limit(1);
    if (error) throw error;
    return !!(data && data.length);
  } catch (err) {
    console.warn('Admin check failed (admins table not set up yet?)', err);
    return false;
  }
}

function applyAdminUI() {
  if (!window.isAdminUser) return;

  // Admin chip in the nav
  const navActions = document.querySelector('.nav-actions');
  if (navActions && !navActions.querySelector('.admin-chip')) {
    const chip = document.createElement('span');
    chip.className = 'admin-chip';
    chip.textContent = 'ADMIN';
    navActions.insertBefore(chip, navActions.firstChild);
  }

  // Delete button on every talent card (full-width, below "View Profile")
  document.querySelectorAll('.talent-card').forEach(card => {
    if (card.querySelector('.talent-admin-del')) return;
    const body = card.querySelector('.talent-body') || card;
    const nameEl = card.querySelector('.talent-name');
    const name = nameEl ? nameEl.textContent.trim() : 'this freelancer';
    const btn = document.createElement('button');
    btn.className = 'talent-admin-del';
    btn.setAttribute('aria-label', `Delete ${name}`);
    btn.textContent = 'Delete';
    // Styled inline so a cached stylesheet can never leave it unstyled
    btn.style.cssText = "width:100%;padding:10px;margin-top:10px;background:#e5484d;color:#fff;font-size:.85rem;font-weight:600;border:none;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .28s cubic-bezier(.4,0,.2,1);";
    btn.onmouseover = () => { btn.style.background = '#c93338'; };
    btn.onmouseout = () => { btn.style.background = '#e5484d'; };
    btn.onclick = (e) => {
      e.stopPropagation();
      deleteFreelancer(card.dataset.email || '', name, card);
    };
    body.appendChild(btn);
  });
}

async function deleteFreelancer(email, name, card) {
  if (!confirm(`Delete ${name} from the marketplace?\n\nThis permanently removes their profile and cannot be undone.`)) return;

  let remoteErr = null;
  if (email) {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.from('freelancers').delete().eq('email', email);
      if (error) throw error;
    } catch (err) {
      remoteErr = err;
    }
  }

  // Remove any local fallback copies too
  try {
    const local = JSON.parse(localStorage.getItem('localFreelancers') || '[]');
    const filtered = local.filter(f => (f.email || '').toLowerCase().trim() !== email.toLowerCase().trim());
    localStorage.setItem('localFreelancers', JSON.stringify(filtered));
  } catch (err) { /* ignore corrupt local data */ }

  card.remove();

  if (remoteErr) {
    console.error('Failed to delete freelancer from Supabase:', remoteErr);
    alert('Removed from this page, but the online database delete failed.\nMake sure supabase-admin-setup.sql has been run and you are logged in as an admin.');
  }
}

/* ── COMMISSION NOTIFICATIONS (nav bell) ── */
let notifBookings = [];

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function timeAgo(iso) {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// Identity of a booking independent of where it was stored (Supabase vs
// localStorage fallback) — created_at intentionally excluded because the
// two copies get different timestamps
function commissionKey(c) {
  return [
    (c.client_email || '').toLowerCase().trim(),
    (c.freelancer_email || c.freelancer_name || '').toLowerCase().trim(),
    c.project_type || '',
    String(c.budget || ''),
    (c.project_desc || '').slice(0, 60)
  ].join('|');
}

// Latest activity relevant TO ME (for the unread badge)
function notifEventTime(c) {
  const times = c._kind === 'received'
    ? [c.created_at, c.payment_at]   // new booking / client paid
    : [c.status_at];                 // freelancer accepted or declined
  return times.filter(Boolean).map(t => new Date(t).getTime()).reduce((a, b) => Math.max(a, b), 0);
}

function notifSortTime(c) {
  return [c.created_at, c.status_at, c.payment_at]
    .filter(Boolean).map(t => new Date(t).getTime()).reduce((a, b) => Math.max(a, b), 0);
}

async function fetchMyBookings() {
  const myEmail = (localStorage.getItem('userEmail') || '').toLowerCase().trim();
  const myName = (localStorage.getItem('userName') || '').trim();
  const map = new Map();
  const add = (c, kind) => {
    const key = kind + '|' + commissionKey(c);
    const existing = map.get(key);
    if (existing) {
      // Prefer the remote copy (has an id) but keep newer fields either way
      map.set(key, existing.id != null ? { ...c, ...existing, _kind: kind } : { ...existing, ...c, _kind: kind });
      return;
    }
    map.set(key, { ...c, _kind: kind });
  };
  const classify = (c) => {
    const isFreelancerMe = (myEmail && (c.freelancer_email || '').toLowerCase() === myEmail) ||
                           (myName && c.freelancer_name === myName);
    const isClientMe = myEmail && (c.client_email || '').toLowerCase() === myEmail;
    if (isFreelancerMe) add(c, 'received');
    else if (isClientMe) add(c, 'sent');
  };

  try {
    const filters = [];
    if (myEmail) {
      filters.push(`freelancer_email.eq."${myEmail}"`);
      filters.push(`client_email.eq."${myEmail}"`);
    }
    if (myName) filters.push(`freelancer_name.eq."${myName}"`);
    if (filters.length) {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from('commissions').select('*').or(filters.join(','));
      if (error) throw error;
      (data || []).forEach(classify);
    }
  } catch (err) {
    console.warn('Could not load commissions for notifications.', err);
  }

  try {
    JSON.parse(localStorage.getItem('localCommissions') || '[]').forEach(classify);
  } catch (err) { /* ignore corrupt local data */ }

  return Array.from(map.values()).sort((a, b) => notifSortTime(b) - notifSortTime(a));
}

function renderNotifList() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  if (!notifBookings.length) {
    list.innerHTML = `
      <div class="notif-empty">
        🔔<br/>No notifications yet.<br/>
        <span style="font-size:.8rem;">Commission bookings and updates will show up here.</span>
      </div>`;
    return;
  }
  list.innerHTML = notifBookings.map((c, i) => {
    const received = c._kind === 'received';
    const other = received ? (c.client_name || c.client_email || 'Client')
                           : (c.freelancer_name || 'Freelancer');
    const status = c.status || 'pending';
    const statusChip =
      c.payment_ref        ? `<span class="notif-status paid">💰 Paid · Ref ${escapeHtml(c.payment_ref)}</span>` :
      status === 'accepted' ? `<span class="notif-status accepted">✓ Accepted</span>` :
      status === 'declined' ? `<span class="notif-status declined">✕ Declined</span>` :
                              `<span class="notif-status pending">Pending</span>`;
    const title = received
      ? `<strong>${escapeHtml(other)}</strong> booked you for a commission`
      : `You booked <strong>${escapeHtml(other)}</strong>`;

    let actions = '';
    if (received && status === 'pending') {
      actions += `<button class="notif-btn accept" data-act="accept" data-i="${i}">✓ Accept</button>` +
                 `<button class="notif-btn decline" data-act="decline" data-i="${i}">✕ Decline</button>`;
    }
    if (!received && status === 'accepted' && !c.payment_ref) {
      actions += `<button class="notif-btn pay" data-act="pay" data-i="${i}">💳 Upload Payment</button>`;
    }
    if (received && c.payment_screenshot) {
      actions += `<button class="notif-btn view" data-act="shot" data-i="${i}">🧾 View Payment</button>`;
    }
    const chatEmail = received ? c.client_email : c.freelancer_email;
    if (chatEmail) {
      actions += `<button class="notif-btn chat" data-act="chat" data-i="${i}">💬 Chat</button>`;
    }

    return `
    <div class="notif-item">
      <img src="${generateInitialsAvatar(other || '?')}" alt="" />
      <div class="notif-item-main">
        <div class="notif-item-title">${title}</div>
        <div class="notif-item-sub">${escapeHtml(c.project_type || 'Project')} · ₱${Number(c.budget || 0).toLocaleString('en-PH')} &nbsp;${statusChip}</div>
        ${c.project_desc ? `<div class="notif-item-desc">${escapeHtml(c.project_desc)}</div>` : ''}
        <div class="notif-item-time">${timeAgo(c.created_at)}</div>
        ${actions ? `<div class="notif-actions">${actions}</div>` : ''}
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('.notif-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleNotifAction(btn.dataset.act, Number(btn.dataset.i));
    });
  });
}

async function updateCommission(c, fields) {
  let remoteOk = false;
  if (c.id != null) {
    try {
      const supabase = await getSupabase();
      // .select() makes Supabase return the changed rows — an empty result
      // means RLS silently blocked the update (missing update policy)
      const { data, error } = await supabase.from('commissions').update(fields).eq('id', c.id).select();
      if (error) throw error;
      if (!data || !data.length) throw new Error('Update was blocked — run supabase-commissions-setup.sql to add the update policy.');
      remoteOk = true;
    } catch (err) {
      console.warn('Failed to update commission in Supabase.', err);
      alert('Could not save this change to the online database.\n' + (err.message || 'Please check your connection and try again.'));
    }
  }
  // Mirror the change onto a local fallback copy if one exists
  try {
    const local = JSON.parse(localStorage.getItem('localCommissions') || '[]');
    let touched = false;
    local.forEach(lc => {
      if (commissionKey(lc) === commissionKey(c)) { Object.assign(lc, fields); touched = true; }
    });
    if (touched) localStorage.setItem('localCommissions', JSON.stringify(local));
  } catch (err) { /* ignore */ }

  // Only reflect the change in the UI if it was actually saved somewhere
  // (remote row updated, or the row only lives in this browser's fallback)
  if (remoteOk || c.id == null) Object.assign(c, fields);
  renderNotifList();
  return remoteOk;
}

async function handleNotifAction(act, i) {
  const c = notifBookings[i];
  if (!c) return;
  if (act === 'accept' || act === 'decline') {
    await updateCommission(c, {
      status: act === 'accept' ? 'accepted' : 'declined',
      status_at: new Date().toISOString()
    });
  } else if (act === 'chat') {
    const panel = document.getElementById('notif-panel');
    if (panel) panel.classList.remove('open');
    const email = c._kind === 'received' ? c.client_email : c.freelancer_email;
    const name = c._kind === 'received' ? (c.client_name || email) : (c.freelancer_name || email);
    if (window.openChatWith && email) window.openChatWith(name, email);
  } else if (act === 'pay') {
    openPaymentModal(i);
  } else if (act === 'shot') {
    viewPaymentShot(c);
  }
}

async function refreshNotifications() {
  notifBookings = await fetchMyBookings();
  const seenAt = localStorage.getItem('notifSeenAt') || '';
  const seenMs = seenAt ? new Date(seenAt).getTime() : 0;
  const unseen = notifBookings.filter(c => {
    const t = notifEventTime(c);
    return t && t > seenMs;
  }).length;
  const badge = document.getElementById('notif-badge');
  if (badge) {
    badge.textContent = unseen > 9 ? '9+' : String(unseen);
    badge.style.display = unseen > 0 ? 'flex' : 'none';
  }
  renderNotifList();
}

/* ── PAYMENT PROOF MODAL (opens from an accepted booking) ── */
let payTargetIndex = null;
let payShotDataUrl = '';

function ensurePaymentModal() {
  if (document.getElementById('payment-modal')) return;
  const div = document.createElement('div');
  div.id = 'payment-modal';
  div.className = 'pay-overlay';
  div.innerHTML = `
    <div class="pay-card">
      <button class="pay-close" onclick="closePaymentModal()">✕</button>
      <h3>Payment via GCash</h3>
      <p class="pay-sub">Send your payment to the number below, then upload a screenshot as proof.</p>
      <div class="pay-gcash">
        <div class="pay-gcash-label">GCash Number</div>
        <div class="pay-gcash-num">0917-XXX-XXXX</div>
        <div class="pay-gcash-name">Account Name: iCreate Platform</div>
        <div class="pay-amount-row">Amount to Send: <strong id="pay-amount"></strong></div>
      </div>
      <div class="pay-drop" onclick="document.getElementById('pay-file').click()">
        <input type="file" id="pay-file" accept="image/*" style="display:none" onchange="handlePayFile(this)" />
        <div id="pay-drop-idle">
          <div style="font-size:2rem;">📷</div>
          <p><strong>Upload GCash screenshot</strong></p>
          <p class="pay-hint">PNG/JPG up to 3 MB</p>
        </div>
        <div id="pay-drop-done" style="display:none;">
          <img id="pay-preview" alt="" />
          <p id="pay-filename"></p>
        </div>
      </div>
      <div class="form-group">
        <label>GCash Reference Number</label>
        <input type="text" id="pay-ref" placeholder="e.g. 1234567890" />
      </div>
      <button class="pay-submit" id="pay-submit" onclick="submitPayment()">✅ Submit Payment Proof</button>
    </div>`;
  div.addEventListener('click', (e) => { if (e.target === div) closePaymentModal(); });
  document.body.appendChild(div);
}

function openPaymentModal(i) {
  ensurePaymentModal();
  payTargetIndex = i;
  payShotDataUrl = '';
  const c = notifBookings[i];
  document.getElementById('pay-amount').textContent = '₱' + Number(c && c.budget || 0).toLocaleString('en-PH');
  document.getElementById('pay-ref').value = '';
  document.getElementById('pay-drop-idle').style.display = 'block';
  document.getElementById('pay-drop-done').style.display = 'none';
  document.getElementById('payment-modal').style.display = 'flex';
}

window.closePaymentModal = function () {
  const m = document.getElementById('payment-modal');
  if (m) m.style.display = 'none';
};

window.handlePayFile = async function (input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  if (file.size > 3 * 1024 * 1024) {
    alert('Screenshot is too large — maximum size is 3 MB.');
    input.value = '';
    return;
  }
  try {
    payShotDataUrl = await readFileAsDataURL(file);
    document.getElementById('pay-preview').src = payShotDataUrl;
    document.getElementById('pay-filename').textContent = file.name;
    document.getElementById('pay-drop-idle').style.display = 'none';
    document.getElementById('pay-drop-done').style.display = 'block';
  } catch (err) {
    console.error('Error reading screenshot:', err);
  }
};

window.submitPayment = async function () {
  const ref = document.getElementById('pay-ref').value.trim();
  if (!payShotDataUrl) { alert('Please upload your GCash screenshot first.'); return; }
  if (!ref) { alert('Please enter your GCash reference number.'); return; }
  const c = notifBookings[payTargetIndex];
  if (!c) return;

  const btn = document.getElementById('pay-submit');
  btn.disabled = true; btn.textContent = 'Submitting…';
  await updateCommission(c, {
    payment_ref: ref,
    payment_screenshot: payShotDataUrl,
    payment_at: new Date().toISOString()
  });
  btn.disabled = false; btn.textContent = '✅ Submit Payment Proof';
  closePaymentModal();
  refreshNotifications();
};

function viewPaymentShot(c) {
  if (!c.payment_screenshot) return;
  let ov = document.getElementById('shot-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'shot-overlay';
    ov.className = 'pay-overlay';
    ov.innerHTML = `
      <div class="shot-box">
        <button class="pay-close" id="shot-close">✕</button>
        <img id="shot-img" alt="Payment screenshot" />
        <p id="shot-cap"></p>
      </div>`;
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.style.display = 'none'; });
    ov.querySelector('#shot-close').onclick = () => { ov.style.display = 'none'; };
    document.body.appendChild(ov);
  }
  ov.querySelector('#shot-img').src = c.payment_screenshot;
  ov.querySelector('#shot-cap').textContent = c.payment_ref ? 'Ref: ' + c.payment_ref : '';
  ov.style.display = 'flex';
}

function initNotifications() {
  const bell = document.getElementById('notif-bell');
  const panel = document.getElementById('notif-panel');
  if (!bell || !panel) return;
  bell.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = panel.classList.toggle('open');
    if (open) {
      localStorage.setItem('notifSeenAt', new Date().toISOString());
      const badge = document.getElementById('notif-badge');
      if (badge) badge.style.display = 'none';
      refreshNotifications();
    }
  });
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('open') && !panel.contains(e.target) && !bell.contains(e.target)) {
      panel.classList.remove('open');
    }
  });
  refreshNotifications();
  setInterval(refreshNotifications, 30000);
}

/* ── FILTER BUTTONS (visual toggle) ── */
function initFilterBtns() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      this.closest('.filter-bar').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

/* ── WIRE "VIEW PROFILE" BUTTONS ── */
function initTalentCtas() {
  document.querySelectorAll('.talent-cta').forEach(btn => {
    const card   = btn.closest('.talent-body');
    if (!card) return;
    const nameEl = card.querySelector('.talent-name');
    if (!nameEl) return;
    btn.onclick = () => openProfile(nameEl.textContent.trim());
  });
}

/* ── GLOBAL LOGOUT FUNCTION ── */
window.logout = function() {
  localStorage.clear();
  const finish = () => window.location.href = 'index.html';
  // Also end the Supabase auth session so admin permissions don't linger
  if (supabaseClient) {
    supabaseClient.auth.signOut().then(finish, finish);
  } else {
    finish();
  }
};

/* ── PASSWORD RECOVERY GUARD ──
   Supabase appends the recovery token to the redirect URL. If its redirect
   allowlist sends the user to a page other than reset-password.html (e.g.
   the Site URL / landing page), forward them — token intact — to the reset
   page so the flow still works. Runs before the Supabase client is created,
   while the URL hash is still untouched. */
function redirectRecoveryIfNeeded() {
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  const isRecovery = hash.includes('type=recovery') || search.includes('type=recovery');
  const onResetPage = /reset-password\.html$/i.test(window.location.pathname);
  if (isRecovery && !onResetPage) {
    window.location.replace('reset-password.html' + search + hash);
    return true;
  }
  return false;
}

// Today's date as YYYY-MM-DD in the user's local timezone
function todayISODate() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/* ── POSITIVE-AMOUNT NUMERIC INPUTS ──
   Restrict a field to a positive number: digits 0-9 with an optional
   single decimal point (max 2 decimal places). No negatives, exponents,
   commas, or other characters. */
function enforceDecimalInput(input) {
  if (!input) return;
  // Use a text field so mid-typing values (e.g. "2.") stay reliably readable;
  // inputmode keeps a numeric keypad on mobile.
  input.type = 'text';
  input.setAttribute('inputmode', 'decimal');

  const clean = () => {
    let v = input.value.replace(/[^0-9.]/g, '');       // digits + dots only
    const firstDot = v.indexOf('.');
    if (firstDot !== -1) {
      // keep only the first dot, and at most 2 digits after it
      const intPart = v.slice(0, firstDot);
      let decPart = v.slice(firstDot + 1).replace(/\./g, '').slice(0, 2);
      v = intPart + '.' + decPart;
    }
    if (input.value !== v) input.value = v;
  };
  // Block characters a number field would otherwise allow (e, E, +, -, ,)
  input.addEventListener('keydown', (e) => {
    if (['e', 'E', '+', '-', ','].includes(e.key)) e.preventDefault();
  });
  input.addEventListener('input', clean);
  input.addEventListener('paste', () => setTimeout(clean, 0));
}

/* ── INIT ON LOAD ── */
document.addEventListener('DOMContentLoaded', () => {
  // Handle a password-recovery landing before anything else touches the URL
  if (redirectRecoveryIfNeeded()) return;

  // Positive amounts (decimals allowed) in rate/budget fields
  enforceDecimalInput(document.getElementById('signup-rate'));
  enforceDecimalInput(document.getElementById('project-budget'));

  // Commission deadline cannot be in the past (blocks the picker and manual entry)
  const deadlineInput = document.getElementById('project-deadline');
  if (deadlineInput) deadlineInput.min = todayISODate();

  initFilterBtns();
  initTalentCtas();

  // Load any registered profiles dynamically
  loadAllDynamicProfiles();

  // Auth-dependent UI (nav, bell, admin, student gating) is driven by the
  // VERIFIED Supabase session — not by editable localStorage flags
  initAuthUI();

  // Close modal on backdrop click
  const modal = document.getElementById('profile-modal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });
  }

  showEditProfile();
});

/* ── AUTH UI (verified session; localStorage is only a display cache) ── */
async function initAuthUI() {
  let user = null;
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.getUser();
    if (!error && data) user = data.user || null;
  } catch (err) {
    console.warn('Could not verify auth session:', err);
  }

  if (user) {
    // Refresh the cache from the authoritative session
    const verifiedEmail = (user.email || '').toLowerCase();
    // Role is anchored to the verified email domain (so students who sign in
    // with Google are recognized too); metadata is only a fallback.
    const role = verifiedEmail.endsWith('@iacademy.edu.ph')
      ? 'student'
      : ((user.user_metadata && user.user_metadata.role) || 'client');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', verifiedEmail);
    localStorage.setItem('userName', (user.user_metadata && user.user_metadata.full_name) || verifiedEmail.split('@')[0]);
    localStorage.setItem('userType', role);
  } else if (localStorage.getItem('isLoggedIn') === 'true') {
    // Cache claims logged-in but there's no valid session (expired or forged) — wipe it
    ['isLoggedIn', 'userName', 'userType', 'userEmail'].forEach(k => localStorage.removeItem(k));
  }

  const isLoggedIn = !!user;
  const name = localStorage.getItem('userName') || 'User';
  const navActions = document.querySelector('.nav-actions');

  // "Offer My Services" is for iAcademy students only. Student status is
  // proven by the VERIFIED login email domain, which cannot be faked
  // without actually owning an iAcademy account.
  const isStudent = isLoggedIn && (user.email || '').toLowerCase().endsWith('@iacademy.edu.ph');
  if (!isStudent) {
    document.querySelectorAll('.nav-links a[href="offer-services.html"]').forEach(a => {
      if (a.parentElement) a.parentElement.style.display = 'none';
    });
    if (/offer-services\.html$/i.test(window.location.pathname)) {
      alert('Offering services is for iAcademy students. Please log in with your student account first.');
      window.location.href = 'login.html';
      return;
    }
  }

  // Admin mode (checked against the verified email)
  checkAdminStatus().then(isAdmin => {
    window.isAdminUser = isAdmin;
    if (isAdmin) applyAdminUI();
  });

  if (navActions && isLoggedIn) {
    navActions.innerHTML = `
      <div class="notif-wrap">
        <button class="notif-bell" id="notif-bell" title="Notifications" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="notif-badge" id="notif-badge"></span>
        </button>
        <div class="notif-panel" id="notif-panel">
          <div class="notif-panel-head">Notifications</div>
          <div class="notif-panel-list" id="notif-list"></div>
        </div>
      </div>
      <span style="font-size:0.9rem; font-weight:600; color:var(--gray-dark); margin-right:8px;">Hi, ${name}!</span>
      <button class="btn-ghost" onclick="logout()">Log Out</button>
    `;
    initNotifications();

    // Pre-fill student signup profile if on offer-services.html
    const signupEmailInput = document.getElementById('signup-email');
    if (signupEmailInput && !signupEmailInput.value) {
      signupEmailInput.value = localStorage.getItem('userEmail') || '';
    }

    // One profile per account: if they already registered, lock the form
    if (document.getElementById('signup-submit-btn')) {
      hasExistingFreelancerProfile(localStorage.getItem('userEmail')).then(exists => {
        if (exists) lockFreelancerForm();
      });
    }
    const firstNameInput = document.getElementById('signup-first-name');
    const lastNameInput = document.getElementById('signup-last-name');
    if (firstNameInput && lastNameInput && !firstNameInput.value && !lastNameInput.value) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        firstNameInput.value = parts[0];
        lastNameInput.value = parts.slice(1).join(' ');
      } else {
        firstNameInput.value = name;
      }
    }

    // Pre-fill commission client fields
    const clientNameInput = document.getElementById('client-name');
    const clientEmailInput = document.getElementById('client-email');
    if (clientNameInput && !clientNameInput.value) {
      clientNameInput.value = name;
    }
    if (clientEmailInput && !clientEmailInput.value) {
      clientEmailInput.value = localStorage.getItem('userEmail') || '';
    }
  }
}

async function showEditProfile() {
    const supabase = await getSupabase();
    const user = localStorage.getItem("userEmail");
    const navbar = document.getElementsByClassName('nav-links');
    const { data, error } = await supabase
        .from('freelancers')
        .select('email');
    for (const freelancerEmail in data){
        if (user.match(freelancerEmail)){
            navbar[0].innerHTML =
                `
                <li><a href="index.html">Home</a></li>
                <li><a href="find-talent.html">Find Talent</a></li>
                <li><a href="edit-profile.html">Edit Profile</a></li>
                <li><a href="index.html#how">How it Works</a></li>
                <li><a href="index.html#about">About</a></li>
                `;
            return    
        }
    } 
}