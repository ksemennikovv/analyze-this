var Billing = (function () {
  function init() {
    document.querySelectorAll('.billing-buy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        Roller.open({
          id: 'billing-pay',
          title: 'Оплата',
          content: '<div style="padding:32px 20px;text-align:center">'
            + '<div class="h3 mb-16">Скоро здесь будет оплата</div>'
            + '<p class="text-muted body-sm mb-24">Для подключения тарифа напишите нам</p>'
            + '<a href="mailto:support@nirva.ai" class="btn btn-primary">Написать в поддержку</a>'
            + '</div>'
        });
      });
    });

    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        fetch('/api/auth-logout.php', { method: 'POST' })
          .then(function () { window.location.href = '/'; });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  return {};
})();
