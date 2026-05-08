<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/php/db.php';

$user = null;
if (!empty($_SESSION['user_id'])) {
    $db   = db();
    $stmt = $db->prepare('SELECT id, name, email, video_url FROM users WHERE id = ?');
    $stmt->bind_param('i', $_SESSION['user_id']);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
}

$pageTitle = 'Личный кабинет — NirvaBody';
$pageCss   = ['/assets/css/pages/dashboard.css'];
$pageJs    = ['/assets/js/pages/dashboard.js'];
require __DIR__ . '/includes/head.php';
?>

<div class="phone">
<div class="page cabinet-page">

<?php require __DIR__ . '/includes/header.php'; ?>

<?php require __DIR__ . '/pages/cabinet-content.php'; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>

<?php require __DIR__ . '/includes/auth-modal.php'; ?>

<?php require __DIR__ . '/includes/scripts.php'; ?>
