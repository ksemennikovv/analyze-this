/* ================================================================
   Roller Engine
   Fullscreen stacked overlays
   Usage:
     Roller.open({ id, title, content, dark, onClose })
     Roller.close()
     Roller.closeAll()
   ================================================================ */
var Roller = (function () {
  var stack = [];
  var backdrop = null;

  function init() {
    backdrop = document.createElement('div');
    backdrop.className = 'roller-backdrop';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', function () {
      // Don't close via backdrop if a chat analysis is in progress (prevents mobile ghost-click restarts)
      if (typeof Chat !== 'undefined' && Chat.getAnalysisId && Chat.getAnalysisId()) return;
      close();
    });
  }

  function open(opts) {
    // opts: { id, title, content (HTML string | Element), dark, onClose }
    var existing = document.getElementById('roller-' + opts.id);
    if (existing) {
      // bring to top if already exists
      _bringToTop(existing);
      return existing;
    }

    var depth = stack.length + 1;
    var el = document.createElement('div');
    el.className = 'roller' + (opts.dark ? ' roller--dark' : '');
    el.id = 'roller-' + opts.id;
    el.setAttribute('data-depth', depth);
    el._onClose = opts.onClose || null;
    el._onOpen  = opts.onOpen  || null;

    var titleText = opts.title || '';
    el.innerHTML =
      '<div class="roller-handle"></div>' +
      '<div class="roller-header">' +
        '<button class="roller-back" onclick="Roller.close()">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>' +
          'обратно' +
        '</button>' +
        '<div class="roller-title">' + _esc(titleText) + '</div>' +
      '</div>' +
      '<div class="roller-body" id="roller-body-' + opts.id + '"></div>';

    document.body.appendChild(el);

    // inject content
    var body = el.querySelector('.roller-body');
    if (opts.content instanceof Element) {
      body.appendChild(opts.content);
    } else if (typeof opts.content === 'string') {
      body.innerHTML = opts.content;
    }

    // swipe-down to close
    _attachSwipe(el);

    // animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('is-open');
        backdrop.classList.add('active');
        if (el._onOpen) el._onOpen();
      });
    });

    stack.push(el);
    _updateBackdrop();
    return el;
  }

  function close() {
    if (!stack.length) return;
    var el = stack.pop();
    el.classList.remove('is-open');
    var cb = el._onClose;
    setTimeout(function () {
      el.remove();
      if (cb) cb();
    }, 350);
    _updateBackdrop();
  }

  function closeAll() {
    while (stack.length) close();
  }

  function getBody(id) {
    return document.getElementById('roller-body-' + id);
  }

  function setTitle(id, title) {
    var el = document.getElementById('roller-' + id);
    if (!el) return;
    var t = el.querySelector('.roller-title');
    if (t) t.textContent = title;
  }

  /* ── Private ───────────────────────────────────────── */
  function _updateBackdrop() {
    if (stack.length > 0) {
      backdrop.classList.add('active');
    } else {
      backdrop.classList.remove('active');
    }
  }

  function _bringToTop(el) {
    var idx = stack.indexOf(el);
    if (idx !== -1) stack.splice(idx, 1);
    stack.push(el);
    el.classList.add('is-open');
    _updateBackdrop();
  }

  function _attachSwipe(el) {
    var startY = null;
    el.addEventListener('touchstart', function (e) {
      startY = e.touches[0].clientY;
    }, { passive: true });
    el.addEventListener('touchmove', function (e) {
      if (startY === null) return;
      var dy = e.touches[0].clientY - startY;
      if (dy > 0) {
        el.style.transform = 'translateY(' + Math.min(dy * 0.5, 120) + 'px)';
      }
    }, { passive: true });
    el.addEventListener('touchend', function (e) {
      var dy = e.changedTouches[0].clientY - (startY || 0);
      el.style.transform = '';
      if (dy > 80 && !(typeof Chat !== 'undefined' && Chat.getAnalysisId && Chat.getAnalysisId())) close();
      startY = null;
    }, { passive: true });
  }

  function _esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  document.addEventListener('DOMContentLoaded', init);

  return { open, close, closeAll, getBody, setTitle };
})();
