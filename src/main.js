import './styles/main.css';
import { WatchViewer } from './webgl/WatchViewer.js';
import { ScrollController } from './animations/ScrollController.js';
import { CustomCursor } from './cursor/CustomCursor.js';
import { sound } from './audio/SoundEngine.js';
import { translations } from './data/content.js';

class App {
  constructor() {
    this.currentLang = 'en';
    this.currentTheme = 'first';
    this.explodedPartIndex = 0;
    this.viewer = null;
    this.scrollController = null;
    this.cursor = null;

    this.init();
  }

  init() {
    // 1. Initialize Custom Cursor
    this.cursor = new CustomCursor();

    // 2. Initialize WebGL 3D Watch Viewer
    this.viewer = new WatchViewer('canvas-wrapper', () => {
      this.onViewerLoaded();
    });

    // 3. Initialize Scroll Choreography
    this.scrollController = new ScrollController(this.viewer, (sectionName) => {
      this.onSectionChange(sectionName);
    });

    // 4. Setup UI Events & Interactivity
    this.setupColorCustomizer();
    this.setupSoundToggle();
    this.setupDisassemblyMode();
    this.setupLanguageSwitcher();
    this.setupSecondsTicker();
    this.setupBackToTop();
  }

  onViewerLoaded() {
    const loader = document.getElementById('loader');
    if (loader) {
      setTimeout(() => {
        loader.classList.add('loaded');
      }, 500);
    }
  }

  onSectionChange(sectionName) {
    // Trigger tick sound on major section changes if sound enabled
    sound.playTick();
  }

  setupColorCustomizer() {
    // Intro buttons
    const introButtons = document.querySelectorAll('.color-opt-btn');
    introButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const configId = btn.getAttribute('data-config');
        this.switchColorTheme(configId);
        sound.playWinding();
      });
    });

    // Parts section swatch buttons
    const partsSwatches = document.querySelectorAll('.parts-swatch-btn');
    partsSwatches.forEach((btn) => {
      btn.addEventListener('click', () => {
        const configId = btn.getAttribute('data-config');
        this.switchColorTheme(configId);
        sound.playWinding();
      });
    });

    // Intro Radial Circle SVG
    const circleSvg = document.querySelector('.circle-svg');
    if (circleSvg) {
      circleSvg.addEventListener('click', () => {
        const order = ['first', 'second', 'third', 'fourth'];
        const nextIdx = (order.indexOf(this.currentTheme) + 1) % order.length;
        this.switchColorTheme(order[nextIdx]);
        sound.playWinding();
      });
    }
  }

  switchColorTheme(configId) {
    this.currentTheme = configId;
    const t = translations[this.currentLang].colors;
    const selectedColor = Object.values(t).find((c) => c.id === configId) || t.silver;

    // Update WebGL PBR Materials
    if (this.viewer) {
      this.viewer.setColorTheme(configId);
    }

    // Update CSS variables
    document.documentElement.style.setProperty('--first-color', selectedColor.firstColor);
    document.documentElement.style.setProperty('--second-color', selectedColor.secondColor);

    // Update active UI buttons
    document.querySelectorAll('.color-opt-btn, .parts-swatch-btn').forEach((b) => {
      if (b.getAttribute('data-config') === configId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // Update Parts Hero Image dynamically
    const partsImg = document.getElementById('parts-hero-img');
    if (partsImg) {
      const imgMap = {
        first: `${import.meta.env.BASE_URL}images/parts_hero.jpg`,
        second: `${import.meta.env.BASE_URL}images/parts_black.jpg`,
        third: `${import.meta.env.BASE_URL}images/parts_gold.jpg`,
        fourth: `${import.meta.env.BASE_URL}images/parts_rose.jpg`
      };
      partsImg.style.opacity = '0';
      setTimeout(() => {
        partsImg.src = imgMap[configId] || imgMap.first;
        partsImg.style.opacity = '1';
      }, 250);
    }
  }

  setupSoundToggle() {
    const soundBtn = document.getElementById('sound-btn');
    if (!soundBtn) return;

    soundBtn.addEventListener('click', () => {
      const isEnabled = sound.toggle();
      if (isEnabled) {
        soundBtn.classList.add('playing');
      } else {
        soundBtn.classList.remove('playing');
      }
    });
  }

  setupDisassemblyMode() {
    const explodeBtn = document.getElementById('explode-btn');
    const closeBtn = document.getElementById('close-disassembly-btn');
    const modal = document.getElementById('disassembly-modal');
    const prevBtn = document.getElementById('modal-prev-btn');
    const nextBtn = document.getElementById('modal-next-btn');

    if (explodeBtn) {
      explodeBtn.addEventListener('click', () => {
        this.toggleExplodedView(true);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.toggleExplodedView(false);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const parts = translations[this.currentLang].disassembly.parts;
        this.explodedPartIndex = (this.explodedPartIndex - 1 + parts.length) % parts.length;
        this.showDisassemblyPart(parts[this.explodedPartIndex]);
        sound.playWinding();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const parts = translations[this.currentLang].disassembly.parts;
        this.explodedPartIndex = (this.explodedPartIndex + 1) % parts.length;
        this.showDisassemblyPart(parts[this.explodedPartIndex]);
        sound.playWinding();
      });
    }
  }

  toggleExplodedView(active) {
    if (active) {
      document.body.classList.add('exploded-active');
      if (this.viewer) this.viewer.setExplodedMode(true);
      sound.playExplode();

      const parts = translations[this.currentLang].disassembly.parts;
      this.explodedPartIndex = 0;
      this.showDisassemblyPart(parts[0]);
    } else {
      document.body.classList.remove('exploded-active');
      if (this.viewer) this.viewer.setExplodedMode(false);
      sound.playLock();
      const modal = document.getElementById('disassembly-modal');
      if (modal) modal.classList.remove('visible');
    }
  }

  showDisassemblyPart(part) {
    const modal = document.getElementById('disassembly-modal');
    if (!modal || !part) return;

    document.getElementById('modal-part-title').textContent = part.title;
    document.getElementById('modal-part-function').textContent = part.functionCaption;
    document.getElementById('modal-part-desc').textContent = part.description;
    modal.classList.add('visible');

    if (this.viewer) {
      this.viewer.focusOnExplodedPart(part.id);
    }
  }

  setupLanguageSwitcher() {
    const langBtn = document.getElementById('lang-btn');
    if (!langBtn) return;

    langBtn.addEventListener('click', () => {
      this.currentLang = this.currentLang === 'en' ? 'fr' : 'en';
      langBtn.textContent = this.currentLang === 'en' ? 'EN / FR' : 'FR / EN';
      this.renderContent();
      sound.playTick();
    });
  }

  renderContent() {
    const data = translations[this.currentLang];
    document.title = data.meta.title;

    // Update dynamic text blocks across the page
    const updateText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = text;
    };

    updateText('timeless-first-label', data.timeless.firstLabel);
    updateText('timeless-first-text', data.timeless.firstText);
    updateText('timeless-second-label', data.timeless.secondLabel);
    updateText('timeless-second-text', data.timeless.secondText);

    updateText('vertical-first-label', data.vertical.firstLabel);
    updateText('vertical-first-text', data.vertical.firstText);
    updateText('vertical-second-label', data.vertical.secondLabel);
    updateText('vertical-second-text', data.vertical.secondText);

    updateText('curves-title', data.curves.title);
    updateText('curves-desc', data.curves.description);

    updateText('movement-first-label', data.movement.firstLabel);
    updateText('movement-first-text', data.movement.firstText);
    updateText('movement-second-label', data.movement.secondLabel);
    updateText('movement-second-text', data.movement.secondText);

    updateText('hands-title', data.hands.title);
    updateText('hands-desc', data.hands.description);

    updateText('straps-title', data.bracelet.title);
    updateText('straps-desc', data.bracelet.description);
  }

  setupSecondsTicker() {
    const sec1 = document.getElementById('sec-digit-1');
    const sec2 = document.getElementById('sec-digit-2');

    setInterval(() => {
      const now = new Date();
      const s = now.getSeconds().toString().padStart(2, '0');
      if (sec1 && sec2) {
        sec1.textContent = s[0];
        sec2.textContent = s[1];
      }
    }, 1000);
  }

  setupBackToTop() {
    const btn = document.getElementById('back-to-top-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.scrollController) {
          this.scrollController.scrollTo(0);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        sound.playWinding();
      });
    }
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
