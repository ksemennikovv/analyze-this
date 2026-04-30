<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$code  = trim($input['code']  ?? '');

if (!$email || !$code) {
    echo json_encode(['ok' => false, 'error' => 'Неверные данные']);
    exit;
}

$db   = db();
$stmt = $db->prepare('SELECT id, name, verify_code, verify_expires, video_url FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();

if (!$row) {
    echo json_encode(['ok' => false, 'error' => 'Пользователь не найден']);
    exit;
}
if ($row['verify_code'] !== $code) {
    echo json_encode(['ok' => false, 'error' => 'Неверный код']);
    exit;
}
if (strtotime($row['verify_expires']) < time()) {
    echo json_encode(['ok' => false, 'error' => 'Код истёк — запросите новый']);
    exit;
}

$stmt = $db->prepare('UPDATE users SET email_verified = 1, verify_code = NULL, verify_expires = NULL WHERE id = ?');
$stmt->bind_param('i', $row['id']);
$stmt->execute();

/* transfer pending history */
if (!empty($_SESSION['pending_history']) && (int)($_SESSION['pending_uid'] ?? 0) === (int)$row['id']) {
    $ins = $db->prepare('INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)');
    foreach ($_SESSION['pending_history'] as $m) {
        if (isset($m['role'], $m['content']) && in_array($m['role'], ['user', 'assistant'], true)) {
            $ins->bind_param('iss', $row['id'], $m['role'], $m['content']);
            $ins->execute();
        }
    }
    unset($_SESSION['pending_history'], $_SESSION['pending_uid']);
}

session_regenerate_id(true);
$_SESSION['user_id']   = $row['id'];
$_SESSION['user_name'] = $row['name'] ?? '';

echo json_encode([
    'ok'    => true,
    'name'  => $row['name'] ?? '',
    'video' => $row['video_url'] ?: 'videos/practice.mp4',
]);
