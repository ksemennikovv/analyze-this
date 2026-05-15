<?php
// pages/landing/includes/hero-states/default-hero/default-hero.php
// Initial state: new user or no active session
?>
<div id="landingMain">
  <div class="landing-hero page-wrap">
    <h1 class="landing-headline">
      Опиши своё состояние и получи персональную телесную практику,
      чтобы уйти от <em>панических атак</em> и почувствовать себя легче прямо сейчас:
    </h1>
    <?= _landingInputBlock() ?>
  </div>
</div>
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
