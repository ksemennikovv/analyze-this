<?php
error_reporting(0); ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../src/db/Database.php';

$analysisId = (int)($_GET['analysis_id'] ?? 0);
$userId     = (int)($_SESSION['user_id'] ?? 0);
if (!$analysisId || !$userId) { echo json_encode(['ok'=>false]); exit; }

$db   = Database::getInstance();
$stmt = $db->prepare('SELECT role, content FROM analysis_messages WHERE analysis_id=? ORDER BY created_at ASC');
$stmt->bind_param('i', $analysisId);
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$messages = [];
$inReflection = false;
foreach ($rows as $r) {
    if ($r['role'] === 'system' && $r['content'] === '[REFLECTION_START]') { $inReflection = true; continue; }
    if ($inReflection && in_array($r['role'], ['user','assistant'])) {
        $messages[] = $r;
    }
}

echo json_encode(['ok'=>true, 'messages'=>$messages]);
