/* ─────────────────────────────────────────
   auth.js
   ───────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () =>
    navbar?.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

  /* ── Tab switch ── */
  const tabSignin   = document.getElementById('tabSignin');
  const tabRegister = document.getElementById('tabRegister');
  const signinForm  = document.getElementById('signinForm');
  const registerForm= document.getElementById('registerForm');

  tabSignin?.addEventListener('click', () => {
    tabSignin.classList.add('active');
    tabRegister?.classList.remove('active');
    signinForm.style.display  = 'block';
    registerForm.style.display = 'none';
  });
  tabRegister?.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabSignin?.classList.remove('active');
    registerForm.style.display = 'block';
    signinForm.style.display   = 'none';
  });

  /* ── OTP flow (sign-in) ── */
  let otpSent = false;
  let resendInterval = null;

  signinForm?.addEventListener('submit', e => {
    e.preventDefault();
    const phone    = document.getElementById('siPhone');
    const phoneErr = document.getElementById('siPhoneErr');
    const otpGroup = document.getElementById('siOtpGroup');
    const submitBtn= document.getElementById('siSubmit');

    if (!otpSent) {
      // Validate phone
      const val = phone?.value.replace(/\D/g, '');
      if (!val || val.length !== 10) {
        setError(phone, phoneErr, 'Enter a valid 10-digit mobile number');
        return;
      }
      clearError(phone, phoneErr);

      // Simulate OTP send
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      setTimeout(() => {
        otpSent = true;
        otpGroup.style.display = 'block';
        submitBtn.textContent = 'Verify OTP →';
        submitBtn.disabled = false;
        startResendTimer();
        showSuccess('OTP Sent!', `We've sent a 6-digit OTP to +91 ${phone.value}`);
        focusFirstOtp();
      }, 1200);

    } else {
      // Validate OTP
      const otp = Array.from(document.querySelectorAll('.otp-input'))
                       .map(i => i.value).join('');
      if (otp.length !== 6) {
        const otpInputs = document.querySelectorAll('.otp-input');
        otpInputs.forEach(i => i.classList.add('error'));
        return;
      }
      submitBtn.textContent = 'Verifying…';
      submitBtn.disabled = true;

      setTimeout(() => {
        showSuccess('Welcome back!', 'Signed in successfully. Redirecting to your dashboard…');
        setTimeout(() => { window.location.href = 'marketplace.html'; }, 2000);
      }, 1000);
    }
  });

  /* OTP auto-advance */
  document.querySelectorAll('.otp-input').forEach((input, idx, arr) => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const v = input.value.replace(/\D/g, '');
      input.value = v.slice(-1);
      if (v && idx < arr.length - 1) arr[idx + 1].focus();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !input.value && idx > 0) arr[idx - 1].focus();
    });
    input.addEventListener('paste', e => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      arr.forEach((inp, i) => { inp.value = pasted[i] || ''; });
      arr[Math.min(pasted.length, arr.length - 1)]?.focus();
    });
  });

  function focusFirstOtp() {
    document.querySelector('.otp-input')?.focus();
  }

  /* Resend timer */
  function startResendTimer() {
    let secs = 30;
    const timerEl  = document.getElementById('resendTimer');
    const resendLink= document.getElementById('resendOtp');
    if (resendLink) resendLink.style.pointerEvents = 'none';
    clearInterval(resendInterval);
    resendInterval = setInterval(() => {
      secs--;
      if (timerEl) timerEl.textContent = secs;
      if (secs <= 0) {
        clearInterval(resendInterval);
        if (resendLink) {
          resendLink.style.pointerEvents = '';
          resendLink.innerHTML = 'Resend OTP';
        }
      }
    }, 1000);
  }

  document.getElementById('resendOtp')?.addEventListener('click', e => {
    e.preventDefault();
    showSuccess('OTP Resent!', 'A new OTP has been sent to your mobile number.');
    startResendTimer();
    document.querySelectorAll('.otp-input').forEach(i => i.value = '');
    focusFirstOtp();
  });

  /* ── Register form ── */
  registerForm?.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const name     = document.getElementById('regName');
    const nameErr  = document.getElementById('regNameErr');
    const phone    = document.getElementById('regPhone');
    const phoneErr = document.getElementById('regPhoneErr');
    const city     = document.getElementById('regCity');
    const cityErr  = document.getElementById('regCityErr');
    const terms    = document.getElementById('regTerms');
    const termsErr = document.getElementById('regTermsErr');

    if (!name?.value.trim() || name.value.trim().length < 2) {
      setError(name, nameErr, 'Enter your full name');
      valid = false;
    } else clearError(name, nameErr);

    const phoneVal = phone?.value.replace(/\D/g,'');
    if (!phoneVal || phoneVal.length !== 10) {
      setError(phone, phoneErr, 'Enter a valid 10-digit mobile number');
      valid = false;
    } else clearError(phone, phoneErr);

    if (!city?.value) {
      setError(city, cityErr, 'Please select your city');
      valid = false;
    } else clearError(city, cityErr);

    if (!terms?.checked) {
      if (termsErr) termsErr.textContent = 'You must agree to the Terms';
      valid = false;
    } else {
      if (termsErr) termsErr.textContent = '';
    }

    if (!valid) return;

    const btn = registerForm.querySelector('.auth-submit');
    btn.textContent = 'Creating account…';
    btn.disabled = true;

    setTimeout(() => {
      showSuccess('Account Created!', 'Welcome to COBROKINGS! Complete your KYC to get your green verified tick.');
      setTimeout(() => { window.location.href = 'marketplace.html'; }, 2500);
    }, 1400);
  });

  /* ── Demo login ── */
  document.getElementById('demoLogin')?.addEventListener('click', () => {
    showSuccess('Demo Mode', 'You\'re exploring as a demo user. Some features require full KYC verification.');
    setTimeout(() => { window.location.href = 'marketplace.html'; }, 2000);
  });

  /* ── Success overlay ── */
  const overlay     = document.getElementById('successOverlay');
  const successClose= document.getElementById('successClose');

  function showSuccess(title, msg) {
    const t = document.getElementById('successTitle');
    const m = document.getElementById('successMsg');
    if (t) t.textContent = title;
    if (m) m.textContent = msg;
    overlay?.classList.add('show');
  }

  successClose?.addEventListener('click', () => {
    overlay?.classList.remove('show');
  });

  /* ── Helpers ── */
  function setError(input, errEl, msg) {
    input?.classList.add('error');
    if (errEl) errEl.textContent = msg;
  }
  function clearError(input, errEl) {
    input?.classList.remove('error');
    if (errEl) errEl.textContent = '';
  }

  /* ── Live phone formatting ── */
  ['siPhone', 'regPhone'].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('input', () => {
      el.value = el.value.replace(/\D/g, '').slice(0, 10);
    });
  });

});
