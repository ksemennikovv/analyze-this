<?php
error_reporting(0); ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/src/db/Database.php';

if (empty($_SESSION['user_id'])) {
    header('Location: /'); exit;
}

$userId   = (int)$_SESSION['user_id'];
$userName = $_SESSION['user_name'] ?? '';

$db = Database::getInstance();

// Get active/last analysis
$stmt = $db->prepare('SELECT id, title, status, practice_num, personal_task, created_at FROM analyses WHERE user_id=? ORDER BY created_at DESC LIMIT 5');
$stmt->bind_param('i', $userId);
$stmt->execute();
$result   = $stmt->get_result();
$analyses = $result->fetch_all(MYSQLI_ASSOC);
$result->free(); $stmt->close();

$currentAnalysis = $analyses[0] ?? null;

$statusLabels = [
  'draft_started'         => ['В черновике',     'badge-amber'],
  'chat_in_progress'      => ['В разборе',       'badge-amber'],
  'analysis_completed'    => ['Практика ждёт',   'badge-amber'],
  'practice_assigned'     => ['Практика ждёт',   'badge-amber'],
  'practice_completed'    => ['Самоисследование','badge-amber'],
  'reflection_in_progress'=> ['Самоисследование','badge-amber'],
  'completed'             => ['Завершён',         'badge-purple'],
  'abandoned'             => ['Прерван',          'badge-amber'],
];

$pageTitle = 'Главная';
$navActive = 'home';
$pageCss   = ['/features/dashboard/dashboard.css'];
$pageJs    = ['/features/dashboard/dashboard.js'];

include __DIR__ . '/shared/layout/header.php';
include __DIR__ . '/features/dashboard/dashboard.page.php';
include __DIR__ . '/shared/layout/bottom-nav.php';
include __DIR__ . '/shared/layout/footer.php';
