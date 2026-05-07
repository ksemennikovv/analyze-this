/* ================================================================
 * video-player.js — circular video player с progress ring
 * ================================================================ */
(function() {
    var CIRCUM = 2 * Math.PI * 116;

    document.querySelectorAll('.vid-circle-wrap').forEach(function(wrap) {
        var circle  = wrap.querySelector('.vid-circle-big');
        var video   = wrap.querySelector('.vid-video');
        var playBtn = wrap.querySelector('.vid-play-big');
        var durEl   = wrap.querySelector('.vid-dur-big');
        var prog    = wrap.querySelector('.vid-ring__prog');

        if (!video) return;

        prog.style.strokeDasharray  = CIRCUM;
        prog.style.strokeDashoffset = CIRCUM;

        function fmt(sec) {
            var m = Math.floor(sec / 60);
            var s = Math.floor(sec % 60);
            return m + ':' + (s < 10 ? '0' : '') + s;
        }

        circle.addEventListener('click', function() {
            if (video.paused) video.play(); else video.pause();
        });

        video.addEventListener('play',  function() { playBtn.style.opacity = '0'; playBtn.style.pointerEvents = 'none'; });
        video.addEventListener('pause', function() { playBtn.style.opacity = '1'; playBtn.style.pointerEvents = ''; });
        video.addEventListener('ended', function() {
            video.currentTime = 0;
            prog.style.strokeDashoffset = CIRCUM;
            video.play();
        });
        video.addEventListener('timeupdate', function() {
            if (!video.duration) return;
            prog.style.strokeDashoffset = CIRCUM * (1 - video.currentTime / video.duration);
            durEl.textContent = fmt(video.duration - video.currentTime);
        });
        video.addEventListener('loadedmetadata', function() {
            durEl.textContent = fmt(video.duration);
        });
    });
})();
