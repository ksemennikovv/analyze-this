<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/../src/helpers/response.php';
header('Content-Type: application/json');
// TODO: реализовать flow-get-current-action
json_success(['html' => null]);
