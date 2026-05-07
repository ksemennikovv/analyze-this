<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../src/db/Database.php';
require_once __DIR__ . '/../src/helpers/response.php';
require_once __DIR__ . '/../src/helpers/security.php';

header('Content-Type: application/json');

$user = require_auth_json();

$db   = Database::getInstance();
$stmt = $db->prepare(
    'SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC'
);
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

json_success(['messages' => $rows]);
