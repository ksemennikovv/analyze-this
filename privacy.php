<?php
require_once __DIR__ . '/config/app.php';
$pageTitle = 'Политика конфиденциальности';
$pageCss   = [];
$pageJs    = [];
include __DIR__ . '/shared/layout/header.php';
include __DIR__ . '/features/legal/privacy.page.php';
include __DIR__ . '/shared/layout/footer.php';
