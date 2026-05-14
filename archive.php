<?php
session_start();
error_reporting(0); ini_set('display_errors', 0);
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/src/db/Database.php';

if (empty($_SESSION['user_id'])) { header('Location: /'); exit; }

$userId = (int)$_SESSION['user_id'];
$db = Database::getInstance();

$stmt = $db->prepare('SELECT id, title, status, practice_num, created_at FROM analyses WHERE user_id=? ORDER BY created_at DESC');
$stmt->bind_param('i', $userId);
$stmt->execute();
$analyses = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$pageTitle = 'Разборы';
$navActive = 'archive';
$pageCss   = ['/features/archive/archive.css'];
$pageJs    = ['/features/archive/archive.js'];

include __DIR__ . '/shared/layout/header.php';
?>
<div class="archive-page">

  <div class="archive-topbar page-wrap">
    <h1 class="h2">Разборы</h1>
    <a href="/dashboard.php" class="btn btn-primary btn-sm">+ Новый</a>
  </div>

  <div class="page-wrap pb-safe">
    <?php if (empty($analyses)): ?>
    <div class="archive-empty text-center">
      <div class="archive-empty-icon">📋</div>
      <div class="h3 mb-8">Разборов пока нет</div>
      <p class="text-muted body-sm mb-24">Начните первый разбор на главной странице</p>
      <a href="/dashboard.php" class="btn btn-primary">Начать разбор</a>
    </div>
    <?php else: ?>

    <div class="archive-tabs mt-16">
      <button class="archive-tab active" data-filter="all">Все (<?= count($analyses) ?>)</button>
      <button class="archive-tab" data-filter="completed">Завершённые</button>
      <button class="archive-tab" data-filter="active">В процессе</button>
    </div>

    <div class="archive-list mt-16" id="archiveList">
      <?php
        $statusLabels = [
          'draft_started'         => ['В черновике',     'badge-amber'],
          'chat_in_progress'      => ['Разбор идёт',     'badge-amber'],
          'analysis_completed'    => ['Практика ждёт',   'badge-amber'],
          'practice_assigned'     => ['Практика ждёт',   'badge-amber'],
          'practice_completed'    => ['Самоисследование','badge-amber'],
          'reflection_in_progress'=> ['Самоисследование','badge-amber'],
          'completed'             => ['Завершён',         'badge-purple'],
          'abandoned'             => ['Прерван',          'badge-amber'],
        ];
      ?>
      <?php foreach ($analyses as $a):
        $done    = $a['status'] === 'completed';
        $dateStr = date('j M Y', strtotime($a['created_at']));
        [$slabel, $sbadge] = $statusLabels[$a['status']] ?? ['В процессе', 'badge-amber'];
      ?>
      <div class="archive-card"
           data-id="<?= $a['id'] ?>"
           data-status="<?= $done ? 'completed' : 'active' ?>"
           onclick="Archive.open(<?= $a['id'] ?>, <?= htmlspecialchars(json_encode($a['title'] ?: 'Разбор')) ?>)">
        <div class="archive-card-head">
          <div class="archive-card-title"><?= htmlspecialchars($a['title'] ?: 'Без названия') ?></div>
          <span class="badge <?= $sbadge ?>"><?= $slabel ?></span>
        </div>
        <div class="archive-card-meta">
          <span class="caption"><?= $dateStr ?></span>
          <?php if ($a['practice_num']): ?>
          <span class="archive-card-practice">Практика №<?= $a['practice_num'] ?></span>
          <?php endif; ?>
        </div>
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
