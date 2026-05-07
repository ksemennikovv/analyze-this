<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../src/db/Database.php';
require_once __DIR__ . '/../src/helpers/response.php';
require_once __DIR__ . '/../src/helpers/validation.php';

header('Content-Type: application/json');

$email = trim($_POST['email'] ?? '');
$pass  = $_POST['password'] ?? '';

$db   = Database::getInstance();
$stmt = $db->prepare('SELECT id, password, name, email_verified FROM users WHERE email = ?');
if (!$stmt) { json_error('Таблица users не найдена — запустите schema.sql'); }

$stmt->bind_param('s', $email);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();

if (!$row || !password_verify($pass, $row['password'])) {
    json_error('Неверный email или пароль');
}
if (empty($row['email_verified'])) {
    json_error('Сначала подтвердите email — проверьте письмо');
}

session_regenerate_id(true);
$_SESSION['user_id']   = $row['id'];
$_SESSION['user_name'] = $row['name'] ?? '';

json_success(['id' => $row['id'], 'name' => $row['name'] ?? '']);
