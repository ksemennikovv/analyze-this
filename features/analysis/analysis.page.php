<?php
// features/analysis/analysis.page.php
// Vars: $analysis, $practiceVideo, $meditations
$status         = $analysis['status'];
$isChatActive   = in_array($status, ['draft_started', 'chat_in_progress']);
$hasPractice    = in_array($status, ['analysis_completed','practice_assigned','practice_completed','reflection_in_progress','completed']);
$practiceDone   = in_array($status, ['practice_completed','reflection_in_progress','completed']);
$hasReflection  = in_array($status, ['practice_completed','reflection_in_progress','completed']);
$isCompleted    = $status === 'completed';
?>
<script>var ANALYSIS = <?= json_encode(['id' => $analysis['id'], 'status' => $status]) ?>;</script>

<div class="analysis-page">

  <div class="analysis-topbar">
    <a href="/archive.php" class="analysis-back">← Назад</a>
    <div class="analysis-title"><?= htmlspecialchars($analysis['title'] ?: 'Разбор') ?></div>
  </div>

  <?php if ($isChatActive): ?>
  <div class="analysis-chat-wrap" id="analysisChatMount"></div>

  <?php else: ?>
  <div class="page-wrap pb-safe">

    <?php if ($analysis['summary']): ?>
    <div class="analysis-section mt-16">
      <button class="analysis-section-toggle" id="summaryToggle">
        <span class="h3">Итоги разбора</span>
        <svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="analysis-summary-body" id="summaryBody">
        <p class="body-sm mt-8"><?= nl2br(htmlspecialchars($analysis['summary'])) ?></p>
      </div>
    </div>
    <?php endif; ?>

    <?php if ($hasPractice): ?>
    <div class="analysis-section mt-16">
      <div class="h3 mb-12">Практика №<?= (int)$analysis['practice_num'] ?></div>

      <?php if ($analysis['personal_task']): ?>
      <div class="analysis-task card-bordered mb-16">
        <div class="analysis-task-label">Персональное задание</div>
        <p class="body-sm"><?= nl2br(htmlspecialchars($analysis['personal_task'])) ?></p>
      </div>
      <?php endif; ?>

      <div class="analysis-video-wrap <?= $practiceDone ? 'analysis-video--done' : '' ?>">
        <video class="analysis-video" controls playsinline preload="metadata" id="practiceVideo">
          <source src="<?= htmlspecialchars($practiceVideo) ?>" type="video/mp4">
        </video>
        <?php if ($practiceDone): ?>
        <div class="analysis-video-done-badge">✓ Выполнено</div>
        <?php endif; ?>
      </div>

      <?php if (!$practiceDone): ?>
      <button class="btn btn-primary btn-full mt-16" id="practiceDoneBtn">
        Практику выполнил ✓
      </button>
      <?php endif; ?>
    </div>
    <?php endif; ?>

    <?php if ($hasReflection): ?>
    <div class="analysis-section mt-16">
      <div class="h3 mb-12">Самоисследование</div>

      <?php if ($status === 'practice_completed'): ?>
      <div class="analysis-reflection-intro card">
        <p class="body-sm text-muted mb-12">Поделитесь ощущениями после практики — ИИ поможет осмыслить опыт.</p>
        <button class="btn btn-primary btn-sm" id="startReflectionBtn">Начать самоисследование</button>
      </div>

      <?php elseif ($status === 'reflection_in_progress'): ?>
      <div class="analysis-reflection-chat" id="reflectionChatMount"></div>
      <div class="analysis-reflection-actions">
        <button class="btn btn-outline btn-sm mt-12" id="completeReflectionBtn">Завершить самоисследование</button>
      </div>

      <?php elseif ($isCompleted): ?>
      <div class="analysis-reflection-done card-bordered">
        <span class="badge badge-purple">Завершено</span>
      </div>
      <?php endif; ?>
    </div>
    <?php endif; ?>

    <?php if ($isCompleted && !empty($meditations)): ?>
    <div class="analysis-section mt-16 mb-32">
      <div class="h3 mb-12">Медитации</div>
      <?php foreach ($meditations as $m): ?>
      <div class="analysis-med-card">
        <div class="analysis-med-info">
          <?php if ($m['theme']): ?><div class="caption text-muted mb-2"><?= htmlspecialchars($m['theme']) ?></div><?php endif; ?>
          <div class="analysis-med-title"><?= htmlspecialchars($m['title']) ?></div>
        </div>
        <?php if ($m['status'] === 'ready'): ?>
        <a href="/meditations.php" class="btn btn-outline btn-sm">Слушать</a>
        <?php else: ?>
        <span class="badge badge-amber">Создаётся</span>
        <?php endif; ?>
      </div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

  </div>
  <?php endif; ?>

</div>
