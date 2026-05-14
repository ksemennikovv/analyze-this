<?php
error_reporting(0); ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/ai.php';
require_once __DIR__ . '/../../../src/db/Database.php';
require_once __DIR__ . '/../../../src/services/ClaudeService.php';

$input      = json_decode(file_get_contents('php://input'), true);
$analysisId = (int)($input['analysis_id'] ?? 0);
$userId     = (int)($_SESSION['user_id'] ?? 0);
if (!$analysisId || !$userId) { echo json_encode(['ok'=>false]); exit; }

$db   = Database::getInstance();

// Verify ownership and status
$stmt = $db->prepare("SELECT id, summary, personal_task FROM analyses WHERE id=? AND user_id=? AND status='practice_completed'");
$stmt->bind_param('ii', $analysisId, $userId);
$stmt->execute();
$analysis = $stmt->get_result()->fetch_assoc();
$stmt->close();
if (!$analysis) { echo json_encode(['ok'=>false,'error'=>'not_found']); exit; }

// Insert REFLECTION_START marker
$stmt = $db->prepare('INSERT INTO analysis_messages (analysis_id, user_id, role, content) VALUES (?,?,"system","[REFLECTION_START]")');
$stmt->bind_param('ii', $analysisId, $userId);
$stmt->execute(); $stmt->close();

// Build context for AI
$systemPrompt = file_get_contents(__DIR__ . '/../../../storage/prompts/reflection-prompt.txt') ?: 'Ты — эмпатичный психолог сервиса Nirva AI. Помоги пользователю осмыслить опыт после телесной практики. Задавай вопросы о телесных ощущениях, изменениях в состоянии. Веди диалог 5-7 сообщений.';

$context = '';
if ($analysis['summary'])       $context .= 'Итоги разбора: ' . $analysis['summary'] . "\n";
if ($analysis['personal_task']) $context .= 'Практика: ' . $analysis['personal_task'] . "\n";
$systemPrompt .= $context ? "\n\nКонтекст разбора:\n" . $context : '';

$claude = new ClaudeService();
$reply  = $claude->chat($systemPrompt, []);

if ($reply) {
    $stmt = $db->prepare('INSERT INTO analysis_messages (analysis_id, user_id, role, content) VALUES (?,?,"assistant",?)');
    $stmt->bind_param('iis', $analysisId, $userId, $reply);
    $stmt->execute(); $stmt->close();
}

$stmt = $db->prepare("UPDATE analyses SET status='reflection_in_progress' WHERE id=?");
$stmt->bind_param('i', $analysisId);
$stmt->execute(); $stmt->close();

echo json_encode(['ok'=>true, 'reply'=>$reply]);
