<?php
error_reporting(0); ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../src/db/Database.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$code  = trim($input['code']  ?? '');

if (!$email || strlen($code) !== 6) { echo json_encode(['ok' => false, 'error' => 'Неверные данные']); exit; }

$db   = Database::getInstance();
$stmt = $db->prepare('SELECT id, name, verify_code, verify_expires FROM users WHERE email=?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$row    = $result->fetch_assoc();
$result->free(); $stmt->close();

if (!$row)                                         { echo json_encode(['ok'=>false,'error'=>'Пользователь не найден']); exit; }
if ($row['verify_code'] !== $code)                 { echo json_encode(['ok'=>false,'error'=>'Неверный код']); exit; }
if (strtotime($row['verify_expires']) < time())    { echo json_encode(['ok'=>false,'error'=>'Код истёк — запросите новый']); exit; }

$stmt = $db->prepare('UPDATE users SET email_verified=1, verify_code=NULL, verify_expires=NULL WHERE id=?');
$stmt->bind_param('i', $row['id']); $stmt->execute(); $stmt->close();

session_regenerate_id(true);
$_SESSION['user_id']   = $row['id'];
$_SESSION['user_name'] = $row['name'] ?? '';

echo json_encode(['ok' => true, 'name' => $row['name'] ?? '']);
