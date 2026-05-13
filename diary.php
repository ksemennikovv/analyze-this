<?php
session_start();
error_reporting(0); ini_set('display_errors', 0);
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/src/db/Database.php';

if (empty($_SESSION['user_id'])) { header('Location: /'); exit; }

$userId = (int)$_SESSION['user_id'];
$db = Database::getInstance();

$stmt = $db->prepare('SELECT id, title, status, created_at FROM diary_entries WHERE user_id=? ORDER BY created_at DESC LIMIT 30');
$stmt->bind_param('i', $userId);
$stmt->execute();
$entries = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$pageTitle = 'Дневник';
$navActive = 'diary';
$pageCss   = ['/features/diary/diary.css'];
$pageJs    = ['/features/diary/diary.js'];

include __DIR__ . '/shared/layout/header.php';
?>
<div class="diary-page">

  <div class="diary-topbar page-wrap">
    <h1 class="h2">Дневник</h1>
    <button class="btn btn-primary btn-sm" id="diaryNewBtn">+ Запись</button>
  </div>

  <div class="page-wrap pb-safe">
    <?php if (empty($entries)): ?>
    <div class="diary-empty text-center">
      <div class="diary-empty-icon">📔</div>
      <div class="h3 mb-8">Дневник пуст</div>
      <p class="text-muted body-sm mb-24">Записывайте мысли и чувства — ИИ поможет разобраться</p>
      <button class="btn btn-primary" id="diaryNewBtn2">Первая запись</button>
    </div>
    <?php else: ?>
    <div class="diary-list mt-16">
      <?php foreach ($entries as $e):
        $done    = $e['status'] === 'completed';
        $dateStr = date('j M Y', strtotime($e['created_at']));
      ?>
      <div class="diary-card" onclick="Diary.openEntry(<?= $e['id'] ?>, <?= htmlspecialchars(json_encode($e['title'] ?: 'Запись')) ?>)">
        <div class="diary-card-head">
          <div class="diary-card-title"><?= htmlspecialchars($e['title'] ?: 'Запись') ?></div>
          <span class="badge <?= $done ? 'badge-purple' : 'badge-amber' ?>">
            <?= $done ? 'Завершено' : 'В процессе' ?>
          </span>
        </div>
        <div class="caption text-muted mt-8"><?= $dateStr ?></div>
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
