var Med = (function () {
  var audio   = null;
  var playBtn = null;

  function play(id, title, audioUrl, coverUrl, theme) {
    var coverHtml = coverUrl
      ? '<img src="' + coverUrl + '" alt="">'
      : '<div class="med-player-cover-ph"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>';

    var html =
      '<div class="med-player">'
      + '<div class="med-player-cover">' + coverHtml + '</div>'
      + '<div class="med-player-info">'
      +   '<div class="med-player-title">' + _esc(title) + '</div>'
      +   (theme ? '<div class="med-player-theme">' + _esc(theme) + '</div>' : '')
      + '</div>'
      + '<div class="med-player-controls">'
      +   '<button class="med-ctrl" id="medBack"><svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.64"/></svg></button>'
      +   '<button class="med-ctrl med-ctrl--main" id="medPlay"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>'
      +   '<button class="med-ctrl" id="medFwd"><svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-3.64"/></svg></button>'
      + '</div>'
      + '<div class="med-player-prog">'
      +   '<input type="range" class="med-slider" id="medSlider" value="0" min="0" max="100" step="0.1">'
      +   '<div class="med-time"><span id="medCur">0:00</span><span id="medTot">0:00</span></div>'
      + '</div>'
      + '</div>';

    Roller.open({
      id: 'med-' + id,
      title: '',
      dark: true,
      content: html,
      onOpen:  function () { _initPlayer(audioUrl); },
      onClose: function () { if (audio) { audio.pause(); audio = null; } }
    });
  }

  function _initPlayer(audioUrl) {
    if (!audioUrl) return;
    audio   = new Audio(audioUrl);
    playBtn = document.getElementById('medPlay');
    var slider = document.getElementById('medSlider');
    var cur    = document.getElementById('medCur');
    var tot    = document.getElementById('medTot');

    audio.addEventListener('loadedmetadata', function () {
      slider.max = audio.duration;
      tot.textContent = _fmt(audio.duration);
    });
    audio.addEventListener('timeupdate', function () {
      slider.value   = audio.currentTime;
      cur.textContent = _fmt(audio.currentTime);
    });
    audio.addEventListener('ended', function () { _setIcon(true); });

    if (playBtn) playBtn.addEventListener('click', function () {
      if (audio.paused) { audio.play(); _setIcon(false); }
      else              { audio.pause(); _setIcon(true);  }
    });
    slider.addEventListener('input', function () { audio.currentTime = slider.value; });
    document.getElementById('medBack').addEventListener('click', function () { audio.currentTime = Math.max(0, audio.currentTime - 15); });
    document.getElementById('medFwd').addEventListener('click',  function () { audio.currentTime = Math.min(audio.duration, audio.currentTime + 15); });

    audio.play().then(function () { _setIcon(false); }).catch(function () {});
  }

  function _setIcon(showPlay) {
    if (!playBtn) return;
    playBtn.innerHTML = showPlay
      ? '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  }

  function _fmt(sec) {
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { play: play };
})();
