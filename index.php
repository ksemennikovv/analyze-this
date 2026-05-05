<?php
$pageTitle = 'NirvaBody — Индивидуальный ИИ-разбор и подбор телесных практик';
$pageCss   = ['/assets/css/pages/landing.css'];
$pageJs    = ['/assets/js/pages/landing.js'];
require __DIR__ . '/includes/head.php';
?>

<div class="phone">
<div class="page">

<?php require __DIR__ . '/includes/header.php'; ?>

<?php require __DIR__ . '/pages/landing-content.php'; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>

<?php require __DIR__ . '/includes/auth-modal.php'; ?>

<?php require __DIR__ . '/includes/scripts.php'; ?>
