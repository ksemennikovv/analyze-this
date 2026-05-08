/* ================================================================
 * meditations.js — страница медитаций (заглушка)
 * ================================================================ */
(function() {

    var listEl = document.getElementById('meditationsList');
    if (!listEl) return;

    API.get('/api/meditations-get-list.php').then(function(d) {
        if (!d.ok) return;
        (d.items || []).forEach(function(item) {
            var card = document.createElement('div');
            card.className = 'meditation-card';
            card.innerHTML = item.html || '';
            listEl.appendChild(card);
        });
    }).catch(function() {});

    document.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-unlock-meditation]');
        if (!btn) return;
        var id = btn.dataset.unlockMeditation;
        btn.disabled = true;
        API.post('/api/meditations-unlock-free.php', { meditation_id: id })
            .then(function(d) {
                if (d.ok) location.reload();
                else { btn.disabled = false; }
            }).catch(function() { btn.disabled = false; });
    });

})();
