<?php
function require_auth(): void {
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
        exit;
    }
}

function require_auth_redirect(string $to = '/'): void {
    if (empty($_SESSION['user_id'])) {
        header('Location: ' . $to);
        exit;
    }
}

function hash_password(string $plain): string {
    return password_hash($plain, PASSWORD_BCRYPT);
}

function verify_password(string $plain, string $hash): bool {
    return password_verify($plain, $hash);
}
