<?php // pages/landing/includes/video-reviews/video-reviews.php ?>
<section class="video-reviews">
  <h2>Видео-Отзывы</h2>
  <div class="video-list">
    <div class="video-card" onclick="playVideo(this)">
      <video src="/videos/WhatsApp1.mp4" playsinline loop muted></video>
      <div class="video-play-btn">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,.3)"/>
          <polygon points="10 8 16 12 10 16 10 8" fill="white"/>
        </svg>
      </div>
    </div>
    <div class="video-card" onclick="playVideo(this)">
      <video src="/videos/WhatsApp2.mp4" playsinline loop muted></video>
      <div class="video-play-btn">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,.3)"/>
          <polygon points="10 8 16 12 10 16 10 8" fill="white"/>
        </svg>
      </div>
    </div>
  </div>
</section>
