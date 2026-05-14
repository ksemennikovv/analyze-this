/* ================================================================
   Landing Page JS
   ================================================================ */
(function () {
  'use strict';

  var state = {
    history: [],   // chat messages before registration
    pendingEmail: null
  };

  /* ── Textarea auto-resize ─────────────────────────────────────── */
  var ta = document.getElementById('landingMessage');
  if (ta) {
    ta.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 240) + 'px';
    });
  }

  /* ── CTA / Send buttons → open chat roller ───────────────────── */
  function onStartClick() {
    var msg = ta ? ta.value.trim() : '';
    openAnalysisChat(msg);
  }
  var ctaBtn = document.getElementById('landingCta');
  if (ctaBtn) { ctaBtn.addEventListener('click', onStartClick); }
  var sendBtn = document.getElementById('landingSendBtn');
  if (sendBtn) { sendBtn.addEventListener('click', onStartClick); }

  /* ── Resume buttons ───────────────────────────────────────────── */
  var btnContinue = document.getElementById('btnContinue');
  if (btnContinue) {
    btnContinue.addEventListener('click', function () {
      openAnalysisChat('', true); // resume mode
    });
  }
  var btnNew = document.getElementById('btnNewAnalysis');
  if (btnNew) {
    btnNew.addEventListener('click', function () {
      openAnalysisChat('');
    });
  }

  /* ── Open chat roller ─────────────────────────────────────────── */
  function openAnalysisChat(initialMsg, resume) {
    var roller = Roller.open({
      id: 'analysis-chat',
      title: 'Разбор',
      content: '<div id="chat-mount"></div>'
    });
    // init Chat module once roller is open
    setTimeout(function () {
      if (typeof Chat !== 'undefined') {
        Chat.init('chat-mount', {
          initialMessage: initialMsg,
          resume: !!resume,
          onComplete: function (data) {
            Roller.close();
            // Show registration gate handled server-side next visit
            window.location.reload();
          }
        });
      }
    }, 50);
  }

  /* ── Registration form ────────────────────────────────────────── */
  var regSubmit = document.getElementById('regSubmit');
  if (regSubmit) {
    regSubmit.addEventListener('click', submitReg);
  }
  var regEmail = document.getElementById('regEmail');
  if (regEmail) {
    regEmail.addEventListener('keydown', function (e) { if (e.key === 'Enter') submitReg(); });
  }

  function submitReg() {
    var email  = (document.getElementById('regEmail') || {}).value || '';
    var check1 = document.getElementById('regCheck1');
    var check2 = document.getElementById('regCheck2');
    var errEl  = document.getElementById('regError');

    email = email.trim();
    if (!email) { showError(errEl, 'Введите email'); return; }
    if (check1 && !check1.checked) { showError(errEl, 'Подтвердите условия использования'); return; }
    if (check2 && !check2.checked) { showError(errEl, 'Подтвердите согласие на обработку данных'); return; }

    clearError(errEl);
    regSubmit.disabled = true;
    regSubmit.textContent = 'Отправляем…';

    fetch('/features/landing/api/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, history: state.history })
    })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      regSubmit.disabled = false;
      regSubmit.textContent = 'Получить доступ';
      if (!d.ok) { showError(errEl, d.error || 'Ошибка'); return; }
      state.pendingEmail = email;
      document.getElementById('regSection').style.display = 'none';
      var vs = document.getElementById('verifySection');
      if (vs) { vs.style.display = 'block'; vs.classList.add('active'); }
      var vc = document.getElementById('verifyCode');
      if (vc) vc.focus();
    })
    .catch(function () {
      regSubmit.disabled = false;
      regSubmit.textContent = 'Получить доступ';
      showError(errEl, 'Ошибка соединения');
    });
  }

  /* ── Verify form ──────────────────────────────────────────────── */
  var verifySubmit = document.getElementById('verifySubmit');
  if (verifySubmit) {
    verifySubmit.addEventListener('click', submitVerify);
  }
  var verifyCode = document.getElementById('verifyCode');
  if (verifyCode) {
    verifyCode.addEventListener('keydown', function (e) { if (e.key === 'Enter') submitVerify(); });
    verifyCode.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').slice(0, 6);
    });
  }

  function submitVerify() {
    var code  = (document.getElementById('verifyCode') || {}).value || '';
    var errEl = document.getElementById('verifyError');
    if (code.length !== 6) { showError(errEl, 'Введите 6-значный код'); return; }

    clearError(errEl);
    verifySubmit.disabled = true;
    verifySubmit.textContent = 'Проверяем…';

    fetch('/features/landing/api/verify.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: state.pendingEmail, code: code })
    })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      verifySubmit.disabled = false;
      verifySubmit.textContent = 'Подтвердить';
      if (!d.ok) { showError(errEl, d.error || 'Ошибка'); return; }
      window.location.href = d.analysis_id ? '/analysis.php?id=' + d.analysis_id : '/dashboard.php';
    })
    .catch(function () {
      verifySubmit.disabled = false;
      verifySubmit.textContent = 'Подтвердить';
      showError(errEl, 'Ошибка соединения');
    });
  }

  /* ── Resend code ──────────────────────────────────────────────── */
  var resendBtn = document.getElementById('resendCode');
  if (resendBtn) {
    resendBtn.addEventListener('click', function () {
      if (!state.pendingEmail) return;
      fetch('/features/landing/api/resend.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.pendingEmail })
      });
    });
  }

  /* ── Video playback ───────────────────────────────────────────── */
  window.playVideo = function (card) {
    var vid = card.querySelector('video');
    if (!vid) return;
    if (vid.paused) {
      // pause all others
      document.querySelectorAll('.video-card video').forEach(function (v) {
        v.pause(); v.closest('.video-card').classList.remove('playing');
      });
      vid.play();
      card.classList.add('playing');
    } else {
      vid.pause();
      card.classList.remove('playing');
    }
  };

  /* ── Review expand ────────────────────────────────────────────── */
  window.toggleReview = function (id, btn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('clamped');
    btn.textContent = el.classList.contains('clamped') ? 'Читать полностью →' : 'Свернуть';
  };

  /* ── Helpers ──────────────────────────────────────────────────── */
  function showError(el, msg) { if (el) el.textContent = msg; }
  function clearError(el)     { if (el) el.textContent = ''; }

})();
