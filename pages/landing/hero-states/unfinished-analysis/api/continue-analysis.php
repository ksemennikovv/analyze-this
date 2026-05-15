<?php
error_reporting(0); ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../../../../config/database.php';
require_once __DIR__ . '/../../../../../src/db/Database.php';

$analysisId = (int)($_GET['analysis_id'] ?? 0);
if (!$analysisId) { echo json_encode(['ok'=>false]); exit; }

$db   = Database::getInstance();
$stmt = $db->prepare('SELECT role, content FROM analysis_messages WHERE analysis_id = ? AND role IN (?,?) ORDER BY created_at ASC');
$r1 = 'user'; $r2 = 'assistant';
$stmt->bind_param('iss', $analysisId, $r1, $r2);
$stmt->execute();
$result   = $stmt->get_result();
$messages = $result->fetch_all(MYSQLI_ASSOC);
$result->free(); $stmt->close();

echo json_encode(['ok' => true, 'messages' => $messages]);
