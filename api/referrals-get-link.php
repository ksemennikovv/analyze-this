<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/../src/helpers/response.php';
header('Content-Type: application/json');
// TODO: реализовать referrals-get-link
json_success(['link' => '', 'count' => 0]);
