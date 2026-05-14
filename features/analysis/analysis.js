var Analysis = (function () {
  'use strict';

  var data   = window.ANALYSIS || {};
  var id     = data.id;
  var status = data.status;

  /* summary toggle */
  var toggleBtn   = document.getElementById('summaryToggle');
  var summaryBody = document.getElementById('summaryBody');
  if (toggleBtn && summaryBody) {
    if (status === 'analysis_completed' || status === 'practice_assigned') {
      toggleBtn.classList.add('is-open');
      summaryBody.classList.add('is-open');
    }
    toggleBtn.addEventListener('click', function () {
      toggleBtn.classList.toggle('is-open');
      summaryBody.classList.toggle('is-open');
    });
  }

  /* analysis chat (resume) */
  if (status === 'draft_started' || status === 'chat_in_progress') {
    if (typeof Chat !== 'undefined') {
      Chat.init('analysisChatMount', {
        resume:      status === 'chat_in_progress',
        analysisId:  id,
        onComplete:  function () { window.location.reload(); }
      });
    }
  }

  /* reflection chat */
  if (status === 'reflection_in_progress') {
    if (typeof Chat !== 'undefined') {
      Chat.init('reflectionChatMount', {
        resume:     true,
        analysisId: id,
        apiMessage: '/features/analysis/api/reflection-message.php',
        apiHistory: '/features/analysis/api/reflection-history.php'
      });
    }
  }

  /* practice done */
  var practiceDoneBtn = document.getElementById('practiceDoneBtn');
  if (practiceDoneBtn) {
    practiceDoneBtn.addEventListener('click', function () {
      practiceDoneBtn.disabled = true;
      practiceDoneBtn.textContent = 'Сохраняем…';
      fetch('/features/analysis/api/practice-complete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_id: id })
      })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.ok) window.location.reload();
        else { practiceDoneBtn.disabled = false; practiceDoneBtn.textContent = 'Практику выполнил ✓'; }
      })
      .catch(function () { practiceDoneBtn.disabled = false; });
    });
  }

  /* start reflection */
  var startReflBtn = document.getElementById('startReflectionBtn');
  if (startReflBtn) {
    startReflBtn.addEventListener('click', function () {
      startReflBtn.disabled = true;
      startReflBtn.textContent = 'Начинаем…';
      fetch('/features/analysis/api/reflection-start.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_id: id })
      })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.ok) window.location.reload();
        else { startReflBtn.disabled = false; startReflBtn.textContent = 'Начать самоисследование'; }
      })
      .catch(function () { startReflBtn.disabled = false; });
    });
  }

  /* complete reflection */
  var completeReflBtn = document.getElementById('completeReflectionBtn');
  if (completeReflBtn) {
    completeReflBtn.addEventListener('click', function () {
      completeReflBtn.disabled = true;
      completeReflBtn.textContent = 'Завершаем…';
      fetch('/features/analysis/api/reflection-complete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_id: id })
      })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.ok) window.location.reload();
        else { completeReflBtn.disabled = false; completeReflBtn.textContent = 'Завершить самоисследование'; }
      })
      .catch(function () { completeReflBtn.disabled = false; });
    });
  }
})();
