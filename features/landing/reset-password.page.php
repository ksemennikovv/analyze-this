<?php
// features/landing/reset-password.page.php
// Vars: $email (string), $code (string)
?>
<div class="page-wrap pb-safe">
  <div class="card mt-32" style="max-width:400px; margin:0 auto;">
    <h1 class="h2 mb-8">Новый пароль</h1>
    <p class="text-muted body-sm mb-24">Придумайте новый пароль для вашего аккаунта.</p>

    <div id="resetError" class="badge badge-amber" style="display:none; margin-bottom:16px;"></div>

    <input type="hidden" id="resetEmail" value="<?= htmlspecialchars($email) ?>">
    <input type="hidden" id="resetCodeVal" value="<?= htmlspecialchars($code) ?>">

    <div class="mb-12">
      <input type="password" id="newPass" class="chat-textarea" style="height:auto;padding:12px;"
             placeholder="Новый пароль" autocomplete="new-password">
    </div>
    <div class="mb-20">
      <input type="password" id="newPass2" class="chat-textarea" style="height:auto;padding:12px;"
             placeholder="Повторите пароль" autocomplete="new-password">
    </div>
    <button class="btn btn-primary btn-full" id="resetSubmitBtn">Сохранить пароль</button>
  </div>
</div>
