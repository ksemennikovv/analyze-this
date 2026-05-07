/* ================================================================
 * ui.js — общие UI-хелперы
 * ================================================================ */
var UI = (function() {
    function show(el) { if (el) el.style.display = ''; }
    function hide(el) { if (el) el.style.display = 'none'; }
    function showBlock(el) { if (el) el.style.display = 'block'; }

    function scrollToBottom(smooth) {
        var se = document.scrollingElement || document.documentElement;
        if (smooth) se.scrollTo({ top: se.scrollHeight, behavior: 'smooth' });
        else se.scrollTop = se.scrollHeight;
    }

    function disableButton(btn, text) {
        if (!btn) return;
        btn.disabled = true;
        if (text) btn._origText = btn.textContent, btn.textContent = text;
    }

    function enableButton(btn) {
        if (!btn) return;
        btn.disabled = false;
        if (btn._origText) btn.textContent = btn._origText;
    }

    function renderLoading(el) {
        if (el) el.innerHTML = '<div class="spinner"></div>';
    }

    function renderError(el, msg) {
        if (el) { el.textContent = msg || 'Ошибка'; el.style.display = 'block'; }
    }

    function clearError(el) {
        if (el) { el.textContent = ''; el.style.display = ''; }
    }

    return { show, hide, showBlock, scrollToBottom, disableButton, enableButton, renderLoading, renderError, clearError };
})();
