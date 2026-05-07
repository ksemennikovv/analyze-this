/* ================================================================
 * language.js — выбор языка, сохранение в localStorage + cookie + API
 * ================================================================ */
(function() {
    var LANGS = { ru: 'Русский', en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français' };

    var modal   = document.getElementById('langModal');
    var openBtn = document.getElementById('langOpenBtn');
    var closeBtn = document.getElementById('langModalClose');
    var list    = document.getElementById('langList');

    function getCurrent() {
        return localStorage.getItem('lang') || 'ru';
    }

    function setCurrent(lang) {
        localStorage.setItem('lang', lang);
        AppState.lang = lang;
        document.documentElement.lang = lang;
        var label = document.getElementById('langCurrentLabel');
        if (label) label.textContent = lang.toUpperCase();
        document.cookie = 'lang=' + lang + ';path=/;max-age=31536000';
        if (AppState.isLoggedIn) {
            API.post('/api/user-set-language.php', { lang: lang }).catch(function() {});
        }
    }

    function openModal() { if (modal) modal.classList.add('open'); }
    function closeModal() { if (modal) modal.classList.remove('open'); }

    if (list) {
        Object.keys(LANGS).forEach(function(code) {
            var btn = document.createElement('button');
            btn.className = 'lang-option';
            btn.dataset.lang = code;
            btn.textContent = LANGS[code];
            btn.addEventListener('click', function() {
                setCurrent(code);
                closeModal();
            });
            list.appendChild(btn);
        });
    }

    if (openBtn)  openBtn.addEventListener('click',  openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal)    modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });

    setCurrent(getCurrent());
})();
