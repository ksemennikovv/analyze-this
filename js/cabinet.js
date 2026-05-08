/* cabinet.js — personal cabinet page logic */
(function () {
  'use strict';

  /* ====== DRAWER ====== */
  var menuToggle   = document.getElementById('menuToggle');
  var drawerOverlay = document.getElementById('drawerOverlay');
  var drawer       = document.getElementById('drawer');
  var drawerClose  = document.getElementById('drawerClose');

  function openDrawer()  {
    if (drawer)        drawer.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (drawer)        drawer.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (menuToggle)    menuToggle.addEventListener('click',   openDrawer);
  if (drawerClose)   drawerClose.addEventListener('click',  closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  /* ====== LANGUAGE MODAL ====== */
  var LANGS = [
    { flag: '🇷🇺', native: 'Русский',    local: 'Russian',       code: 'ru' },
    { flag: '🇬🇧', native: 'English',    local: 'Английский',    code: 'en' },
    { flag: '🇩🇪', native: 'Deutsch',    local: 'Немецкий',      code: 'de' },
    { flag: '🇫🇷', native: 'Français',   local: 'Французский',   code: 'fr' },
    { flag: '🇪🇸', native: 'Español',    local: 'Испанский',     code: 'es' },
    { flag: '🇮🇹', native: 'Italiano',   local: 'Итальянский',   code: 'it' },
    { flag: '🇵🇹', native: 'Português',  local: 'Португальский', code: 'pt' },
    { flag: '🇵🇱', native: 'Polski',     local: 'Польский',      code: 'pl' },
    { flag: '🇺🇦', native: 'Українська', local: 'Украинский',    code: 'uk' },
    { flag: '🇧🇾', native: 'Беларуская', local: 'Белорусский',   code: 'be' },
    { flag: '🇰🇿', native: 'Қазақша',   local: 'Казахский',     code: 'kk' },
    { flag: '🇨🇳', native: '中文',       local: 'Китайский',     code: 'zh' },
    { flag: '🇯🇵', native: '日本語',     local: 'Японский',      code: 'ja' },
    { flag: '🇰🇷', native: '한국어',     local: 'Корейский',     code: 'ko' },
    { flag: '🇮🇳', native: 'हिन्दी',    local: 'Хинди',         code: 'hi' },
    { flag: '🇹🇷', native: 'Türkçe',    local: 'Турецкий',      code: 'tr' },
    { flag: '🇦🇪', native: 'العربية',   local: 'Арабский',      code: 'ar' },
    { flag: '🇮🇱', native: 'עברית',     local: 'Иврит',         code: 'he' },
    { flag: '🇳🇱', native: 'Nederlands',local: 'Нидерландский', code: 'nl' },
    { flag: '🇸🇪', native: 'Svenska',   local: 'Шведский',      code: 'sv' },
    { flag: '🇳🇴', native: 'Norsk',     local: 'Норвежский',    code: 'no' },
    { flag: '🇩🇰', native: 'Dansk',     local: 'Датский',       code: 'da' },
    { flag: '🇫🇮', native: 'Suomi',     local: 'Финский',       code: 'fi' },
    { flag: '🇬🇷', native: 'Ελληνικά', local: 'Греческий',     code: 'el' },
    { flag: '🇷🇴', native: 'Română',    local: 'Румынский',     code: 'ro' }
  ];

  var currentLang    = localStorage.getItem('cab_lang') || 'ru';
  var langModal      = document.getElementById('langModalOverlay');
  var langModalClose = document.getElementById('langModalClose');
  var langSearch     = document.getElementById('langSearch');
  var langList       = document.getElementById('langList');
  var langValueEl    = document.getElementById('drawerLangValue');
  var drawerLangRow  = document.getElementById('drawerLangRow');

  function getLang(code) {
    return LANGS.find(function (l) { return l.code === code; }) || LANGS[0];
  }

  function renderLangs(q) {
    if (!langList) return;
    var items = q
      ? LANGS.filter(function (l) {
          var s = q.toLowerCase();
          return l.native.toLowerCase().indexOf(s) !== -1 || l.local.toLowerCase().indexOf(s) !== -1;
        })
      : LANGS;
    langList.innerHTML = items.map(function (l) {
      return '<div class="lang-item' + (l.code === currentLang ? ' selected' : '') + '" data-code="' + l.code + '">' +
        '<span style="font-size:22px;line-height:1;flex-shrink:0">' + l.flag + '</span>' +
        '<div class="lang-item-names">' +
          '<div class="lang-item-native">' + l.native + '</div>' +
          '<div class="lang-item-local">'  + l.local  + '</div>' +
        '</div>' +
        '<div class="lang-item-check">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function updateLangDisplay() {
    if (langValueEl) {
      var l = getLang(currentLang);
      langValueEl.textContent = l.flag + ' ' + l.native;
    }
  }

  function openLangModal() {
    if (!langModal) return;
    if (langSearch) langSearch.value = '';
    renderLangs('');
    langModal.classList.add('open');
    setTimeout(function () {
      var sel = langList && langList.querySelector('.selected');
      if (sel) sel.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 300);
  }

  function closeLangModal() {
    if (langModal) langModal.classList.remove('open');
  }

  if (drawerLangRow) {
    drawerLangRow.addEventListener('click', function () {
      closeDrawer();
      setTimeout(openLangModal, 340);
    });
  }
  if (langModalClose) langModalClose.addEventListener('click', closeLangModal);
  if (langModal) {
    langModal.addEventListener('click', function (e) {
      if (e.target === langModal) closeLangModal();
    });
  }
  if (langSearch) {
    langSearch.addEventListener('input', function () { renderLangs(this.value); });
  }
  if (langList) {
    langList.addEventListener('click', function (e) {
      var item = e.target.closest('.lang-item');
      if (!item) return;
      currentLang = item.dataset.code;
      localStorage.setItem('cab_lang', currentLang);
      updateLangDisplay();
      renderLangs(langSearch ? langSearch.value : '');
      setTimeout(closeLangModal, 260);
    });
  }

  updateLangDisplay();

  /* ====== ENTRANCE ANIMATION ====== */
  function wait(ms) {
    return new Promise(function (res) { setTimeout(res, ms); });
  }

  function typeText(el, text, speed) {
    return new Promise(function (res) {
      if (!el) { res(); return; }
      var i = 0;
      (function tick() {
        el.textContent = text.slice(0, i++);
        if (i <= text.length) setTimeout(tick, speed || 35);
        else res();
      })();
    });
  }

  function typeWithCursor(el, text, speed) {
    return new Promise(function (res) {
      if (!el) { res(); return; }
      var cursor = document.createElement('span');
      cursor.className = 'typing-cursor';
      var i = 0;
      (function tick() {
        el.textContent = text.slice(0, i++);
        el.appendChild(cursor);
        if (i <= text.length) {
          setTimeout(tick, speed || 45);
        } else {
          cursor.remove();
          res();
        }
      })();
    });
  }

  function runSequence() {
    var greetingEl       = document.getElementById('greetingEl');
    var greetingTitle    = document.getElementById('greetingTitle');
    var greetingSub      = document.getElementById('greetingSub');
    var stepCard         = document.getElementById('stepCard');
    var stepBadge        = document.getElementById('stepBadge');
    var stepLabel        = document.getElementById('stepLabel');
    var stepTitle        = document.getElementById('stepTitle');
    var taskCard         = document.getElementById('taskCard');
    var taskIcon         = document.getElementById('taskIcon');
    var taskHeaderTitle  = document.getElementById('taskHeaderTitle');
    var taskText         = document.getElementById('taskText');
    var practCard        = document.getElementById('practCard');
    var practIcon        = document.getElementById('practIcon');
    var practHeaderTitle = document.getElementById('practHeaderTitle');
    var ctaAction        = document.getElementById('ctaAction');
    var ctaBadge         = document.getElementById('ctaBadge');
    var ctaActionText    = document.getElementById('ctaActionText');
    var footerEl         = document.getElementById('footerEl');

    Promise.resolve()
      .then(function () { return wait(300); })

      /* -- greeting -- */
      .then(function () { if (greetingEl) greetingEl.classList.add('visible'); return wait(100); })
      .then(function () { return typeWithCursor(greetingTitle, 'Доброе утро, Алеся!', 55); })
      .then(function () { return wait(150); })
      .then(function () { return typeText(greetingSub, 'Сегодня · День 3 вашего пути', 28); })
      .then(function () { return wait(380); })

      /* -- step card -- */
      .then(function () { if (stepCard) stepCard.classList.add('visible'); return wait(140); })
      .then(function () { if (stepBadge) stepBadge.classList.add('visible'); return wait(90); })
      .then(function () { if (stepLabel) stepLabel.classList.add('visible'); return wait(90); })
      .then(function () {
        if (stepTitle) stepTitle.classList.add('visible');
        return typeWithCursor(stepTitle, 'Осознание тела', 52);
      })
      .then(function () { return wait(380); })

      /* -- task card -- */
      .then(function () { if (taskCard) taskCard.classList.add('visible'); return wait(140); })
      .then(function () { if (taskIcon) taskIcon.classList.add('visible'); return wait(90); })
      .then(function () { if (taskHeaderTitle) taskHeaderTitle.classList.add('visible'); return wait(180); })
      .then(function () {
        return typeText(taskText,
          'Уделите 5 минут наблюдению за своим телом. Замечайте ощущения без оценки — просто присутствуйте.', 20);
      })
      .then(function () { return wait(450); })

      /* -- practice card -- */
      .then(function () { if (practCard) practCard.classList.add('visible'); return wait(140); })
      .then(function () { if (practIcon) practIcon.classList.add('visible'); return wait(90); })
      .then(function () {
        if (practHeaderTitle) practHeaderTitle.classList.add('visible');
        return typeWithCursor(practHeaderTitle, 'Утренняя медитация', 48);
      })
      .then(function () { return wait(380); })

      /* -- cta -- */
      .then(function () { if (ctaAction) ctaAction.classList.add('visible'); return wait(140); })
      .then(function () { if (ctaBadge) ctaBadge.classList.add('visible'); return wait(180); })
      .then(function () { if (ctaActionText) ctaActionText.classList.add('visible'); return wait(260); })

      /* -- footer -- */
      .then(function () { if (footerEl) footerEl.style.opacity = '1'; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runSequence);
  } else {
    runSequence();
  }

})();
