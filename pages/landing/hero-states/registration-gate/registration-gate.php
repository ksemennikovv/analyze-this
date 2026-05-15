<?php
// pages/landing/includes/hero-states/registration-gate/registration-gate.php
// State: analysis completed — show practice and registration form
$practiceNum  = $practiceNum  ?? 1;
$practiceName = $practiceName ?? 'Телесная практика';
$videoFile    = $videoFile    ?? 'practice';
?>
<div id="landingGate" class="reg-gate page-wrap">
  <div class="nb-practice-block">

    <div class="nb-pb-title">
      Мы подобрали для Вас практику «№<span id="gatePracticeNum"><?= $practiceNum ?></span>»
    </div>

    <div class="nb-lk-card">
      <div class="nb-lk-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" stroke-width="1.6" fill="none"/>
          <path d="M9 22V12h6v10" stroke="currentColor" stroke-width="1.6" fill="none"/>
        </svg>
        <span>Личный кабинет</span>
      </div>
      <div class="nb-lk-body">
        <div class="nb-lk-nav">
          <div class="nb-lk-nav-item active"><span>▶</span> Мои практики</div>
          <div class="nb-lk-nav-item"><span>📋</span> Разбор</div>
          <div class="nb-lk-nav-item"><span>🧘</span> Медитации</div>
          <div class="nb-lk-nav-item"><span>📖</span> Дневник</div>
          <div class="nb-lk-nav-item"><span>⭐</span> Подписка</div>
        </div>
        <div class="nb-lk-main">
          <div class="nb-lk-practice-title" id="gatePracticeName"><?= htmlspecialchars($practiceName) ?></div>
          <div class="nb-lk-video">
            <video id="gatePracticeVideo" muted loop playsinline autoplay
                   src="/videos/<?= $videoFile ?>.mp4"
                   style="width:100%;height:100%;object-fit:cover">
            </video>
            <div class="nb-lk-video-overlay">
              <div class="nb-lk-play">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
          <div class="nb-lk-desc">Данная практика выполняется в домашних условиях, потребуется поверхность дивана или кровати</div>
        </div>
      </div>
    </div>

    <p class="nb-pb-sub">Она ждёт Вас в личном кабинете.<br>Введите Ваш email, чтобы получить бесплатный доступ.</p>

    <div id="regSection">
      <div class="reg-error" id="regError"></div>
      <input type="email" id="regEmail" class="input" placeholder="Ваш email" autocomplete="email" style="margin-bottom:12px">
      <button class="landing-cta-btn" id="regSubmit">Получить доступ</button>
      <div class="nb-pb-disclaimers">
        <label class="nb-pb-disc">
          <input type="checkbox" id="regCheck1">
          <span>Я принимаю <a href="/privacy.php">условия использования</a></span>
        </label>
        <label class="nb-pb-disc">
          <input type="checkbox" id="regCheck2">
          <span>Я соглашаюсь на <a href="/privacy.php">обработку персональных данных</a></span>
        </label>
      </div>
    </div>

    <div class="verify-section" id="verifySection">
      <div class="reg-form-title" style="margin-bottom:8px">Введите код из письма</div>
      <p style="text-align:center;color:var(--c-text-2);font-size:.9rem;margin-bottom:16px">
        Мы отправили 6-значный код на ваш email
      </p>
      <input type="text" id="verifyCode" class="input verify-code-input"
             placeholder="000000" maxlength="6" inputmode="numeric">
      <div class="reg-error" id="verifyError"></div>
      <button class="landing-cta-btn mt-16" id="verifySubmit">Подтвердить</button>
      <p class="text-center mt-12" style="font-size:.85rem;color:var(--c-text-2)">
        Не пришло? <button id="resendCode" style="color:var(--c-purple);font-weight:600">Отправить ещё раз</button>
      </p>
    </div>

  </div>
</div>
