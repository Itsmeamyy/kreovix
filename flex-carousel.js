/**
 * FlexCarousel — Pure JavaScript implementation of React Bits @react-bits/FlexCarousel
 * Creates an infinite, liquid-glass 3D perspective card carousel with drag inertia,
 * wheel scroll capture, dynamic curvature bending, and integrated media lightbox trigger.
 */

class FlexCarousel {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.options = Object.assign({
      autoplay: true,
      autoplaySpeed: 1.0,
      pauseOnHover: true,
      captureWheel: true,
      focusOnClick: true,
      cardWidth: 320,
      gap: 24,
      bend: 0.18,
      items: []
    }, options);

    // Read items from options or DOM
    this.rawItems = this.options.items.length > 0 ? this.options.items : this.extractItemsFromDOM();
    if (!this.rawItems.length) return;

    this.activeFilter = 'all';
    this.filteredItems = [...this.rawItems];

    // State
    this.offset = 0;
    this.targetOffset = 0;
    this.velocity = 0;
    this.isHovered = false;
    this.isPointerDown = false;
    this.dragStartX = 0;
    this.dragStartOffset = 0;
    this.dragDistance = 0;
    this.lastPointerX = 0;
    this.lastPointerTime = 0;
    this.animId = null;
    this.isVisible = true;

    this.init();
  }

  extractItemsFromDOM() {
    let cards = this.container.querySelectorAll('.flex-carousel-card, .video-card');
    if (!cards.length) {
      cards = document.querySelectorAll('.video-grid .video-card');
    }
    const items = [];
    cards.forEach(card => {
      const onclickStr = card.getAttribute('onclick') || '';
      const match = onclickStr.match(/openMedia\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/);
      
      const type = card.dataset.type || (match ? match[1] : (onclickStr.includes("'image'") ? 'image' : 'video'));
      const id = card.dataset.id || (match ? match[2] : '');
      const title = card.dataset.title || (match ? match[3] : card.querySelector('.video-card-title, h3')?.textContent?.trim() || '');
      const badge = card.dataset.badge || (match ? match[4] : card.querySelector('.video-badge, .badge')?.textContent?.trim() || '');
      const meta = card.dataset.meta || card.querySelector('.video-card-meta, .meta')?.textContent?.trim() || '';
      const category = card.dataset.category || '';
      const thumb = card.dataset.thumb || card.querySelector('img')?.getAttribute('src') || '';

      if (id || thumb) {
        items.push({ type, id, title, badge, meta, category, thumb });
      }
    });
    return items;
  }

  extractMediaSrc(onclickStr) {
    if (!onclickStr) return '';
    const match = onclickStr.match(/openMedia\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/);
    return match ? match[2] : '';
  }

  init() {
    this.buildDOM();
    this.setupListeners();
    this.updateMetrics();
    this.start();
  }

  buildDOM() {
    this.container.classList.add('flex-carousel-container');
    this.container.innerHTML = `
      <div class="flex-carousel-liquid-edge flex-carousel-edge-left" aria-hidden="true"></div>
      <div class="flex-carousel-liquid-edge flex-carousel-edge-right" aria-hidden="true"></div>

      <div class="flex-carousel-viewport">
        <div class="flex-carousel-track"></div>
      </div>

      <div class="flex-carousel-controls">
        <button class="flex-carousel-arrow flex-carousel-prev" aria-label="Previous project">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div class="flex-carousel-indicator">
          <span class="flex-carousel-dot"></span>
          <span class="flex-carousel-status">Infinite Stream &middot; Drag or Scroll</span>
        </div>

        <button class="flex-carousel-arrow flex-carousel-next" aria-label="Next project">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    `;

    this.viewport = this.container.querySelector('.flex-carousel-viewport');
    this.track = this.container.querySelector('.flex-carousel-track');
    this.prevBtn = this.container.querySelector('.flex-carousel-prev');
    this.nextBtn = this.container.querySelector('.flex-carousel-next');

    this.renderCards();
  }

  renderCards() {
    this.track.innerHTML = '';
    const items = this.filteredItems;
    if (!items.length) return;

    // Clone items 3 times for seamless wrapping
    const copies = 3;
    this.totalCopies = copies;
    this.singleSetCount = items.length;

    for (let c = 0; c < copies; c++) {
      items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'flex-carousel-card';
        card.dataset.index = index;
        card.dataset.copy = c;
        card.dataset.type = item.type;
        card.dataset.id = item.id;
        card.dataset.title = item.title;
        card.dataset.tag = item.badge;
        card.dataset.category = item.category;

        const isVideo = item.type === 'video';
        const playIcon = isVideo
          ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`;

        card.innerHTML = `
          <div class="flex-carousel-card-inner">
            <img src="${item.thumb}" alt="${item.title}" class="flex-carousel-thumb" loading="lazy">
            <div class="flex-carousel-card-overlay">
              <div class="flex-carousel-top-badge">
                <span class="flex-card-badge">${item.badge}</span>
              </div>
              <div class="flex-carousel-play-btn">
                ${playIcon}
              </div>
              <div class="flex-carousel-bottom-info">
                <h4 class="flex-carousel-title">${item.title}</h4>
                <div class="flex-carousel-meta">${item.meta}</div>
              </div>
            </div>
          </div>
        `;

        // Card click handling (check if it was a drag or real click)
        card.addEventListener('click', (e) => {
          if (this.dragDistance > 8) return; // ignore drag release
          e.preventDefault();

          // Open in lightbox
          if (typeof window.openMedia === 'function') {
            window.openMedia(item.type, item.id, item.title, item.badge);
          }
        });

        this.track.appendChild(card);
      });
    }

    this.cards = Array.from(this.track.querySelectorAll('.flex-carousel-card'));
    this.updateMetrics();
  }

  updateMetrics() {
    const isMobile = window.innerWidth <= 768;
    this.cardWidth = isMobile ? Math.min(270, window.innerWidth - 64) : this.options.cardWidth;
    this.gap = isMobile ? 16 : this.options.gap;
    this.itemWidth = this.cardWidth + this.gap;
    this.cycleWidth = this.singleSetCount * this.itemWidth;
    this.viewportWidth = this.viewport.offsetWidth || this.container.offsetWidth;

    // Apply width to cards
    if (this.cards) {
      this.cards.forEach(card => {
        card.style.width = `${this.cardWidth}px`;
        card.style.marginRight = `${this.gap}px`;
      });
    }
  }

  setupListeners() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateMetrics();
    });
    this.resizeObserver.observe(this.container);

    // Mouse hover pause
    if (this.options.pauseOnHover) {
      this.container.addEventListener('mouseenter', () => {
        this.isHovered = true;
      });
      this.container.addEventListener('mouseleave', () => {
        this.isHovered = false;
      });
    }

    // Pointer Drag Handling (Mouse & Touch)
    const onPointerDown = (clientX) => {
      this.isPointerDown = true;
      this.dragStartX = clientX;
      this.dragStartOffset = this.offset;
      this.dragDistance = 0;
      this.lastPointerX = clientX;
      this.lastPointerTime = performance.now();
      this.velocity = 0;
      this.container.classList.add('is-dragging');
    };

    const onPointerMove = (clientX) => {
      if (!this.isPointerDown) return;
      const dx = clientX - this.dragStartX;
      this.dragDistance = Math.abs(dx);
      this.offset = this.dragStartOffset - dx;

      // Track velocity
      const now = performance.now();
      const dt = now - this.lastPointerTime;
      if (dt > 10) {
        this.velocity = -(clientX - this.lastPointerX) / (dt * 0.06);
        this.lastPointerX = clientX;
        this.lastPointerTime = now;
      }
    };

    const onPointerUp = () => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;
      this.container.classList.remove('is-dragging');
    };

    // Mouse events
    this.viewport.addEventListener('mousedown', (e) => {
      onPointerDown(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPointerDown) {
        onPointerMove(e.clientX);
      }
    });

    window.addEventListener('mouseup', onPointerUp);

    // Touch events
    this.viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        onPointerDown(e.touches[0].clientX);
      }
    }, { passive: true });

    this.viewport.addEventListener('touchmove', (e) => {
      if (this.isPointerDown && e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX);
      }
    }, { passive: true });

    this.viewport.addEventListener('touchend', onPointerUp);
    this.viewport.addEventListener('touchcancel', onPointerUp);

    // Mouse Wheel Capture (vertical or horizontal wheel scrolls carousel)
    if (this.options.captureWheel) {
      this.container.addEventListener('wheel', (e) => {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(delta) > 4) {
          e.preventDefault();
          this.offset += delta * 0.85;
          this.velocity = delta * 0.12;
        }
      }, { passive: false });
    }

    // Prev / Next button navigation
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.velocity = -12;
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.velocity = 12;
      });
    }

    // Viewport Intersection Observer
    this.intersectionObserver = new IntersectionObserver((entries) => {
      this.isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    this.intersectionObserver.observe(this.container);
  }

  filter(category) {
    this.activeFilter = category;
    if (category === 'all') {
      this.filteredItems = [...this.rawItems];
    } else {
      this.filteredItems = this.rawItems.filter(item => {
        const cats = (item.category || '').toLowerCase().split(/\s+/);
        return cats.includes(category.toLowerCase());
      });
    }

    // Reset offset smoothly and rebuild
    this.offset = 0;
    this.velocity = 0;
    this.renderCards();
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
    if (!this.isVisible || !this.cards || !this.cards.length) return;

    // Apply inertia or autoplay
    if (this.isPointerDown) {
      // During active drag, offset is directly driven by mouse
    } else {
      // Decelerate velocity
      if (Math.abs(this.velocity) > 0.05) {
        this.offset += this.velocity;
        this.velocity *= 0.92;
      } else {
        this.velocity = 0;
        // Autoplay when idle
        if (this.options.autoplay && !this.isHovered) {
          this.offset += this.options.autoplaySpeed;
        }
      }
    }

    // Wrap around smoothly (infinite loop)
    if (this.cycleWidth > 0) {
      if (this.offset >= this.cycleWidth) {
        this.offset -= this.cycleWidth;
        if (this.isPointerDown) this.dragStartOffset -= this.cycleWidth;
      } else if (this.offset < 0) {
        this.offset += this.cycleWidth;
        if (this.isPointerDown) this.dragStartOffset += this.cycleWidth;
      }
    }

    this.renderFrame();
  }

  renderFrame() {
    const halfViewport = this.viewportWidth / 2;
    const bendFactor = this.options.bend;

    // Position track
    this.track.style.transform = `translate3d(${-this.offset}px, 0, 0)`;

    // Calculate 3D perspective distortion and scale for each card
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      const cardLeft = i * this.itemWidth - this.offset;
      const cardCenter = cardLeft + this.cardWidth / 2;
      const distFromCenter = (cardCenter - halfViewport) / (halfViewport || 1);

      // Only compute and transform if in or near viewport
      if (cardLeft < -this.cardWidth * 2 || cardLeft > this.viewportWidth + this.cardWidth * 2) {
        continue;
      }

      const clampedDist = Math.max(-1.8, Math.min(1.8, distFromCenter));
      const absDist = Math.abs(clampedDist);

      // 3D Liquid-Glass Flex Transform
      const scale = Math.max(0.86, 1.05 - absDist * 0.12);
      const rotateY = -clampedDist * 18 * (bendFactor / 0.18);
      const rotateZ = -clampedDist * 1.5;
      const opacity = Math.max(0.4, 1 - Math.pow(absDist * 0.52, 1.8));

      // Center card elevation glow
      const isCenter = absDist < 0.35;
      card.classList.toggle('is-center-focus', isCenter);

      const inner = card.querySelector('.flex-carousel-card-inner');
      if (inner) {
        inner.style.transform = `perspective(1000px) scale(${scale}) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
        inner.style.opacity = opacity.toFixed(2);
      }
    }
  }

  destroy() {
    this.stop();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
  }
}

// Auto-initialize element with [data-flex-carousel]
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('[data-flex-carousel]');
  if (container) {
    const opts = {};
    const dataset = container.dataset;

    if (dataset.autoplay !== undefined) opts.autoplay = dataset.autoplay !== 'false';
    if (dataset.autoplaySpeed) opts.autoplaySpeed = parseFloat(dataset.autoplaySpeed);
    if (dataset.captureWheel !== undefined) opts.captureWheel = dataset.captureWheel !== 'false';
    if (dataset.bend) opts.bend = parseFloat(dataset.bend);

    window.kreovixFlexCarousel = new FlexCarousel(container, opts);
  }
});

if (typeof window !== 'undefined') {
  window.FlexCarousel = FlexCarousel;
}
