<?php
session_start();
require_once __DIR__ . '/../../../../config/database.php';
require_once __DIR__ . '/../../../../config/app.php';
require_once __DIR__ . '/../../../../config/ai.php';
require_once __DIR__ . '/../../../../src/db/Database.php';
require_once __DIR__ . '/../../../../src/helpers/response.php';
require_once __DIR__ . '/../../../../src/services/ClaudeService.php';
header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) { json_error('Unauthorized', 401); }
$userId = (int)$_SESSION['user_id'];
$db = Database::getInstance();

$title  = 'Запись дневника';
$status = 'in_chat';
$stmt = $db->prepare('INSERT INTO diary_entries (user_id, title, status) VALUES (?, ?, ?)');
$stmt->bind_param('iss', $userId, $title, $status);
$stmt->execute();
$entryId = $db->insert_id;
$stmt->close();

$system   = "Ты эмпатичный помощник дневника. Помогаешь пользователю осмыслить мысли и чувства. Задавай мягкие открытые вопросы, будь поддерживающим. Отвечай на русском языке. Ответ — 1-2 коротких предложения.";
$messages = [['role' => 'user', 'content' => 'Привет, хочу сделать запись в дневник.']];

$claude = new ClaudeService();
$reply  = $claude->chat($system, $messages) ?? 'Привет! Рад, что вы решили написать. О чём хотите рассказать сегодня?';

$stmt = $db->prepare('INSERT INTO diary_messages (entry_id, user_id, role, content) VALUES (?, ?, ?, ?)');
$ru = 'user';   $cu = 'Привет, хочу сделать запись в дневник.';
$stmt->bind_param('iiss', $entryId, $userId, $ru, $cu);
$stmt->execute();
$ra = 'assistant';
$stmt->bind_param('iiss', $entryId, $userId, $ra, $reply);
$stmt->execute();
$stmt->close();

json_success(['entry_id' => $entryId, 'title' => $title, 'message' => $reply]);
