/* ================================================================
 * practice-report.js — AI-чат для отчёта о практике
 * ================================================================ */
(function() {

    var container = document.getElementById('reportMessages');
    var input     = document.getElementById('reportInput');
    var sendBtn   = document.getElementById('reportSend');
    var stepId    = document.body.dataset.stepId || '';

    if (!container || !input || !sendBtn) return;

    var history = [];

    sendBtn.addEventListener('click', submit);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    });

    function submit() {
        var t = input.value.trim();
        if (!t) return;
        input.value = '';
        history.push({ role: 'user', content: t });
        AiChat.addBubble(container, 'user', t);
        AiChat.send({
            container: container,
            messages:  history,
            sendBtn:   sendBtn,
            endpoint:  '/api/ai-report-message.php',
            onEnd: function(full, ended) {
                history.push({ role: 'assistant', content: full });
                if (ended) finishReport(full);
            }
        });
    }

    function finishReport(summary) {
        API.post('/api/practice-save-report.php', { step_id: stepId, summary: summary })
            .then(function(d) {
                if (d.ok) location.href = '/dashboard.php';
            }).catch(function() {});
    }

})();
