<?php
error_reporting(0); ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../src/db/Database.php';

$input    = json_decode(file_get_contents('php://input'), true);
$email    = trim($input['email']    ?? '');
$code     = trim($input['code']     ?? '');
$password = trim($input['password'] ?? '');

if (!$email || !$code || strlen($password) < 6) {
    echo json_encode(['ok' => false, 'error' => 'Неверные данные или пароль короче 6 символов']); exit;
}

$db   = Database::getInstance();
$stmt = $db->prepare('SELECT id, name, verify_code, verify_expires FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row || $row['verify_code'] !== $code) {
    echo json_encode(['ok' => false, 'error' => 'Неверный код']); exit;
}
if ($row['verify_expires'] && strtotime($row['verify_expires']) < time()) {
    echo json_encode(['ok' => false, 'error' => 'Код истёк — запросите новый']); exit;
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $db->prepare('UPDATE users SET password=?, verify_code=NULL, verify_expires=NULL, email_verified=1 WHERE id=?');
$stmt->bind_param('si', $hash, $row['id']);
$stmt->execute(); $stmt->close();

session_regenerate_id(true);
$_SESSION['user_id']   = $row['id'];
$_SESSION['user_name'] = $row['name'] ?? '';

echo json_encode(['ok' => true]);
