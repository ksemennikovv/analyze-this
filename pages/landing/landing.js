/* ================================================================
   Landing Page JS
   ================================================================ */
(function () {
  'use strict';

  var state = { pendingEmail: null };

  /* ── Practice video map ───────────────────────────────────── */
  var VIDEO_MAP = (function () {
    var m = {};
    for (var i = 1;  i <= 7;  i++) m[i] = 'practice.mp4';
    for (var i = 8;  i <= 14; i++) m[i] = 'WhatsApp1.mp4';
    for (var i = 15; i <= 20; i++) m[i] = 'WhatsApp2.mp4';
    return m;
  })();

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
  if (btnContinue) btnContinue.addEventListener('click', function () { openAnalysisChat('', true); });
  var btnNew = document.getElementById('btnNewAnalysis');
  if (btnNew) btnNew.addEventListener('click', function () { openAnalysisChat(''); });

  /* ── Open chat roller ─────────────────────────────────────── */
  function openAnalysisChat(initialMsg, resume) {
    Roller.open({
      id: 'analysis-chat',
      title: 'Разбор',
      content: '<div id="chat-mount"></div>'
    });
    setTimeout(function () {
      if (typeof Chat !== 'undefined') {
        Chat.init('chat-mount', {
          initialMessage: initialMsg,
          resume: !!resume,
          onComplete: function (data) {
            injectGateInRoller(
              parseInt(data.practice_num, 10) || 1,
              data.personal_task || 'Телесная практика'
            );
          }
        });
      }
    }, 50);
  }

  /* ── Inject gate inside the open Roller ──────────────────── */
  function injectGateInRoller(num, name) {
    var mount = document.getElementById('chat-mount');
    if (!mount) { showGate(num, name); return; }

    Roller.setTitle('analysis-chat', 'Ваша практика');
    mount.innerHTML = _buildGateHtml(num, name);
    mount.scrollTop = 0;

    var vid = document.getElementById('rg-video');
    if (vid) {
      vid.src = '/videos/' + (VIDEO_MAP[num] || 'practice.mp4');
      vid.play().catch(function () {});
    }

    _bindRollerGate();
  }

  /* ── Build gate HTML for Roller ──────────────────────────── */
  function _buildGateHtml(num, name) {
    var esc = function(s) { return String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
    return [
      '<div class="nb-practice-block reg-gate">',
        '<div class="nb-pb-title">',
          'Мы подобрали для Вас практику «№' + num + '»',
        '</div>',
        '<div class="nb-lk-card">',
          '<div class="nb-lk-header">',
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none">',
              '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" stroke-width="1.6" fill="none"/>',
              '<path d="M9 22V12h6v10" stroke="currentColor" stroke-width="1.6" fill="none"/>',
            '</svg>',
            '<span>Личный кабинет</span>',
          '</div>',
          '<div class="nb-lk-body">',
            '<div class="nb-lk-nav">',
              '<div class="nb-lk-nav-item active"><span>▶</span> Мои практики</div>',
              '<div class="nb-lk-nav-item"><span>📋</span> Разбор</div>',
              '<div class="nb-lk-nav-item"><span>🧘</span> Медитации</div>',
              '<div class="nb-lk-nav-item"><span>📖</span> Дневник</div>',
              '<div class="nb-lk-nav-item"><span>⭐</span> Подписка</div>',
            '</div>',
            '<div class="nb-lk-main">',
              '<div class="nb-lk-practice-title">' + esc(name) + '</div>',
              '<div class="nb-lk-video">',
                '<video id="rg-video" muted loop playsinline autoplay',
                       ' style="width:100%;height:100%;object-fit:cover"></video>',
                '<div class="nb-lk-video-overlay">',
                  '<div class="nb-lk-play">',
                    '<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>',
                  '</div>',
                '</div>',
              '</div>',
              '<div class="nb-lk-desc">Данная практика выполняется в домашних условиях, потребуется поверхность дивана или кровати</div>',
            '</div>',
          '</div>',
        '</div>',
        '<p class="nb-pb-sub">Она ждёт Вас в личном кабинете.<br>Введите Ваш email, чтобы получить бесплатный доступ.</p>',
        '<div id="rg-form">',
          '<div class="reg-error" id="rg-error"></div>',
          '<input type="email" id="rg-email" class="input" placeholder="Ваш email"',
                 ' autocomplete="email" style="margin-bottom:12px">',
          '<button class="landing-cta-btn" id="rg-submit">Получить доступ</button>',
          '<div class="nb-pb-disclaimers">',
            '<label class="nb-pb-disc">',
              '<input type="checkbox" id="rg-check1">',
              '<span>Я принимаю <a href="/privacy.php" style="color:var(--c-purple)">условия использования</a></span>',
            '</label>',
            '<label class="nb-pb-disc">',
              '<input type="checkbox" id="rg-check2">',
              '<span>Я соглашаюсь на <a href="/privacy.php" style="color:var(--c-purple)">обработку персональных данных</a></span>',
            '</label>',
          '</div>',
        '</div>',
        '<div id="rg-verify" style="display:none">',
          '<div class="reg-form-title" style="margin-bottom:8px">Введите код из письма</div>',
          '<p style="text-align:center;color:var(--c-text-2);font-size:.9rem;margin-bottom:16px">',
            'Мы отправили 6-значный код на ваш email',
          '</p>',
          '<input type="text" id="rg-code" class="input verify-code-input"',
                 ' placeholder="000000" maxlength="6" inputmode="numeric">',
          '<div class="reg-error" id="rg-verify-error"></div>',
          '<button class="landing-cta-btn mt-16" id="rg-verify-submit">Подтвердить</button>',
          '<p class="text-center mt-12" style="font-size:.85rem;color:var(--c-text-2)">',
            'Не пришло? <button id="rg-resend" style="color:var(--c-purple);font-weight:600">Отправить ещё раз</button>',
          '</p>',
        '</div>',
      '</div>'
    ].join('');
  }

  /* ── Bind roller gate events ──────────────────────────────── */
  function _bindRollerGate() {
    var submitBtn = document.getElementById('rg-submit');
    var emailEl   = document.getElementById('rg-email');
    if (submitBtn) submitBtn.addEventListener('click', _rgSubmit);
    if (emailEl)   emailEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') _rgSubmit(); });

    var verifyBtn = document.getElementById('rg-verify-submit');
    var codeEl    = document.getElementById('rg-code');
    if (verifyBtn) verifyBtn.addEventListener('click', _rgVerify);
    if (codeEl) {
      codeEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') _rgVerify(); });
      codeEl.addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 6); });
    }

    var resendBtn = document.getElementById('rg-resend');
    if (resendBtn) resendBtn.addEventListener('click', function () {
      if (!state.pendingEmail) return;
      fetch('/pages/landing/hero-states/registration-gate/api/resend.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.pendingEmail })
      });
    });
  }

  function _rgSubmit() {
    var email  = (document.getElementById('rg-email') || {}).value || '';
    var check1 = document.getElementById('rg-check1');
    var check2 = document.getElementById('rg-check2');
    var errEl  = document.getElementById('rg-error');
    var btn    = document.getElementById('rg-submit');

    email = email.trim();
    if (!email)                            { _showErr(errEl, 'Введите email'); return; }
    if (check1 && !check1.checked)         { _showErr(errEl, 'Подтвердите условия использования'); return; }
    if (check2 && !check2.checked)         { _showErr(errEl, 'Подтвердите согласие на обработку данных'); return; }

    _showErr(errEl, '');
    if (btn) { btn.disabled = true; btn.textContent = 'Отправляем…'; }

    fetch('/pages/landing/hero-states/registration-gate/api/submit-email.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, history: [] })
    })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (btn) { btn.disabled = false; btn.textContent = 'Получить доступ'; }
      if (!d.ok) { _showErr(errEl, d.error || 'Ошибка'); return; }
      state.pendingEmail = email;
      var form   = document.getElementById('rg-form');
      var verify = document.getElementById('rg-verify');
      if (form)   form.style.display   = 'none';
      if (verify) { verify.style.display = 'block'; var c = document.getElementById('rg-code'); if (c) c.focus(); }
    })
    .catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = 'Получить доступ'; }
      _showErr(errEl, 'Ошибка соединения');
    });
  }

  function _rgVerify() {
    var code  = (document.getElementById('rg-code') || {}).value || '';
    var errEl = document.getElementById('rg-verify-error');
    var btn   = document.getElementById('rg-verify-submit');
    if (code.length !== 6) { _showErr(errEl, 'Введите 6-значный код'); return; }

    _showErr(errEl, '');
    if (btn) { btn.disabled = true; btn.textContent = 'Проверяем…'; }

    fetch('/pages/landing/hero-states/registration-gate/api/verify-code.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: state.pendingEmail, code: code })
    })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (btn) { btn.disabled = false; btn.textContent = 'Подтвердить'; }
      if (!d.ok) { _showErr(errEl, d.error || 'Ошибка'); return; }
      window.location.href = d.analysis_id ? '/analysis.php?id=' + d.analysis_id : '/dashboard.php';
    })
    .catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = 'Подтвердить'; }
      _showErr(errEl, 'Ошибка соединения');
    });
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
