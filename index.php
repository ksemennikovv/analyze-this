<?php
session_start();
error_reporting(0);
ini_set('display_errors', 0);
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/src/db/Database.php';

// Redirect logged-in users to dashboard
if (!empty($_SESSION['user_id'])) {
    header('Location: /dashboard.php'); exit;
}

// Check for unfinished analysis (guest session)
$landingState = 'fresh';
$resumeTitle  = '';
$practiceNum  = 1;
$practiceName = 'Телесная практика';

// If coming from completed analysis (set by chat API)
if (!empty($_SESSION['show_gate'])) {
    $landingState = 'gate';
    $practiceNum  = $_SESSION['practice_num'] ?? 1;
    $practiceName = $_SESSION['practice_name'] ?? 'Телесная практика';
}
// If has unfinished guest analysis
elseif (!empty($_SESSION['guest_analysis_id'])) {
    $landingState = 'resumed';
    $resumeTitle  = $_SESSION['guest_analysis_title'] ?? 'Ваш запрос';
}

$pageTitle = 'Главная';
$pageCss   = ['/features/landing/landing.css'];
$pageJs    = ['/features/landing/landing.js'];

include __DIR__ . '/shared/layout/header.php';
include __DIR__ . '/features/landing/landing.page.php';
include __DIR__ . '/shared/layout/footer.php';
