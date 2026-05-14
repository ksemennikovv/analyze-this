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
$content    = trim($input['content'] ?? '');
$userId     = (int)($_SESSION['user_id'] ?? 0);
if (!$analysisId || !$content || !$userId) { echo json_encode(['ok'=>false,'error'=>'invalid']); exit; }

$db = Database::getInstance();

// Load reflection history (messages after [REFLECTION_START])
$stmt = $db->prepare('SELECT id, role, content FROM analysis_messages WHERE analysis_id=? ORDER BY created_at ASC');
$stmt->bind_param('i', $analysisId);
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->free_result(); $stmt->close();

$history = [];
$inReflection = false;
foreach ($rows as $r) {
    if ($r['role'] === 'system' && $r['content'] === '[REFLECTION_START]') { $inReflection = true; continue; }
    if ($inReflection && in_array($r['role'], ['user','assistant'])) {
        $history[] = ['role' => $r['role'], 'content' => $r['content']];
    }
}

// Save user message
$stmt = $db->prepare('INSERT INTO analysis_messages (analysis_id, user_id, role, content) VALUES (?,?,"user",?)');
$stmt->bind_param('iis', $analysisId, $userId, $content);
$stmt->execute(); $stmt->close();

$history[] = ['role' => 'user', 'content' => $content];

$systemPrompt = file_get_contents(__DIR__ . '/../../../storage/prompts/reflection-prompt.txt') ?: 'Ты — эмпатичный психолог сервиса Nirva AI. Помоги пользователю осмыслить опыт после телесной практики.';

$claude = new ClaudeService();
$reply  = $claude->chat($systemPrompt, $history);

if ($reply) {
    $stmt = $db->prepare('INSERT INTO analysis_messages (analysis_id, user_id, role, content) VALUES (?,?,"assistant",?)');
    $stmt->bind_param('iis', $analysisId, $userId, $reply);
    $stmt->execute(); $stmt->close();
}

echo json_encode(['ok'=>true, 'reply'=>$reply]);
