<?php
error_reporting(0); ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/config/app.php';

$email = trim($_GET['email'] ?? '');
$code  = trim($_GET['code']  ?? '');

$pageTitle = 'Сброс пароля';
$pageCss   = [];
$pageJs    = ['/features/landing/reset-password.js'];
include __DIR__ . '/shared/layout/header.php';
include __DIR__ . '/features/landing/reset-password.page.php';
include __DIR__ . '/shared/layout/footer.php';
