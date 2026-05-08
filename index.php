<?php
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/src/db/Database.php';

$pageTitle = APP_NAME . ' — Индивидуальный ИИ-разбор и подбор телесных практик';
$pageCss   = ['/assets/css/landing.css'];
$pageJs    = ['/assets/js/landing.js'];
require __DIR__ . '/includes/head.php';
?>

<div class="phone">
<div class="page">

<?php require __DIR__ . '/includes/header.php'; ?>

<?php require __DIR__ . '/pages/landing.php'; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>

<?php require __DIR__ . '/includes/scripts.php'; ?>
