<?php if (!$user): ?>

<div class="cab-login-wrap">
  <div class="cab-login-icon">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="#3B1F0A" stroke-width="1.8" fill="none"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#3B1F0A" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    </svg>
  </div>
  <div class="cab-login-title">Личный кабинет</div>
  <div class="cab-login-sub">Войдите в аккаунт, чтобы получить доступ к своим практикам</div>
  <button id="cabLoginBtn" class="cab-login-btn">Войти в аккаунт</button>
</div>

<?php else: ?>

<!-- Nav tabs -->
<div class="cab-tabs">
  <div class="cab-tab active" data-tab="practices">Мои практики</div>
  <div class="cab-tab" data-tab="analysis">Разбор</div>
  <div class="cab-tab" data-tab="meditations">Медитации</div>
  <div class="cab-tab" data-tab="diary">Дневник</div>
  <div class="cab-tab" data-tab="subscription">Подписка</div>
</div>

<!-- Tab: Мои практики -->
<div id="tabPractices" class="cab-tab-content">
  <div class="cab-practice-card">
    <div class="cab-practice-video">
      <img src="/images/volk.jpg" alt="Практика «Волчий глаз»" />
      <div class="cab-video-overlay">
        <div class="cab-play-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <div class="cab-duration">3:12</div>
    </div>
    <div class="cab-practice-info">
      <div class="cab-practice-tag">Рекомендовано для вас</div>
      <div class="cab-practice-name">Практика «Волчий глаз»</div>
      <div class="cab-practice-desc">Данная практика выполняется в домашних условиях. Потребуется поверхность дивана или кровати.</div>
      <?php if (!empty($user['video_url'])): ?>
      <video class="practice-video" controls playsinline preload="metadata" style="width:100%;border-radius:10px;margin-bottom:10px">
        <source src="<?= htmlspecialchars($user['video_url']) ?>" type="video/mp4">
      </video>
      <?php else: ?>
      <button class="cab-practice-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7z" fill="#3B1F0A"/></svg>
        Начать практику
      </button>
      <?php endif; ?>
    </div>
  </div>
</div>

<!-- Other tabs (placeholders) -->
<div id="tabAnalysis"     class="cab-tab-content" style="display:none"><div style="padding:32px 20px;text-align:center;color:var(--t3);font-size:14px">Раздел в разработке</div></div>
<div id="tabMeditations"  class="cab-tab-content" style="display:none"><div style="padding:32px 20px;text-align:center;color:var(--t3);font-size:14px">Раздел в разработке</div></div>
<div id="tabDiary"        class="cab-tab-content" style="display:none"><div style="padding:32px 20px;text-align:center;color:var(--t3);font-size:14px">Раздел в разработке</div></div>
<div id="tabSubscription" class="cab-tab-content" style="display:none"><div style="padding:32px 20px;text-align:center;color:var(--t3);font-size:14px">Раздел в разработке</div></div>

<?php endif; ?>
