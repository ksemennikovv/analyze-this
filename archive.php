<?php
session_start();
error_reporting(0); ini_set('display_errors', 0);
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/src/db/Database.php';

if (empty($_SESSION['user_id'])) { header('Location: /'); exit; }

$userId = (int)$_SESSION['user_id'];
$db = Database::getInstance();

$stmt = $db->prepare('SELECT id, title, status, practice_num, created_at FROM analyses WHERE user_id=? ORDER BY created_at DESC');
$stmt->bind_param('i', $userId);
$stmt->execute();
$analyses = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$statusLabels = [
  'draft_started'         => ['В черновике',     'badge-amber'],
  'chat_in_progress'      => ['Разбор идёт',     'badge-amber'],
  'analysis_completed'    => ['Практика ждёт',   'badge-amber'],
  'practice_assigned'     => ['Практика ждёт',   'badge-amber'],
  'practice_completed'    => ['Самоисследование','badge-amber'],
  'reflection_in_progress'=> ['Самоисследование','badge-amber'],
  'completed'             => ['Завершён',         'badge-purple'],
  'abandoned'             => ['Прерван',          'badge-amber'],
];

$pageTitle = 'Разборы';
$navActive = 'archive';
$pageCss   = ['/features/archive/archive.css'];
$pageJs    = ['/features/archive/archive.js'];

include __DIR__ . '/features/header.php';
include __DIR__ . '/features/archive/archive.page.php';
include __DIR__ . '/shared/layout/bottom-nav.php';
include __DIR__ . '/features/footer.php';
