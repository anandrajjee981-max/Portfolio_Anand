import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

/* ==========================================================================
   ANIMATION MANAGER
   Controls:
   1. Intro Timeline — cinematic falling/landing sequence
   2. Scroll-driven Camera — weaves along the web path through the city
   3. Section interactions — panel reveals, node telemetry, sunrise shift
   ========================================================================== */

export class AnimationManager {
  constructor(engine) {
    this.engine = engine;
    this.scrollProgress = 0;        // 0→1 over full scroll
    this.introComplete = false;
    this.sunriseFactor = 0;         // 0→1 for contact section warm shift

    // Temp vectors used in update() to avoid per-frame allocation
    this._pos = new THREE.Vector3();
    this._lookAt = new THREE.Vector3();

    // Init scroll tracking
    this.initScrollCamera();
    this.initSectionTriggers();
    this.initSunriseTransition();
  }

  // ──────────────────────────────────────────
  //  INTRO TIMELINE — Cinematic Fall & Landing
  // ──────────────────────────────────────────
playIntro() {
  const cam = this.engine.camera;
  const heroContent = document.querySelector('.hero-content');

  // Start position: high up, wide sky — no building focus
  cam.position.set(0, 350, 250);
  cam.lookAt(0, 0, -100);

  const tl = gsap.timeline({
    onComplete: () => {
      this.introComplete = true;
      if (heroContent) heroContent.classList.add('active');
      ScrollTrigger.refresh();
    }
  });

  // Phase 1: Web-shoot sound FIRST
  tl.call(() => {
    const webSfx = document.getElementById('web-shoot-audio');
    if (webSfx) { webSfx.currentTime = 0; webSfx.volume = 0.4; webSfx.play().catch(() => {}); }
  }, null, '+=0');

  // Phase 2: Lightning flash — camera still wide, no building lookAt yet
  tl.call(() => {
    this.engine.lightning.intensity = 8000;
    const sfx = document.getElementById('lightning-audio');
    if (sfx) { sfx.currentTime = 0; sfx.volume = 0.3; sfx.play().catch(() => {}); }
  }, null, '+=0.1');

  tl.to(this.engine.lightning, {
    intensity: 0,
    duration: 0.4,
    ease: 'power3.out'
  });

  // Phase 3: SINGLE continuous fall+settle — directly to final scroll-ready position
  // Building reveals only ONCE, right at the end of this single move
  tl.to(cam.position, {
    x: this.engine.curvePoints[1].x,
    y: this.engine.curvePoints[1].y,
    z: this.engine.curvePoints[1].z,
    duration: 3.2,
    ease: 'power2.inOut',
    onUpdate: () => {
      const lookTarget = this.engine.cameraPath.getPointAt(0.05);
      cam.lookAt(lookTarget);
    }
  });
}
  // ──────────────────────────────────────────
  //  SCROLL-DRIVEN CAMERA
  //  Maps window scroll 0→1 onto the CatmullRom path
  // ──────────────────────────────────────────
  initScrollCamera() {
    // Track raw scroll progress via ScrollTrigger
    ScrollTrigger.create({
      trigger: '#content-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: self => {
        this.scrollProgress = self.progress;
      }
    });
  }

  // Called from the render loop in main.js
  update(engine) {
    if (!this.introComplete || !engine.cameraPath) return;

    // Clamp to avoid last-pixel weirdness
    const t = Math.min(Math.max(this.scrollProgress, 0.0001), 0.9999);

    // Camera position on the path
    engine.cameraPath.getPointAt(t, this._pos);
    engine.camera.position.lerp(this._pos, 0.08);

    // Look slightly ahead on the path
    const lookT = Math.min(t + 0.03, 0.999);
    engine.cameraPath.getPointAt(lookT, this._lookAt);
    engine.camera.lookAt(this._lookAt);

    // Sunrise color shift — ramp up in the last 15% of scroll
    if (this.sunriseFactor > 0) {
      const nightBg = engine.fogColorNight;
      const dayBg = engine.fogColorDay;
      const blended = nightBg.clone().lerp(dayBg, this.sunriseFactor);
      engine.scene.background.copy(blended);
      engine.scene.fog.color.copy(blended);
      engine.ambientLight.intensity = 0.5 + this.sunriseFactor * 1.5;
    }
  }

  // ──────────────────────────────────────────
  //  SECTION-LEVEL TRIGGERS
  //  Activate glassmorphic panels and interactive elements
  // ──────────────────────────────────────────
  initSectionTriggers() {
    // Skills panel
    this.createPanelTrigger('#skills .section-overlay-panel', '#skills');

    // Projects panel
    this.createPanelTrigger('#projects .section-overlay-panel', '#projects');

    // Experience panel + items stagger
    this.createPanelTrigger('#experience .section-overlay-panel', '#experience', () => {
      gsap.from('#experience .experience-item', {
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out'
      });
    });

    // Achievements panel + cards stagger
    this.createPanelTrigger('#achievements .section-overlay-panel', '#achievements', () => {
      gsap.from('#achievements .achievement-card', {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.12,
        ease: 'power2.out'
      });
    });

    // Certificates panel reveal
    this.createPanelTrigger('#certificates .section-overlay-panel', '#certificates');

    // Horizontal track slide scrollLeft animation on scroll
    const sliderWrapper = document.querySelector('#certificates .certificates-slider-wrapper');
    if (sliderWrapper) {
      gsap.fromTo(sliderWrapper,
        { scrollLeft: 0 },
        {
          scrollLeft: () => sliderWrapper.scrollWidth - sliderWrapper.clientWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: '#certificates',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          }
        }
      );
    }

    // Contact content
    ScrollTrigger.create({
      trigger: '#contact',
      start: 'top 60%',
      once: true,
      onEnter: () => {
        const el = document.querySelector('.contact-content');
        if (el) el.classList.add('active');
      }
    });
  }

  createPanelTrigger(panelSelector, sectionSelector, onEnterCallback) {
    ScrollTrigger.create({
      trigger: sectionSelector,
      start: 'top 65%',
      once: true,
      onEnter: () => {
        const panel = document.querySelector(panelSelector);
        if (panel) panel.classList.add('active');
        if (onEnterCallback) onEnterCallback();
      }
    });
  }

  // ──────────────────────────────────────────
  //  SUNRISE TRANSITION  (Contact section)
  //  Gradually shifts fog/background color from night → warm sunrise
  // ──────────────────────────────────────────
  initSunriseTransition() {
    ScrollTrigger.create({
      trigger: '#contact',
      start: 'top 80%',
      end: 'top 20%',
      scrub: true,
      onUpdate: self => {
        this.sunriseFactor = self.progress;
      }
    });
  }
}
