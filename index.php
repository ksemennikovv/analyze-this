<?php
session_start();
error_reporting(0);
ini_set('display_errors', 0);
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/src/db/Database.php';

if (!empty($_SESSION['user_id'])) {
    header('Location: /dashboard.php'); exit;
}

include __DIR__ . '/pages/landing/landing.php';
