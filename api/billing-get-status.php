<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/../src/helpers/response.php';
header('Content-Type: application/json');
// TODO: реализовать billing-get-status
json_success([
    'subscription' => null,
    'included'     => 1,
    'package'      => 0,
    'available'    => 1,
    'credits'      => 0,
]);
