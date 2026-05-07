/* ================================================================
 * dashboard-feed.js — лента событий: загрузка и рендеринг
 * ================================================================ */
function initFeed() {
    var feedEl   = document.getElementById('feedList');
    var loadMore = document.getElementById('feedLoadMore');
    var cursor   = null;
    var loading  = false;

    if (!feedEl) return;

    function renderItem(item) {
        var div = document.createElement('div');
        div.className = 'feed-item feed-item--' + (item.type || 'unknown');
        div.innerHTML = item.html || '';
        feedEl.appendChild(div);
    }

    function load(older) {
        if (loading) return;
        loading = true;
        var url = '/api/flow-get-feed.php' + (older && cursor ? '?cursor=' + cursor : '');
        API.get(url).then(function(d) {
            loading = false;
            if (!d.ok) return;
            (d.items || []).forEach(renderItem);
            cursor = d.next_cursor || null;
            AppState.feed = AppState.feed.concat(d.items || []);
            if (loadMore) loadMore.style.display = cursor ? '' : 'none';
        }).catch(function() { loading = false; });
    }

    if (loadMore) loadMore.addEventListener('click', function() { load(true); });

    load(false);
}
