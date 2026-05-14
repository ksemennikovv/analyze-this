<?php
error_reporting(0); ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../src/db/Database.php';

$input      = json_decode(file_get_contents('php://input'), true);
$analysisId = (int)($input['analysis_id'] ?? 0);
$userId     = (int)($_SESSION['user_id'] ?? 0);
if (!$analysisId || !$userId) { echo json_encode(['ok'=>false]); exit; }

$db   = Database::getInstance();
$stmt = $db->prepare("UPDATE analyses SET status='completed', completed_at=NOW() WHERE id=? AND user_id=? AND status='reflection_in_progress'");
$stmt->bind_param('ii', $analysisId, $userId);
$stmt->execute();
echo json_encode(['ok' => $stmt->affected_rows > 0]);
$stmt->close();
