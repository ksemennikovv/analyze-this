<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$input    = json_decode(file_get_contents('php://input'), true);
$email    = trim($input['email']    ?? '');
$name     = trim($input['name']     ?? '');
$password = trim($input['password'] ?? '');
$history  = $input['history'] ?? [];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['ok' => false, 'error' => 'Некорректный email']);
    exit;
}
if (strlen($password) < 6) {
    echo json_encode(['ok' => false, 'error' => 'Пароль должен быть не менее 6 символов']);
    exit;
}

$db      = db();
$code    = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
$expires = date('Y-m-d H:i:s', time() + 600);
$hash    = password_hash($password, PASSWORD_BCRYPT);

$stmt = $db->prepare('SELECT id, name, email_verified FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();

if ($row) {
    if ((int)$row['email_verified'] === 1) {
        echo json_encode([
            'ok'    => false,
            'error' => 'Этот email уже зарегистрирован. Войдите через меню или нажмите «Забыл пароль».',
        ]);
        exit;
    }
    /* not yet verified — allow resend with new password */
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

if (!empty($history)) {
    $_SESSION['pending_history'] = $history;
    $_SESSION['pending_uid']     = $userId;
}
$_SESSION['pending_email'] = $email;

$subject = 'Ваш код подтверждения — NirvaBody';
$body    = "Код подтверждения: $code\n\nДействителен 10 минут.\n\nЕсли вы не запрашивали код — проигнорируйте это письмо.";
$headers = "From: noreply@inter-removals.com\r\nContent-Type: text/plain; charset=UTF-8";
mail($email, $subject, $body, $headers);

echo json_encode(['ok' => true]);
