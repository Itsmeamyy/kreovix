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

/* ─── 1. THEME — Dark Mode Only ─── */
function initTheme() {
  document.documentElement.setAttribute('data-theme', 'dark');
  document.body.classList.add('dark-mode');
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
  const titleEl = document.getElementById('emailGateTitle');
  const resourceInput = document.getElementById('emailGateResource');
  const emailInput = document.getElementById('emailGateInput');

  if (!modal) return;

  if (titleEl) titleEl.textContent = `Get: ${resourceTitle}`;
  if (resourceInput) resourceInput.value = resourceSlug;
  if (emailInput) emailInput.value = '';

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
  const modal = document.getElementById('emailGateModal');

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
    // Show success and trigger download regardless of email send status
    triggerDownload(resource);
  }).catch(() => {
    // Still trigger download even if email send fails
    triggerDownload(resource);
  });

  function triggerDownload(slug) {
    // Replace modal content with success message
    const inner = modal.querySelector('.email-gate-inner');
    if (inner) {
      inner.innerHTML = `
        <button class="email-gate-close" onclick="closeEmailGate()" aria-label="Close">&times;</button>
        <div style="padding: 20px 0;">
          <div style="width:56px;height:56px;border-radius:50%;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:1.5rem;">&#10003;</div>
          <h3 style="font-size:1.3rem;font-weight:600;color:var(--text);margin-bottom:8px;">You're all set!</h3>
          <p style="font-size:0.92rem;color:var(--text-muted);margin-bottom:24px;">Your download is starting now.</p>
          <a href="/resources/${slug}.pdf" download class="btn btn-primary" style="width:100%;justify-content:center;" onclick="setTimeout(closeEmailGate, 500)">
            Download PDF
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </a>
        </div>
      `;
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
