<?php
/* pages/dashboard.php — сборщик дашборда */
if (!isset($user)) {
    echo '<p class="padded">Загрузка…</p>';
    return;
}
require_once __DIR__ . '/../includes/dashboard/current-action.php';
require_once __DIR__ . '/../includes/dashboard/feed.php';
require_once __DIR__ . '/../includes/dashboard/package-balance.php';
require_once __DIR__ . '/../includes/dashboard/subscription-status.php';
require_once __DIR__ . '/../includes/dashboard/referrals.php';
