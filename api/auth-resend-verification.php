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

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? $_SESSION['pending_email'] ?? '');

if (!validate_email($email)) { json_error('Некорректный email'); }

$db   = Database::getInstance();
$stmt = $db->prepare('SELECT id, email_verified FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$row  = $stmt->get_result()->fetch_assoc();

if (!$row) { json_error('Email не найден'); }
if (!empty($row['email_verified'])) { json_error('Email уже подтверждён'); }

$code    = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
$expires = date('Y-m-d H:i:s', time() + 86400);
$stmt    = $db->prepare('UPDATE users SET verify_code = ?, verify_expires = ? WHERE id = ?');
$stmt->bind_param('ssi', $code, $expires, $row['id']);
$stmt->execute();

(new EmailService())->sendVerification($email, $code);

json_success();
