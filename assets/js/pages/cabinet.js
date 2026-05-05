(function(){
  /* ============ SIDE MENU ============ */
  var overlay   = document.getElementById('sideMenuOverlay');
  var menu      = document.getElementById('sideMenu');
  var toggleBtn = document.getElementById('menuToggle');
  var closeBtn  = document.getElementById('sideMenuClose');

  function openMenu(){ overlay.classList.add('open'); menu.classList.add('open'); }
  function closeMenu(){ overlay.classList.remove('open'); menu.classList.remove('open'); }

  if(toggleBtn) toggleBtn.addEventListener('click', openMenu);
  if(closeBtn)  closeBtn.addEventListener('click', closeMenu);
  if(overlay)   overlay.addEventListener('click', closeMenu);

  /* ============ LOGIN FORM (in menu) ============ */
  var loginArea   = document.getElementById('menuLoginArea');
  var authedArea  = document.getElementById('menuAuthedArea');
  var logoutBtn   = document.getElementById('menuLogoutBtn');
  var loginBtn    = document.getElementById('menuLoginBtn');
  var emailEl     = document.getElementById('menuEmail');
  var passEl      = document.getElementById('menuPass');
  var errorEl     = document.getElementById('menuLoginError');
  var forgotLink  = document.getElementById('menuForgotLink');
  var stepLogin   = document.getElementById('menuStepLogin');
  var stepForgot  = document.getElementById('menuStepForgot');
  var stepReset   = document.getElementById('menuStepReset');
  var forgotEmail = document.getElementById('menuForgotEmail');
  var forgotSend  = document.getElementById('menuForgotSendBtn');
  var backToLogin = document.getElementById('menuBackToLogin');
  var resetCode   = document.getElementById('menuResetCode');
  var resetPass   = document.getElementById('menuResetPass');
  var resetBtn    = document.getElementById('menuResetBtn');

  function setError(msg){ if(errorEl) errorEl.textContent = msg || ''; }
  function showStep(s){
    [stepLogin, stepForgot, stepReset].forEach(function(el){ if(el) el.style.display = 'none'; });
    if(s) s.style.display = 'flex';
  }

  function setAuthed(name){
    if(loginArea)  loginArea.style.display  = 'none';
    if(authedArea) authedArea.style.display = 'block';
    if(logoutBtn)  logoutBtn.style.display  = 'flex';
    var nameEl = document.getElementById('menuUserName');
    if(nameEl) nameEl.textContent = name || '';
  }

  /* check session on load */
  (function(){
    var fd = new FormData(); fd.append('action', 'check');
    fetch('php/auth.php', {method:'POST', body:fd})
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d.ok) setAuthed(d.name);
      });
  })();

  if(loginBtn) loginBtn.addEventListener('click', function(){
    var email = emailEl ? emailEl.value.trim() : '';
    var pass  = passEl  ? passEl.value.trim()  : '';
    if(!email || !pass){ setError('Заполните все поля'); return; }
    setError('');
    var fd = new FormData();
    fd.append('action','login'); fd.append('email',email); fd.append('password',pass);
    fetch('php/auth.php', {method:'POST', body:fd})
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d.ok){ setAuthed(d.name); closeMenu(); location.reload(); }
        else setError(d.error || 'Ошибка входа');
      });
  });

  if(forgotLink) forgotLink.addEventListener('click', function(){ setError(''); showStep(stepForgot); });
  if(backToLogin) backToLogin.addEventListener('click', function(){ setError(''); showStep(stepLogin); });

  if(forgotSend) forgotSend.addEventListener('click', function(){
    var email = forgotEmail ? forgotEmail.value.trim() : '';
    if(!email){ setError('Введите email'); return; }
    var fd = new FormData(); fd.append('action','forgot'); fd.append('email',email);
    fetch('php/auth.php', {method:'POST', body:fd})
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d.ok){ setError(''); showStep(stepReset); }
        else setError(d.error || 'Ошибка');
      });
  });

  if(resetBtn) resetBtn.addEventListener('click', function(){
    var code = resetCode ? resetCode.value.trim() : '';
    var pass = resetPass ? resetPass.value.trim() : '';
    if(!code || !pass){ setError('Заполните все поля'); return; }
    var fd = new FormData(); fd.append('action','reset'); fd.append('code',code); fd.append('password',pass);
    fetch('php/auth.php', {method:'POST', body:fd})
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d.ok){ setAuthed(''); showStep(stepLogin); closeMenu(); location.reload(); }
        else setError(d.error || 'Ошибка');
      });
  });

  if(logoutBtn) logoutBtn.addEventListener('click', function(){
    var fd = new FormData(); fd.append('action','logout');
    fetch('php/auth.php', {method:'POST', body:fd})
      .then(function(){ location.href = '/'; });
  });

  /* ============ CAB LOGIN BUTTON ============ */
  var cabLoginBtn = document.getElementById('cabLoginBtn');
  if(cabLoginBtn) cabLoginBtn.addEventListener('click', openMenu);

  /* ============ NAV TABS ============ */
  var tabs = document.querySelectorAll('.cab-tab');
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t){ t.classList.remove('active'); });
      document.querySelectorAll('.cab-tab-content').forEach(function(c){ c.style.display = 'none'; });
      tab.classList.add('active');
      var target = document.getElementById('tab' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1));
      if(target) target.style.display = 'block';
    });
  });
})();
