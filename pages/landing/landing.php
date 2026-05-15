<?php
// pages/landing/landing.php
// Landing page assembly: state detection + hero-state include + sections

$landingState = 'fresh';
$resumeTitle  = '';
$practiceNum  = 1;
$practiceName = 'Телесная практика';
$isGate       = false;
$videoFile    = 'practice';

if (!empty($_SESSION['show_gate'])) {
    $landingState = 'gate';
    $practiceNum  = (int)($_SESSION['practice_num'] ?? 1);
    $practiceName = $_SESSION['practice_name'] ?? 'Телесная практика';
    $isGate       = true;
    $videoFile    = $practiceNum <= 7 ? 'practice' : ($practiceNum <= 14 ? 'WhatsApp1' : 'WhatsApp2');
} elseif (!empty($_SESSION['guest_analysis_id'])) {
    $landingState = 'resumed';
    $resumeTitle  = $_SESSION['guest_analysis_title'] ?? 'Ваш запрос';
}

$pageTitle = 'Главная';
$pageCss   = ['/pages/landing/landing.css', '/features/chat/chat.css'];
$pageJs    = ['/features/chat/chat.js', '/pages/landing/landing.js'];

include __DIR__ . '/../../features/header.php';
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

  <!-- Hero state (only one is included based on PHP state) -->
  <?php if ($landingState === 'gate'): ?>
    <?php include __DIR__ . '/hero-states/registration-gate/registration-gate.php'; ?>
  <?php elseif ($landingState === 'resumed'): ?>
    <?php include __DIR__ . '/hero-states/unfinished-analysis/unfinished-analysis.php'; ?>
  <?php else: ?>
    <?php include __DIR__ . '/hero-states/default-hero/default-hero.php'; ?>
  <?php endif; ?>

  <!-- CTA block (hidden when gate) -->
  <?php if (!$isGate): ?>
  <div id="landingCtaBlock" class="landing-cta-block page-wrap">
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

  <!-- Landing sections -->
  <?php include __DIR__ . '/practice-preview/practice-preview.php'; ?>
  <?php include __DIR__ . '/reviews/reviews.php'; ?>
  <?php include __DIR__ . '/video-reviews/video-reviews.php'; ?>
  <?php include __DIR__ . '/disclaimer/disclaimer.php'; ?>

</div><!-- /landing-page -->

<?php include __DIR__ . '/../../features/footer.php'; ?>
