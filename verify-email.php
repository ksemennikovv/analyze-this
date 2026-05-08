<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/src/db/Database.php';

$code     = trim($_GET['code']  ?? '');
$email    = trim($_GET['email'] ?? '');
$verified = false;
$error    = '';

if ($code && $email) {
    $db   = Database::getInstance();
    $stmt = $db->prepare('SELECT id, name, verify_code, verify_code_expires FROM users WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if (!$row || $row['verify_code'] !== $code) {
        $error = 'Неверный код подтверждения.';
    } elseif ($row['verify_code_expires'] && strtotime($row['verify_code_expires']) < time()) {
        $error = 'Срок действия кода истёк. Запросите новый.';
    } else {
        $stmt = $db->prepare('UPDATE users SET email_verified = 1, verify_code = NULL, verify_code_expires = NULL WHERE id = ?');
        $stmt->bind_param('i', $row['id']);
        $stmt->execute();
        session_regenerate_id(true);
        $_SESSION['user_id']   = $row['id'];
        $_SESSION['user_name'] = $row['name'] ?? '';
        $verified = true;
    }
} else {
    $error = 'Неверная ссылка подтверждения.';
}

$pageTitle = 'Подтверждение email — ' . APP_NAME;
$pageCss   = [];
$pageJs    = [];
require __DIR__ . '/includes/head.php';
?>
<div class="phone"><div class="page">
<?php require __DIR__ . '/includes/header.php'; ?>
<?php require __DIR__ . '/pages/verify-email.php'; ?>
<?php require __DIR__ . '/includes/footer.php'; ?>
<?php require __DIR__ . '/includes/scripts.php'; ?>
