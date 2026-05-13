var Archive = (function () {

  function init() {
    document.querySelectorAll('.archive-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.archive-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var filter = tab.dataset.filter;
        document.querySelectorAll('.archive-card').forEach(function (card) {
          card.style.display = (filter === 'all' || card.dataset.status === filter) ? '' : 'none';
        });
      });
    });
  }

  function open(id, title) {
    Roller.open({
      id: 'ad-' + id,
      title: title,
      content: '<div class="ad-msgs"><div style="margin:32px auto;width:22px;height:22px;border:2.5px solid rgba(0,0,0,.12);border-top-color:var(--c-purple);border-radius:50%;animation:spin .7s linear infinite"></div></div>',
      onOpen: function () { loadDetail(id); }
    });
  }

  function loadDetail(id) {
    fetch('/features/archive/api/detail.php?id=' + id)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.ok) return;
        var body = Roller.getBody('ad-' + id);
        if (!body) return;

        var html = '<div class="ad-msgs">';
        data.messages.forEach(function (m) {
          if (m.role === 'system') return;
          html += '<div class="ad-msg ad-msg--' + m.role + '"><div class="ad-bubble">' + esc(m.content) + '</div></div>';
        });
        if (data.analysis.practice_num) {
          html += '<div class="ad-practice">'
            + '<div class="ad-practice-num">Практика №' + data.analysis.practice_num + '</div>'
            + '<div class="ad-practice-title">' + esc(data.analysis.personal_task || 'Телесная практика') + '</div>'
            + '</div>';
        }
        html += '</div>';
        body.innerHTML = html;
      });
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  document.addEventListener('DOMContentLoaded', init);
  return { open: open };
})();
