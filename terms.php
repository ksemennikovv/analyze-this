<?php
require_once __DIR__ . '/config/app.php';
$pageTitle = 'Условия использования';
$pageCss   = [];
$pageJs    = [];
include __DIR__ . '/shared/layout/header.php';
include __DIR__ . '/features/legal/terms.page.php';
include __DIR__ . '/shared/layout/footer.php';
