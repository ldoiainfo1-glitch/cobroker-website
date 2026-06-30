/* ─────────────────────────────────────────
   list-property.js
   ───────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () =>
    navbar?.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger?.addEventListener('click', () => {
    const open = mobileMenu?.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  /* ── Pill selectors ── */
  document.querySelectorAll('.pill-select').forEach(group => {
    group.querySelectorAll('.pill-option').forEach(btn => {
      btn.addEventListener('click', () => {
        // single-select within each pill-select group
        group.querySelectorAll('.pill-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });

  /* ── Character counter ── */
  const descArea  = document.getElementById('propDesc');
  const descCount = document.getElementById('descCount');
  descArea?.addEventListener('input', () => {
    const len = descArea.value.length;
    if (descCount) descCount.textContent = len;
    if (len > 280) descCount.style.color = '#f87171';
    else descCount.style.color = '';
    if (descArea.value.length > 300) descArea.value = descArea.value.slice(0, 300);
  });

  /* ── Pricing summary live update ── */
  const priceInput = document.getElementById('priceMin');
  const priceUnit  = document.getElementById('priceUnit');
  const summary    = document.getElementById('priceSummary');

  function updatePriceSummary() {
    const val = priceInput?.value;
    const unit = priceUnit?.value || 'Cr';
    const neg  = document.querySelector('#negotiable .pill-option.active')?.dataset.val;
    const stamp= document.querySelector('#stampDuty .pill-option.active')?.dataset.val;
    if (val && parseFloat(val) > 0) {
      if (summary) summary.style.display = 'block';
      const ps = document.getElementById('psSummaryPrice');
      const pn = document.getElementById('psSummaryNeg');
      const pst= document.getElementById('psSummaryStamp');
      if (ps) ps.textContent = `₹ ${val} ${unit}`;
      if (pn) pn.textContent = neg === 'yes' ? 'Yes' : 'Fixed';
      if (pst) pst.textContent = stamp === 'included' ? 'Included' : stamp === 'na' ? 'N/A' : 'Extra';
    } else {
      if (summary) summary.style.display = 'none';
    }
  }
  priceInput?.addEventListener('input', updatePriceSummary);
  priceUnit?.addEventListener('change', updatePriceSummary);
  document.getElementById('negotiable')?.addEventListener('click', updatePriceSummary);
  document.getElementById('stampDuty')?.addEventListener('click', updatePriceSummary);

  /* ── Steppers ── */
  let currentStep = 1;
  const totalSteps = 4;

  function goToStep(n) {
    // Deactivate all
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step-indicator').forEach((si, i) => {
      si.classList.remove('active', 'completed');
      if (i + 1 < n) si.classList.add('completed');
      if (i + 1 === n) si.classList.add('active');
    });
    // Activate target
    const target = document.getElementById(`step${n}`);
    if (target) target.classList.add('active');
    currentStep = n;
    // Scroll to form top
    document.querySelector('.lp-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* Step 1 → 2 */
  document.getElementById('step1Next')?.addEventListener('click', () => {
    const cat = document.getElementById('propCategory');
    const type= document.getElementById('propType');
    let valid = true;

    if (!cat?.value) { showErr('catErr', 'Select a category'); cat?.classList.add('error'); valid = false; }
    else { clearErr('catErr'); cat?.classList.remove('error'); }

    if (!type?.value) { showErr('typeErr', 'Select a property type'); type?.classList.add('error'); valid = false; }
    else { clearErr('typeErr'); type?.classList.remove('error'); }

    if (valid) goToStep(2);
  });

  /* Step 2 → 3 */
  document.getElementById('step2Next')?.addEventListener('click', () => {
    const city = document.getElementById('city');
    const loc  = document.getElementById('locality');
    let valid = true;

    if (!city?.value) { showErr('cityErr', 'Select a city'); city?.classList.add('error'); valid = false; }
    else { clearErr('cityErr'); city?.classList.remove('error'); }

    if (!loc?.value.trim()) { showErr('localityErr', 'Enter area/locality'); loc?.classList.add('error'); valid = false; }
    else { clearErr('localityErr'); loc?.classList.remove('error'); }

    if (valid) goToStep(3);
  });

  /* Step 3 → 4 */
  document.getElementById('step3Next')?.addEventListener('click', () => {
    const price = document.getElementById('priceMin');
    let valid = true;
    if (!price?.value || parseFloat(price.value) <= 0) {
      showErr('priceErr', 'Enter an expected price');
      price?.classList.add('error');
      valid = false;
    } else {
      clearErr('priceErr');
      price?.classList.remove('error');
    }
    if (valid) goToStep(4);
  });

  /* Back buttons */
  document.getElementById('step2Back')?.addEventListener('click', () => goToStep(1));
  document.getElementById('step3Back')?.addEventListener('click', () => goToStep(2));
  document.getElementById('step4Back')?.addEventListener('click', () => goToStep(3));

  /* ── Final submit ── */
  document.getElementById('lpForm')?.addEventListener('submit', e => {
    e.preventDefault();

    const ownerName = document.getElementById('ownerName');
    const ownerPhone= document.getElementById('ownerPhone');
    const terms     = document.getElementById('lpTerms');
    let valid = true;

    if (!ownerName?.value.trim()) {
      showErr('ownerNameErr', 'Enter your name');
      ownerName?.classList.add('error');
      valid = false;
    } else { clearErr('ownerNameErr'); ownerName?.classList.remove('error'); }

    const pv = ownerPhone?.value.replace(/\D/g,'');
    if (!pv || pv.length !== 10) {
      showErr('ownerPhoneErr', 'Enter a valid 10-digit number');
      ownerPhone?.classList.add('error');
      valid = false;
    } else { clearErr('ownerPhoneErr'); ownerPhone?.classList.remove('error'); }

    if (!terms?.checked) {
      showErr('lpTermsErr', 'You must confirm and agree');
      valid = false;
    } else { clearErr('lpTermsErr'); }

    if (!valid) return;

    const btn = document.getElementById('lpSubmit');
    btn.textContent = 'Posting…';
    btn.disabled    = true;

    setTimeout(() => {
      document.getElementById('lpSuccess')?.classList.add('show');
    }, 1500);
  });

  /* ── Pincode digits only ── */
  document.getElementById('pincode')?.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 6);
  });

  document.getElementById('ownerPhone')?.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 10);
  });

  /* ── Helpers ── */
  function showErr(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }
  function clearErr(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  }

});
