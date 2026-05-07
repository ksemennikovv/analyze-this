/* ================================================================
 * payments.js — UI платёжного потока (заглушка)
 * ================================================================ */
(function() {

    document.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-payment]');
        if (!btn) return;
        var type = btn.dataset.payment;

        btn.disabled = true;

        var endpoints = {
            'subscription':         '/api/billing-create-subscription.php',
            'analysis-package':     '/api/billing-buy-analysis-package.php',
            'meditation':           '/api/billing-create-meditation-payment.php'
        };

        var endpoint = endpoints[type];
        if (!endpoint) { btn.disabled = false; return; }

        API.post(endpoint, { type: type, item_id: btn.dataset.itemId || '' })
            .then(function(d) {
                btn.disabled = false;
                if (d.ok && d.redirect) {
                    location.href = d.redirect;
                } else if (!d.ok) {
                    alert(d.error || 'Ошибка оплаты');
                }
            }).catch(function() {
                btn.disabled = false;
                alert('Ошибка соединения');
            });
    });

})();
