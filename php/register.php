<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$input   = json_decode(file_get_contents('php://input'), true);
$email   = trim($input['email']   ?? '');
$name    = trim($input['name']    ?? '');
$history = $input['history'] ?? [];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['ok' => false, 'error' => 'Некорректный email']);
    exit;
}

$db      = db();
$code    = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
$expires = date('Y-m-d H:i:s', time() + 86400); /* 24 hours */

/* generate secure password */
$chars    = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
$plainPwd = '';
for ($i = 0; $i < 10; $i++) $plainPwd .= $chars[random_int(0, strlen($chars) - 1)];
$hash = password_hash($plainPwd, PASSWORD_BCRYPT);

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

/* save chat history directly to DB */
if (!empty($history)) {
    $ins = $db->prepare('INSERT IGNORE INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)');
    foreach ($history as $m) {
        if (isset($m['role'], $m['content']) && in_array($m['role'], ['user', 'assistant'], true)) {
            $ins->bind_param('iss', $userId, $m['role'], $m['content']);
            $ins->execute();
        }
    }
}

$siteUrl    = 'https://analyze.inter-removals.com';
$confirmUrl = $siteUrl . '/confirm.php?code=' . $code . '&email=' . urlencode($email);

/* Email 1 — confirmation link */
$subject1 = 'Подтвердите регистрацию — NirvaBody';
$body1    = "Здравствуйте!\n\nДля подтверждения регистрации перейдите по ссылке:\n$confirmUrl\n\nСсылка действительна 24 часа.\n\nЕсли вы не регистрировались — проигнорируйте это письмо.";
$headers1 = "From: noreply@inter-removals.com\r\nContent-Type: text/plain; charset=UTF-8";
mail($email, $subject1, $body1, $headers1);

/* Email 2 — credentials */
$subject2 = 'Ваши данные для входа — NirvaBody';
$body2    = "Здравствуйте!\n\nВаши данные для входа:\nЛогин: $email\nПароль: $plainPwd\n\nВойти можно через меню на сайте:\n$siteUrl\n\nРекомендуем сохранить эти данные.";
$headers2 = "From: noreply@inter-removals.com\r\nContent-Type: text/plain; charset=UTF-8";
mail($email, $subject2, $body2, $headers2);

$_SESSION['pending_email'] = $email;

echo json_encode(['ok' => true]);
