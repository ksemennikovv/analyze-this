<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/ai.php';
require_once __DIR__ . '/../src/db/Database.php';
require_once __DIR__ . '/../src/services/AiService.php';
require_once __DIR__ . '/../src/services/PromptService.php';

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['messages'])) {
    header('Content-Type: text/event-stream');
    echo "data: [DONE]\n\n";
    exit;
}

$messages = [];
foreach ($input['messages'] as $m) {
    if (isset($m['role'], $m['content']) && in_array($m['role'], ['user', 'assistant'], true)) {
        $messages[] = ['role' => $m['role'], 'content' => (string) $m['content']];
    }
}

if (empty($messages)) {
    header('Content-Type: text/event-stream');
    echo "data: [DONE]\n\n";
    exit;
}

$promptService = new PromptService();
$system        = $promptService->analysis();

(new AiService())->streamAnalysis($messages, $system);
