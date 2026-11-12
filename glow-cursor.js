/**
 * GlowCursor — Pure JavaScript implementation of React Bits @react-bits/GlowCursor
 * Creates an ethereal, shader-like fluid light trail that smoothly tracks the pointer
 * with luminous bloom, golden core, physics linger, and high-energy click bursts.
 */

class GlowCursor {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.options = Object.assign({
      color: '#ffe9a5',
      intensity: 1.3,
      trailWidth: 3,
      linger: 1.4,
      glow: 1.2,
      clickBurst: true,
      theme: 'dark'
    }, options);

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'glow-cursor-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.inset = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none'; // allows underlying clicks to pass through
    this.canvas.style.zIndex = '10';
    this.ctx = this.canvas.getContext('2d');

    // Ensure relative positioning on container
    const computedPos = window.getComputedStyle(this.container).position;
    if (computedPos === 'static') {
      this.container.style.position = 'relative';
    }

    if (this.options.theme === 'dark') {
      this.container.classList.add('glow-cursor-dark-theme');
    }

    this.container.appendChild(this.canvas);

    // Points history for smooth ribbon trail
    this.trail = [];
    this.particles = [];
    this.shockwaves = [];
    this.mouse = { x: -9999, y: -9999, active: false, speed: 0, lastX: 0, lastY: 0 };
    this.width = 0;
    this.height = 0;
    this.animId = null;
    this.isVisible = true;

    // Convert hex color to rgb components
    this.rgb = this.hexToRgb(this.options.color) || { r: 255, g: 233, b: 165 };

    this.init();
  }

  hexToRgb(hex) {
    let c = hex.replace('#', '').trim();
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return null;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  init() {
    this.setupListeners();
    this.resize();
    this.start();
  }

  setupListeners() {
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);

    const updatePointer = (clientX, clientY) => {
      const rect = this.container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const dx = x - this.mouse.lastX;
      const dy = y - this.mouse.lastY;
      this.mouse.speed = Math.hypot(dx, dy);
      this.mouse.lastX = x;
      this.mouse.lastY = y;

      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.active = true;

      // Add trail point with timestamp and velocity
      const maxAge = Math.max(300, 1000 * this.options.linger);
      this.trail.push({
        x,
        y,
        time: performance.now(),
        maxAge,
        width: Math.max(1, this.options.trailWidth * (1 + Math.min(3, this.mouse.speed * 0.08)))
      });
    };

    this.container.addEventListener('mousemove', (e) => {
      updatePointer(e.clientX, e.clientY);
    }, { passive: true });

    this.container.addEventListener('mouseenter', (e) => {
      this.mouse.active = true;
      this.mouse.lastX = e.clientX - this.container.getBoundingClientRect().left;
      this.mouse.lastY = e.clientY - this.container.getBoundingClientRect().top;
    }, { passive: true });

    this.container.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    }, { passive: true });

    // Touch support for mobile devices
    this.container.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointer(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.mouse.active = true;
        this.mouse.lastX = touch.clientX - this.container.getBoundingClientRect().left;
        this.mouse.lastY = touch.clientY - this.container.getBoundingClientRect().top;
        updatePointer(touch.clientX, touch.clientY);
        if (this.options.clickBurst) {
          this.triggerBurst(this.mouse.x, this.mouse.y);
        }
      }
    }, { passive: true });

    this.container.addEventListener('touchend', () => {
      this.mouse.active = false;
    }, { passive: true });

    // Click burst effect
    if (this.options.clickBurst) {
      this.container.addEventListener('mousedown', (e) => {
        const rect = this.container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.triggerBurst(x, y);
      });
    }

    // Viewport intersection observer to conserve GPU/CPU
    this.intersectionObserver = new IntersectionObserver((entries) => {
      this.isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    this.intersectionObserver.observe(this.container);
  }

  triggerBurst(x, y) {
    const burstCount = Math.round(28 * this.options.intensity);
    for (let i = 0; i < burstCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        friction: 0.94 + Math.random() * 0.03,
        size: 1.5 + Math.random() * 3.5,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        sparkle: Math.random() > 0.4
      });
    }

    // Shockwave ring
    this.shockwaves.push({
      x,
      y,
      radius: 4,
      maxRadius: 75 * this.options.glow,
      speed: 4.5,
      life: 1.0,
      decay: 0.04
    });
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  start() {
    if (!this.animId) {
      this.tick();
    }
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  tick() {
    this.animId = requestAnimationFrame(() => this.tick());
    if (!this.isVisible) return;
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const now = performance.now();
    const { r, g, b } = this.rgb;
    const intensity = this.options.intensity;
    const glow = this.options.glow;

    ctx.clearRect(0, 0, this.width, this.height);

    // Prune expired trail points
    while (this.trail.length > 0 && now - this.trail[0].time > this.trail[0].maxAge) {
      this.trail.shift();
    }

    // Render Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed;
      sw.life -= sw.decay;

      if (sw.life <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${sw.life * 0.7 * intensity})`;
      ctx.lineWidth = Math.max(1, 3 * sw.life);
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
      ctx.shadowBlur = 16 * glow;
      ctx.stroke();
      ctx.restore();
    }

    // Render Fluid Light Trail
    if (this.trail.length > 1) {
      const pts = this.trail;
      const count = pts.length;

      // Draw multi-pass smooth spline
      // Pass 1: Soft Ambient Aura
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
      ctx.shadowBlur = 24 * glow;

      for (let i = 0; i < count - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const age = (now - p1.time) / p1.maxAge;
        const alpha = Math.max(0, (1 - age) * 0.4 * intensity);
        const w = p1.width * 2.8 * (1 - age * 0.7);

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = w;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.restore();

      // Pass 2: Main Intense Glow
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
      ctx.shadowBlur = 10 * glow;

      for (let i = 0; i < count - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const age = (now - p1.time) / p1.maxAge;
        const alpha = Math.max(0, (1 - age) * 0.85 * intensity);
        const w = p1.width * 1.5 * (1 - age * 0.6);

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = w;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.restore();

      // Pass 3: White-Hot Core
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 4 * glow;

      for (let i = 0; i < count - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const age = (now - p1.time) / p1.maxAge;
        const alpha = Math.max(0, (1 - age) * 0.95 * intensity);
        const w = Math.max(1, p1.width * 0.6 * (1 - age * 0.5));

        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = w;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Active Cursor Tip Glow Bead
    if (this.mouse.active) {
      ctx.save();
      // Outer aura
      const grad = ctx.createRadialGradient(
        this.mouse.x, this.mouse.y, 0,
        this.mouse.x, this.mouse.y, 22 * glow
      );
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.8 * intensity})`);
      grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${0.35 * intensity})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.mouse.x, this.mouse.y, 22 * glow, 0, Math.PI * 2);
      ctx.fill();

      // Inner white spark
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
      ctx.shadowBlur = 8 * glow;
      ctx.beginPath();
      ctx.arc(this.mouse.x, this.mouse.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render Click Burst Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      const pAlpha = p.life * intensity;
      const isWhite = p.sparkle && p.life > 0.6;
      ctx.fillStyle = isWhite ? `rgba(255, 255, 255, ${pAlpha})` : `rgba(${r}, ${g}, ${b}, ${pAlpha})`;
      ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
      ctx.shadowBlur = 10 * glow;

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.7, p.size * p.life), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  destroy() {
    this.stop();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Auto-initialize elements with [data-glow-cursor]
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-glow-cursor]').forEach(el => {
    const opts = {};
    const dataset = el.dataset;

    if (dataset.color) opts.color = dataset.color;
    if (dataset.intensity) opts.intensity = parseFloat(dataset.intensity);
    if (dataset.trailWidth) opts.trailWidth = parseFloat(dataset.trailWidth);
    if (dataset.linger) opts.linger = parseFloat(dataset.linger);
    if (dataset.glow) opts.glow = parseFloat(dataset.glow);
    if (dataset.clickBurst !== undefined) opts.clickBurst = dataset.clickBurst !== 'false';
    if (dataset.theme) opts.theme = dataset.theme;

    new GlowCursor(el, opts);
  });
});

if (typeof window !== 'undefined') {
  window.GlowCursor = GlowCursor;
}

