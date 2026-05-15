<?php
error_reporting(0); ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../../../../config/database.php';
require_once __DIR__ . '/../../../../../config/ai.php';
require_once __DIR__ . '/../../../../../src/db/Database.php';

$input      = json_decode(file_get_contents('php://input'), true);
$firstMsg   = trim($input['first_message'] ?? '');

$db     = Database::getInstance();
$userId = $_SESSION['user_id'] ?? $_SESSION['guest_user_id'] ?? null;

if (!$userId) {
    $guestEmail = 'guest_' . bin2hex(random_bytes(8)) . '@nirva.ai';
    $guestPass  = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);
    $sg = $db->prepare('INSERT INTO users (email, password, email_verified) VALUES (?, ?, 0)');
    $sg->bind_param('ss', $guestEmail, $guestPass);
    $sg->execute();
    $userId = (int)$db->insert_id;
    $sg->close();
    if ($userId) $_SESSION['guest_user_id'] = $userId;
}
$uid = (int)$userId;

$stmt = $db->prepare('INSERT INTO analyses (user_id, title, status) VALUES (?, ?, ?)');
$title  = $firstMsg ? mb_substr($firstMsg, 0, 60) : 'Новый разбор';
$status = $firstMsg ? 'chat_in_progress' : 'draft_started';
$stmt->bind_param('iss', $uid, $title, $status);
$stmt->execute();
$analysisId = $db->insert_id;
$stmt->close();

if (empty($_SESSION['user_id'])) {
    $_SESSION['guest_analysis_id']    = $analysisId;
    $_SESSION['guest_analysis_title'] = $title;
}

$systemPrompt = file_get_contents(__DIR__ . '/../../../../../prompts/analysis-prompt.txt')
    ?: "Ты — психолог-аналитик в сервисе Nirva AI. Помогаешь пользователю разобраться в его эмоциональном состоянии через диалог. Задавай уточняющие вопросы, слушай внимательно. После глубокого разбора (5-10 сообщений) подбери персональную телесную практику и мягко предложи зарегистрироваться.";

$messages = [];
if ($firstMsg) {
    $messages[] = ['role' => 'user', 'content' => $firstMsg];
    $stmt = $db->prepare('INSERT INTO analysis_messages (analysis_id, user_id, role, content) VALUES (?, ?, ?, ?)');
    $role = 'user';
    $stmt->bind_param('iiss', $analysisId, $uid, $role, $firstMsg);
    $stmt->execute(); $stmt->close();
}

require_once __DIR__ . '/../../../../../src/services/AiService.php';
$ai      = new AiService();
$aiInput = $messages ?: [['role' => 'user', 'content' => 'Начни диалог — поздоровайся и спроси о состоянии']];
$reply   = $ai->chat($systemPrompt, $aiInput);

if ($reply) {
    $stmt = $db->prepare('INSERT INTO analysis_messages (analysis_id, user_id, role, content) VALUES (?, ?, ?, ?)');
    $role = 'assistant';
    $stmt->bind_param('iiss', $analysisId, $uid, $role, $reply);
    $stmt->execute(); $stmt->close();
}

echo json_encode([
    'ok'          => true,
    'analysis_id' => $analysisId,
    'title'       => $title,
    'reply'       => $reply ?: 'Привет! Расскажи, что тебя беспокоит прямо сейчас?'
]);
