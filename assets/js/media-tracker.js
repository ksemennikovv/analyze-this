/* ================================================================
 * media-tracker.js — трекинг медиа: start/progress/complete/abandon
 * ================================================================ */
var MediaTracker = (function() {

    function track(event, sessionId, data) {
        var endpoints = {
            start:    '/api/media-start.php',
            progress: '/api/media-progress.php',
            complete: '/api/media-complete.php',
            abandon:  '/api/media-abandon.php'
        };
        var url = endpoints[event];
        if (!url) return;
        API.post(url, Object.assign({ session_id: sessionId }, data || {})).catch(function() {});
    }

    function attach(videoEl, mediaId, mediaType) {
        if (!videoEl) return;
        var sessionId = null;
        var reported25 = false;
        var reported50 = false;
        var reported75 = false;

        videoEl.addEventListener('play', function() {
            if (!sessionId) {
                sessionId = mediaId + '_' + Date.now();
                track('start', sessionId, { media_id: mediaId, media_type: mediaType });
            }
        });

        videoEl.addEventListener('timeupdate', function() {
            if (!sessionId || !videoEl.duration) return;
            var pct = videoEl.currentTime / videoEl.duration;
            if (!reported25 && pct >= 0.25) { reported25 = true; track('progress', sessionId, { progress: 25 }); }
            if (!reported50 && pct >= 0.50) { reported50 = true; track('progress', sessionId, { progress: 50 }); }
            if (!reported75 && pct >= 0.75) { reported75 = true; track('progress', sessionId, { progress: 75 }); }
        });

        videoEl.addEventListener('ended', function() {
            if (sessionId) track('complete', sessionId, {});
        });

        window.addEventListener('beforeunload', function() {
            if (sessionId && !videoEl.ended) {
                var pct = videoEl.duration ? Math.round(videoEl.currentTime / videoEl.duration * 100) : 0;
                track('abandon', sessionId, { progress: pct });
            }
        });
    }

    return { attach: attach };
})();
