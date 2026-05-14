<?php
// features/landing/landing.page.php
// States: fresh | resumed | gate
$landingState = $landingState ?? 'fresh';
$resumeTitle  = $resumeTitle ?? '';
$practiceNum  = $practiceNum ?? 1;
$practiceName = $practiceName ?? 'Телесная практика';
?>

<div class="landing-page">

  <!-- Logo bar -->
  <div class="landing-logo-bar">
    <div class="landing-logo-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    </div>
    <div>
      <div class="landing-logo-name">Nirva.AI</div>
      <div class="landing-logo-tagline">Сервис для улучшения<br>эмоционального состояния</div>
    </div>
  </div>

  <?php if ($landingState === 'gate'): ?>
  <!-- ── REGISTRATION GATE ────────────────────────────────────────── -->
  <div class="reg-gate page-wrap">
    <div class="reg-gate-preview">
      <div class="reg-gate-practice">
        <span class="reg-gate-badge">Практика №<?= $practiceNum ?></span>
        <?= _practiceMountainSvg('full') ?>
      </div>
      <div class="reg-gate-info">
        <h3>Мы подобрали для Вас практику №<?= $practiceNum ?>!</h3>
        <p><?= htmlspecialchars($practiceName) ?></p>
      </div>
    </div>

    <div class="reg-form" id="regSection">
      <div class="reg-form-title">Получите бесплатный доступ</div>
      <input type="email" id="regEmail" class="input" placeholder="Ваш email" autocomplete="email">
      <div class="reg-error" id="regError"></div>
      <button class="landing-cta-btn" id="regSubmit">Получить доступ</button>
      <label class="checkbox-row">
        <input type="checkbox" id="regCheck1"> 
        <span>Я принимаю <a href="/privacy.php" style="color:var(--c-purple)">условия использования</a></span>
      </label>
      <label class="checkbox-row">
        <input type="checkbox" id="regCheck2">
        <span>Я соглашаюсь на <a href="/privacy.php" style="color:var(--c-purple)">обработку персональных данных</a></span>
      </label>
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

  <?php elseif ($landingState === 'resumed'): ?>
  <!-- ── RESUMED (analysis in progress) ──────────────────────────── -->
  <div class="landing-hero page-wrap">
    <div class="landing-resume">
      <h3>Разбор не завершён</h3>
      <p>Вы начали разбор на тему «<?= htmlspecialchars($resumeTitle) ?>». Можем продолжить с того места, где остановились.</p>
      <div class="landing-resume-actions">
        <button class="btn btn-primary btn-sm" id="btnContinue">Продолжить разбор</button>
        <button class="btn btn-secondary btn-sm" id="btnNewAnalysis">Начать новый</button>
      </div>
    </div>
  </div>
  <?= _landingInputBlock() ?>

  <?php else: ?>
  <!-- ── FRESH / DEFAULT ─────────────────────────────────────────── -->
  <div class="landing-hero page-wrap">
    <h1 class="landing-headline">
      Опиши своё состояние и получи персональную телесную практику, 
      чтобы уйти от <em>панических атак</em> и почувствовать себя легче прямо сейчас:
    </h1>
    <?= _landingInputBlock() ?>
  </div>
  <?php endif; ?>

  <!-- ── CTA block (shown when not gate) ─────────────────────────── -->
  <?php if ($landingState !== 'gate'): ?>
  <div class="landing-cta-block page-wrap">
    <button class="landing-cta-btn" id="landingCta">
      Разобрать состояние и получить практику бесплатно
    </button>
    <div class="landing-privacy">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
      Конфиденциально — никто не увидит запрос
    </div>
  </div>
  <?php endif; ?>

  <!-- ── Practice preview ────────────────────────────────────────── -->
  <section class="practice-preview">
    <h2>Пример практики (без деталей):</h2>
    <div class="practice-steps">
      <div class="practice-step">
        <div class="practice-step-num">1</div>
        <div class="practice-step-title">Замахнись</div>
        <img class="practice-step-img" src="/images/img04.jpg" alt="Замахнись">
        <div class="practice-step-sub">Выпусти напряжение и злость</div>
      </div>
      <div class="practice-step">
        <div class="practice-step-num">2</div>
        <div class="practice-step-title">Удар по дивану</div>
        <img class="practice-step-img" src="/images/img05.jpg" alt="Удар по дивану">
        <div class="practice-step-sub">Выпусти напряжение и злость</div>
      </div>
      <div class="practice-step">
        <div class="practice-step-num">3</div>
        <div class="practice-step-title">Выдохи</div>
        <img class="practice-step-img" src="/images/img06.jpg" alt="Выдохи">
        <div class="practice-step-sub">Дыши глубоко и отпусти напряжение</div>
      </div>
      <div class="practice-step">
        <div class="practice-step-num">4</div>
        <div class="practice-step-title">Почувствуй легче</div>
        <img class="practice-step-img" src="/images/img07.jpg" alt="Почувствуй легче">
        <div class="practice-step-sub">Напряжение ушло</div>
      </div>
    </div>
  </section>

  <!-- ── Reviews ──────────────────────────────────────────────────── -->
  <section class="reviews-section page-wrap">
    <div class="reviews-header">
      <h2>Отзывы</h2>
      <span class="reviews-rating-badge">★★★★★ 5-ть звезд</span>
    </div>
    <div class="review-carousel">
      <div class="review-card">
        <div class="review-stars">★★★★★</div>
        <div class="review-text clamped" id="rv1">
          «Добрый день! вчера не писала, отчитаюсь за вчера! Была дивана, от души так что, там так! Я это 3 заходa! побила 3 раза, успокоилась за 3 минуты после 5 почувствовала, что нужно ещё, и потом ещё! просто выбила из этого дивана всё 😊 очень очень легко! после дивана легко после практики, моя улыбка не сходила с лица 😊 »
        </div>
        <span class="review-more" onclick="toggleReview('rv1',this)">Читать полностью →</span>
      </div>
      <div class="review-card">
        <div class="review-stars">★★★★★</div>
        <div class="review-text clamped" id="rv2">
          «Всё получилось с первого раза. Очень понравился персональный подход — практика прямо попала в точку. Чувствую себя значительно лучше, тревога ушла. Рекомендую всем!»
        </div>
        <span class="review-more" onclick="toggleReview('rv2',this)">Читать полностью →</span>
      </div>
    </div>
    <div class="review-count">8477+ уже получили положительные результаты</div>
  </section>

  <!-- ── Video reviews ─────────────────────────────────────────────── -->
  <section class="video-reviews">
    <h2>Видео-Отзывы</h2>
    <div class="video-list">
      <div class="video-card" onclick="playVideo(this)">
        <video src="/videos/WhatsApp1.mp4" playsinline loop muted></video>
        <div class="video-play-btn">
          <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="rgba(0,0,0,.3)"/><polygon points="10 8 16 12 10 16 10 8" fill="white"/></svg>
        </div>
      </div>
      <div class="video-card" onclick="playVideo(this)">
        <video src="/videos/WhatsApp2.mp4" playsinline loop muted></video>
        <div class="video-play-btn">
          <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="rgba(0,0,.3)"/><polygon points="10 8 16 12 10 16 10 8" fill="white"/></svg>
        </div>
      </div>
    </div>
  </section>

  <!-- ── How it works ──────────────────────────────────────────────── -->
  <section class="how-section page-wrap">
    <h2>Как работает сервис</h2>
    <div class="how-steps">
      <div class="how-step">
        <div class="how-step-num">1</div>
        <div class="how-step-text">
          <strong>Опишите ситуацию</strong>
          <span>Расскажите, что вас беспокоит — текстом или голосом</span>
        </div>
      </div>
      <div class="how-step">
        <div class="how-step-num">2</div>
        <div class="how-step-text">
          <strong>ИИ разбирает запрос</strong>
          <span>Задаёт уточняющие вопросы и находит корень состояния</span>
        </div>
      </div>
      <div class="how-step">
        <div class="how-step-num">3</div>
        <div class="how-step-text">
          <strong>Получаете практику</strong>
          <span>Персональное телесное упражнение под вашу ситуацию</span>
        </div>
      </div>
      <div class="how-step">
        <div class="how-step-num">4</div>
        <div class="how-step-text">
          <strong>Чувствуете облегчение</strong>
          <span>Состояние улучшается уже в процессе практики</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Disclaimer ────────────────────────────────────────────────── -->
  <div class="landing-disclaimer">
    <strong>На основе реальной практики 3000+ клиентами</strong>
    NirvaBody не является медицинским сервисом.<br>
    При наличии медицинских диагнозов — обратитесь к врачу.
  </div>

</div><!-- /landing-page -->

<?php
function _landingInputBlock() {
  return '
  <div class="chat-input-wrap">
    <div class="chat-textarea-row">
      <textarea id="landingMessage" class="chat-textarea" rows="3"
        placeholder="Например: я чувствую тревогу, пустоту, не сплю, злюсь, не понимаю что делать..."></textarea>
      <div class="chat-textarea-actions">
        <button class="btn-voice" id="voiceBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
            <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
          </svg>
          диктофон
        </button>
        <button class="btn-send" id="landingSendBtn">
          отправить
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" stroke="none"/>
          </svg>
        </button>
      </div>
    </div>
  </div>';
}

function _practiceMountainSvg($size = 'small') {
  $h = $size === 'full' ? '120' : '52';
  return '
  <svg class="practice-mountain-svg" viewBox="0 0 200 ' . $h . '" style="height:' . $h . 'px" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="' . $h . '" fill="#1A2744"/>
    <polygon points="0,' . $h . ' 60,20 120,' . $h . '" fill="#2A4A8A"/>
    <polygon points="60,' . $h . ' 130,10 200,' . $h . '" fill="#4A7ACC"/>
    <polygon points="100,' . $h . ' 160,30 200,' . $h . '" fill="#6B9FE0"/>
  </svg>';
}
?>
