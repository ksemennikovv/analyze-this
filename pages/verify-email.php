<?php
/* pages/verify-email.php — результат верификации по ссылке из письма */
?>
<div class="page padded" style="text-align:center; padding-top:60px;">
<?php if (!empty($verified)): ?>
    <h2>Email подтверждён ✓</h2>
    <p>Вы успешно подтвердили email. Добро пожаловать!</p>
    <a href="/" class="cta-btn" style="margin-top:24px;">На главную</a>
<?php elseif (!empty($error)): ?>
    <h2>Ошибка верификации</h2>
    <p><?= htmlspecialchars($error) ?></p>
    <a href="/" class="cta-btn" style="margin-top:24px;">На главную</a>
<?php else: ?>
    <p>Проверяем код…</p>
<?php endif; ?>
</div>
