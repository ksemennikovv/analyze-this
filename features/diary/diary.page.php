<?php
// features/diary/diary.page.php
// Vars: $entries, $diaryLocked, $nearLimit, $freeLimit
?>
<div class="diary-page">

  <div class="diary-topbar page-wrap">
    <h1 class="h2">Дневник</h1>
    <?php if (!$diaryLocked): ?>
    <button class="btn btn-primary btn-sm" id="diaryNewBtn">+ Запись</button>
    <?php else: ?>
    <a href="/billing.php" class="btn btn-outline btn-sm">Открыть доступ</a>
    <?php endif; ?>
  </div>

  <div class="page-wrap pb-safe">

    <?php if ($diaryLocked): ?>
    <div class="diary-paywall card mt-16">
      <div class="diary-paywall-icon">📔</div>
      <div class="h3 mb-8">Бесплатные записи закончились</div>
      <p class="text-muted body-sm mb-16">Вы использовали <?= $freeLimit ?> бесплатные записи. Чтобы продолжить — выберите тариф.</p>
      <a href="/billing.php" class="btn btn-primary btn-full">Выбрать тариф</a>
    </div>
    <?php elseif ($nearLimit): ?>
    <div class="diary-near-limit card-bordered mt-16">
      <span class="badge badge-amber mb-8">Осталась 1 бесплатная запись</span>
      <p class="text-muted body-sm">После неё потребуется подписка.</p>
    </div>
    <?php endif; ?>

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
