<?php
session_start();
error_reporting(0); ini_set('display_errors', 0);
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/src/db/Database.php';

if (empty($_SESSION['user_id'])) { header('Location: /'); exit; }

$userId = (int)$_SESSION['user_id'];
$db = Database::getInstance();

$stmt = $db->prepare('SELECT id, title, description, theme, audio_url, cover_url, duration_sec, status FROM meditations WHERE user_id=? ORDER BY created_at DESC');
$stmt->bind_param('i', $userId);
$stmt->execute();
$meditations = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$pageTitle = 'Медитации';
$navActive = 'meditations';
$pageCss   = ['/features/meditations/meditations.css'];
$pageJs    = ['/features/meditations/meditations.js'];

include __DIR__ . '/shared/layout/header.php';
?>
<div class="med-page">

  <div class="med-topbar page-wrap">
    <h1 class="h2">Медитации</h1>
  </div>

  <div class="page-wrap pb-safe">
    <?php if (empty($meditations)): ?>
    <div class="med-empty text-center">
      <div class="med-empty-icon">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="24" cy="24" r="20"/>
          <path d="M16 24a8 8 0 0016 0"/>
          <path d="M24 8v4M24 36v4M8 24h4M36 24h4"/>
        </svg>
      </div>
      <div class="h3 mb-8">Медитаций пока нет</div>
      <p class="text-muted body-sm mb-24">Медитации создаются персонально после завершения разбора</p>
      <a href="/dashboard.php" class="btn btn-primary">Начать разбор</a>
    </div>
    <?php else: ?>
    <div class="med-list mt-16">
      <?php foreach ($meditations as $m):
        $mins    = $m['duration_sec'] ? floor($m['duration_sec'] / 60) . ' мин' : '';
        $isReady = $m['status'] === 'ready';
        $clickAttr = $isReady
          ? 'onclick="Med.play(' . $m['id'] . ',' . htmlspecialchars(json_encode($m['title'])) . ',' . htmlspecialchars(json_encode($m['audio_url'])) . ',' . htmlspecialchars(json_encode($m['cover_url'])) . ',' . htmlspecialchars(json_encode($m['theme'])) . ')"'
          : '';
      ?>
      <div class="med-card <?= !$isReady ? 'med-card--locked' : '' ?>" <?= $clickAttr ?>>
        <div class="med-card-cover">
          <?php if ($m['cover_url']): ?>
          <img src="<?= htmlspecialchars($m['cover_url']) ?>" alt="">
          <?php else: ?>
          <div class="med-cover-ph">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
          </div>
          <?php endif; ?>
          <?php if (!$isReady): ?>
          <div class="med-status-overlay">
            <span><?= $m['status'] === 'generating' ? 'Создаётся…' : 'Недоступно' ?></span>
          </div>
          <?php endif; ?>
        </div>
        <div class="med-card-info">
          <?php if ($m['theme']): ?><div class="med-card-theme"><?= htmlspecialchars($m['theme']) ?></div><?php endif; ?>
          <div class="med-card-title"><?= htmlspecialchars($m['title']) ?></div>
          <?php if ($m['description']): ?>
          <div class="med-card-desc"><?= htmlspecialchars(mb_substr($m['description'], 0, 70)) ?>…</div>
          <?php endif; ?>
          <?php if ($mins): ?><div class="caption text-muted mt-6"><?= $mins ?></div><?php endif; ?>
        </div>
        <?php if ($isReady): ?>
        <div class="med-play-btn">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <?php endif; ?>
      </div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>
  </div>
</div>

<?php
include __DIR__ . '/shared/layout/bottom-nav.php';
include __DIR__ . '/shared/layout/footer.php';
?>
