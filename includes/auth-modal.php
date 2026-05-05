<div id="sideMenuOverlay" class="side-menu-overlay"></div>
<div id="sideMenu" class="side-menu">
  <button id="sideMenuClose" class="side-menu__close" aria-label="Закрыть">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </button>

  <!-- Shown when NOT logged in -->
  <div id="menuLoginArea" class="side-menu__login">
    <p class="side-menu__login-title">Войти в аккаунт</p>
    <div id="menuLoginError" class="auth-error"></div>

    <!-- Step: email + password -->
    <div id="menuStepLogin">
      <input type="email" id="menuEmail" class="auth-input" placeholder="Email" autocomplete="email">
      <input type="password" id="menuPass" class="auth-input" placeholder="Пароль" autocomplete="current-password">
      <button id="menuLoginBtn" class="cta-btn menu-login-btn">Войти</button>
      <p class="reg-resend"><span id="menuForgotLink">Забыл пароль</span></p>
    </div>

    <!-- Step: forgot — send code -->
    <div id="menuStepForgot" style="display:none">
      <p class="reg-subtitle" style="margin-bottom:10px">Введите email — пришлём код для сброса пароля</p>
      <input type="email" id="menuForgotEmail" class="auth-input" placeholder="Email" autocomplete="email">
      <button id="menuForgotSendBtn" class="cta-btn menu-login-btn">Отправить код</button>
      <p class="reg-resend"><span id="menuBackToLogin">← Назад</span></p>
    </div>

    <!-- Step: enter code + new password -->
    <div id="menuStepReset" style="display:none">
      <p class="reg-subtitle" style="margin-bottom:10px">Введите код из письма и новый пароль</p>
      <input type="text" id="menuResetCode" class="auth-input code-input" placeholder="000000" maxlength="6" inputmode="numeric" autocomplete="one-time-code">
      <input type="password" id="menuResetPass" class="auth-input" placeholder="Новый пароль (мин. 6 символов)" autocomplete="new-password">
      <button id="menuResetBtn" class="cta-btn menu-login-btn">Сохранить пароль</button>
    </div>
  </div>

  <!-- Shown when logged in -->
  <div id="menuAuthedArea" style="display:none">
    <div class="side-menu__user">
      <div class="side-menu__avatar">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.6" fill="none"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
        </svg>
      </div>
      <div id="menuUserName" class="side-menu__name">—</div>
      <div class="side-menu__plan">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="#FFB800"/></svg>
        Стартовый · бесплатный
      </div>
    </div>
  </div>

  <div class="side-menu__divider"></div>

  <div class="side-menu__section">
    <div class="side-menu__label">Язык</div>
    <div class="side-menu__lang">
      <button class="lang-btn lang-btn--active" data-lang="ru">🇷🇺 Русский</button>
      <button class="lang-btn" data-lang="en">🇬🇧 English</button>
    </div>
  </div>

  <div class="side-menu__divider"></div>

  <button id="menuLogoutBtn" class="side-menu__logout" style="display:none">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Выйти
  </button>
</div>
