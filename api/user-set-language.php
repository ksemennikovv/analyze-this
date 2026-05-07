<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/../src/helpers/response.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$lang  = $input['lang'] ?? '';
$allowed = ['ru', 'en', 'de', 'fr', 'es'];

if (!in_array($lang, $allowed, true)) { json_error('Недопустимый язык'); }

$_SESSION['lang'] = $lang;
setcookie('lang', $lang, time() + 86400 * 365, '/');

json_success(['lang' => $lang]);
