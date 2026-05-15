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

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { echo json_encode(['ok'=>false]); exit; }

$db      = Database::getInstance();
$code    = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
$expires = date('Y-m-d H:i:s', time() + 86400);

$stmt = $db->prepare('UPDATE users SET verify_code=?, verify_expires=? WHERE email=? AND email_verified=0');
$stmt->bind_param('sss', $code, $expires, $email); $stmt->execute(); $stmt->close();

try { (new EmailService())->sendVerification($email, $code); } catch (Throwable $e) {}

echo json_encode(['ok' => true]);
