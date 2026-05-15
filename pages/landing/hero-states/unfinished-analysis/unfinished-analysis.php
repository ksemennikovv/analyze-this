<?php
// pages/landing/includes/hero-states/unfinished-analysis/unfinished-analysis.php
// State: user has an unfinished analysis session
$resumeTitle = $resumeTitle ?? 'Ваш запрос';
?>
<div id="landingMain">
  <div class="landing-hero page-wrap">
    <div class="landing-resume">
      <h3>Разбор не завершён</h3>
      <p>Вы начали разбор на тему «<?= htmlspecialchars($resumeTitle) ?>». Можем продолжить с того места, где остановились.</p>
      <div class="landing-resume-actions">
        <button class="btn btn-primary btn-sm" id="btnContinue">Продолжить разбор</button>
        <button class="btn btn-secondary btn-sm" id="btnNewAnalysis">Начать новый</button>
      </div>
    </div>
    <?= _landingInputBlock() ?>
  </div>
</div>
<?php
if (!function_exists('_landingInputBlock')) {
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
}
