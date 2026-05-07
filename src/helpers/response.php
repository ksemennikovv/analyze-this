<?php
function json_success(array $data = []): void {
    header('Content-Type: application/json');
    echo json_encode(array_merge(['ok' => true], $data));
    exit;
}

function json_error(string $message, int $status = 200): void {
    header('Content-Type: application/json');
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}
