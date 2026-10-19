import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export class ScrollController {
  constructor(watchViewer, onSectionChange) {
    this.viewer = watchViewer;
    this.onSectionChange = onSectionChange;
    this.lenis = null;
    this.currentSection = 'Intro';

    this.init();
  }

  init() {
    // 1. Initialize Lenis Smooth Scroll
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false
    });

    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // 2. Global Scroll Choreography
    ScrollTrigger.create({
      trigger: '#the-watch',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const progress = self.progress;
        if (this.viewer) {
          this.viewer.updateScroll(progress, this.currentSection);
        }

        // Global background translation variable
        document.documentElement.style.setProperty('--translate-progress', progress.toString());
      }
    });

    // 3. Section-specific ScrollTriggers
    this.setupSectionTriggers();
    this.setupCharacterSplitAnimations();
    this.setupLookbookParallax();
    this.setupPartsBarAnimations();
  }

  setupSectionTriggers() {
    const sections = document.querySelectorAll('section[data-section]');

    sections.forEach((section) => {
      const name = section.getAttribute('data-section');

      ScrollTrigger.create({
        trigger: section,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => this.handleSectionEnter(name, section),
        onEnterBack: () => this.handleSectionEnter(name, section)
      });
    });
  }

  handleSectionEnter(name, sectionEl) {
    this.currentSection = name;
    if (this.onSectionChange) {
      this.onSectionChange(name);
    }

    // Toggle dark theme for Movement section
    if (name === 'Movement' || name === 'MovementWatchRight' || name === 'Mechanism') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    // Fade in fade elements within this section
    const fadeEls = sectionEl.querySelectorAll('[data-fade]');
    if (fadeEls.length) {
      gsap.fromTo(
        fadeEls,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out', overwrite: 'auto' }
      );
    }
  }

  setupCharacterSplitAnimations() {
    // Reveal animated grey line
    const greyLines = document.querySelectorAll('.grey-line');
    greyLines.forEach((line) => {
      ScrollTrigger.create({
        trigger: line,
        start: 'top 85%',
        onEnter: () => line.classList.add('active'),
        onLeaveBack: () => line.classList.remove('active')
      });
    });

    // Big backdrop text scroll
    const bigBackdrops = document.querySelectorAll('.big-text-section .fps-timeless-content, .big-text-section .fps-movement-content');
    bigBackdrops.forEach((backdrop) => {
      gsap.fromTo(
        backdrop,
        { y: 80, opacity: 0.2 },
        {
          y: -80,
          opacity: 0.8,
          ease: 'none',
          scrollTrigger: {
            trigger: backdrop.closest('section'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        }
      );
    });
  }

  setupLookbookParallax() {
    const images = document.querySelectorAll('.images-w .single-img-w');
    images.forEach((img, i) => {
      const speed = (i % 2 === 0 ? 1 : -1) * (40 + i * 25);
      gsap.fromTo(
        img,
        { y: speed },
        {
          y: -speed,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-section="Images"]',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        }
      );
    });
  }

  setupPartsBarAnimations() {
    const partRows = document.querySelectorAll('[data-section="Parts"] ul li');
    partRows.forEach((row, i) => {
      const bar = row.querySelector('.bar-fill');
      if (bar) {
        ScrollTrigger.create({
          trigger: row,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(bar, {
              scaleX: 1,
              duration: 0.8,
              delay: i * 0.05,
              ease: 'power3.out'
            });
          }
        });
      }
    });
  }

  scrollTo(target) {
    if (this.lenis) {
      this.lenis.scrollTo(target, { duration: 1.6, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    }
  }
}
