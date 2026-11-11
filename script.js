/* ══════════════════════════════════════════════════════════════
   KREOVIX — script.js
   Theme Switcher (Dark & Normal Mode)
   Video Showcase, Lightbox Modal, Interactive Tabs & Pricing
   ══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbarScroll();
  initVideoTabs();
  initFaqAccordion();
  initPricingToggle();
  initMobileMenu();
  initScrollReveal();
});

/* ─── 1. THEME SWITCHER (Dark & Light Mode) ─── */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  try {
    localStorage.setItem('kreovix_theme', theme);
  } catch (e) {}

  const isDark = theme === 'dark';
  document.querySelectorAll('.theme-toggle-btn, #theme-toggle, #themeToggleBtn').forEach(btn => {
    btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    btn.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  });

  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    if (isDark) {
      themeIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    } else {
      themeIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem('kreovix_theme');
  } catch (e) {}

  const theme = saved || 'light';
  applyTheme(theme);

  document.querySelectorAll('.theme-toggle-btn, #theme-toggle, #themeToggleBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  });
}

/* ─── 2. NAVBAR SCROLL EFFECT ─── */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ─── 3. VIDEO LIGHTBOX MODAL ─── */
const SHORTS_IDS = [
  'ZWVE7T4TcM0', '4GmfmiUx2PQ', 'O6JbUuSdVxg', 'o-OCZb8BrFU',
  'I9BxXv3D48I', 'U0XbK9rSr1A', 'nlLwR7kNHK8', 'o6WGXQ1HrVg',
  'Yu1g5G6LRo4', 'dmn3umPbsRY', 'VGNL7R9ZzTU', '4KWCU7wWyic'
];

function openVideo(videoId, title, tag) {
  const modal    = document.getElementById('videoModal');
  const frame    = document.getElementById('videoFrame');
  const titleEl  = document.getElementById('modalTitle');
  const tagEl    = document.getElementById('modalTag');

  if (!modal || !frame) return;

  const isShorts = SHORTS_IDS.includes(videoId);

  if (titleEl) titleEl.innerHTML = title || 'Video Showcase';
  if (tagEl) tagEl.innerHTML = tag || 'Kreovix Edit';

  frame.className = isShorts ? 'video-modal-frame shorts-frame' : 'video-modal-frame';
  modal.classList.toggle('shorts-mode', isShorts);

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
  if (!modal) return;

  modal.classList.remove('active', 'shorts-mode');
  document.body.style.overflow = '';
  if (frame) {
    setTimeout(() => { frame.innerHTML = ''; }, 250);
  }
}

function closeVideoOnBg(e) {
  if (e.target === document.getElementById('videoModal')) closeVideo();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeVideo();
    closeEmailGate();
  }
});

/* ─── 4. VIDEO CATEGORY TABS (SIMPLE / COMPLEX / BRAND) ─── */
function initVideoTabs() {
  const tabs = document.querySelectorAll('.tab-pill');
  const cards = document.querySelectorAll('.video-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 40);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* ─── 5. PRICING PACK TOGGLE ─── */
const PRICING_DATA = {
  simple: {
    4:  { perVideo: '$55',  total: '$220',  validity: '60 Days' },
    8:  { perVideo: '$50',  total: '$400',  validity: '60 Days' },
    12: { perVideo: '$45',  total: '$540',  validity: '60 Days' }
  },
  complex: {
    4:  { perVideo: '$80',  total: '$320',  validity: '60 Days' },
    8:  { perVideo: '$75',  total: '$600',  validity: '60 Days' },
    12: { perVideo: '$70',  total: '$840',  validity: '60 Days' }
  }
};

function initPricingToggle() {
  const packBtns = document.querySelectorAll('.pricing-pack-btn');
  if (!packBtns.length) return;

  packBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.pricing-card');
      if (!parent) return;

      const groupBtns = parent.querySelectorAll('.pricing-pack-btn');
      groupBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tier = parent.getAttribute('data-tier'); // 'simple' or 'complex'
      const count = btn.getAttribute('data-count');

      if (PRICING_DATA[tier] && PRICING_DATA[tier][count]) {
        const priceEl = parent.querySelector('.pricing-price-val');
        const totalEl = parent.querySelector('.pricing-total-val');
        const valEl   = parent.querySelector('.pricing-validity-val');

        if (priceEl) priceEl.textContent = PRICING_DATA[tier][count].perVideo;
        if (totalEl) totalEl.textContent = `Total ${PRICING_DATA[tier][count].total}`;
        if (valEl)   valEl.textContent   = `${PRICING_DATA[tier][count].validity} Validity`;
      }
    });
  });
}

/* ─── 6. FAQ ACCORDION ─── */
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      if (!item) return;

      const isActive = item.classList.contains('active');
      // Close others
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ─── 7. MOBILE MENU TOGGLE ─── */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ─── 8. FORM SUBMIT HANDLER ─── */
async function handleSubmit(e) {
  const btn = document.getElementById('submit-btn');
  if (btn) {
    btn.textContent = 'Submitting Request…';
    btn.disabled = true;
  }
}

/* ─── 9. SCROLL REVEAL (EditLobby Page-Turn Animation) ─── */
function initScrollReveal() {
  // Add 'reveal' class to elements that should animate on scroll
  const revealSelectors = [
    '.section-header',
    '.video-card',
    '.process-card',
    '.bento-card',
    '.pricing-card',
    '.faq-item',
    '.contact-card-box',
    '.ticker-section',
    '.work-tabs',
    '.featured-video-wrapper',
    '.shop-card'
  ];

  revealSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('reveal');
    });
  });

  // Intersection Observer — triggers 'visible' when element enters viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger siblings (e.g. video cards, bento cards) for cascade effect
        const el = entry.target;
        const parent = el.parentElement;
        const siblings = parent ? Array.from(parent.querySelectorAll(':scope > .reveal')) : [];
        const siblingIndex = siblings.indexOf(el);
        const delay = siblingIndex >= 0 ? siblingIndex * 100 : 0;

        setTimeout(() => {
          el.classList.add('visible');
        }, delay);

        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}


/* ─── 10. EMAIL GATE FOR FREE RESOURCES ─── */
function openEmailGate(resourceSlug, resourceTitle) {
  const modal = document.getElementById('emailGateModal');
  const body = document.getElementById('emailGateBody');
  const success = document.getElementById('emailGateSuccess');
  const titleEl = document.getElementById('emailGateTitle');
  const resourceInput = document.getElementById('emailGateResource');
  const emailInput = document.getElementById('emailGateInput');
  const submitBtn = document.getElementById('emailGateSubmit');

  if (!modal) return;

  if (body) body.style.display = 'block';
  if (success) success.style.display = 'none';
  if (titleEl) titleEl.textContent = `Get: ${resourceTitle}`;
  if (resourceInput) resourceInput.value = resourceSlug;
  if (emailInput) emailInput.value = '';
  if (submitBtn) {
    submitBtn.innerHTML = 'Get Access &rarr;';
    submitBtn.disabled = false;
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Focus the email input after animation
  setTimeout(() => {
    if (emailInput) emailInput.focus();
  }, 300);
}

function closeEmailGate() {
  const modal = document.getElementById('emailGateModal');
  if (!modal) return;

  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Close email gate when clicking background
document.addEventListener('click', (e) => {
  if (e.target === document.getElementById('emailGateModal')) {
    closeEmailGate();
  }
});

function handleEmailGate(e) {
  e.preventDefault();

  const emailInput = document.getElementById('emailGateInput');
  const resourceInput = document.getElementById('emailGateResource');
  const submitBtn = document.getElementById('emailGateSubmit');

  if (!emailInput || !resourceInput) return;

  const email = emailInput.value.trim();
  const resource = resourceInput.value;

  if (!email) return;

  // Disable button during submission
  if (submitBtn) {
    submitBtn.innerHTML = 'Sending…';
    submitBtn.disabled = true;
  }

  // Send email to FormSubmit for lead capture
  const formData = new FormData();
  formData.append('email', email);
  formData.append('resource', resource);
  formData.append('_subject', `New Resource Download: ${resource} 📥`);
  formData.append('_captcha', 'false');
  formData.append('_template', 'table');

  fetch('https://formsubmit.co/ajax/teamkreovix@gmail.com', {
    method: 'POST',
    body: formData
  }).then(() => {
    triggerDownload(resource);
  }).catch(() => {
    triggerDownload(resource);
  });

  function triggerDownload(slug) {
    const body = document.getElementById('emailGateBody');
    const success = document.getElementById('emailGateSuccess');
    const downloadLink = document.getElementById('emailGateDownloadLink');

    if (body) body.style.display = 'none';
    if (success) success.style.display = 'block';
    if (downloadLink) {
      downloadLink.href = `/resources/${slug}.pdf`;
      downloadLink.download = `${slug}.pdf`;
    }

    // Auto-trigger download
    const link = document.createElement('a');
    link.href = `/resources/${slug}.pdf`;
    link.download = `${slug}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
