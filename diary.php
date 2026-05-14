<?php
session_start();
error_reporting(0); ini_set('display_errors', 0);
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/src/db/Database.php';

if (empty($_SESSION['user_id'])) { header('Location: /'); exit; }

$userId = (int)$_SESSION['user_id'];
$db = Database::getInstance();

$stmt = $db->prepare('SELECT id, title, status, created_at FROM diary_entries WHERE user_id=? ORDER BY created_at DESC LIMIT 30');
$stmt->bind_param('i', $userId);
$stmt->execute();
$entries = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// Check subscription for paywall (3 free entries)
$stmt = $db->prepare('SELECT id FROM subscriptions WHERE user_id=? AND status="active" LIMIT 1');
$stmt->bind_param('i', $userId);
$stmt->execute();
$hasSub = (bool)$stmt->get_result()->fetch_assoc();
$stmt->close();

$entryCount    = count($entries);
$freeLimit     = 3;
$diaryLocked   = !$hasSub && $entryCount >= $freeLimit;
$nearLimit     = !$hasSub && $entryCount === $freeLimit - 1; // last free entry

$pageTitle = 'Дневник';
$navActive = 'diary';
$pageCss   = ['/features/diary/diary.css'];
$pageJs    = ['/features/diary/diary.js'];

include __DIR__ . '/shared/layout/header.php';
include __DIR__ . '/features/diary/diary.page.php';
include __DIR__ . '/shared/layout/bottom-nav.php';
include __DIR__ . '/shared/layout/footer.php';
