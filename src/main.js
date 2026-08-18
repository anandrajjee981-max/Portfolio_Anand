import './style.css';
import { WebGLEngine } from './webgl-engine.js';
import { AnimationManager } from './animation-manager.js';
import { setupCounter } from './counter.js';
import { projects, experience, achievements, skills, certificates } from './data.js';

/* ==========================================================================
   CINEMATIC PORTFOLIO — MAIN ENTRY POINT
   Initializes WebGL, DOM population, custom cursor, loading screen,
   and wires up all interactivity.
   ========================================================================== */

// ──────────────────────────────────────────
//  GLOBALS
// ──────────────────────────────────────────
let engine = null;
let animManager = null;
let isSoundOn = false;
let raf = null;

// ──────────────────────────────────────────
//  DOM POPULATION — Projects, Experience, Achievements
// ──────────────────────────────────────────
function populateProjects() {
  const container = document.getElementById('project-cards');
  if (!container) return;

  projects.forEach(p => {
    const strip = document.createElement('div');
    strip.className = 'project-strip';
    strip.dataset.projectId = p.id;
    strip.innerHTML = `
      <div class="project-strip-info">
        <h3>${p.name}</h3>
        <p>${p.tech.slice(0, 3).join(' · ')}</p>
      </div>
      <span class="project-strip-action"><i class="fa-solid fa-arrow-right"></i></span>
    `;
    strip.addEventListener('click', () => openProjectModal(p));
    container.appendChild(strip);
  });
}

function populateExperience() {
  const container = document.getElementById('experience-list');
  if (!container) return;

  experience.forEach(exp => {
    const item = document.createElement('div');
    item.className = 'experience-item';
    item.innerHTML = `
      <span class="exp-period">${exp.period}</span>
      <h3 class="exp-company">${exp.company}</h3>
      <p class="exp-role">${exp.role}</p>
      <p class="exp-details">${exp.details}</p>
    `;
    container.appendChild(item);
  });
}

function populateAchievements() {
  const container = document.getElementById('achievements-grid');
  if (!container) return;

  achievements.forEach(a => {
    const card = document.createElement('div');
    card.className = 'achievement-card';
    card.innerHTML = `
      <div class="achievement-header">
        <h3>${a.name}</h3>
        <span class="achievement-date">${a.date}</span>
      </div>
      <p>${a.desc}</p>
    `;
    container.appendChild(card);
  });
}

function populateCertificates() {
  const container = document.getElementById('certificates-slider');
  if (!container) return;

  certificates.forEach(c => {
    const card = document.createElement('div');
    card.className = 'certificate-card';
    card.innerHTML = `
      <div class="certificate-card-inner">
        <div class="certificate-image-container">
          <img class="certificate-img" src="${c.image}" alt="${c.name}">
        </div>
        <div class="certificate-info">
          <div class="certificate-issuer-row">
            <span class="certificate-issuer">${c.issuer}</span>
            <span class="certificate-date">${c.date}</span>
          </div>
          <h3>${c.name}</h3>
          <p>${c.desc}</p>
        </div>
      </div>
    `;
    card.addEventListener('click', () => openCertificateModal(c));
    container.appendChild(card);
  });
}

function populateSkills() {
  const container = document.getElementById('telemetry-skills-list');
  if (!container) return;

  container.innerHTML = '';
  skills.forEach(skill => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.textContent = skill.name;
    tag.title = `${skill.name} • ${skill.category} • ${skill.level}%`;
    container.appendChild(tag);
  });
}

// ──────────────────────────────────────────
//  PROJECT MODAL
// ──────────────────────────────────────────
function openProjectModal(project) {
  const modal = document.getElementById('project-modal');
  document.getElementById('modal-project-tag').textContent = 'PROJECT DETECTED';
  document.getElementById('modal-project-title').textContent = project.name;
  document.getElementById('modal-project-desc').textContent = project.description;

  // Tech tags
  const techContainer = document.getElementById('modal-project-tech');
  techContainer.innerHTML = '';
  project.tech.forEach(t => {
    const tag = document.createElement('span');
    tag.className = 'tech-tag';
    tag.textContent = t;
    techContainer.appendChild(tag);
  });

  // Links
  document.getElementById('modal-github-link').href = project.github;
  document.getElementById('modal-demo-link').href = project.demo;
  const videoLink = document.getElementById('modal-video-link');
  if (videoLink) {
    if (project.video) {
      videoLink.href = project.video;
      videoLink.style.display = 'inline-flex';
    } else {
      videoLink.href = '#';
      videoLink.style.display = 'none';
    }
  }

  modal.classList.add('active');
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  modal.classList.remove('active');
}

function openCertificateModal(cert) {
  const modal = document.getElementById('certificate-modal');
  if (!modal) return;
  document.getElementById('modal-cert-title').textContent = cert.name;
  document.getElementById('modal-cert-issuer').textContent = cert.issuer;
  document.getElementById('modal-cert-date').textContent = cert.date;
  document.getElementById('modal-cert-desc').textContent = cert.desc;

  const img = document.getElementById('modal-cert-img');
  img.src = cert.image;
  img.alt = cert.name;

  const viewLink = document.getElementById('modal-cert-link');
  viewLink.href = cert.image;

  modal.classList.add('active');
}

function closeCertificateModal() {
  const modal = document.getElementById('certificate-modal');
  if (modal) modal.classList.remove('active');
}

// ──────────────────────────────────────────
//  CUSTOM CURSOR
// ──────────────────────────────────────────
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('custom-cursor-dot');
  if (!cursor || !cursorDot) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // The dot follows immediately
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  // Smooth trail for the outer ring
  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover state for interactive elements
  const interactiveElements = document.querySelectorAll(
    'a, button, .project-strip, .social-icon, .nav-link, .glowing-btn, .outline-btn, .experience-item, .achievement-card, .certificate-card'
  );
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovered');
      cursorDot.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovered');
      cursorDot.classList.remove('hovered');
    });
  });
}

// ──────────────────────────────────────────
//  SOUND TOGGLE
// ──────────────────────────────────────────
function toggleSound(forceState) {
  const btn = document.getElementById('sound-toggle');
  const ambientAudio = document.getElementById('ambient-audio');
  if (!btn || !ambientAudio) return;

  if (typeof forceState === 'boolean') {
    isSoundOn = forceState;
  } else {
    isSoundOn = !isSoundOn;
  }

  if (isSoundOn) {
    ambientAudio.volume = 0.45;
    ambientAudio.play().then(() => {
      btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      btn.classList.add('playing');
    }).catch(err => {
      console.warn("Audio play prevented:", err);
      isSoundOn = false;
      btn.innerHTML = '<i class="fa-solid fa-volume-mute"></i>';
      btn.classList.remove('playing');
    });
  } else {
    ambientAudio.pause();
    btn.innerHTML = '<i class="fa-solid fa-volume-mute"></i>';
    btn.classList.remove('playing');
  }
}

function initSoundToggle() {
  const btn = document.getElementById('sound-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => toggleSound());
}

function initCounter() {
  const counterElement = document.getElementById('counter-widget');
  if (!counterElement) return;
  setupCounter(counterElement);
}

// ──────────────────────────────────────────
//  NAVIGATION — Active link tracking
// ──────────────────────────────────────────
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.scroll-section');

  // Intersection Observer for active nav links
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => observer.observe(section));

  // Smooth scroll on nav click
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Scroll progress bar
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    const bar = document.getElementById('scroll-progress');
    if (bar) bar.style.width = scrollPercent + '%';
  });
}

// ──────────────────────────────────────────
//  SECTION REVEAL ANIMATIONS (IntersectionObserver)
// ──────────────────────────────────────────
function initSectionReveals() {
  const revealTargets = document.querySelectorAll(
    '.hero-content, .section-overlay-panel, .contact-content'
  );

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.2 });

  revealTargets.forEach(el => revealObserver.observe(el));
}

// ──────────────────────────────────────────
//  CLOSE MODAL EVENTS
// ──────────────────────────────────────────
function initModalClose() {
  const closeBtn = document.getElementById('close-modal');
  const modal = document.getElementById('project-modal');
  if (closeBtn) closeBtn.addEventListener('click', closeProjectModal);
  if (modal) modal.addEventListener('click', e => {
    if (e.target === modal) closeProjectModal();
  });

  const closeCertBtn = document.getElementById('close-certificate-modal');
  const certModal = document.getElementById('certificate-modal');
  if (closeCertBtn) closeCertBtn.addEventListener('click', closeCertificateModal);
  if (certModal) certModal.addEventListener('click', e => {
    if (e.target === certModal) closeCertificateModal();
  });
}

// ──────────────────────────────────────────
//  RENDER LOOP
// ──────────────────────────────────────────
function renderLoop(time) {
  if (engine) {
    // Update camera position based on scroll (if animation manager exists)
    if (animManager) {
      animManager.update(engine);
    }
    engine.update(time);
  }
  raf = requestAnimationFrame(renderLoop);
}

// ──────────────────────────────────────────
//  INITIALIZATION
// ──────────────────────────────────────────
function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  loader.style.opacity = '0';
  loader.style.visibility = 'hidden';
  window.setTimeout(() => {
    loader.style.display = 'none';
  }, 500);
}

// ──────────────────────────────────────────
//  CONTACT FORM EMAIL REDIRECTION
// ──────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('contact-name')?.value.trim() || 'Anonymous';
    const email = document.getElementById('contact-email')?.value.trim() || 'No email provided';
    const msg = document.getElementById('contact-msg')?.value.trim() || '';

    const targetEmail = 'anandrajjee981@gmail.com';
    const subject = encodeURIComponent(`Portfolio Transmission from ${name}`);
    const body = encodeURIComponent(
      `Hello Anand,\n\nYou received a message from your cinematic portfolio:\n\n` +
      `Sender Name: ${name}\n` +
      `Sender Email: ${email}\n\n` +
      `Message Details:\n${msg}\n\n` +
      `Best regards,\n${name}`
    );

    // Redirect to default email client / mailto composer
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
  });
}

function launchApp() {
  hideLoader();

  // 1. Populate DOM content
  populateProjects();
  populateExperience();
  populateAchievements();
  populateCertificates();
  populateSkills();

  // 2. Init cursor, sound, counter, navigation, modals, contact
  initCustomCursor();
  initSoundToggle();
  initCounter();
  initNavigation();
  initModalClose();
  initSectionReveals();
  initContactForm();

  // 3. Initialize WebGL engine
  const canvas = document.getElementById('webgl-canvas');
  if (canvas) {
    engine = new WebGLEngine(canvas);

    // Set starting camera position
    engine.camera.position.set(0, 150, 50);
    engine.camera.lookAt(-20, 80, -50);

    // 4. Create animation manager
    animManager = new AnimationManager(engine);
  }

  // 5. Start render loop
  renderLoop(0);

  // 6. Immediately show hero content
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) heroContent.classList.add('active');

  // 7. Play intro animation
  if (animManager) {
    animManager.playIntro();
  }
}

function startLoader() {
  const loaderBar = document.getElementById('loader-bar');
  const loaderPercent = document.getElementById('loader-percent');
  const enterBtn = document.getElementById('enter-btn');
  const loader = document.getElementById('loader');
  if (!loader || !loaderBar || !loaderPercent) {
    launchApp();
    return;
  }

  let progress = 0;
  let hasLaunched = false;

  const completeLaunch = () => {
    if (hasLaunched) return;
    hasLaunched = true;
    launchApp();
  };

  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      if (progress >= 100) {
        completeLaunch();
        toggleSound(true);
      }
    });
  }

  const updateProgress = () => {
    const increment = Math.floor(Math.random() * 6) + 3;
    progress = Math.min(100, progress + increment);
    loaderBar.style.width = `${progress}%`;
    loaderPercent.textContent = `${progress}%`;

    if (progress < 100) {
      window.setTimeout(updateProgress, 30 + Math.random() * 40);
      return;
    }

    if (enterBtn) {
      enterBtn.style.display = 'inline-flex';
    }

    window.setTimeout(completeLaunch, 700);
  };

  updateProgress();
}

window.addEventListener('DOMContentLoaded', startLoader);
