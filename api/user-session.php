<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../src/db/Database.php';
require_once __DIR__ . '/../src/helpers/response.php';

header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) {
    json_success(['loggedIn' => false]);
}

$db   = Database::getInstance();
$stmt = $db->prepare('SELECT id, name, email, video_url FROM users WHERE id = ?');
$stmt->bind_param('i', $_SESSION['user_id']);
$stmt->execute();
$row  = $stmt->get_result()->fetch_assoc();

if (!$row) {
    session_destroy();
    json_success(['loggedIn' => false]);
}

json_success([
    'loggedIn' => true,
    'id'       => $row['id'],
    'name'     => $row['name'] ?? '',
    'email'    => $row['email'],
    'video'    => $row['video_url'] ?? 'videos/practice.mp4',
]);
