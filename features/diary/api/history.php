<?php
session_start();
require_once __DIR__ . '/../../../../config/database.php';
require_once __DIR__ . '/../../../../src/db/Database.php';
require_once __DIR__ . '/../../../../src/helpers/response.php';
header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) { json_error('Unauthorized', 401); }
$userId  = (int)$_SESSION['user_id'];
$entryId = (int)($_GET['id'] ?? 0);
if (!$entryId) { json_error('Bad request'); }

$db = Database::getInstance();

$stmt = $db->prepare('SELECT id FROM diary_entries WHERE id=? AND user_id=?');
$stmt->bind_param('ii', $entryId, $userId);
$stmt->execute();
if (!$stmt->get_result()->fetch_assoc()) { json_error('Not found', 404); }
$stmt->close();

$stmt = $db->prepare('SELECT role, content FROM diary_messages WHERE entry_id=? ORDER BY created_at ASC');
$stmt->bind_param('i', $entryId);
$stmt->execute();
$messages = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

json_success(['messages' => $messages]);
