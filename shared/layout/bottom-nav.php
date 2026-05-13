<?php
// shared/layout/bottom-nav.php
// Shown only for authenticated users
// Required: $navActive = 'home'|'archive'|'diary'|'meditations'|'billing'
$navActive = $navActive ?? '';
?>
<nav class="bottom-nav" id="bottomNav">
  <a href="/dashboard.php" class="bnav-item <?= $navActive==='home'?'active':'' ?>">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
    <span>Главная</span>
  </a>
  <a href="/archive.php" class="bnav-item <?= $navActive==='archive'?'active':'' ?>">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <polyline points="21 8 21 21 3 21 3 8"/>
      <rect x="1" y="3" width="22" height="5"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
    <span>Разборы</span>
  </a>
  <a href="/diary.php" class="bnav-item <?= $navActive==='diary'?'active':'' ?>">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
    <span>Дневник</span>
  </a>
  <a href="/meditations.php" class="bnav-item <?= $navActive==='meditations'?'active':'' ?>">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="18" cy="16" r="3"/>
    </svg>
    <span>Медитации</span>
  </a>
  <a href="/billing.php" class="bnav-item <?= $navActive==='billing'?'active':'' ?>">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
    <span>Профиль</span>
  </a>
</nav>

<style>
.bottom-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: calc(var(--nav-h) + env(safe-area-inset-bottom, 0px));
  background: var(--c-bg);
  border-top: 1px solid var(--c-border);
  display: flex;
  z-index: 800;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.bnav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: var(--c-text-3);
  font-size: .65rem;
  font-weight: 500;
  -webkit-tap-highlight-color: transparent;
  transition: color var(--t);
}
.bnav-item svg { width: 22px; height: 22px; }
.bnav-item.active { color: var(--c-amber); }
</style>
