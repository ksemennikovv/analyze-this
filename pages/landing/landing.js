/* ================================================================
   Landing Page JS
   ================================================================ */
(function () {
  'use strict';

  var state = { pendingEmail: null };

  /* ── Textarea auto-resize ─────────────────────────────────── */
  var ta = document.getElementById('landingMessage');
  if (ta) {
    ta.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 240) + 'px';
    });
  }

  /* ── CTA / Send buttons ───────────────────────────────────── */
  function onStartClick() {
    var msg = ta ? ta.value.trim() : '';
    openAnalysisChat(msg);
  }
  var ctaBtn = document.getElementById('landingCta');
  if (ctaBtn) ctaBtn.addEventListener('click', onStartClick);
  var sendBtn = document.getElementById('landingSendBtn');
  if (sendBtn) sendBtn.addEventListener('click', onStartClick);

  /* ── Resume buttons ───────────────────────────────────────── */
  var btnContinue = document.getElementById('btnContinue');
  if (btnContinue) btnContinue.addEventListener('click', function () {
    openAnalysisChat('', true, parseInt(this.dataset.analysisId, 10) || 0);
  });
  var btnNew = document.getElementById('btnNewAnalysis');
  if (btnNew) btnNew.addEventListener('click', function () { openAnalysisChat(''); });

  /* ── Open chat roller ─────────────────────────────────────── */
  function openAnalysisChat(initialMsg, resume, analysisId) {
    var alreadyOpen = !!document.getElementById('roller-analysis-chat');
    Roller.open({
      id: 'analysis-chat',
      title: 'Разбор',
      content: '<div id="chat-mount"></div>'
    });
    if (alreadyOpen) return;

    // If Chat already has an active analysis (roller was closed but session continues),
    // resume it instead of starting a new one — prevents ghost-click new-analysis on mobile
    var existingId = (typeof Chat !== 'undefined' && Chat.getAnalysisId) ? Chat.getAnalysisId() : 0;
    var doResume  = !!(resume || existingId);
    var aId       = analysisId || existingId || 0;

    setTimeout(function () {
      if (typeof Chat !== 'undefined') {
        Chat.init('chat-mount', {
          initialMessage: doResume ? '' : initialMsg,
          resume: doResume,
          analysisId: aId,
          onComplete: function () {
            Roller.closeAll();
            window.location.reload();
          }
        });
      }
    }, 50);
  }

  /* ── Show gate on landing page (for server-side gate state) ─ */
  function showGate(num, name) {
    var elNum  = document.getElementById('gatePracticeNum');
    var elName = document.getElementById('gatePracticeName');
    if (elNum)  elNum.textContent  = num;
    if (elName) elName.textContent = name;

    var img = document.getElementById('gatePracticeImg');
    var vid = document.getElementById('gatePracticeVideo');
    if (vid) {
      vid.src = '/videos/' + (VIDEO_MAP[num] || 'practice.mp4');
      vid.style.display = 'block';
      vid.play().catch(function () {});
      if (img) img.style.display = 'none';
    }

    var gateEl   = document.getElementById('landingGate');
    var mainEl   = document.getElementById('landingMain');
    var ctaBlock = document.getElementById('landingCtaBlock');
    if (mainEl)   mainEl.style.display   = 'none';
    if (ctaBlock) ctaBlock.style.display = 'none';
    if (gateEl) { gateEl.style.display = 'block'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }

  /* ── Landing page gate form (server-side rendered gate state) */
  var regSubmit = document.getElementById('regSubmit');
  if (regSubmit) regSubmit.addEventListener('click', submitReg);
  var regEmail = document.getElementById('regEmail');
  if (regEmail) regEmail.addEventListener('keydown', function (e) { if (e.key === 'Enter') submitReg(); });

  function submitReg() {
    var email  = (document.getElementById('regEmail') || {}).value || '';
    var check1 = document.getElementById('regCheck1');
    var check2 = document.getElementById('regCheck2');
    var errEl  = document.getElementById('regError');
    email = email.trim();
    if (!email)                    { showError(errEl, 'Введите email'); return; }
    if (check1 && !check1.checked) { showError(errEl, 'Подтвердите условия использования'); return; }
    if (check2 && !check2.checked) { showError(errEl, 'Подтвердите согласие на обработку данных'); return; }
    clearError(errEl);
    regSubmit.disabled = true; regSubmit.textContent = 'Отправляем…';
    fetch('/pages/landing/hero-states/registration-gate/api/submit-email.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, history: [] })
    })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      regSubmit.disabled = false; regSubmit.textContent = 'Получить доступ';
      if (!d.ok) { showError(errEl, d.error || 'Ошибка'); return; }
      state.pendingEmail = email;
      document.getElementById('regSection').style.display = 'none';
      var vs = document.getElementById('verifySection');
      if (vs) { vs.style.display = 'block'; vs.classList.add('active'); var vc = document.getElementById('verifyCode'); if (vc) vc.focus(); }
    })
    .catch(function () { regSubmit.disabled = false; regSubmit.textContent = 'Получить доступ'; showError(errEl, 'Ошибка соединения'); });
  }

  var verifySubmit = document.getElementById('verifySubmit');
  if (verifySubmit) verifySubmit.addEventListener('click', submitVerify);
  var verifyCode = document.getElementById('verifyCode');
  if (verifyCode) {
    verifyCode.addEventListener('keydown', function (e) { if (e.key === 'Enter') submitVerify(); });
    verifyCode.addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 6); });
  }

  function submitVerify() {
    var code  = (document.getElementById('verifyCode') || {}).value || '';
    var errEl = document.getElementById('verifyError');
    if (code.length !== 6) { showError(errEl, 'Введите 6-значный код'); return; }
    clearError(errEl);
    verifySubmit.disabled = true; verifySubmit.textContent = 'Проверяем…';
    fetch('/pages/landing/hero-states/registration-gate/api/verify-code.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: state.pendingEmail, code: code })
    })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      verifySubmit.disabled = false; verifySubmit.textContent = 'Подтвердить';
      if (!d.ok) { showError(errEl, d.error || 'Ошибка'); return; }
      window.location.href = d.analysis_id ? '/analysis.php?id=' + d.analysis_id : '/dashboard.php';
    })
    .catch(function () { verifySubmit.disabled = false; verifySubmit.textContent = 'Подтвердить'; showError(errEl, 'Ошибка соединения'); });
  }

  var resendBtn = document.getElementById('resendCode');
  if (resendBtn) resendBtn.addEventListener('click', function () {
    if (!state.pendingEmail) return;
    fetch('/pages/landing/hero-states/registration-gate/api/resend.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: state.pendingEmail })
    });
  });

  /* ── Video playback (reviews section) ────────────────────── */
  window.playVideo = function (card) {
    var vid = card.querySelector('video');
    if (!vid) return;
    if (vid.paused) {
      document.querySelectorAll('.video-card video').forEach(function (v) {
        v.pause(); v.closest('.video-card').classList.remove('playing');
      });
      vid.play(); card.classList.add('playing');
    } else { vid.pause(); card.classList.remove('playing'); }
  };

  /* ── Review expand ────────────────────────────────────────── */
  window.toggleReview = function (id, btn) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('clamped');
    btn.textContent = el.classList.contains('clamped') ? 'Читать полностью →' : 'Свернуть';
  };

  /* ── Helpers ──────────────────────────────────────────────── */
  function _showErr(el, msg) { if (el) el.textContent = msg; }
  function showError(el, msg) { if (el) el.textContent = msg; }
  function clearError(el)     { if (el) el.textContent = ''; }

})();
