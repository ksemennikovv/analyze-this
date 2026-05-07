<?php
function validate_email(string $email): bool {
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validate_password(string $pass): bool {
    return strlen($pass) >= 6;
}

function sanitize_text(string $text): string {
    return htmlspecialchars(trim($text), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
