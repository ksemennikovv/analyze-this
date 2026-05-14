<?php
// features/landing/verify-email.page.php
// Vars: $error (string)
?>
<div class="page-wrap pb-safe" style="text-align:center; padding-top:60px;">
  <div class="card" style="max-width:400px; margin:0 auto; padding:32px;">
    <div style="font-size:2.5rem; margin-bottom:16px;">❌</div>
    <div class="h3 mb-8">Ошибка верификации</div>
    <p class="text-muted body-sm mb-24"><?= htmlspecialchars($error) ?></p>
    <a href="/" class="btn btn-primary btn-full">На главную</a>
  </div>
</div>
