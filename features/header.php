<?php
// features/header.php
$pageTitle = $pageTitle ?? 'Nirva AI';
$pageClass = $pageClass ?? '';
require_once __DIR__ . '/../config/app.php';
?>
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title><?= htmlspecialchars($pageTitle) ?> — Nirva AI</title>
<meta name="description" content="Сервис для улучшения эмоционального состояния на основе ИИ">
<meta name="theme-color" content="#0D0B1E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<!-- Design system -->
<link rel="stylesheet" href="/assets/css/main.css">
<!-- Roller -->
<link rel="stylesheet" href="/features/chat-roller/chat-roller.css">
<!-- Page-specific CSS injected by each feature -->
<?php if (!empty($pageCss)): foreach ($pageCss as $css): ?>
<link rel="stylesheet" href="<?= htmlspecialchars($css) ?>">
<?php endforeach; endif; ?>
</head>
<body class="<?= htmlspecialchars($pageClass) ?>">
