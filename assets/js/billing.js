/* ================================================================
 * billing.js — страница биллинга (заглушка)
 * ================================================================ */
(function() {

    var statusEl = document.getElementById('billingStatus');
    if (!statusEl) return;

    API.get('/api/billing-get-status.php').then(function(d) {
        if (!d.ok) return;
        AppState.subscription = d.subscription || null;
        AppState.credits = d.credits || 0;
    }).catch(function() {});

})();
