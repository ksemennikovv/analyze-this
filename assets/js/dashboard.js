/* ================================================================
 * dashboard.js — инициализация дашборда
 * ================================================================ */
(function() {

    if (!AppState.isLoggedIn) return;

    /* ---- load current action ---- */
    var actionEl = document.getElementById('currentAction');
    if (actionEl) {
        API.get('/api/flow-get-current-action.php').then(function(d) {
            if (d.ok && d.html) {
                actionEl.innerHTML = d.html;
            } else {
                actionEl.innerHTML = '';
            }
        }).catch(function() {
            if (actionEl) actionEl.innerHTML = '';
        });
    }

    /* ---- feed ---- */
    if (typeof initFeed === 'function') initFeed();

})();
