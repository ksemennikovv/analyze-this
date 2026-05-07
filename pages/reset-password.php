<?php
/* pages/reset-password.php — форма сброса пароля по ссылке из письма */
$email = htmlspecialchars($_GET['email'] ?? '');
$code  = htmlspecialchars($_GET['code']  ?? '');
?>
<div class="page padded" style="max-width:400px; margin:60px auto;">
    <h2>Новый пароль</h2>
    <p style="margin-bottom:24px;">Придумайте новый пароль для вашего аккаунта.</p>

    <div id="resetError" class="form-error" style="display:none;"></div>

    <input type="hidden" id="resetEmail" value="<?= $email ?>">
    <input type="hidden" id="resetCodeVal" value="<?= $code ?>">

    <div class="auth-input" style="margin-bottom:12px;">
        <input type="password" id="newPass" placeholder="Новый пароль" autocomplete="new-password">
    </div>
    <div class="auth-input" style="margin-bottom:20px;">
        <input type="password" id="newPass2" placeholder="Повторите пароль" autocomplete="new-password">
    </div>
    <button class="cta-btn" id="resetSubmitBtn" style="width:100%;">Сохранить пароль</button>
</div>

<script>
(function() {
    var btn    = document.getElementById('resetSubmitBtn');
    var errEl  = document.getElementById('resetError');
    var email  = document.getElementById('resetEmail').value;
    var code   = document.getElementById('resetCodeVal').value;

    btn.addEventListener('click', function() {
        var p1 = document.getElementById('newPass').value;
        var p2 = document.getElementById('newPass2').value;
        if (p1.length < 6) { show('Пароль не менее 6 символов'); return; }
        if (p1 !== p2)     { show('Пароли не совпадают'); return; }
        btn.disabled = true;
        API.post('/api/auth-reset-password.php', { email: email, code: code, password: p1 })
            .then(function(d) {
                btn.disabled = false;
                if (!d.ok) { show(d.error || 'Ошибка'); return; }
                location.href = '/dashboard.php';
            }).catch(function() { btn.disabled = false; show('Ошибка соединения'); });
    });

    function show(msg) { errEl.textContent = msg; errEl.style.display = ''; }
})();
</script>
