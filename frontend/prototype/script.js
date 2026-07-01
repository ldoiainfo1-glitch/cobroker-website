/* ─────────────────────────────────────────
   COBROKINGS — script.js
   ───────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Navbar scroll effect ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ── 2. Hamburger / mobile menu ── */
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
    // animate spans
    const spans = hamburger.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    })
  );

  /* ── 3. Search tabs ── */
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const placeholder = {
        buy:     'e.g. 3BHK flat in Bandra under 3Cr…',
        sell:    'e.g. 2BHK in Koramangala, good ROI…',
        rent:    'e.g. furnished 1BHK in Andheri West…',
        lease:   'e.g. commercial space 2000 sqft…',
        pg:      'e.g. PG near Hinjewadi IT park…',
        circles: 'Select your city to join a broker circle…',
      }[tab.dataset.tab] || 'Area, locality or landmark…';
      const input = document.querySelector('.search-input');
      if (input) input.placeholder = placeholder;
    });
  });

  /* ── 4. Live listings filter ── */
  let activeType = 'all';
  let activeCity = 'all';

  function applyListingFilters() {
    document.querySelectorAll('.listing-card').forEach(card => {
      const matchType = activeType === 'all' || card.dataset.type === activeType;
      const matchCity = activeCity === 'all' || card.dataset.city === activeCity;
      card.style.display = (matchType && matchCity) ? 'flex' : 'none';
    });
  }

  document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeType = btn.dataset.filter;
      applyListingFilters();
    });
  });

  document.querySelectorAll('.filter-btn[data-city]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-city]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCity = btn.dataset.city;
      applyListingFilters();
    });
  });

  /* ── 5. Live listings ticker — infinite scroll duplicate ── */
  // Duplicate cards inside each ticker-col for seamless loop
  document.querySelectorAll('.ticker-col').forEach(col => {
    const cards = col.querySelectorAll('.listing-card');
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      col.appendChild(clone);
    });
  });

  /* ── 6. Cookie banner ── */
  const cookieBanner = document.getElementById('cookieBanner');
  const COOKIE_KEY   = 'cbk_cookie_consent';

  if (localStorage.getItem(COOKIE_KEY)) {
    cookieBanner.classList.add('hidden');
  }

  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    cookieBanner.classList.add('hidden');
  });
  document.getElementById('cookieReject').addEventListener('click', () => {
    localStorage.setItem(COOKIE_KEY, 'rejected');
    cookieBanner.classList.add('hidden');
  });

  /* ── 7. Smooth-scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 8. Intersection observer — fade-in on scroll ── */
  const fadeEls = document.querySelectorAll(
    '.feature-card, .step-card, .cat-card, .listing-card, .trust-item, .usp-pill, .city-chip'
  );

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeEls.forEach((el, i) => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = `opacity .5s ease ${(i % 6) * 0.06}s, transform .5s ease ${(i % 6) * 0.06}s`;
    io.observe(el);
  });

  // add .visible to stylesheet dynamically
  const styleEl = document.createElement('style');
  styleEl.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
  document.head.appendChild(styleEl);

  /* ── 9. Live "pulse" timestamps — increment every 30s ── */
  function refreshTimestamps() {
    document.querySelectorAll('.lc-time').forEach(el => {
      const txt = el.textContent.trim();
      const match = txt.match(/^(\d+)\s*min ago$/);
      if (match) {
        const mins = parseInt(match[1], 10) + 1;
        el.textContent = `${mins} min ago`;
      }
    });
  }
  setInterval(refreshTimestamps, 30_000);

  /* ── 10. Hero — tiny animated counter for "30,000+ Deals" ── */
  const animateCounter = (el, target, suffix = '') => {
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = start.toLocaleString('en-IN') + suffix;
      if (start >= target) clearInterval(timer);
    }, 24);
  };

  const trustNums = document.querySelectorAll('.t-num');
  const trustIo = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      if (raw === '100%') { el.textContent = '100%'; }
      else if (raw === 'Zero') { /* static */ }
      else {
        const num = parseInt(raw.replace(/[^0-9]/g, ''), 10);
        const suffix = raw.replace(/[0-9,]/g, '');
        animateCounter(el, num, suffix);
      }
      trustIo.unobserve(el);
    });
  }, { threshold: 0.5 });

  trustNums.forEach(el => trustIo.observe(el));

  /* ── 11. Search input — Enter key → search ── */
  document.querySelector('.search-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      document.querySelector('.btn-search')?.click();
    }
  });

  document.querySelector('.btn-search')?.addEventListener('click', () => {
    const city  = document.querySelector('.city-select')?.value;
    const query = document.querySelector('.search-input')?.value.trim();
    if (!city && !query) {
      shakeEl(document.querySelector('.search-box'));
    }
  });

  document.querySelector('.btn-ai')?.addEventListener('click', () => {
    const query = document.querySelector('.search-input')?.value.trim();
    if (!query) {
      document.querySelector('.search-input')?.focus();
    }
  });

  function shakeEl(el) {
    if (!el) return;
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake .4s ease';
  }

  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-6px); }
      40%     { transform: translateX(6px); }
      60%     { transform: translateX(-4px); }
      80%     { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(shakeStyle);

});
