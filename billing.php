<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/src/db/Database.php';
require_once __DIR__ . '/src/helpers/security.php';

require_auth_redirect('/');

$pageTitle = 'Подписка и оплата — ' . APP_NAME;
$pageCss   = ['/assets/css/billing.css'];
$pageJs    = ['/assets/js/billing.js', '/assets/js/payments.js'];
require __DIR__ . '/includes/head.php';
?>
<div class="phone"><div class="page">
<?php require __DIR__ . '/includes/header.php'; ?>
<?php require __DIR__ . '/pages/billing.php'; ?>
<?php require __DIR__ . '/includes/footer.php'; ?>
<?php require __DIR__ . '/includes/scripts.php'; ?>
