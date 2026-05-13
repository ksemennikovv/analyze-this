<?php
session_start();
error_reporting(0); ini_set('display_errors', 0);
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/src/db/Database.php';

if (empty($_SESSION['user_id'])) { header('Location: /'); exit; }

$userId = (int)$_SESSION['user_id'];
$db = Database::getInstance();

$stmt = $db->prepare('SELECT plan, status, period_end, analyses_per_month FROM subscriptions WHERE user_id=? AND status="active" ORDER BY created_at DESC LIMIT 1');
$stmt->bind_param('i', $userId);
$stmt->execute();
$sub = $stmt->get_result()->fetch_assoc();
$stmt->close();

$stmt = $db->prepare('SELECT name, email FROM users WHERE id=?');
$stmt->bind_param('i', $userId);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

$stmt = $db->prepare('SELECT type, amount, status, created_at FROM transactions WHERE user_id=? ORDER BY created_at DESC LIMIT 5');
$stmt->bind_param('i', $userId);
$stmt->execute();
$transactions = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$monthStart = date('Y-m-01');
$stmt = $db->prepare('SELECT COUNT(*) as cnt FROM analyses WHERE user_id=? AND created_at >= ?');
$stmt->bind_param('is', $userId, $monthStart);
$stmt->execute();
$usedRow = $stmt->get_result()->fetch_assoc();
$stmt->close();
$analysesUsed = (int)($usedRow['cnt'] ?? 0);

$planNames  = ['start' => 'СТАРТ', 'base' => 'БАЗОВЫЙ', 'transformation' => 'ТРАНСФОРМАЦИЯ'];
$planLimits = ['start' => 1, 'base' => 4, 'transformation' => 0];

$pageTitle = 'Профиль';
$navActive = 'billing';
$pageCss   = ['/features/billing/billing.css'];
$pageJs    = ['/features/billing/billing.js'];

include __DIR__ . '/shared/layout/header.php';
?>
<div class="billing-page">

  <div class="billing-topbar page-wrap">
    <h1 class="h2">Профиль</h1>
  </div>

  <div class="page-wrap pb-safe">

    <!-- User info -->
    <div class="billing-profile card mt-16">
      <div class="billing-avatar"><?= mb_strtoupper(mb_substr($user['name'] ?: $user['email'], 0, 1)) ?></div>
      <div>
        <div class="billing-profile-name"><?= htmlspecialchars($user['name'] ?: 'Пользователь') ?></div>
        <div class="text-muted body-sm"><?= htmlspecialchars($user['email']) ?></div>
      </div>
    </div>

    <!-- Subscription -->
    <div class="mt-24">
      <div class="h3 mb-12">Подписка</div>
      <?php if ($sub): ?>
      <div class="billing-cur-plan card-bordered">
        <div class="flex justify-between items-start">
          <div>
            <div class="billing-plan-name"><?= $planNames[$sub['plan']] ?? $sub['plan'] ?></div>
            <div class="text-muted body-sm mt-4">
              <?php if (($planLimits[$sub['plan']] ?? 1) === 0): ?>
                Безлимитные разборы
              <?php else: ?>
                <?= $analysesUsed ?> / <?= $sub['analyses_per_month'] ?> разборов в месяц
              <?php endif; ?>
            </div>
          </div>
          <span class="badge badge-purple">Активна</span>
        </div>
        <div class="caption text-muted mt-8">До <?= date('j F Y', strtotime($sub['period_end'])) ?></div>
        <?php if (($planLimits[$sub['plan']] ?? 1) > 0): ?>
        <div class="billing-usage-bar mt-12">
          <div class="billing-usage-fill" style="width:<?= min(100, round($analysesUsed / max(1,$sub['analyses_per_month']) * 100)) ?>%"></div>
        </div>
        <?php endif; ?>
      </div>
      <?php else: ?>
      <div class="billing-no-plan card">
        <div class="text-muted body-sm">Подписка не активна</div>
        <div class="caption text-muted mt-4">Выберите тариф ниже</div>
      </div>
      <?php endif; ?>
    </div>

    <!-- Plans -->
    <div class="mt-24">
      <div class="h3 mb-12">Тарифы</div>
      <div class="billing-plans">

        <div class="billing-plan-card">
          <div class="billing-plan-header">
            <div class="billing-plan-title">СТАРТ</div>
            <div class="billing-plan-price">5 000 <span>₽/мес</span></div>
          </div>
          <ul class="billing-plan-features">
            <li>1 разбор в месяц</li>
            <li>Персональная практика</li>
            <li>Дневник без ограничений</li>
          </ul>
          <button class="btn btn-outline btn-full btn-sm billing-buy-btn" data-plan="start">
            <?= ($sub && $sub['plan']==='start') ? 'Текущий тариф' : 'Выбрать' ?>
          </button>
        </div>

        <div class="billing-plan-card billing-plan-card--featured">
          <div class="billing-plan-badge">Популярный</div>
          <div class="billing-plan-header">
            <div class="billing-plan-title">БАЗОВЫЙ</div>
            <div class="billing-plan-price">9 500 <span>₽/мес</span></div>
          </div>
          <ul class="billing-plan-features">
            <li>4 разбора в месяц</li>
            <li>Персональные практики</li>
            <li>Дневник без ограничений</li>
            <li>Медитации по теме разбора</li>
          </ul>
          <button class="btn btn-primary btn-full btn-sm billing-buy-btn" data-plan="base">
            <?= ($sub && $sub['plan']==='base') ? 'Текущий тариф' : 'Выбрать' ?>
          </button>
        </div>

        <div class="billing-plan-card">
          <div class="billing-plan-header">
            <div class="billing-plan-title">ТРАНСФОРМАЦИЯ</div>
            <div class="billing-plan-price">18 000 <span>₽/мес</span></div>
          </div>
          <ul class="billing-plan-features">
            <li>Безлимитные разборы</li>
            <li>Все практики включены</li>
            <li>Дневник без ограничений</li>
            <li>Все медитации включены</li>
            <li>Приоритетная поддержка</li>
          </ul>
          <button class="btn btn-outline btn-full btn-sm billing-buy-btn" data-plan="transformation">
            <?= ($sub && $sub['plan']==='transformation') ? 'Текущий тариф' : 'Выбрать' ?>
          </button>
        </div>

      </div>
    </div>

    <!-- History -->
    <?php if (!empty($transactions)): ?>
    <div class="mt-24">
      <div class="h3 mb-12">История платежей</div>
      <?php foreach ($transactions as $tx): ?>
      <div class="billing-tx">
        <div>
          <div class="billing-tx-type"><?= $tx['type'] === 'subscription' ? 'Подписка' : 'Медитация' ?></div>
          <div class="caption text-muted"><?= date('j M Y', strtotime($tx['created_at'])) ?></div>
        </div>
        <div class="billing-tx-amount <?= $tx['status']==='completed'?'text-green':'text-muted' ?>">
          <?= number_format($tx['amount'], 0, '.', ' ') ?> ₽
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <div class="mt-24 mb-32">
      <button class="btn btn-outline btn-full" id="logoutBtn">Выйти из аккаунта</button>
    </div>

  </div>
</div>

<?php
include __DIR__ . '/shared/layout/bottom-nav.php';
include __DIR__ . '/shared/layout/footer.php';
?>
