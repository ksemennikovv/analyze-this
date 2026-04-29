<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

$action = $_POST['action'] ?? '';

/* ---- check session ---- */
if ($action === 'check') {
    echo json_encode([
        'ok'   => !empty($_SESSION['user_id']),
        'name' => $_SESSION['user_name'] ?? '',
        'id'   => $_SESSION['user_id'] ?? null,
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

    $stmt = $db->prepare('SELECT id, password, name FROM users WHERE email = ?');
    if (!$stmt) { echo json_encode(['ok' => false, 'error' => 'Таблица users не найдена — запустите schema.sql']); exit; }

    $stmt->bind_param('s', $email);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if (!$row || !password_verify($pass, $row['password'])) {
        echo json_encode(['ok' => false, 'error' => 'Неверный email или пароль']);
        exit;
    }

    session_regenerate_id(true);
    $_SESSION['user_id']   = $row['id'];
    $_SESSION['user_name'] = $row['name'] ?? '';
    echo json_encode(['ok' => true, 'id' => $row['id'], 'name' => $row['name'] ?? '']);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Unknown action']);
