<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

$action = $_POST['action'] ?? '';

/* ---- check session ---- */
if ($action === 'check') {
    if (empty($_SESSION['user_id'])) {
        echo json_encode(['ok' => false]);
        exit;
    }
    $db = db();
    $stmt = $db->prepare('SELECT name, video_url FROM users WHERE id = ?');
    $stmt->bind_param('i', $_SESSION['user_id']);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    echo json_encode([
        'ok'    => true,
        'name'  => $row['name'] ?? $_SESSION['user_name'] ?? '',
        'video' => $row['video_url'] ?? 'videos/practice.mp4',
        'id'    => $_SESSION['user_id'],
    ]);
    exit;
}

/* ---- logout ---- */
if ($action === 'logout') {
    session_destroy();
    echo json_encode(['ok' => true]);
    exit;
}

/* ---- register ---- */
if ($action === 'register') {
    $email = trim($_POST['email'] ?? '');
    $pass  = $_POST['password'] ?? '';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($pass) < 6) {
        echo json_encode(['ok' => false, 'error' => 'Email некорректен или пароль короче 6 символов']);
        exit;
    }

    $db = db();
    if (!$db) { echo json_encode(['ok' => false, 'error' => 'Нет подключения к БД']); exit; }

    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    if (!$stmt) { echo json_encode(['ok' => false, 'error' => 'Таблица users не найдена — запустите schema.sql']); exit; }

    $stmt->bind_param('s', $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        echo json_encode(['ok' => false, 'error' => 'Email уже зарегистрирован']);
        exit;
    }

    $hash = password_hash($pass, PASSWORD_BCRYPT);
    $stmt = $db->prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    $stmt->bind_param('ss', $email, $hash);
    $stmt->execute();

    session_regenerate_id(true);
    $_SESSION['user_id']   = $db->insert_id;
    $_SESSION['user_name'] = '';
    echo json_encode(['ok' => true, 'id' => $_SESSION['user_id'], 'name' => '']);
    exit;
}

/* ---- login ---- */
if ($action === 'login') {
    $email = trim($_POST['email'] ?? '');
    $pass  = $_POST['password'] ?? '';

    $db = db();
    if (!$db) { echo json_encode(['ok' => false, 'error' => 'Нет подключения к БД']); exit; }

    $stmt = $db->prepare('SELECT id, password, name, email_verified FROM users WHERE email = ?');
    if (!$stmt) { echo json_encode(['ok' => false, 'error' => 'Таблица users не найдена — запустите schema.sql']); exit; }

    $stmt->bind_param('s', $email);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if (!$row || !password_verify($pass, $row['password'])) {
        echo json_encode(['ok' => false, 'error' => 'Неверный email или пароль']);
        exit;
    }
    if (empty($row['email_verified'])) {
        echo json_encode(['ok' => false, 'error' => 'Сначала подтвердите email — проверьте письмо с ссылкой']);
        exit;
    }

    session_regenerate_id(true);
    $_SESSION['user_id']   = $row['id'];
    $_SESSION['user_name'] = $row['name'] ?? '';
    echo json_encode(['ok' => true, 'id' => $row['id'], 'name' => $row['name'] ?? '']);
    exit;
}

/* ---- forgot password: send code ---- */
if ($action === 'forgot') {
    $email = trim($_POST['email'] ?? '');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['ok' => false, 'error' => 'Некорректный email']);
        exit;
    }
    $db   = db();
    $stmt = $db->prepare('SELECT id, email_verified FROM users WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $row  = $stmt->get_result()->fetch_assoc();
    if (!$row) {
        echo json_encode(['ok' => false, 'error' => 'Email не найден']);
        exit;
    }
    if (empty($row['email_verified'])) {
        echo json_encode(['ok' => false, 'error' => 'Аккаунт не подтверждён — используйте ссылку из письма о регистрации']);
        exit;
    }
    $code    = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expires = date('Y-m-d H:i:s', time() + 600);
    $stmt = $db->prepare('UPDATE users SET verify_code = ?, verify_expires = ? WHERE id = ?');
    $stmt->bind_param('ssi', $code, $expires, $row['id']);
    $stmt->execute();
    $_SESSION['reset_email'] = $email;
    $subject = 'Сброс пароля — NirvaBody';
    $body    = "Код для сброса пароля: $code\n\nДействителен 10 минут.\n\nЕсли вы не запрашивали сброс — проигнорируйте это письмо.";
    $headers = "From: noreply@inter-removals.com\r\nContent-Type: text/plain; charset=UTF-8";
    mail($email, $subject, $body, $headers);
    echo json_encode(['ok' => true]);
    exit;
}

/* ---- reset password: verify code + set new password ---- */
if ($action === 'reset') {
    $email    = trim($_POST['email']    ?? '');
    $code     = trim($_POST['code']     ?? '');
    $password = trim($_POST['password'] ?? '');
    if (!$email || !$code || strlen($password) < 6) {
        echo json_encode(['ok' => false, 'error' => 'Неверные данные или пароль короче 6 символов']);
        exit;
    }
    $db   = db();
    $stmt = $db->prepare('SELECT id, name, verify_code, verify_expires FROM users WHERE email = ?');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $row  = $stmt->get_result()->fetch_assoc();
    if (!$row || $row['verify_code'] !== $code) {
        echo json_encode(['ok' => false, 'error' => 'Неверный код']);
        exit;
    }
    if (strtotime($row['verify_expires']) < time()) {
        echo json_encode(['ok' => false, 'error' => 'Код истёк — запросите новый']);
        exit;
    }
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
    echo json_encode([
        'ok'    => true,
        'name'  => $row['name'] ?? '',
        'video' => $row2['video_url'] ?? 'videos/practice.mp4',
    ]);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Unknown action']);
