const ResetPassword = (() => {
    const btn   = document.getElementById('resetSubmitBtn');
    const errEl = document.getElementById('resetError');
    const email = document.getElementById('resetEmail').value;
    const code  = document.getElementById('resetCodeVal').value;

    function showError(msg) {
        errEl.textContent = msg;
        errEl.style.display = '';
    }

    btn.addEventListener('click', () => {
        const p1 = document.getElementById('newPass').value;
        const p2 = document.getElementById('newPass2').value;
        if (p1.length < 6) { showError('Пароль не менее 6 символов'); return; }
        if (p1 !== p2)     { showError('Пароли не совпадают'); return; }

        btn.disabled = true;
        fetch('/features/landing/api/reset-password.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, password: p1 })
        })
        .then(r => r.json())
        .then(d => {
            btn.disabled = false;
            if (!d.ok) { showError(d.error || 'Ошибка'); return; }
            window.location.href = '/dashboard.php';
        })
        .catch(() => { btn.disabled = false; showError('Ошибка соединения'); });
    });
})();
