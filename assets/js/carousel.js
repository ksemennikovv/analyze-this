/* ================================================================
 * carousel.js — текстовые и видео карусели
 * ================================================================ */
function initCarousel(slidesId, prevId, nextId) {
    var container = document.getElementById(slidesId);
    if (!container) return;
    var slides = Array.from(container.children);
    var total  = slides.length;
    var idx    = 0;
    slides[0].classList.add('active');

    function go(newIdx) {
        var outVideo = slides[idx].querySelector('.vid-video');
        if (outVideo) { outVideo.pause(); outVideo.currentTime = 0; }
        slides[idx].classList.remove('active');
        idx = (newIdx + total) % total;
        slides[idx].classList.add('active');
    }

    var prev = document.getElementById(prevId);
    var next = document.getElementById(nextId);
    if (prev) prev.addEventListener('click', function() { go(idx - 1); });
    if (next) next.addEventListener('click', function() { go(idx + 1); });
}
