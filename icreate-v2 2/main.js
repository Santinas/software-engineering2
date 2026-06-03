/* ──────────────────────────────────────────────────────────
   iCreate · CENTRAL LOCAL DATABASE ENGINE
────────────────────────────────────────────────────────── */
const iCreateDB = {
  // 1. Initialize Database with a Mock Student Profile if empty
  init() {
    if (!localStorage.getItem('icreate_users')) {
      const defaultUsers = [
        {
          name: "Juan dela Cruz",
          email: "student@iacademy.edu.ph",
          password: "password123",
          registeredAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('icreate_users', JSON.stringify(defaultUsers));
      console.log("iCreate Database Initialized with default records.");
    }
  },

  // 2. Fetch all registered user records (SELECT * FROM users)
  getAllUsers() {
    this.init();
    return JSON.parse(localStorage.getItem('icreate_users'));
  },

  // 3. Register a new user (INSERT INTO users)
  registerUser(name, email, password) {
    const users = this.getAllUsers();
    
    // Check if email already exists
    const userExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
      return { success: false, message: "This email address is already registered!" };
    }

    // Append new user record
    const newUser = {
      name,
      email: email.toLowerCase(),
      password, 
      registeredAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('icreate_users', JSON.stringify(users));
    
    // Automatically log them in after registration
    this.setCurrentSession(newUser);
    return { success: true, message: "Account created successfully!" };
  },

  // 4. Authenticate user credentials (SELECT * FROM users WHERE email=? AND password=?)
  authenticate(email, password) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!user) {
      return { success: false, message: "Invalid email address or incorrect password." };
    }

    this.setCurrentSession(user);
    return { success: true, message: `Welcome back, ${user.name}!` };
  },

  // 5. Establish Session (Set active session token)
  setCurrentSession(user) {
    const sessionData = {
      name: user.name,
      email: user.email,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('icreate_current_user', JSON.stringify(sessionData));
  },

  // 6. Get Active Session (Check if user is logged in)
  getCurrentSession() {
    const session = localStorage.getItem('icreate_current_user');
    return session ? JSON.parse(session) : null;
  },

  // 7. Clear Session (Log out)
  destroySession() {
    localStorage.removeItem('icreate_current_user');
  }
};


/* ──────────────────────────────────────────────────────────
   iCreate · AUTHENTICATION UI LOGIC (Modal Controllers)
────────────────────────────────────────────────────────── */
let authMode = 'login'; 

const getAuthEls = () => ({
  modal: document.getElementById('auth-modal'),
  title: document.getElementById('auth-title'),
  subtitle: document.getElementById('auth-subtitle'),
  groupName: document.getElementById('group-fullname'),
  nameInput: document.getElementById('auth-name'),
  emailInput: document.getElementById('auth-email'),
  passInput: document.getElementById('auth-password'),
  submitBtn: document.getElementById('auth-submit-btn'),
  switchText: document.getElementById('auth-switch-text'),
  switchLink: document.getElementById('auth-switch-link'),
  alert: document.getElementById('auth-alert')
});

function openAuthModal(mode = 'login') {
  authMode = mode;
  const els = getAuthEls();
  if (!els.modal) return;

  // Clear previous values & alert states
  els.alert.style.display = 'none';
  els.emailInput.value = '';
  els.passInput.value = '';
  els.nameInput.value = '';

  if (authMode === 'login') {
    els.title.textContent = 'Welcome Back';
    els.subtitle.textContent = 'Log in to access your iCreate account';
    els.groupName.style.display = 'none';
    els.nameInput.removeAttribute('required');
    els.submitBtn.textContent = 'Log In';
    els.switchText.textContent = "Don't have an account?";
    els.switchLink.textContent = 'Sign Up';
  } else {
    els.title.textContent = 'Create an Account';
    els.subtitle.textContent = 'Join the iAcademy creative & tech network';
    els.groupName.style.display = 'block';
    els.nameInput.setAttribute('required', 'true');
    els.submitBtn.textContent = 'Register';
    els.switchText.textContent = 'Already have an account?';
    els.switchLink.textContent = 'Log In';
  }

  els.modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  const els = getAuthEls();
  if (els.modal) els.modal.style.display = 'none';
  document.body.style.overflow = '';
}

function toggleAuthMode(e) {
  e.preventDefault();
  openAuthModal(authMode === 'login' ? 'register' : 'login');
}

function showAuthAlert(message, isSuccess = false) {
  const alertEl = getAuthEls().alert;
  if (!alertEl) return;
  alertEl.textContent = message;
  alertEl.style.display = 'block';
  if (isSuccess) {
    alertEl.style.background = '#e8f5ee';
    alertEl.style.color = '#1a7a45';
    alertEl.style.border = '1px solid #a0ddb8';
  } else {
    alertEl.style.background = '#fdf2f2';
    alertEl.style.color = '#9b1c1c';
    alertEl.style.border = '1px solid #f8b4b4';
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const els = getAuthEls();
  const email = els.emailInput.value.trim();
  const password = els.passInput.value;

  if (authMode === 'register') {
    const name = els.nameInput.value.trim();
    const result = iCreateDB.registerUser(name, email, password);
    
    if (!result.success) {
      showAuthAlert(result.message, false);
    } else {
      showAuthAlert(result.message + " Logging you in...", true);
      setTimeout(() => { closeAuthModal(); updateNavbarAuthUI(); }, 1500);
    }
  } else {
    const result = iCreateDB.authenticate(email, password);
    if (!result.success) {
      showAuthAlert(result.message, false);
    } else {
      showAuthAlert(result.message, true);
      setTimeout(() => { closeAuthModal(); updateNavbarAuthUI(); }, 1200);
    }
  }
}

function handleLogout() {
  iCreateDB.destroySession();
  updateNavbarAuthUI();
  window.location.reload();
}

function updateNavbarAuthUI() {
  const user = iCreateDB.getCurrentSession();
  const navActionsContainers = document.querySelectorAll('.nav-actions');

  navActionsContainers.forEach(container => {
    if (user) {
      container.innerHTML = `
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="text-align:right;display:block;">
            <div style="font-size:.85rem;font-weight:700;color:#1c2033;">${user.name}</div>
            <div style="font-size:.7rem;color:#1a7a45;font-weight:600;">🟢 Online</div>
          </div>
          <button onclick="handleLogout()" style="padding:8px 16px;background:#fdf2f2;color:#9b1c1c;border:1px solid #f8b4b4;border-radius:10px;font-size:.85rem;font-weight:600;cursor:pointer;font-family:inherit;">Log Out</button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <button class="btn-ghost" id="nav-login-btn">Log In</button>
        <button class="btn-solid" id="nav-signup-btn">Sign Up</button>
      `;
    }
  });

  if (!user) {
    document.querySelectorAll('#nav-login-btn').forEach(b => b.onclick = () => openAuthModal('login'));
    document.querySelectorAll('#nav-signup-btn').forEach(b => b.onclick = () => openAuthModal('register'));
  }
}


/* ──────────────────────────────────────────────────────────
   iCreate · EXISTING DATA & LOGIC (Freelancers, Profiles, Filters)
────────────────────────────────────────────────────────── */
const freelancers = {
  'Marco Reyes': {
    role: 'Full-Stack Developer · BS Information Technology',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&q=80',
    bio: "Hi! I'm Marco, a 3rd year BS IT student at iAcademy. I specialize in building full-stack web applications using React, Node.js, and MySQL. I've built capstone projects including a real-time inventory system and a school portal. I love clean code and pixel-perfect UIs.",
    rate: '₱150 / hour',
    projects: '18 completed',
    skills: ['React','Node.js','MySQL','REST APIs','Git','Tailwind CSS'],
    portfolio: [
      'https://images.unsplash.com/photo-1555066931-4365d14431b9?w=400&q=70',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=70'
    ]
  },
  'Sophia Lim': {
    role: 'Multimedia Artist · BA Multimedia Arts and Design',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=80',
    bio: "Hello! I'm Sophia, a senior Multimedia Arts student. I specialize in brand identity design, digital illustration, and marketing collaterals. I use Adobe Illustrator, Photoshop, and Figma. I have worked with multiple local startups to help shape their visual stories.",
    rate: '₱200 / hour',
    projects: '32 completed',
    skills: ['Illustrator','Photoshop','Figma','Branding','Vector Art','UI Design'],
    portfolio: [
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=70',
      'https://images.unsplash.com/photo-1541462608141-ad4979e408c9?w=400&q=70'
    ]
  },
  'Ethan Santos': {
    role: 'Video Editor & Animator · BA Animation',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=900&q=80',
    bio: "Hey there! I'm Ethan, an Animation major specializing in video post-production and 2D motion graphics. Experienced in editing vlogs, commercial ads, and short films using Premiere Pro and After Effects. Let's make your videos engaging and dynamic!",
    rate: '₱180 / hour',
    projects: '24 completed',
    skills: ['Premiere Pro','After Effects','Motion Graphics','Color Grading','Audio Mixing','2D Animation'],
    portfolio: [
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&q=70',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=70'
    ]
  }
};

function openProfile(name) {
  const data = freelancers[name];
  if (!data) return;

  const modal = document.getElementById('profile-modal');
  if (!modal) return;

  // Set names & texts
  document.getElementById('modal-name').textContent = name;
  document.getElementById('modal-role').textContent = data.role;
  document.getElementById('modal-bio').textContent = data.bio;
  document.getElementById('modal-rate').textContent = data.rate;
  document.getElementById('modal-projects').textContent = data.projects;

  // Set assets
  document.getElementById('modal-avatar').src = data.avatar;
  document.getElementById('modal-cover').style.backgroundImage = `url('${data.cover}')`;
  document.getElementById('modal-cover').style.backgroundSize = 'cover';
  document.getElementById('modal-cover').style.backgroundPosition = 'center';

  // Render Skill Badges
  const skillsWrap = document.getElementById('modal-skills');
  skillsWrap.innerHTML = '';
  data.skills.forEach(skill => {
    const span = document.createElement('span');
    span.className = 'skill-badge';
    span.textContent = skill;
    skillsWrap.appendChild(span);
  });

  // Render Portfolio Grid
  const portfolioWrap = document.getElementById('modal-portfolio-grid');
  portfolioWrap.innerHTML = '';
  data.portfolio.forEach(imgUrl => {
    const div = document.createElement('div');
    div.className = 'portfolio-item';
    div.style.backgroundImage = `url('${imgUrl}')`;
    portfolioWrap.appendChild(div);
  });

  // Reset multi-step order layout form states
  switchTab('portfolio');
  document.getElementById('commission-step-1').style.display = 'block';
  document.getElementById('commission-step-2').style.display = 'none';
  document.getElementById('commission-step-3').style.display = 'none';

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

function switchTab(tab) {
  const pTab = document.getElementById('tab-portfolio');
  const hTab = document.getElementById('tab-hire');
  const pContent = document.getElementById('content-portfolio');
  const hContent = document.getElementById('content-hire');

  if (!pTab || !hTab || !pContent || !hContent) return;

  if (tab === 'portfolio') {
    pTab.classList.add('active');
    hTab.classList.remove('active');
    pContent.style.display = 'block';
    hContent.style.display = 'none';
  } else {
    hTab.classList.add('active');
    pTab.classList.remove('active');
    hContent.style.display = 'block';
    pContent.style.display = 'none';
  }
}

function proceedToPayment() {
  const desc = document.getElementById('commission-desc').value.trim();
  if (!desc) {
    alert('Please describe your project or commission requirements first.');
    return;
  }
  document.getElementById('commission-step-1').style.display = 'none';
  document.getElementById('commission-step-2').style.display = 'block';
}

function submitCommission() {
  const ref = document.getElementById('gcash-ref').value.trim();
  const fileInput = document.getElementById('gcash-file');
  if (!fileInput.files || !fileInput.files[0]) {
    alert('Please upload your GCash screenshot before submitting.');
    return;
  }
  if (!ref) {
    alert('Please enter your GCash reference number.');
    return;
  }
  
  const targetName = document.getElementById('modal-name').textContent;
  const successNameEl = document.getElementById('success-name');
  if (successNameEl) successNameEl.textContent = targetName;

  document.getElementById('commission-step-2').style.display = 'none';
  document.getElementById('commission-step-3').style.display = 'block';
}

function initFilterBtns() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      this.closest('.filter-bar').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function initTalentCtas() {
  document.querySelectorAll('.talent-cta').forEach(btn => {
    const card = btn.closest('.talent-body');
    if (!card) return;
    const nameEl = card.querySelector('.talent-name');
    if (!nameEl) return;
    btn.onclick = () => openProfile(nameEl.textContent.trim());
  });
}


/* ──────────────────────────────────────────────────────────
   iCreate · LIFECYCLE INITIALIZER (DOM Loaded Event)
────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize DB Records & Nav States
  iCreateDB.init();
  updateNavbarAuthUI();

  // 2. Setup Page Filter UI Animations & Portfolio Trigger Elements
  initFilterBtns();
  initTalentCtas();

  // 3. Handle Overlay Backdrop Clicks to close Auth & Profile Modals cleanly
  window.addEventListener('click', (e) => {
    const authModal = document.getElementById('auth-modal');
    if (e.target === authModal) closeAuthModal();

    const profileModal = document.getElementById('profile-modal');
    if (e.target === profileModal) closeModal();
  });
});