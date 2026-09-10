/* ══════════════════════════════════
   VIDEO LIGHTBOX
══════════════════════════════════ */

// Shorts video IDs (9:16 aspect ratio)
const SHORTS_IDS = ['ZWVE7T4TcM0', '4GmfmiUx2PQ', 'O6JbUuSdVxg', 'o-OCZb8BrFU', 'I9BxXv3D48I', 'U0XbK9rSr1A', 'nlLwR7kNHK8', 'o6WGXQ1HrVg', 'Yu1g5G6LRo4', 'dmn3umPbsRY', 'VGNL7R9ZzTU', '4KWCU7wWyic'];

function openVideo(videoId, title, tag) {
  const modal    = document.getElementById('videoModal');
  const frame    = document.getElementById('videoFrame');
  const titleEl  = document.getElementById('modalTitle');
  const tagEl    = document.getElementById('modalTag');

  const isShorts = SHORTS_IDS.includes(videoId);

  titleEl.innerHTML = title;
  tagEl.innerHTML   = tag;

  // Set aspect ratio class
  frame.className = isShorts ? 'video-modal-frame shorts-frame' : 'video-modal-frame';

  // Toggle vertical mode on modal for alignment
  modal.classList.toggle('shorts-mode', isShorts);

  // Inject iframe
  frame.innerHTML = `<iframe
    src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1"
    allow="autoplay; encrypted-media; picture-in-picture"
    allowfullscreen
  ></iframe>`;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeVideo() {
  const modal = document.getElementById('videoModal');
  const frame = document.getElementById('videoFrame');
  modal.classList.remove('active', 'shorts-mode');
  document.body.style.overflow = '';
  // Destroy iframe to stop video
  setTimeout(() => { frame.innerHTML = ''; }, 300);
}

function closeVideoOnBg(e) {
  if (e.target === document.getElementById('videoModal')) closeVideo();
}

// Close with Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeVideo();
});

/* ══════════════════════════════════
   PHOTO LIGHTBOX
══════════════════════════════════ */
const SHOOT_PHOTOS = [
  { src: 'images/shoots/shoot-journal.jpg',        title: 'Spiral Journal — Product Shoot' },
  { src: 'images/shoots/shoot-mohebi.jpg',         title: 'Mohebi Life — Natural Hair Support' },
  { src: 'images/shoots/shoot-blenders.jpg',       title: 'Blenders Pride — Premium Whisky' },
  { src: 'images/shoots/shoot-coffee.jpg',         title: 'Cold Brew + Camera — Café Lifestyle' },
  { src: 'images/shoots/shoot-notebook.jpg',       title: 'Astronaut Notebook — Desk Lifestyle' },
  { src: 'images/shoots/shoot-stationery-set.jpg', title: 'Girl Boss Collection — Stationery Set' },
];
let currentPhotoIdx = 0;

function openPhoto(index) {
  currentPhotoIdx = index;
  _renderPhoto();
  const lb = document.getElementById('photoLightbox');
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function _renderPhoto() {
  const p = SHOOT_PHOTOS[currentPhotoIdx];
  document.getElementById('photoLightboxImg').src    = p.src;
  document.getElementById('photoLightboxImg').alt    = p.title;
  document.getElementById('photoLightboxTitle').textContent   = p.title;
  document.getElementById('photoLightboxCounter').textContent = `${currentPhotoIdx + 1} / ${SHOOT_PHOTOS.length}`;
}

function closePhoto() {
  const lb = document.getElementById('photoLightbox');
  lb.classList.remove('active');
  document.body.style.overflow = '';
}

function closePhotoOnBg(e) {
  if (e.target === document.getElementById('photoLightbox')) closePhoto();
}

function photoNav(dir) {
  currentPhotoIdx = (currentPhotoIdx + dir + SHOOT_PHOTOS.length) % SHOOT_PHOTOS.length;
  const img = document.getElementById('photoLightboxImg');
  img.style.opacity = '0';
  img.style.transform = `scale(0.95) translateX(${dir * 30}px)`;
  setTimeout(() => {
    _renderPhoto();
    img.style.transition = 'none';
    img.style.opacity = '0';
    img.style.transform = `scale(0.95) translateX(${-dir * 30}px)`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        img.style.transition = 'opacity 0.25s ease, transform 0.3s ease';
        img.style.opacity = '1';
        img.style.transform = 'scale(1) translateX(0)';
      });
    });
  }, 180);
}

// Keyboard nav for photo lightbox
document.addEventListener('keydown', e => {
  const lb = document.getElementById('photoLightbox');
  if (!lb.classList.contains('active')) return;
  if (e.key === 'ArrowRight') photoNav(1);
  if (e.key === 'ArrowLeft')  photoNav(-1);
  if (e.key === 'Escape')     closePhoto();
});

/* ══════════════════════════════════
   VIDEO EDITING — SHOW MORE TOGGLE
══════════════════════════════════ */
function toggleMoreVideos() {
  const btn     = document.getElementById('videoMoreBtn');
  const label   = document.getElementById('videoMoreLabel');
  const hidden  = document.querySelectorAll('#tab-content-editing .video-more-hidden');
  const expanded = btn.classList.toggle('expanded');

  hidden.forEach((el, i) => {
    if (expanded) {
      el.style.display = 'block';
      el.style.animation = `fadeSlideUp 0.4s ease ${i * 0.08}s both`;
    } else {
      el.style.display = 'none';
      el.style.animation = '';
    }
  });

  label.textContent = expanded ? 'Show Less' : 'Show More';
}

/* ══════════════════════════════════
   PHOTO SHOOTS — SHOW MORE TOGGLE
══════════════════════════════════ */
function toggleMoreShoots() {
  const btn    = document.getElementById('shootMoreBtn');
  const label  = document.getElementById('shootMoreLabel');
  const hidden = document.querySelectorAll('#tab-content-shoots .photo-more-hidden');
  const expanded = btn.classList.toggle('expanded');

  hidden.forEach((el, i) => {
    if (expanded) {
      el.style.display = 'block';
      el.style.animation = `fadeSlideUp 0.4s ease ${i * 0.08}s both`;
    } else {
      el.style.display = 'none';
      el.style.animation = '';
    }
  });

  label.textContent = expanded ? 'Show Less' : 'Show More';
}

/* ══════════════════════════════════
   GRAPHIC DESIGN — SHOW MORE TOGGLE
══════════════════════════════════ */
function toggleMoreGfx() {
  const btn    = document.getElementById('gfxMoreBtn');
  const label  = document.getElementById('gfxMoreLabel');
  const hidden = document.querySelectorAll('#tab-content-graphics .gfx-more-hidden');
  const expanded = btn.classList.toggle('expanded');

  hidden.forEach((el, i) => {
    if (expanded) {
      el.style.display = 'block';
      el.style.animation = `fadeSlideUp 0.4s ease ${i * 0.08}s both`;
    } else {
      el.style.display = 'none';
      el.style.animation = '';
    }
  });

  label.textContent = expanded ? 'Show Less' : 'Show More';
}

/* ══════════════════════════════════
   SERVICES — MORE TOGGLE
══════════════════════════════════ */
function toggleMoreServices() {
  const btn   = document.getElementById('servicesMoreBtn');
  const cards = document.querySelectorAll('.service-card--hidden');
  const isExpanded = btn.classList.contains('expanded');

  if (isExpanded) {
    // Collapse
    cards.forEach(c => {
      c.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      c.style.opacity    = '0';
      c.style.transform  = 'translateY(16px)';
      setTimeout(() => { c.classList.remove('visible'); }, 260);
    });
    btn.classList.remove('expanded');
    btn.querySelector('.services-more-btn__text').textContent = 'More Services';
  } else {
    // Expand — set display:block first, then animate in next frame
    cards.forEach((c, i) => {
      c.classList.add('visible');
      c.style.opacity   = '0';
      c.style.transform = 'translateY(16px)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          c.style.transition = `opacity 0.35s ease ${i * 70}ms, transform 0.35s ease ${i * 70}ms`;
          c.style.opacity    = '1';
          c.style.transform  = 'translateY(0)';
        });
      });
    });
    btn.classList.add('expanded');
    btn.querySelector('.services-more-btn__text').textContent = 'Show Less';
  }
}


/* ══════════════════════════════════
   NAVBAR & SITE JS
══════════════════════════════════ */

/* ─── Form Success Detection ─── */
(function () {
  if (new URLSearchParams(window.location.search).get('sent') === '1') {
    // Clean URL immediately
    history.replaceState({}, '', window.location.pathname + '#contact');

    // Wait for DOM then show success
    window.addEventListener('DOMContentLoaded', showFormSuccess, { once: true });
    if (document.readyState !== 'loading') showFormSuccess();
  }

  function showFormSuccess() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Replace form with success card
    form.innerHTML = `
      <div class="form-success">
        <div class="form-success-icon">✓</div>
        <h3>Message Sent!</h3>
        <p>Thanks for reaching out — we'll come back to you within 48 hours with a custom proposal.</p>
      </div>`;

    // Short delay so card renders before smooth scroll
    setTimeout(() => {
      const section = document.getElementById('contact');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  }
})();

/* ─── Navbar Scroll ─── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

/* ─── Mobile Menu ─── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  const spans = hamburger.querySelectorAll('span');
  if (mobileMenu.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
  const spans = hamburger.querySelectorAll('span');
  spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}

/* ─── Portfolio Tabs ─── */
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    const content = document.getElementById(`tab-content-${target}`);
    if (content) {
      content.classList.add('active');
      // Reveal new items
      const items = content.querySelectorAll('.portfolio-item');
      items.forEach((item, i) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
          item.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, i * 60);
      });
    }
  });
});

/* ─── Scroll Reveal ─── */
const revealEls = document.querySelectorAll(
  '.service-card, .work-card, .portfolio-item, .pricing-card, .why-card, .testimonial-card, .audit-item, .campaign-card, .process-step, .section-header, .hero-stats, .audit-section, .campaign-section'
);

revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));

/* ─── Staggered Reveal for Grids ─── */
function applyStagger(selector, parentSelector) {
  document.querySelectorAll(parentSelector).forEach(parent => {
    const children = parent.querySelectorAll(selector);
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.08}s`;
    });
  });
}

applyStagger('.service-card', '.services-grid');
applyStagger('.why-card', '.why-grid');
applyStagger('.pricing-card', '.pricing-grid');
applyStagger('.testimonial-card', '.testimonials-grid');
applyStagger('.audit-item', '.audit-grid');
applyStagger('.campaign-card', '.campaign-grid');
applyStagger('.work-card', '.work-grid');

/* ─── Hero Parallax ─── */
const hero = document.querySelector('.hero');
const heroGlows = document.querySelectorAll('.hero-glow');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (scrollY < window.innerHeight) {
    heroGlows.forEach((glow, i) => {
      const speed = 0.15 * (i + 1);
      glow.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }
}, { passive: true });

/* ─── Smooth active nav link ─── */
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${id}`) {
          link.style.color = 'var(--accent)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ─── Contact Form ─── */
// ── Google Sheets Web App URL ──────────────────────────────
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxpp52e5OusVxZykqnn-LTDQV92VUWQC4NJERTFB7dwcDBs1PPpMd2oiA2qupYor-SJpg/exec';
// ──────────────────────────────────────────────────────────

async function handleSubmit(e) {
  // Let the native form POST to FormSubmit.co happen
  // Just update button to show loading state
  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Sending…';
  btn.disabled = true;
  // Form will POST and redirect to ?sent=1#contact on success
}

/* ─── Cursor glow effect (desktop) ─── */
if (window.innerWidth > 900) {
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed; width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(200,169,110,0.04) 0%, transparent 70%);
    border-radius: 50%; pointer-events: none; z-index: 9999;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    will-change: transform;
  `;
  document.body.appendChild(cursor);

  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function animateCursor() {
    curX += (mouseX - curX) * 0.08;
    curY += (mouseY - curY) * 0.08;
    cursor.style.left = `${curX}px`;
    cursor.style.top = `${curY}px`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}

/* ─── Number counter animation ─── */
function animateCounter(el, target, suffix = '') {
  const duration = 1800;
  const start = performance.now();
  const isDecimal = target % 1 !== 0;

  function update(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;
    el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-num');
      nums.forEach(num => {
        const text = num.textContent;
        if (text.includes('120')) animateCounter(num, 120, '+');
        else if (text.includes('5')) animateCounter(num, 5, '★');
        else if (text.includes('3')) num.textContent = '3yr+';
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObserver.observe(statsEl);
