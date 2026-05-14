<?php
session_start();
error_reporting(0); ini_set('display_errors', 0);
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/src/db/Database.php';

if (empty($_SESSION['user_id'])) { header('Location: /'); exit; }

$userId     = (int)$_SESSION['user_id'];
$analysisId = (int)($_GET['id'] ?? 0);
if (!$analysisId) { header('Location: /archive.php'); exit; }

$db = Database::getInstance();

$stmt = $db->prepare('SELECT id, title, status, practice_num, personal_task, summary, created_at FROM analyses WHERE id=? AND user_id=?');
$stmt->bind_param('ii', $analysisId, $userId);
$stmt->execute();
$analysis = $stmt->get_result()->fetch_assoc();
$stmt->close();
if (!$analysis) { header('Location: /archive.php'); exit; }

$meditations = [];
if ($analysis['status'] === 'completed') {
    $stmt = $db->prepare('SELECT id, title, theme, audio_url, cover_url, duration_sec, status FROM meditations WHERE analysis_id=? AND user_id=?');
    $stmt->bind_param('ii', $analysisId, $userId);
    $stmt->execute();
    $meditations = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
}

$videoMap = [
     1=>'practice.mp4',  2=>'practice.mp4',  3=>'practice.mp4',
     4=>'practice.mp4',  5=>'practice.mp4',  6=>'practice.mp4',
     7=>'practice.mp4',  8=>'WhatsApp1.mp4', 9=>'WhatsApp1.mp4',
    10=>'WhatsApp1.mp4',11=>'WhatsApp1.mp4',12=>'WhatsApp1.mp4',
    13=>'WhatsApp1.mp4',14=>'WhatsApp1.mp4',15=>'WhatsApp2.mp4',
    16=>'WhatsApp2.mp4',17=>'WhatsApp2.mp4',18=>'WhatsApp2.mp4',
    19=>'WhatsApp2.mp4',20=>'WhatsApp2.mp4',
];
$practiceVideo = '/videos/' . ($videoMap[$analysis['practice_num'] ?? 0] ?? 'practice.mp4');

$pageTitle = $analysis['title'] ?: 'Разбор';
$navActive  = 'archive';
$pageCss    = ['/features/chat/chat.css', '/features/analysis/analysis.css'];
$pageJs     = ['/features/chat/chat.js',  '/features/analysis/analysis.js'];

include __DIR__ . '/shared/layout/header.php';
include __DIR__ . '/features/analysis/analysis.page.php';
include __DIR__ . '/shared/layout/bottom-nav.php';
include __DIR__ . '/shared/layout/footer.php';
