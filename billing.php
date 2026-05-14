<?php
session_start();
error_reporting(0); ini_set('display_errors', 0);
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/src/db/Database.php';

if (empty($_SESSION['user_id'])) { header('Location: /'); exit; }

$userId = (int)$_SESSION['user_id'];
$db = Database::getInstance();

$stmt = $db->prepare('SELECT plan, status, period_end, analyses_per_month FROM subscriptions WHERE user_id=? AND status="active" ORDER BY created_at DESC LIMIT 1');
$stmt->bind_param('i', $userId);
$stmt->execute();
$sub = $stmt->get_result()->fetch_assoc();
$stmt->close();

$stmt = $db->prepare('SELECT name, email FROM users WHERE id=?');
$stmt->bind_param('i', $userId);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

$stmt = $db->prepare('SELECT type, amount, status, created_at FROM transactions WHERE user_id=? ORDER BY created_at DESC LIMIT 5');
$stmt->bind_param('i', $userId);
$stmt->execute();
$transactions = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$monthStart = date('Y-m-01');
$stmt = $db->prepare('SELECT COUNT(*) as cnt FROM analyses WHERE user_id=? AND created_at >= ?');
$stmt->bind_param('is', $userId, $monthStart);
$stmt->execute();
$usedRow = $stmt->get_result()->fetch_assoc();
$stmt->close();
$analysesUsed = (int)($usedRow['cnt'] ?? 0);

$planNames  = ['start' => 'СТАРТ', 'base' => 'БАЗОВЫЙ', 'transformation' => 'ТРАНСФОРМАЦИЯ'];
$planLimits = ['start' => 1, 'base' => 2, 'transformation' => 4];

$pageTitle = 'Профиль';
$navActive = 'billing';
$pageCss   = ['/features/billing/billing.css'];
$pageJs    = ['/features/billing/billing.js'];

include __DIR__ . '/shared/layout/header.php';
include __DIR__ . '/features/billing/billing.page.php';
include __DIR__ . '/shared/layout/bottom-nav.php';
include __DIR__ . '/shared/layout/footer.php';
