export class CustomCursor {
  constructor() {
    this.cursorEl = document.getElementById('cursor');
    this.cursorRing = document.getElementById('cursor-ring');
    this.cursorDot = document.getElementById('cursor-dot');
    this.cursorText = document.getElementById('cursor-text');

    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.speed = 0.15;
    this.isHovering = false;
    this.currentText = '';
    this.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (this.isTouch) {
      if (this.cursorEl) this.cursorEl.style.display = 'none';
      return;
    }

    this.init();
  }

  init() {
    window.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
      if (this.cursorEl) {
        this.cursorEl.style.opacity = '1';
      }
    });

    document.addEventListener('mouseleave', () => {
      if (this.cursorEl) this.cursorEl.style.opacity = '0';
    });

    // Delegate mouseover for data-cursor elements
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-cursor]');
      if (target) {
        const cursorType = target.getAttribute('data-cursor');
        this.setText(cursorType);
      } else {
        const clickable = e.target.closest('button, a, .config-w, .img-w, li, .circle-svg');
        if (clickable) {
          this.setHoverState(true);
        }
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-cursor]');
      const clickable = e.target.closest('button, a, .config-w, .img-w, li, .circle-svg');
      if (target || clickable) {
        this.reset();
      }
    });

    this.render();
  }

  setText(type) {
    if (!this.cursorText || !this.cursorRing) return;
    let label = '';
    switch (type) {
      case 'swap':
        label = 'SWAP<br />COLOR';
        break;
      case 'hold':
        label = 'HOLD TO<br />EXPLORE';
        break;
      case 'selectModel':
        label = 'SELECT<br />FINISH';
        break;
      case 'drag':
        label = 'DRAG<br />360°';
        break;
      case 'explore':
        label = 'INSPECT';
        break;
      case 'close':
        label = 'CLOSE';
        break;
      default:
        label = type.toUpperCase();
    }
    this.cursorText.innerHTML = label;
    this.cursorRing.classList.add('large');
    this.cursorText.classList.add('visible');
    this.isHovering = true;
  }

  setHoverState(hover) {
    if (!this.cursorRing) return;
    if (hover) {
      this.cursorRing.classList.add('active');
    } else {
      this.cursorRing.classList.remove('active');
    }
  }

  reset() {
    if (!this.cursorText || !this.cursorRing) return;
    this.cursorRing.classList.remove('large');
    this.cursorRing.classList.remove('active');
    this.cursorText.classList.remove('visible');
    this.cursorText.innerHTML = '';
    this.isHovering = false;
  }

  render() {
    this.pos.x += (this.target.x - this.pos.x) * this.speed;
    this.pos.y += (this.target.y - this.pos.y) * this.speed;

    if (this.cursorEl) {
      this.cursorEl.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
    }

    requestAnimationFrame(() => this.render());
  }
}
