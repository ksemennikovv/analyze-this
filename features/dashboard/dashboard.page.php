<?php
// features/dashboard/dashboard.page.php
// Vars: $userName, $currentAnalysis, $analyses, $statusLabels
?>
<div class="dashboard-page">

  <!-- Header bar -->
  <div class="db-topbar">
    <div class="db-logo">Nirva.AI</div>
    <a href="/billing.php" class="db-avatar">
      <?= mb_strtoupper(mb_substr($userName ?: 'U', 0, 1)) ?>
    </a>
  </div>

  <div class="page-wrap pb-safe">

    <!-- Greeting -->
    <div class="db-greeting">
      <?php if ($userName): ?>
        <h1 class="h2">Привет, <?= htmlspecialchars($userName) ?>!</h1>
      <?php else: ?>
        <h1 class="h2">Добро пожаловать!</h1>
      <?php endif; ?>
      <p class="text-muted body-sm mt-4">
        Ваш персонализированный инсайт обновляется после каждого разбора
      </p>
    </div>

    <!-- Chat input (new analysis) -->
    <div class="db-chat-start card mt-16">
      <div class="chat-textarea-row">
        <textarea id="dbMessage" class="chat-textarea" rows="2"
          placeholder="Например: я чувствую тревогу, пустоту, не сплю…"></textarea>
      </div>
      <button class="btn btn-primary btn-full mt-12" id="dbStartBtn">
        Начать новый разбор →
      </button>
    </div>

    <?php if ($currentAnalysis): ?>
    <!-- Unfinished analysis -->
    <?php if ($currentAnalysis['status'] !== 'completed'): ?>
    <div class="db-resume card-bordered mt-16">
      <div class="db-resume-label badge badge-amber mb-8">Незавершённый разбор</div>
      <div class="db-resume-title"><?= htmlspecialchars($currentAnalysis['title']) ?></div>
      <div class="db-resume-date text-muted caption mt-4">
        <?= date('j F', strtotime($currentAnalysis['created_at'])) ?>
      </div>
      <button class="btn btn-secondary btn-sm mt-12"
              onclick="Dashboard.openAnalysis(<?= $currentAnalysis['id'] ?>)">
        Продолжить →
      </button>
    </div>
    <?php endif; ?>

    <!-- Analysis list -->
    <?php if (count($analyses) > 0): ?>
    <div class="mt-24">
      <div class="flex justify-between items-center mb-12">
        <span class="h3">Разборы</span>
        <a href="/archive.php" style="font-size:.875rem;color:var(--c-purple)">Все →</a>
      </div>
      <?php foreach ($analyses as $a): ?>
      <div class="db-analysis-card" onclick="Dashboard.openAnalysis(<?= $a['id'] ?>)">
        <div class="flex justify-between items-start">
          <div>
            <div class="db-analysis-title"><?= htmlspecialchars($a['title']) ?></div>
            <div class="caption text-muted mt-4"><?= date('j M', strtotime($a['created_at'])) ?></div>
          </div>
          <?php [$slabel, $sbadge] = $statusLabels[$a['status']] ?? ['В процессе', 'badge-amber']; ?>
          <span class="badge <?= $sbadge ?>"><?= $slabel ?></span>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <?php else: ?>
    <!-- Empty state -->
    <div class="db-empty mt-32 text-center">
      <div style="font-size:3rem;margin-bottom:12px">🌿</div>
      <div class="h3 mb-8">Начните первый разбор</div>
      <p class="text-muted body-sm">Опишите своё состояние выше и получите персональную практику</p>
    </div>
    <?php endif; ?>

  </div>
</div>
