<?php
/* Роутер карточек feed — смотрит type и подключает нужный файл */
$type = $item['type'] ?? '';
$map  = [
    'analysis'             => 'feed-item-analysis',
    'topic_confirmation'   => 'feed-item-topic-confirmation',
    'personal_task'        => 'feed-item-personal-task',
    'practice'             => 'feed-item-practice',
    'practice_report'      => 'feed-item-practice-report',
    'reflection'           => 'feed-item-reflection',
    'next_step'            => 'feed-item-next-step',
    'payment_gate'         => 'feed-item-payment-gate',
    'credit_consumption'   => 'feed-item-credit-consumption',
    'referral_reward'      => 'feed-item-referral-reward',
    'price_warning'        => 'feed-item-price-warning',
    'subscription_warning' => 'feed-item-subscription-warning',
    'meditation_offer'     => 'feed-item-meditation-offer',
];

$partial = $map[$type] ?? null;
if ($partial) {
    require __DIR__ . '/' . $partial . '.php';
}
