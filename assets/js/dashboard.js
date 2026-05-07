/* ================================================================
 * dashboard.js — инициализация дашборда
 * ================================================================ */
(function() {

    /* ---- load current action ---- */
    var actionEl = document.getElementById('currentAction');
    if (actionEl) {
        API.get('flow-get-current-action.php').then(function(d) {
            actionEl.innerHTML = (d.ok && d.html) ? d.html : '';
        }).catch(function() {
            actionEl.innerHTML = '';
        });
    }

    /* ---- billing balance ---- */
    API.get('billing-get-status.php').then(function(d) {
        if (!d.ok) return;
        var el = function(id) { return document.getElementById(id); };
        if (el('balanceIncluded')) el('balanceIncluded').textContent = d.included  != null ? d.included  : '—';
        if (el('balancePackage'))  el('balancePackage').textContent  = d.package   != null ? d.package   : '—';
        if (el('balanceTotal'))    el('balanceTotal').textContent    = d.available != null ? d.available : '—';
        if (el('subStatusBadge'))  el('subStatusBadge').textContent  = d.subscription ? 'Активна' : 'Нет подписки';
        AppState.subscription = d.subscription;
        AppState.credits      = d.credits || 0;
    }).catch(function() {});

    /* ---- referral link ---- */
    API.get('referrals-get-link.php').then(function(d) {
        var linkEl  = document.getElementById('referralLink');
        var countEl = document.getElementById('referralCount');
        if (linkEl)  linkEl.value        = (d.ok && d.link)  ? d.link  : '';
        if (linkEl)  linkEl.placeholder  = (d.ok && d.link)  ? ''      : 'Скоро будет доступно';
        if (countEl) countEl.textContent = (d.ok && d.count) ? d.count : '0';
    }).catch(function() {});

    var copyBtn = document.getElementById('copyReferralLink');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            var linkEl = document.getElementById('referralLink');
            if (!linkEl || !linkEl.value) return;
            navigator.clipboard.writeText(linkEl.value).then(function() {
                copyBtn.textContent = 'Скопировано';
                setTimeout(function() { copyBtn.textContent = 'Копировать'; }, 2000);
            });
        });
    }

    /* initFeed вызывается из dashboard-feed.js */

})();
