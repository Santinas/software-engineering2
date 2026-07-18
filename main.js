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

/* ── FREELANCER DATA ── */
const freelancers = {};

let currentFreelancer = '';

/* ── PROFILE MODAL ── */
function openProfile(name) {
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
  portEl.innerHTML = f.portfolio.map(src =>
    `<img src="${src}" alt="portfolio" style="width:100%;height:130px;object-fit:cover;border-radius:10px;" />`
  ).join('');

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

function goToPayment() {
  const name   = document.getElementById('client-name').value.trim();
  const email  = document.getElementById('client-email').value.trim();
  const type   = document.getElementById('project-type').value;
  const desc   = document.getElementById('project-desc').value.trim();
  const budget = document.getElementById('project-budget').value;

  if (!name || !email || !type || !desc || !budget) {
    alert('Please fill in all required fields before continuing.');
    return;
  }

  const formatted = '₱' + Number(budget).toLocaleString('en-PH');
  document.getElementById('payment-amount').textContent = formatted;
  document.getElementById('commission-step-1').style.display = 'none';
  document.getElementById('commission-step-2').style.display = 'block';
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

  supabaseClient = window.supabase.createClient(url, config.supabaseAnonKey);
  return supabaseClient;
}

/* ── SUBMIT COMMISSION WITH SUPABASE ── */
async function submitCommission() {
  const ref       = document.getElementById('gcash-ref').value.trim();
  const fileInput = document.getElementById('gcash-file');
  if (!fileInput.files || !fileInput.files[0]) {
    alert('Please upload your GCash screenshot before submitting.');
    return;
  }
  if (!ref) {
    alert('Please enter your GCash reference number.');
    return;
  }

  const clientName = document.getElementById('client-name').value.trim();
  const clientEmail = document.getElementById('client-email').value.trim();
  const projType = document.getElementById('project-type').value;
  const projDesc = document.getElementById('project-desc').value.trim();
  const budget = document.getElementById('project-budget').value;
  const deadline = document.getElementById('project-deadline').value;

  const commissionData = {
    freelancer_name: currentFreelancer,
    client_name: clientName,
    client_email: clientEmail,
    project_type: projType,
    project_desc: projDesc,
    budget: parseInt(budget, 10),
    deadline: deadline || null,
    gcash_ref: ref,
    screenshot_url: fileInput.files[0].name
  };

  // Submit to Supabase
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from('commissions').insert([commissionData]);
    if (error) throw error;
    console.log('Commission saved successfully to Supabase:', data);
  } catch (err) {
    console.warn('Failed to insert commission into Supabase. Storing locally as fallback.', err);
  }

  // Backup store to localStorage
  const localCommissions = JSON.parse(localStorage.getItem('localCommissions') || '[]');
  localCommissions.push(commissionData);
  localStorage.setItem('localCommissions', JSON.stringify(localCommissions));

  document.getElementById('commission-step-2').style.display = 'none';
  document.getElementById('commission-step-3').style.display = 'block';
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
window.handleFreelancerSubmit = async function(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('signup-submit-btn');
  if (!submitBtn) return;
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting Profile...';

  try {
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

    const profileData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      program: `${program} (${year})`,
      headline: headline,
      bio: bio,
      skills: selectedSkills,
      rate: parseInt(rate, 10),
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
function renderFreelancerCard(f, grid, pageCategory) {
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

  // Register in global object so openProfile works!
  freelancers[fullName] = {
    email: f.email || '',
    role: `${f.headline} · ${f.program}`,
    avatar: f.avatar && !f.avatar.includes('unsplash.com') ? f.avatar : generateInitialsAvatar(fullName),
    cover: f.cover && !f.cover.includes('unsplash.com') ? f.cover : generateCoverBanner(fullName),
    bio: f.bio,
    rate: `₱${f.rate} / hour`,
    projects: '0 completed',
    skills: f.skills || [],
    portfolio: portfolioArr.length > 0 ? portfolioArr : ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=70']
  };

  // Build the element
  const card = document.createElement('div');
  card.className = 'talent-card';
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
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('userType');
  window.location.reload();
};

/* ── INIT ON LOAD ── */
document.addEventListener('DOMContentLoaded', () => {
  initFilterBtns();
  initTalentCtas();
  
  // Load any registered profiles dynamically
  loadAllDynamicProfiles();

  // Dynamic Authentication state in Navigation
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const name = localStorage.getItem('userName') || 'User';
  const navActions = document.querySelector('.nav-actions');

  if (navActions && isLoggedIn) {
    navActions.innerHTML = `
      <span style="font-size:0.9rem; font-weight:600; color:var(--gray-dark); margin-right:8px;">Hi, ${name}!</span>
      <button class="btn-ghost" onclick="logout()">Log Out</button>
    `;

    // Pre-fill student signup profile if on offer-services.html
    const signupEmailInput = document.getElementById('signup-email');
    if (signupEmailInput && !signupEmailInput.value) {
      signupEmailInput.value = localStorage.getItem('userEmail') || '';
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

  // Close modal on backdrop click
  const modal = document.getElementById('profile-modal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });
  }
});