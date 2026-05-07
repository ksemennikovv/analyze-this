/* ================================================================
 * main.js — общая инициализация: orb, welcome-banner, shared setup
 * ================================================================ */
(function() {

    /* orb click → scroll to hero input */
    var orb = document.querySelector('.logo-orb');
    if (orb) {
        orb.addEventListener('click', function() {
            var input = document.getElementById('heroInput') || document.querySelector('.input-box');
            if (input) {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(function() { input.focus(); }, 400);
            }
        });
    }

    /* welcome banner dismiss */
    var welcomeDismiss = document.getElementById('welcomeDismiss');
    var welcomeBanner  = document.getElementById('welcomeBanner');
    if (welcomeDismiss && welcomeBanner) {
        welcomeDismiss.addEventListener('click', function() {
            welcomeBanner.style.display = 'none';
        });
    }

    /* suppress enter-submit on single-line inputs inside forms */
    document.querySelectorAll('input[type="text"], input[type="email"]').forEach(function(inp) {
        inp.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') e.preventDefault();
        });
    });

})();
