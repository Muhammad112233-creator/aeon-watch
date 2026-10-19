class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.isTickRunning = false;
    this.tickInterval = null;
    this.tickToggle = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.init();
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.playWinding();
      this.startTicking();
    } else {
      this.stopTicking();
    }
    return this.enabled;
  }

  startTicking() {
    if (this.isTickRunning || !this.enabled) return;
    this.isTickRunning = true;
    // 4Hz tick = every 250ms
    this.tickInterval = setInterval(() => {
      if (this.enabled) {
        this.playTick();
      }
    }, 250);
  }

  stopTicking() {
    this.isTickRunning = false;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  playTick() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      this.tickToggle = !this.tickToggle;
      // High vs low escapement tooth impact
      osc.type = 'sine';
      osc.frequency.setValueAtTime(this.tickToggle ? 2400 : 1800, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.025);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, t);
      filter.Q.setValueAtTime(4.0, t);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.028);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.03);
    } catch (e) {
      // Audio fallback
    }
  }

  playWinding() {
    if (!this.enabled && this.ctx?.state !== 'running') return;
    try {
      this.init();
      const t = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const offset = i * 0.022;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400 + i * 200, t + offset);
        osc.frequency.exponentialRampToValueAtTime(400, t + offset + 0.018);

        gain.gain.setValueAtTime(0.08, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.02);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + offset);
        osc.stop(t + offset + 0.025);
      }
    } catch (e) {}
  }

  playLock() {
    if (!this.enabled && this.ctx?.state !== 'running') return;
    try {
      this.init();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.08);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {}
  }

  playExplode() {
    if (!this.enabled && this.ctx?.state !== 'running') return;
    try {
      this.init();
      const t = this.ctx.currentTime;
      // Sub-bass sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.45);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.55);
    } catch (e) {}
  }
}

export const sound = new SoundEngine();
