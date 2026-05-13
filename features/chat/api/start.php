<?php
error_reporting(0); ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/ai.php';
require_once __DIR__ . '/../../../src/db/Database.php';

$input      = json_decode(file_get_contents('php://input'), true);
$firstMsg   = trim($input['first_message'] ?? '');

$db     = Database::getInstance();
$userId = $_SESSION['user_id'] ?? null;

// Create analysis record
$stmt = $db->prepare('INSERT INTO analyses (user_id, title, status) VALUES (?, ?, ?)');
$title = $firstMsg ? mb_substr($firstMsg, 0, 60) : 'Новый разбор';
$status = 'in_chat';
$uid = $userId ?: 0;
$stmt->bind_param('iss', $uid, $title, $status);
$stmt->execute();
$analysisId = $db->insert_id;
$stmt->close();

// Store in session for guests
if (!$userId) {
    $_SESSION['guest_analysis_id']    = $analysisId;
    $_SESSION['guest_analysis_title'] = $title;
}

// Build system prompt
$systemPrompt = file_get_contents(__DIR__ . '/../../../storage/prompts/analysis-prompt.txt') ?: "Ты — психолог-аналитик в сервисе Nirva AI. Помогаешь пользователю разобраться в его эмоциональном состоянии через диалог. Задавай уточняющие вопросы, слушай внимательно. После глубокого разбора (5-10 сообщений) подбери персональную телесную практику и мягко предложи зарегистрироваться.";

// Messages to send to Claude
$messages = [];
if ($firstMsg) {
    $messages[] = ['role' => 'user', 'content' => $firstMsg];
    // Save user message
    $stmt = $db->prepare('INSERT INTO analysis_messages (analysis_id, user_id, role, content) VALUES (?, ?, ?, ?)');
    $role = 'user';
    $stmt->bind_param('iiss', $analysisId, $uid, $role, $firstMsg);
    $stmt->execute(); $stmt->close();
}

// Get AI reply
require_once __DIR__ . '/../../../src/services/ClaudeService.php';
$claude = new ClaudeService();
$reply  = $claude->chat($systemPrompt, $messages);

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
