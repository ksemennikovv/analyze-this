<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../config/mail.php';
require_once __DIR__ . '/../src/db/Database.php';
require_once __DIR__ . '/../src/helpers/response.php';
require_once __DIR__ . '/../src/helpers/validation.php';
require_once __DIR__ . '/../src/services/EmailService.php';
require_once __DIR__ . '/../src/services/ChatService.php';

header('Content-Type: application/json');

$input   = json_decode(file_get_contents('php://input'), true);
$email   = trim($input['email']   ?? '');
$name    = trim($input['name']    ?? '');
$history = $input['history'] ?? [];

if (!validate_email($email)) {
    json_error('Некорректный email');
}

$db      = Database::getInstance();
$code    = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
$expires = date('Y-m-d H:i:s', time() + 86400);

$chars    = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
$plainPwd = '';
for ($i = 0; $i < 10; $i++) $plainPwd .= $chars[random_int(0, strlen($chars) - 1)];
$hash = password_hash($plainPwd, PASSWORD_BCRYPT);

$stmt = $db->prepare('SELECT id, name, email_verified FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();

if ($row) {
    if (!empty($row['email_verified'])) {
        json_error('Этот email уже зарегистрирован. Войдите через меню или нажмите «Забыл пароль».');
    }
    $stmt = $db->prepare('UPDATE users SET password = ?, verify_code = ?, verify_expires = ? WHERE id = ?');
    $stmt->bind_param('sssi', $hash, $code, $expires, $row['id']);
    $stmt->execute();
    $userId   = $row['id'];
    $userName = $row['name'] ?: $name;
} else {
    $stmt = $db->prepare(
        'INSERT INTO users (email, name, password, email_verified, verify_code, verify_expires) VALUES (?, ?, ?, 0, ?, ?)'
    );
    $stmt->bind_param('sssss', $email, $name, $hash, $code, $expires);
    $stmt->execute();
    $userId   = $db->insert_id;
    $userName = $name;
}

$chatService = new ChatService($db);
if (!empty($history)) {
    $chatService->saveBulk($userId, $history);
}

$emailService = new EmailService();
$emailService->sendVerification($email, $code);
$emailService->sendCredentials($email, $plainPwd);

$_SESSION['pending_email'] = $email;

json_success();
