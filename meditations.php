<?php
session_start();
error_reporting(0); ini_set('display_errors', 0);
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/src/db/Database.php';

if (empty($_SESSION['user_id'])) { header('Location: /'); exit; }

$userId = (int)$_SESSION['user_id'];
$db = Database::getInstance();

$stmt = $db->prepare('SELECT id, title, description, theme, audio_url, cover_url, duration_sec, status FROM meditations WHERE user_id=? ORDER BY created_at DESC');
$stmt->bind_param('i', $userId);
$stmt->execute();
$meditations = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$pageTitle = 'Медитации';
$navActive = 'meditations';
$pageCss   = ['/features/meditations/meditations.css'];
$pageJs    = ['/features/meditations/meditations.js'];

include __DIR__ . '/shared/layout/header.php';
include __DIR__ . '/features/meditations/meditations.page.php';
include __DIR__ . '/shared/layout/bottom-nav.php';
include __DIR__ . '/shared/layout/footer.php';
