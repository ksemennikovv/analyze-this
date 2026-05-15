<?php
require_once __DIR__ . '/config/app.php';
$pageTitle = 'Политика конфиденциальности';
$pageCss   = [];
$pageJs    = [];
include __DIR__ . '/features/header.php';
include __DIR__ . '/features/legal/privacy.page.php';
include __DIR__ . '/features/footer.php';
