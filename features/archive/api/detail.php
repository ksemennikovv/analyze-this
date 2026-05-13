<?php
session_start();
require_once __DIR__ . '/../../../../config/database.php';
require_once __DIR__ . '/../../../../src/db/Database.php';
require_once __DIR__ . '/../../../../src/helpers/response.php';
header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) { json_error('Unauthorized', 401); }
$userId = (int)$_SESSION['user_id'];
$id     = (int)($_GET['id'] ?? 0);
if (!$id) { json_error('Bad request'); }

$db = Database::getInstance();

$stmt = $db->prepare('SELECT id, title, status, practice_num, personal_task FROM analyses WHERE id=? AND user_id=?');
$stmt->bind_param('ii', $id, $userId);
$stmt->execute();
$analysis = $stmt->get_result()->fetch_assoc();
$stmt->close();
if (!$analysis) { json_error('Not found', 404); }

$stmt = $db->prepare('SELECT role, content FROM analysis_messages WHERE analysis_id=? ORDER BY created_at ASC');
$stmt->bind_param('i', $id);
$stmt->execute();
$messages = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

json_success(['analysis' => $analysis, 'messages' => $messages]);
