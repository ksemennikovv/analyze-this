<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/src/db/Database.php';
require_once __DIR__ . '/src/helpers/security.php';

require_auth_redirect('/');

$db   = Database::getInstance();
$stmt = $db->prepare('SELECT id, name, email FROM users WHERE id = ?');
$stmt->bind_param('i', $_SESSION['user_id']);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

$pageTitle = 'Личный кабинет — NirvaBody';
$pageCss   = ['/assets/css/pages/dashboard.css'];
$pageJs    = ['/assets/js/pages/dashboard.js', '/assets/js/dashboard-feed.js', '/assets/js/current-action.js'];
require __DIR__ . '/includes/head.php';
?>
<script>
AppState.isLoggedIn = true;
AppState.user = <?= json_encode(['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email']]) ?>;
</script>

<div class="phone">
<div class="page">

<?php require __DIR__ . '/includes/header.php'; ?>

<?php require __DIR__ . '/pages/dashboard.php'; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>

<?php require __DIR__ . '/includes/scripts.php'; ?>
