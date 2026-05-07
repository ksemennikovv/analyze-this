/* ================================================================
 * auth.js — авторизация (login, logout, forgot, reset)
 * ================================================================ */
(function() {
    var overlay    = document.getElementById('sideMenuOverlay');
    var menu       = document.getElementById('sideMenu');
    var toggle     = document.getElementById('menuToggle');
    var closeBtn   = document.getElementById('sideMenuClose');
    var loginArea  = document.getElementById('menuLoginArea');
    var authedArea = document.getElementById('menuAuthedArea');
    var logoutBtn  = document.getElementById('menuLogoutBtn');
    var loginBtn   = document.getElementById('menuLoginBtn');
    var loginErr   = document.getElementById('menuLoginError');
    var menuEmail  = document.getElementById('menuEmail');
    var menuPass   = document.getElementById('menuPass');

    var stepLogin  = document.getElementById('menuStepLogin');
    var stepForgot = document.getElementById('menuStepForgot');
    var stepReset  = document.getElementById('menuStepReset');
    var forgotLink = document.getElementById('menuForgotLink');
    var backToLogin= document.getElementById('menuBackToLogin');
    var forgotEmail= document.getElementById('menuForgotEmail');
    var forgotSend = document.getElementById('menuForgotSendBtn');
    var resetCode  = document.getElementById('menuResetCode');
    var resetPass  = document.getElementById('menuResetPass');
    var resetBtn   = document.getElementById('menuResetBtn');

    /* ----- menu open/close ----- */
    function openMenu() {
        if (overlay) overlay.classList.add('open');
        if (menu) menu.classList.add('open');
    }
    function closeMenu() {
        if (overlay) overlay.classList.remove('open');
        if (menu) menu.classList.remove('open');
    }
    if (toggle)  toggle.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (overlay)  overlay.addEventListener('click', closeMenu);

    /* ----- step navigation ----- */
    function showStep(step) {
        [stepLogin, stepForgot, stepReset].forEach(function(s) { if (s) s.style.display = 'none'; });
        if (step) step.style.display = 'flex';
        if (loginErr) loginErr.textContent = '';
    }
    if (forgotLink)  forgotLink.addEventListener('click',  function() { showStep(stepForgot); });
    if (backToLogin) backToLogin.addEventListener('click', function() { showStep(stepLogin); });

    /* ----- login ----- */
    function doLogin() {
        var email = menuEmail ? menuEmail.value.trim() : '';
        var pass  = menuPass  ? menuPass.value : '';
        if (!email || !pass) return;
        if (loginBtn) loginBtn.disabled = true;
        API.authLogin(email, pass).then(function(res) {
            if (loginBtn) loginBtn.disabled = false;
            if (!res.ok) { if (loginErr) loginErr.textContent = res.error || 'Ошибка'; return; }
            AppState.isLoggedIn = true;
            AppState.user = res;
            applyAuthState(res);
            closeMenu();
        }).catch(function() {
            if (loginBtn) loginBtn.disabled = false;
        });
    }
    if (loginBtn) loginBtn.addEventListener('click', doLogin);

    /* ----- forgot ----- */
    if (forgotSend) forgotSend.addEventListener('click', function() {
        var email = forgotEmail ? forgotEmail.value.trim() : '';
        if (!email) return;
        forgotSend.disabled = true;
        API.authForgot(email).then(function(res) {
            forgotSend.disabled = false;
            if (!res.ok) { if (loginErr) loginErr.textContent = res.error || 'Ошибка'; return; }
            showStep(stepReset);
        }).catch(function() { forgotSend.disabled = false; });
    });

    /* ----- reset ----- */
    if (resetBtn) resetBtn.addEventListener('click', function() {
        var email = forgotEmail ? forgotEmail.value.trim() : '';
        var code  = resetCode  ? resetCode.value.trim() : '';
        var pass  = resetPass  ? resetPass.value : '';
        if (!email || !code || !pass) return;
        resetBtn.disabled = true;
        API.authReset(email, code, pass).then(function(res) {
            resetBtn.disabled = false;
            if (!res.ok) { if (loginErr) loginErr.textContent = res.error || 'Ошибка'; return; }
            AppState.isLoggedIn = true;
            applyAuthState(res);
            closeMenu();
            showStep(stepLogin);
        }).catch(function() { resetBtn.disabled = false; });
    });

    /* ----- logout ----- */
    if (logoutBtn) logoutBtn.addEventListener('click', function() {
        API.authLogout().then(function() {
            AppState.isLoggedIn = false;
            AppState.user = null;
            applyAuthState(null);
        });
    });

    /* ----- apply state to UI ----- */
    function applyAuthState(user) {
        if (loginArea)  loginArea.style.display  = user ? 'none' : '';
        if (authedArea) authedArea.style.display = user ? '' : 'none';
        if (logoutBtn)  logoutBtn.style.display  = user ? '' : 'none';
        var nameEl  = document.getElementById('menuUserName');
        var emailEl = document.getElementById('menuUserEmail');
        if (nameEl  && user) nameEl.textContent  = user.name  || '—';
        if (emailEl && user) emailEl.textContent = user.email || '';

        /* sync cabinet login button if exists */
        var cabLoginBtn = document.getElementById('cabLoginBtn');
        if (cabLoginBtn) cabLoginBtn.style.display = user ? 'none' : '';
    }

    /* ----- init session check ----- */
    API.getSession().then(function(res) {
        if (res.loggedIn) {
            AppState.isLoggedIn = true;
            AppState.user = res;
            applyAuthState(res);
            window.__isLoggedIn = true;
        }
    }).catch(function() {});

    /* cabinet login button */
    var cabLoginBtn = document.getElementById('cabLoginBtn');
    if (cabLoginBtn) cabLoginBtn.addEventListener('click', openMenu);
})();
