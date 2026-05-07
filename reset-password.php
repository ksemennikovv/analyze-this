<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/config/app.php';

$pageTitle = 'Сброс пароля — NirvaBody';
$pageCss   = [];
$pageJs    = [];
require __DIR__ . '/includes/head.php';
?>
<div class="phone"><div class="page">
<?php require __DIR__ . '/includes/header.php'; ?>
<?php require __DIR__ . '/pages/reset-password.php'; ?>
<?php require __DIR__ . '/includes/footer.php'; ?>
<?php require __DIR__ . '/includes/scripts.php'; ?>
