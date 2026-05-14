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

  function open(id) {
    window.location.href = '/analysis.php?id=' + id;
  }

  document.addEventListener('DOMContentLoaded', init);
  return { open: open };
})();
