<?php
error_reporting(0); ini_set('display_errors', 0);
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../../../../config/database.php';
require_once __DIR__ . '/../../../../../src/db/Database.php';

$userId = $_SESSION['user_id'] ?? $_SESSION['guest_user_id'] ?? null;
if (!$userId) { echo json_encode(['ok'=>false,'error'=>'Не авторизован']); exit; }

$db  = Database::getInstance();
$uid = (int)$userId;

$analysisId = (int)($_SESSION['guest_analysis_id'] ?? 0);
if ($analysisId) {
    $stmt = $db->prepare('DELETE FROM analysis_messages WHERE analysis_id=?');
    $stmt->bind_param('i', $analysisId); $stmt->execute(); $stmt->close();
    $stmt = $db->prepare('DELETE FROM analyses WHERE id=? AND user_id=?');
    $stmt->bind_param('ii', $analysisId, $uid); $stmt->execute(); $stmt->close();
}

unset($_SESSION['guest_analysis_id'], $_SESSION['guest_analysis_title']);
echo json_encode(['ok' => true]);
