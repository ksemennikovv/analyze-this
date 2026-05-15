<?php
error_reporting(0); ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../../../../config/database.php';
require_once __DIR__ . '/../../../../../config/app.php';
require_once __DIR__ . '/../../../../../config/mail.php';
require_once __DIR__ . '/../../../../../src/db/Database.php';
require_once __DIR__ . '/../../../../../src/services/EmailService.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['ok' => false, 'error' => 'Некорректный email']); exit;
}

$db      = Database::getInstance();
$code    = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
$expires = date('Y-m-d H:i:s', time() + 86400);
$chars   = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
$pwd     = '';
for ($i = 0; $i < 10; $i++) $pwd .= $chars[random_int(0, strlen($chars) - 1)];
$hash    = password_hash($pwd, PASSWORD_BCRYPT);

$stmt = $db->prepare('SELECT id, email_verified FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$row    = $result->fetch_assoc();
$result->free(); $stmt->close();

$guestUserId = (int)($_SESSION['guest_user_id'] ?? 0);

if ($row) {
    if (!empty($row['email_verified'])) {
        echo json_encode(['ok' => false, 'error' => 'Этот email уже зарегистрирован']); exit;
    }
    $stmt = $db->prepare('UPDATE users SET `password`=?, verify_code=?, verify_expires=? WHERE id=?');
    $stmt->bind_param('sssi', $hash, $code, $expires, $row['id']);
    $stmt->execute(); $stmt->close();
    $userId = $row['id'];
} elseif ($guestUserId) {
    $stmt = $db->prepare('UPDATE users SET email=?, `password`=?, verify_code=?, verify_expires=? WHERE id=?');
    $stmt->bind_param('ssssi', $email, $hash, $code, $expires, $guestUserId);
    $stmt->execute(); $stmt->close();
    $userId = $guestUserId;
} else {
    $stmt = $db->prepare('INSERT INTO users (email, `password`, email_verified, verify_code, verify_expires) VALUES (?,?,0,?,?)');
    $stmt->bind_param('ssss', $email, $hash, $code, $expires);
    $stmt->execute();
    $userId = $db->insert_id;
    $stmt->close();
}

$_SESSION['pending_email'] = $email;

try { (new EmailService())->sendVerification($email, $code); (new EmailService())->sendCredentials($email, $pwd); } catch (Throwable $e) {}

echo json_encode(['ok' => true]);
