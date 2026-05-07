<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../src/db/Database.php';
require_once __DIR__ . '/../src/helpers/response.php';
require_once __DIR__ . '/../src/helpers/validation.php';

header('Content-Type: application/json');

$email    = trim($_POST['email']    ?? '');
$code     = trim($_POST['code']     ?? '');
$password = trim($_POST['password'] ?? '');

if (!$email || !$code || !validate_password($password)) {
    json_error('Неверные данные или пароль короче 6 символов');
}

$db   = Database::getInstance();
$stmt = $db->prepare('SELECT id, name, verify_code, verify_expires FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$row  = $stmt->get_result()->fetch_assoc();

if (!$row || $row['verify_code'] !== $code) { json_error('Неверный код'); }
if (strtotime($row['verify_expires']) < time()) { json_error('Код истёк — запросите новый'); }

$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $db->prepare('UPDATE users SET password = ?, verify_code = NULL, verify_expires = NULL, email_verified = 1 WHERE id = ?');
$stmt->bind_param('si', $hash, $row['id']);
$stmt->execute();

session_regenerate_id(true);
$_SESSION['user_id']   = $row['id'];
$_SESSION['user_name'] = $row['name'] ?? '';

$stmt2 = $db->prepare('SELECT video_url FROM users WHERE id = ?');
$stmt2->bind_param('i', $row['id']);
$stmt2->execute();
$row2 = $stmt2->get_result()->fetch_assoc();

json_success([
    'name'  => $row['name'] ?? '',
    'video' => $row2['video_url'] ?? 'videos/practice.mp4',
]);
