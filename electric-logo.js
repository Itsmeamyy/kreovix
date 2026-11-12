/**
 * ElectricLogo — Pure JavaScript implementation of React Bits @react-bits/ElectricLogo
 * Creates a living lightning outline around any logo with reactive electrical arcs and sparks.
 */

class ElectricLogo {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.options = Object.assign({
      src: '/logo.svg',
      color: '#ecc7ff',
      glowColor: '#8b1111',
      scale: 0.7,
      strands: 3,
      bend: 0.25,
      crackle: 1.5,
      arcs: 1,
      speed: 2.5,
      interactive: true,
      intensity: 1,
      glow: 1,
      thickness: 0.7,
      flicker: 0.6,
      fill: 0,
      cursorIntensity: 0.45,
      cursorRadius: 65
    }, options);

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'electric-logo-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.inset = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = this.options.interactive ? 'auto' : 'none';
    this.ctx = this.canvas.getContext('2d');

    this.container.style.position = 'relative';
    this.container.appendChild(this.canvas);

    this.points = [];
    this.particles = [];
    this.arcsList = [];
    this.mouse = { x: -9999, y: -9999, isHovered: false };
    this.time = 0;
    this.animId = null;
    this.isLoaded = false;
    this.isVisible = true;

    this.init();
  }

  init() {
    this.setupListeners();
    this.loadLogo();
  }

  setupListeners() {
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);

    if (this.options.interactive) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.mouse.isHovered = true;
      });

      this.canvas.addEventListener('mouseenter', () => {
        this.mouse.isHovered = true;
      });

      this.canvas.addEventListener('mouseleave', () => {
        this.mouse.isHovered = false;
        this.mouse.x = -9999;
        this.mouse.y = -9999;
      });
    }

    // Pause when off-screen to save battery/CPU
    this.intersectionObserver = new IntersectionObserver((entries) => {
      this.isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    this.intersectionObserver.observe(this.container);
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

  loadLogo() {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.logoImg = img;
      this.extractContours();
      this.isLoaded = true;
      this.resize();
      this.start();
    };
    img.onerror = () => {
      // Fallback to kreovix-logo.svg
      if (this.options.src !== '/kreovix-logo.svg') {
        this.options.src = '/kreovix-logo.svg';
        this.loadLogo();
      }
    };
    img.src = this.options.src;
  }

  extractContours() {
    const off = document.createElement('canvas');
    const w = this.logoImg.naturalWidth || 580;
    const h = this.logoImg.naturalHeight || 120;
    off.width = w;
    off.height = h;
    const octx = off.getContext('2d');
    octx.drawImage(this.logoImg, 0, 0, w, h);

    const imgData = octx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const edgePoints = [];
    const step = 2;

    for (let y = 1; y < h - 1; y += step) {
      for (let x = 1; x < w - 1; x += step) {
        const idx = (y * w + x) * 4;
        const alpha = data[idx + 3];

        if (alpha > 40) {
          const topA = data[((y - 1) * w + x) * 4 + 3];
          const btmA = data[((y + 1) * w + x) * 4 + 3];
          const lftA = data[(y * w + (x - 1)) * 4 + 3];
          const rgtA = data[(y * w + (x + 1)) * 4 + 3];

          if (topA <= 40 || btmA <= 40 || lftA <= 40 || rgtA <= 40) {
            const nx = (lftA <= 40 ? -1 : 0) + (rgtA <= 40 ? 1 : 0);
            const ny = (topA <= 40 ? -1 : 0) + (btmA <= 40 ? 1 : 0);
            const len = Math.hypot(nx, ny) || 1;
            edgePoints.push({
              x: x / w,
              y: y / h,
              nx: nx / len,
              ny: ny / len
            });
          }
        }
      }
    }

    this.points = edgePoints;
    this.aspect = w / h;

    // Chain edge points into coherent contour strokes
    if (edgePoints.length > 0) {
      const unvisited = new Set(edgePoints.map((_, i) => i));
      const chained = [];
      const maxJump = 16 / Math.min(w, h);

      while (unvisited.size > 0) {
        const startIdx = unvisited.values().next().value;
        unvisited.delete(startIdx);
        let curr = edgePoints[startIdx];
        chained.push(curr);

        let searching = true;
        while (searching) {
          let closestDist = maxJump;
          let closestIdx = -1;

          for (const idx of unvisited) {
            const p = edgePoints[idx];
            const d = Math.hypot(p.x - curr.x, p.y - curr.y);
            if (d < closestDist) {
              closestDist = d;
              closestIdx = idx;
            }
          }

          if (closestIdx !== -1) {
            unvisited.delete(closestIdx);
            curr = edgePoints[closestIdx];
            chained.push(curr);
          } else {
            searching = false;
          }
        }
      }
      this.points = chained;
    }
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

  // Recursive midpoint displacement for fractal lightning
  drawDisplacedLine(ctx, x1, y1, x2, y2, displace, depth) {
    if (depth <= 0 || Math.hypot(x2 - x1, y2 - y1) < 8) {
      ctx.lineTo(x2, y2);
      return;
    }
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const offset = (Math.random() - 0.5) * displace;
    const mx = midX + nx * offset;
    const my = midY + ny * offset;

    this.drawDisplacedLine(ctx, x1, y1, mx, my, displace * 0.52, depth - 1);
    this.drawDisplacedLine(ctx, mx, my, x2, y2, displace * 0.52, depth - 1);
  }

  tick() {
    this.animId = requestAnimationFrame(() => this.tick());
    if (!this.isVisible || !this.isLoaded || !this.points.length) return;

    this.time += 0.016 * this.options.speed;
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const opts = this.options;

    ctx.clearRect(0, 0, w, h);

    // Calculate dimensions of logo centered on canvas
    let drawW, drawH;
    const targetScale = opts.scale;
    if (w / h > this.aspect) {
      drawH = h * targetScale;
      drawW = drawH * this.aspect;
    } else {
      drawW = w * targetScale;
      drawH = drawW / this.aspect;
    }

    const offsetX = (w - drawW) / 2;
    const offsetY = (h - drawH) / 2;

    // Optional fill
    if (opts.fill > 0 && this.logoImg) {
      ctx.save();
      ctx.globalAlpha = opts.fill;
      ctx.drawImage(this.logoImg, offsetX, offsetY, drawW, drawH);
      ctx.restore();
    }

    const screenPoints = this.points.map(p => ({
      x: offsetX + p.x * drawW,
      y: offsetY + p.y * drawH,
      nx: p.nx,
      ny: p.ny
    }));

    const totalPts = screenPoints.length;
    if (totalPts < 10) return;

    // Voltage micro-flicker calculation
    const flickerBase = 1 - opts.flicker * 0.5 * Math.random();
    const cursorBoost = this.mouse.isHovered ? opts.cursorIntensity : 0;
    const currentIntensity = (opts.intensity + cursorBoost) * flickerBase;

    // Draw Strands
    const numStrands = Math.max(1, opts.strands);
    const segmentCount = Math.min(36, Math.floor(totalPts / 18));
    const step = Math.floor(totalPts / segmentCount);

    for (let s = 0; s < numStrands; s++) {
      const strandOffset = s * (totalPts / numStrands);
      const bendScale = (opts.bend * 20) * (0.6 + s * 0.4);
      const crackleDist = 12 * opts.crackle;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Pass 1: Outer Corona Glow
      ctx.shadowColor = opts.glowColor;
      ctx.shadowBlur = 24 * opts.glow;
      ctx.strokeStyle = opts.glowColor;
      ctx.lineWidth = Math.max(1.5, opts.thickness * 4);
      ctx.globalAlpha = Math.min(1, 0.45 * currentIntensity);

      this.renderStrandPath(ctx, screenPoints, step, strandOffset, bendScale, crackleDist);
      ctx.stroke();

      // Pass 2: Main Electric Strand
      ctx.shadowBlur = 10 * opts.glow;
      ctx.strokeStyle = opts.color;
      ctx.lineWidth = Math.max(1, opts.thickness * 2);
      ctx.globalAlpha = Math.min(1, 0.85 * currentIntensity);

      this.renderStrandPath(ctx, screenPoints, step, strandOffset, bendScale * 0.7, crackleDist * 0.8);
      ctx.stroke();

      // Pass 3: White-Hot Center Core
      ctx.shadowBlur = 4 * opts.glow;
      ctx.shadowColor = '#ffffff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(0.75, opts.thickness * 0.9);
      ctx.globalAlpha = Math.min(1, 1.0 * currentIntensity);

      this.renderStrandPath(ctx, screenPoints, step, strandOffset, bendScale * 0.3, crackleDist * 0.5);
      ctx.stroke();

      ctx.restore();
    }

    // Spontaneous Leaping Arcs
    if (opts.arcs > 0 && Math.random() < 0.28 * opts.arcs) {
      const idxA = Math.floor(Math.random() * totalPts);
      const idxB = (idxA + Math.floor(totalPts * (0.15 + Math.random() * 0.35))) % totalPts;
      const ptA = screenPoints[idxA];
      const ptB = screenPoints[idxB];

      this.arcsList.push({
        x1: ptA.x,
        y1: ptA.y,
        x2: ptB.x,
        y2: ptB.y,
        life: 1.0,
        decay: 0.12 + Math.random() * 0.15
      });
    }

    // Render & update active leaping arcs
    for (let i = this.arcsList.length - 1; i >= 0; i--) {
      const arc = this.arcsList[i];
      arc.life -= arc.decay;
      if (arc.life <= 0) {
        this.arcsList.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.shadowColor = opts.glowColor;
      ctx.shadowBlur = 16 * opts.glow;
      ctx.strokeStyle = opts.color;
      ctx.lineWidth = opts.thickness * 2.2 * arc.life;
      ctx.globalAlpha = arc.life * currentIntensity;

      ctx.beginPath();
      ctx.moveTo(arc.x1, arc.y1);
      this.drawDisplacedLine(ctx, arc.x1, arc.y1, arc.x2, arc.y2, 28 * opts.crackle, 4);
      ctx.stroke();

      ctx.restore();
    }

    // Interactive Cursor Arcs
    if (opts.interactive && this.mouse.isHovered) {
      let closest = null;
      let minDist = Infinity;
      const effectiveRadius = opts.cursorRadius * 2.5;

      for (let i = 0; i < totalPts; i += 6) {
        const p = screenPoints[i];
        const d = Math.hypot(p.x - this.mouse.x, p.y - this.mouse.y);
        if (d < minDist) {
          minDist = d;
          closest = p;
        }
      }

      if (closest && minDist < effectiveRadius) {
        ctx.save();
        ctx.shadowColor = opts.glowColor;
        ctx.shadowBlur = 20 * opts.glow;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1, opts.thickness * 2.5);
        ctx.globalAlpha = Math.min(1, (1 - minDist / effectiveRadius) * (0.8 + 0.2 * Math.random()));

        ctx.beginPath();
        ctx.moveTo(closest.x, closest.y);
        this.drawDisplacedLine(ctx, closest.x, closest.y, this.mouse.x, this.mouse.y, 20 * opts.crackle, 4);
        ctx.stroke();

        // Spawn interactive sparks at cursor
        if (this.particles.length < 35 && Math.random() < 0.6) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 1.5 + Math.random() * 3.5;
          this.particles.push({
            x: this.mouse.x,
            y: this.mouse.y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            life: 1.0,
            decay: 0.04 + Math.random() * 0.06,
            color: Math.random() > 0.4 ? opts.color : '#ffffff'
          });
        }

        ctx.restore();
      }
    }

    // Ambient Sparks leaping off letter edges
    if (this.particles.length < 25 && Math.random() < 0.35) {
      const p = screenPoints[Math.floor(Math.random() * totalPts)];
      const spd = 1.2 + Math.random() * 2.5;
      this.particles.push({
        x: p.x,
        y: p.y,
        vx: p.nx * spd + (Math.random() - 0.5),
        vy: p.ny * spd + (Math.random() - 0.5),
        life: 1.0,
        decay: 0.03 + Math.random() * 0.05,
        color: Math.random() > 0.5 ? opts.color : opts.glowColor
      });
    }

    // Render particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= pt.decay;

      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.fillStyle = pt.color;
      ctx.shadowColor = opts.glowColor;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = pt.life;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(0.5, 1.6 * pt.life), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  renderStrandPath(ctx, points, step, strandOffset, bendScale, crackleDist) {
    ctx.beginPath();
    const count = Math.floor(points.length / step);
    let first = true;

    for (let i = 0; i < count; i++) {
      const idx = (Math.floor(strandOffset) + i * step) % points.length;
      const p = points[idx];
      const nextIdx = (idx + step) % points.length;
      const nextP = points[nextIdx];

      // If consecutive points jump across different letters/segments (> 48px), start a fresh subpath
      if (Math.hypot(nextP.x - p.x, nextP.y - p.y) > 48) {
        first = true;
        continue;
      }

      // Wave bend displacement based on normal and time
      const wave = Math.sin(this.time * 2 + i * 0.5) * bendScale;
      const sx = p.x + p.nx * wave;
      const sy = p.y + p.ny * wave;
      const nx = nextP.x + nextP.nx * wave;
      const ny = nextP.y + nextP.ny * wave;

      if (first) {
        ctx.moveTo(sx, sy);
        first = false;
      }

      this.drawDisplacedLine(ctx, sx, sy, nx, ny, crackleDist, 3);
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

// Auto-initialize elements with [data-electric-logo]
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-electric-logo]').forEach(el => {
    const opts = {};
    const dataset = el.dataset;

    if (dataset.src) opts.src = dataset.src;
    if (dataset.color) opts.color = dataset.color;
    if (dataset.glowColor) opts.glowColor = dataset.glowColor;
    if (dataset.scale) opts.scale = parseFloat(dataset.scale);
    if (dataset.strands) opts.strands = parseInt(dataset.strands, 10);
    if (dataset.bend) opts.bend = parseFloat(dataset.bend);
    if (dataset.crackle) opts.crackle = parseFloat(dataset.crackle);
    if (dataset.arcs) opts.arcs = parseFloat(dataset.arcs);
    if (dataset.speed) opts.speed = parseFloat(dataset.speed);
    if (dataset.interactive !== undefined) opts.interactive = dataset.interactive !== 'false';
    if (dataset.intensity) opts.intensity = parseFloat(dataset.intensity);
    if (dataset.glow) opts.glow = parseFloat(dataset.glow);
    if (dataset.thickness) opts.thickness = parseFloat(dataset.thickness);
    if (dataset.flicker) opts.flicker = parseFloat(dataset.flicker);
    if (dataset.fill !== undefined) opts.fill = parseFloat(dataset.fill);
    if (dataset.cursorIntensity) opts.cursorIntensity = parseFloat(dataset.cursorIntensity);
    if (dataset.cursorRadius) opts.cursorRadius = parseFloat(dataset.cursorRadius);

    new ElectricLogo(el, opts);
  });
});

if (typeof window !== 'undefined') {
  window.ElectricLogo = ElectricLogo;
}
