<?php
function billing_period_start(): string {
    return date('Y-m-01 00:00:00');
}

function billing_period_end(): string {
    return date('Y-m-t 23:59:59');
}

function future_date(int $seconds): string {
    return date('Y-m-d H:i:s', time() + $seconds);
}

function is_expired(string $datetime): bool {
    return strtotime($datetime) < time();
}
