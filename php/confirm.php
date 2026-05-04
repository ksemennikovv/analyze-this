<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/db.php';

$code  = trim($_GET['code']  ?? '');
$email = trim($_GET['email'] ?? '');

if (!$code || !$email) {
    header('Location: /?error=invalid');
    exit;
}

$db   = db();
$stmt = $db->prepare('SELECT id, name, verify_code, verify_expires, video_url FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$row  = $stmt->get_result()->fetch_assoc();

if (!$row || $row['verify_code'] !== $code) {
    header('Location: /?error=invalid_link');
    exit;
}
if (strtotime($row['verify_expires']) < time()) {
    header('Location: /?error=link_expired');
    exit;
}

/* mark verified */
$stmt = $db->prepare('UPDATE users SET email_verified = 1, verify_code = NULL, verify_expires = NULL WHERE id = ?');
$stmt->bind_param('i', $row['id']);
$stmt->execute();

/* auto-login */
session_regenerate_id(true);
$_SESSION['user_id']   = $row['id'];
$_SESSION['user_name'] = $row['name'] ?? '';

header('Location: /?welcome=1');
exit;
