<?php
error_reporting(0); ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/ai.php';
require_once __DIR__ . '/../../../src/db/Database.php';

$input      = json_decode(file_get_contents('php://input'), true);
$analysisId = (int)($input['analysis_id'] ?? 0);
$content    = trim($input['content'] ?? '');

$userId = (int)(($_SESSION['user_id'] ?? $_SESSION['guest_user_id'] ?? 0));

if (!$analysisId || !$content || !$userId) {
    echo json_encode(['ok' => false, 'error' => 'Неверные параметры']); exit;
}

$db = Database::getInstance();

$stmt = $db->prepare('INSERT INTO analysis_messages (analysis_id, user_id, role, content) VALUES (?, ?, ?, ?)');
$role = 'user';
$stmt->bind_param('iiss', $analysisId, $userId, $role, $content);
$stmt->execute(); $stmt->close();

$stmt = $db->prepare('SELECT role, content FROM analysis_messages WHERE analysis_id=? AND role IN (?,?) ORDER BY created_at ASC');
$r1 = 'user'; $r2 = 'assistant';
$stmt->bind_param('iss', $analysisId, $r1, $r2);
$stmt->execute();
$result  = $stmt->get_result();
$history = $result->fetch_all(MYSQLI_ASSOC);
$result->free(); $stmt->close();

$systemPrompt = file_get_contents(__DIR__ . '/../../../prompts/analysis-prompt.txt')
    ?: "Ты — психолог-аналитик в сервисе Nirva AI. Помогаешь пользователю разобраться в его эмоциональном состоянии через диалог. Задавай уточняющие вопросы, слушай внимательно. После глубокого разбора (5-10 сообщений) подбери персональную телесную практику.";

require_once __DIR__ . '/../../../src/services/AiService.php';
$ai    = new AiService();
$reply = $ai->chat($systemPrompt, $history);

$completed    = false;
$practiceNum  = null;
$personalTask = null;

if ($reply) {
    $stmt = $db->prepare('INSERT INTO analysis_messages (analysis_id, user_id, role, content) VALUES (?, ?, ?, ?)');
    $role = 'assistant';
    $stmt->bind_param('iiss', $analysisId, $userId, $role, $reply);
    $stmt->execute(); $stmt->close();

    if (preg_match('/\[PRACTICE_(\d+)\]/', $reply, $m)) {
        $practiceNum  = (int)$m[1];
        $personalTask = 'Телесная практика №' . $practiceNum;
        $completed    = true;

        $stmt = $db->prepare("UPDATE analyses SET status='completed', practice_num=?, personal_task=? WHERE id=?");
        $stmt->bind_param('isi', $practiceNum, $personalTask, $analysisId);
        $stmt->execute(); $stmt->close();
    }
}

echo json_encode([
    'ok'           => true,
    'reply'        => $reply,
    'completed'    => $completed,
    'practice_num' => $practiceNum,
    'personal_task'=> $personalTask,
]);
