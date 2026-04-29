<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$userId = (int)$_SESSION['user_id'];
$db     = db();

/* ---- GET: load history ---- */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->prepare(
        'SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC'
    );
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['ok' => true, 'messages' => $rows]);
    exit;
}

/* ---- POST: save one message ---- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $role  = $input['role']    ?? '';
    $text  = $input['content'] ?? '';

    if (!in_array($role, ['user', 'assistant'], true) || $text === '') {
        echo json_encode(['ok' => false, 'error' => 'Invalid data']);
        exit;
    }

    $stmt = $db->prepare(
        'INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)'
    );
    $stmt->bind_param('iss', $userId, $role, $text);
    $stmt->execute();
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
