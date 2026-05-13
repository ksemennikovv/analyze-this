<?php
session_start();
require_once __DIR__ . '/../../../../config/database.php';
require_once __DIR__ . '/../../../../config/app.php';
require_once __DIR__ . '/../../../../config/ai.php';
require_once __DIR__ . '/../../../../src/db/Database.php';
require_once __DIR__ . '/../../../../src/helpers/response.php';
require_once __DIR__ . '/../../../../src/services/ClaudeService.php';
header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) { json_error('Unauthorized', 401); }
$userId  = (int)$_SESSION['user_id'];
$input   = json_decode(file_get_contents('php://input'), true);
$entryId = (int)($input['entry_id'] ?? 0);
$message = trim($input['message'] ?? '');
if (!$entryId || !$message) { json_error('Bad request'); }

$db = Database::getInstance();

$stmt = $db->prepare('SELECT id, title FROM diary_entries WHERE id=? AND user_id=?');
$stmt->bind_param('ii', $entryId, $userId);
$stmt->execute();
$entry = $stmt->get_result()->fetch_assoc();
$stmt->close();
if (!$entry) { json_error('Not found', 404); }

$stmt = $db->prepare('SELECT role, content FROM diary_messages WHERE entry_id=? ORDER BY created_at ASC');
$stmt->bind_param('i', $entryId);
$stmt->execute();
$history = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$messages   = array_values(array_filter($history, function ($m) { return in_array($m['role'], ['user','assistant']); }));
$messages[] = ['role' => 'user', 'content' => $message];

$system = "Ты эмпатичный помощник дневника. Помогаешь пользователю осмыслить мысли и чувства. Задавай мягкие открытые вопросы. Отвечай на русском языке. Ответ — 1-3 предложения.";
$claude = new ClaudeService();
$reply  = $claude->chat($system, $messages) ?? 'Расскажите подробнее?';

$stmt = $db->prepare('INSERT INTO diary_messages (entry_id, user_id, role, content) VALUES (?, ?, ?, ?)');
$ru = 'user';
$stmt->bind_param('iiss', $entryId, $userId, $ru, $message);
$stmt->execute();
$ra = 'assistant';
$stmt->bind_param('iiss', $entryId, $userId, $ra, $reply);
$stmt->execute();
$stmt->close();

// Update title from first real user message
if (count($history) <= 1 && ($entry['title'] === 'Запись дневника')) {
    $newTitle = mb_substr($message, 0, 80);
    $stmt = $db->prepare('UPDATE diary_entries SET title=? WHERE id=?');
    $stmt->bind_param('si', $newTitle, $entryId);
    $stmt->execute();
    $stmt->close();
}

json_success(['reply' => $reply]);
