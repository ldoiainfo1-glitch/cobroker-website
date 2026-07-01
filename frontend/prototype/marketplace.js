/* ─────────────────────────────────────────
   marketplace.js
   ───────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Hamburger (shared) ── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
  }

  /* ── Navbar scroll ── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () =>
      navbar.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
  }

  /* ── Search filter ── */
  const searchInput = document.getElementById('mpSearchInput');
  const searchBtn   = document.getElementById('mpSearchBtn');

  function runSearch() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    document.querySelectorAll('.mp-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.classList.toggle('hidden', q.length > 0 && !text.includes(q));
    });
    updateCount();
  }

  searchInput?.addEventListener('input', runSearch);
  searchBtn?.addEventListener('click', runSearch);
  searchInput?.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });

  /* ── Checkbox filters ── */
  document.querySelectorAll('.cb-label input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', applyCheckboxFilters);
  });

  function getChecked(group) {
    return Array.from(document.querySelectorAll(`.cb-label input[type="checkbox"]:checked`))
      .map(cb => cb.closest('.sidebar-section'))
      .filter(Boolean);
  }

  function applyCheckboxFilters() {
    // gather selected types
    const typeSection = document.querySelectorAll('.sidebar-section')[0];
    const typeChecks  = typeSection.querySelectorAll('input[type="checkbox"]');
    const typeLabels  = ['buy','sell','rent','lease'];
    const activeTypes = [];
    typeChecks.forEach((cb, i) => { if (cb.checked) activeTypes.push(typeLabels[i]); });

    // gather selected cities
    const citySection = document.querySelectorAll('.sidebar-section')[1];
    const cityChecks  = citySection.querySelectorAll('input[type="checkbox"]');
    const cityLabels  = ['mumbai','bengaluru','delhi ncr','pune','hyderabad','chennai','goa','gurgaon'];
    const activeCities = [];
    cityChecks.forEach((cb, i) => { if (cb.checked && cityLabels[i]) activeCities.push(cityLabels[i]); });

    document.querySelectorAll('.mp-card').forEach(card => {
      const cardType = card.dataset.type;
      const cardCity = (card.dataset.city || '').toLowerCase();
      const matchType = activeTypes.length === 0 || activeTypes.includes(cardType);
      const matchCity = activeCities.length === 0 || activeCities.some(c => cardCity.includes(c));
      card.classList.toggle('hidden', !(matchType && matchCity));
    });
    updateCount();
  }

  function updateCount() {
    const visible = document.querySelectorAll('.mp-card:not(.hidden)').length;
    const el = document.getElementById('countNum');
    if (el) el.textContent = visible;
  }

  /* ── Grid / List toggle ── */
  const gridView = document.getElementById('gridView');
  const listView = document.getElementById('listView');
  const mpGrid   = document.getElementById('mpGrid');

  gridView?.addEventListener('click', () => {
    mpGrid?.classList.remove('list-mode');
    gridView.classList.add('active');
    listView?.classList.remove('active');
  });
  listView?.addEventListener('click', () => {
    mpGrid?.classList.add('list-mode');
    listView.classList.add('active');
    gridView?.classList.remove('active');
  });

  /* ── Sort select ── */
  document.querySelector('.sort-select')?.addEventListener('change', function () {
    const cards = Array.from(document.querySelectorAll('.mp-card'));
    const grid  = document.getElementById('mpGrid');
    if (!grid) return;

    cards.sort((a, b) => {
      const ta = a.querySelector('.mpc-detail:last-child .mpc-dv')?.textContent || '';
      const tb = b.querySelector('.mpc-detail:last-child .mpc-dv')?.textContent || '';
      const numA = parseInt(ta.replace(/\D/g,''), 10) || 0;
      const numB = parseInt(tb.replace(/\D/g,''), 10) || 0;
      if (this.value === 'Newest first') return numA - numB;
      if (this.value === 'Oldest first') return numB - numA;
      return 0;
    });
    cards.forEach(c => grid.appendChild(c));
  });

  /* ── Pagination ── */
  document.querySelectorAll('.pg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* ── Chat Modal ── */
  const chatModal  = document.getElementById('chatModal');
  const modalClose = document.getElementById('modalClose');

  window.openChatModal = function (name) {
    const title = document.getElementById('chatModalTitle');
    if (title) title.textContent = `Chat with ${name}`;
    const msgs = document.getElementById('chatMessages');
    if (msgs) {
      msgs.innerHTML = `<div class="chat-msg system">🔒 Private broker-to-broker channel with <strong>${name}</strong>. Phone unmasks on mutual accept.</div>`;
    }
    chatModal?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  modalClose?.addEventListener('click', closeModal);
  chatModal?.addEventListener('click', e => {
    if (e.target === chatModal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  function closeModal() {
    chatModal?.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Chat send ── */
  const chatSend  = document.getElementById('chatSend');
  const chatInput = document.getElementById('chatInput');
  const msgs      = document.getElementById('chatMessages');

  function sendMessage() {
    const text = chatInput?.value.trim();
    if (!text || !msgs) return;
    const div = document.createElement('div');
    div.className = 'chat-msg sent';
    div.textContent = text;
    msgs.appendChild(div);
    chatInput.value = '';
    msgs.scrollTop = msgs.scrollHeight;

    // Simulated reply after 1.2s
    setTimeout(() => {
      const reply = document.createElement('div');
      reply.className = 'chat-msg recv';
      reply.textContent = 'Thanks for reaching out. Let me check the details and get back to you shortly.';
      msgs.appendChild(reply);
      msgs.scrollTop = msgs.scrollHeight;
    }, 1200);
  }

  chatSend?.addEventListener('click', sendMessage);
  chatInput?.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  /* ── Accept & Share Number ── */
  document.getElementById('acceptShare')?.addEventListener('click', function () {
    const div = document.createElement('div');
    div.className = 'chat-msg system';
    div.innerHTML = '✅ You accepted share. Phone number will unmask when the other broker also accepts.';
    msgs?.appendChild(div);
    msgs.scrollTop = msgs?.scrollHeight;
    this.textContent = '⏳ Waiting for other broker…';
    this.disabled = true;
    this.style.opacity = '.6';

    // Simulate acceptance
    setTimeout(() => {
      const div2 = document.createElement('div');
      div2.className = 'chat-msg system';
      div2.innerHTML = '📞 Both accepted! Phone: <strong>+91 98765 43210</strong>';
      msgs?.appendChild(div2);
      msgs.scrollTop = msgs?.scrollHeight;
      this.textContent = '✓ Numbers Shared';
    }, 2500);
  });

  /* ── Range sliders ── */
  const minSlider = document.getElementById('minPrice');
  const maxSlider = document.getElementById('maxPrice');
  const minLabel  = document.getElementById('minLabel');
  const maxLabel  = document.getElementById('maxLabel');

  function updateRangeLabels() {
    if (minLabel) minLabel.textContent = `₹${minSlider?.value || 0} Cr`;
    if (maxLabel) {
      const v = parseInt(maxSlider?.value || 1000, 10);
      maxLabel.textContent = v >= 1000 ? '₹1000+ Cr' : `₹${v} Cr`;
    }
  }
  minSlider?.addEventListener('input', updateRangeLabels);
  maxSlider?.addEventListener('input', updateRangeLabels);

});
