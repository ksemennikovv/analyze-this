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
$userId     = $_SESSION['user_id'] ?? 0;

if (!$analysisId || !$content) { echo json_encode(['ok'=>false,'error'=>'invalid']); exit; }

$db = Database::getInstance();

// Load history
$stmt = $db->prepare('SELECT role, content FROM analysis_messages WHERE analysis_id = ? ORDER BY created_at ASC');
$stmt->bind_param('i', $analysisId);
$stmt->execute();
$result = $stmt->get_result();
$history = [];
while ($row = $result->fetch_assoc()) {
    if (in_array($row['role'], ['user','assistant'])) {
        $history[] = ['role' => $row['role'], 'content' => $row['content']];
    }
}
$result->free(); $stmt->close();

// Save user message
$stmt = $db->prepare('INSERT INTO analysis_messages (analysis_id, user_id, role, content) VALUES (?, ?, ?, ?)');
$role = 'user';
$stmt->bind_param('iiss', $analysisId, $userId, $role, $content);
$stmt->execute(); $stmt->close();

$history[] = ['role' => 'user', 'content' => $content];

// System prompt
$systemPrompt = file_get_contents(__DIR__ . '/../../../storage/prompts/analysis-prompt.txt') ?: "Ты — психолог-аналитик сервиса Nirva AI. Ведёшь глубокий диалог о психологическом состоянии. Задавай уточняющие вопросы. После достаточного разбора (минимум 5 обменов) сообщи что подобрал практику и предложи ввести email. В конце своего ПОСЛЕДНЕГО сообщения добавь скрытый сигнал: [PRACTICE_SELECTED:N] где N — номер практики 1-20.";

$claude = new ClaudeService();
$reply  = $claude->chat($systemPrompt, $history);

$completed = false;
$practiceNum = null;

// Check for completion signal
if ($reply && preg_match('/\[PRACTICE_SELECTED:(\d+)\]/i', $reply, $m)) {
    $practiceNum = (int)$m[1];
    $reply = trim(preg_replace('/\[PRACTICE_SELECTED:\d+\]/i', '', $reply));
    $completed = true;

    // Update analysis
    $stmt = $db->prepare('UPDATE analyses SET status=?, practice_num=? WHERE id=?');
    $s = 'practice_pending';
    $stmt->bind_param('sii', $s, $practiceNum, $analysisId);
    $stmt->execute(); $stmt->close();

    // Store in session for registration gate
    $_SESSION['show_gate']     = true;
    $_SESSION['practice_num']  = $practiceNum;
    $_SESSION['practice_name'] = 'Состояние Изобилия и уверенности';
}

// Save assistant reply
if ($reply) {
    $stmt = $db->prepare('INSERT INTO analysis_messages (analysis_id, user_id, role, content) VALUES (?, ?, ?, ?)');
    $r = 'assistant';
    $stmt->bind_param('iiss', $analysisId, $userId, $r, $reply);
    $stmt->execute(); $stmt->close();
}

echo json_encode([
    'ok'          => true,
    'reply'       => $reply,
    'completed'   => $completed,
    'practice_num'=> $practiceNum
]);
