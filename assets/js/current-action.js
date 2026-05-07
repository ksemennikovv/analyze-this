/* ================================================================
 * current-action.js — блок текущего действия (анализ, практика и др.)
 * ================================================================ */
(function() {

    document.addEventListener('click', function(e) {
        /* complete step */
        var btn = e.target.closest('[data-action="complete-step"]');
        if (btn) {
            btn.disabled = true;
            API.post('/api/flow-complete-step.php', { step_id: btn.dataset.stepId })
                .then(function(d) {
                    if (d.ok) location.reload();
                    else { btn.disabled = false; }
                }).catch(function() { btn.disabled = false; });
        }

        /* confirm topic */
        var topicBtn = e.target.closest('[data-action="confirm-topic"]');
        if (topicBtn) {
            topicBtn.disabled = true;
            API.post('/api/flow-confirm-topic.php', { topic: topicBtn.dataset.topic })
                .then(function(d) {
                    if (d.ok) location.reload();
                    else { topicBtn.disabled = false; }
                }).catch(function() { topicBtn.disabled = false; });
        }
    });

})();
