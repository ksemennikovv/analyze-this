<?php
require_once __DIR__ . '/config/app.php';
$pageTitle = 'Политика конфиденциальности — ' . APP_NAME;
$pageCss   = [];
$pageJs    = [];
require __DIR__ . '/includes/head.php';
?>
<div class="phone"><div class="page">
<?php require __DIR__ . '/includes/header.php'; ?>
<?php require __DIR__ . '/pages/privacy.php'; ?>
<?php require __DIR__ . '/includes/footer.php'; ?>
<?php require __DIR__ . '/includes/scripts.php'; ?>
