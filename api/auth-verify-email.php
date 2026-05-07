<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../src/db/Database.php';
require_once __DIR__ . '/../src/helpers/response.php';
require_once __DIR__ . '/../src/services/ChatService.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$code  = trim($input['code']  ?? '');

if (!$email || !$code) { json_error('Неверные данные'); }

$db   = Database::getInstance();
$stmt = $db->prepare('SELECT id, name, verify_code, verify_expires, video_url FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();

if (!$row)                               { json_error('Пользователь не найден'); }
if ($row['verify_code'] !== $code)       { json_error('Неверный код'); }
if (strtotime($row['verify_expires']) < time()) { json_error('Код истёк — запросите новый'); }

$stmt = $db->prepare('UPDATE users SET email_verified = 1, verify_code = NULL, verify_expires = NULL WHERE id = ?');
$stmt->bind_param('i', $row['id']);
$stmt->execute();

session_regenerate_id(true);
$_SESSION['user_id']   = $row['id'];
$_SESSION['user_name'] = $row['name'] ?? '';

json_success([
    'name'  => $row['name'] ?? '',
    'video' => $row['video_url'] ?: 'videos/practice.mp4',
]);
