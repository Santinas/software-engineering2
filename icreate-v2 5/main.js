/* ─────────────────────────────────────
   iCreate · Main JavaScript
───────────────────────────────────── */

/* ── FREELANCER DATA ── */
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
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=70',
      'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=400&q=70',
    ]
  },
  'Alexa Santos': {
    role: 'UI/UX Designer · BS Multimedia Arts',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
    bio: "I'm Alexa, a UI/UX designer and digital illustrator from iAcademy's MMA program. I help brands create beautiful, user-centered experiences — from wireframes to polished high-fidelity prototypes. My design philosophy: every pixel has a purpose.",
    rate: '₱180 / hour',
    projects: '24 completed',
    skills: ['Figma','Adobe XD','Branding','Digital Illustration','Prototyping','Photoshop'],
    portfolio: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=70',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70',
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=70',
    ]
  },
  'Jed Villanueva': {
    role: 'Video Editor · BS Entertainment & Multimedia Computing',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=900&q=80',
    bio: "Jed here — video editor and storyteller from iAcademy's EMC program. I edit everything from YouTube vlogs to cinematic short films. I work fast, communicate clearly, and always deliver before deadline. My tools of choice: Premiere Pro, DaVinci Resolve, and After Effects.",
    rate: '₱120 / hour',
    projects: '31 completed',
    skills: ['Premiere Pro','After Effects','DaVinci Resolve','Color Grading','Sound Design','Motion Graphics'],
    portfolio: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=70',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=70',
      'https://images.unsplash.com/photo-1536240478700-b869ad10e2ac?w=400&q=70',
    ]
  },
  'Trisha Lim': {
    role: 'Web Developer · BS Computer Science',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80',
    bio: "I'm Trisha, a BS CS student who loves building clean, fast, and accessible websites. I specialize in Vue.js frontends paired with PHP/Laravel backends. Whether it's a landing page or a full CMS, I deliver polished, well-documented code.",
    rate: '₱140 / hour',
    projects: '12 completed',
    skills: ['Vue.js','PHP','Laravel','Tailwind CSS','MySQL','REST APIs'],
    portfolio: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=70',
      'https://images.unsplash.com/photo-1555066931-4365d14431b9?w=400&q=70',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=70',
    ]
  },
  'Paulo dela Cruz': {
    role: '3D Artist · BS Graphic Design',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&q=80',
    bio: "Paulo — 3D generalist and visual artist from iAcademy. I create product renders, character concepts, and environment art using Blender and Cinema 4D. My work has been featured in student exhibitions and a local game jam.",
    rate: '₱200 / hour',
    projects: '9 completed',
    skills: ['Blender','Cinema 4D','ZBrush','Substance Painter','UV Mapping','Rendering'],
    portfolio: [
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=70',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=70',
    ]
  },
  'Bianca Torres': {
    role: 'Motion Designer · BS Multimedia Arts',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1536240478700-b869ad10e2ac?w=900&q=80',
    bio: "Bianca — motion designer and animation nerd. I turn static ideas into living, breathing visuals. From logo animations to full explainer videos, I bring brands to life with frame-perfect animations using After Effects and Lottie.",
    rate: '₱160 / hour',
    projects: '15 completed',
    skills: ['After Effects','Lottie','GSAP','Premiere Pro','Illustrator','Storyboarding'],
    portfolio: [
      'https://images.unsplash.com/photo-1536240478700-b869ad10e2ac?w=400&q=70',
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=70',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=70',
    ]
  },
  'Renz Aquino': {
    role: 'Mobile Developer · BS Information Technology',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=900&q=80',
    bio: "Renz is a mobile app developer who builds smooth, polished Flutter apps with Firebase backends. I've published two personal projects to the Play Store and love building utility apps that solve real problems for real people.",
    rate: '₱170 / hour',
    projects: '7 completed',
    skills: ['Flutter','Dart','Firebase','REST APIs','Android','UI Design'],
    portfolio: [
      'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=400&q=70',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=70',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=70',
    ]
  },
  'Luis Garcia': {
    role: 'Cinematographer · BS Entertainment & Multimedia Computing',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&q=80',
    bio: "Luis — cinematographer and color grader. I shoot and edit brand films, music videos, and short documentaries. With a trained eye for composition and a deep understanding of color science, I give your footage that professional cinematic look.",
    rate: '₱130 / hour',
    projects: '20 completed',
    skills: ['DaVinci Resolve','Color Grading','LUTs','Premiere Pro','Cinematography','Lighting'],
    portfolio: [
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=70',
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=70',
      'https://images.unsplash.com/photo-1536240478700-b869ad10e2ac?w=400&q=70',
    ]
  },
  'Dana Mercado': {
    role: 'Brand Designer · BS Graphic Design & Illustration',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&q=80',
    bio: "Dana — brand designer and typographer. I craft visual identities that communicate, connect, and convert. From logo suites to full brand guidelines, I deliver consistent, memorable branding for startups, events, and small businesses.",
    rate: '₱190 / hour',
    projects: '22 completed',
    skills: ['Illustrator','InDesign','Typography','Brand Identity','Packaging','Print Design'],
    portfolio: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=70',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70',
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=70',
    ]
  }
};

let currentFreelancer = '';

/* ── PROFILE MODAL ── */
function openProfile(name) {
  const f = freelancers[name];
  if (!f) return;
  currentFreelancer = name;

  document.getElementById('modal-name').textContent = name;
  document.getElementById('modal-role').textContent = f.role;
  document.getElementById('modal-avatar').src = f.avatar;
  document.getElementById('modal-cover').style.background = `url('${f.cover}') center/cover no-repeat`;
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

function submitCommission() {
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
  document.getElementById('commission-step-2').style.display = 'none';
  document.getElementById('commission-step-3').style.display = 'block';
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

/* ── INIT ON LOAD ── */
document.addEventListener('DOMContentLoaded', () => {
  initFilterBtns();
  initTalentCtas();

  // Close modal on backdrop click
  const modal = document.getElementById('profile-modal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });
  }
});
