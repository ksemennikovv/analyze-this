/* Chat Module - universal chat engine used by analysis roller */
var Chat = (function () {
  'use strict';

  var _opts = {};
  var _analysisId = null;
  var _sending = false;

  function init(mountId, opts) {
    _opts = opts || {};
    var mount = document.getElementById(mountId);
    if (!mount) return;

    mount.innerHTML =
      '<div class="chat-roller-body">' +
        '<div class="chat-messages" id="chatMessages"></div>' +
        '<div class="chat-input-bar">' +
          '<button class="chat-voice-btn" id="chatVoiceBtn" title="Голосовой ввод">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>' +
              '<path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>' +
            '</svg>' +
          '</button>' +
          '<textarea id="chatInput" class="chat-ta" rows="1" placeholder="Напишите сообщение..."></textarea>' +
          '<button class="chat-send-btn" id="chatSendBtn">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<line x1="22" y1="2" x2="11" y2="13"/>' +
              '<polygon points="22 2 15 22 11 13 2 9 22 2"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
      '</div>';

    var ta   = document.getElementById('chatInput');
    var send = document.getElementById('chatSendBtn');

    ta.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 160) + 'px';
    });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    send.addEventListener('click', sendMessage);

    if (_opts.resume && _opts.analysisId) {
      _analysisId = _opts.analysisId;
      loadHistory();
    } else {
      startAnalysis(_opts.initialMessage || '');
    }
  }

  function startAnalysis(firstMsg) {
    _appendLoading();
    fetch('/pages/landing/hero-states/default-hero/api/start-analysis.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_message: firstMsg })
    })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      _removeLoading();
      if (!d.ok) { _appendSystem('Ошибка: ' + (d.error || '')); return; }
      _analysisId = d.analysis_id;
      Roller.setTitle('analysis-chat', d.title || 'Разбор');
      if (d.reply) _appendAI(d.reply);
    })
    .catch(function () { _removeLoading(); _appendSystem('Ошибка соединения'); });
  }

  function loadHistory() {
    fetch('/features/chat-roller/api/load-messages.php?analysis_id=' + _analysisId)
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d.ok) return;
      d.messages.forEach(function (m) {
        if (m.role === 'assistant') _appendAI(m.content);
        else if (m.role === 'user') _appendUser(m.content);
      });
      _scrollBottom();
    });
  }

  function sendMessage() {
    if (_sending) return;
    var ta  = document.getElementById('chatInput');
    var msg = ta ? ta.value.trim() : '';
    if (!msg || !_analysisId) return;

    _sending = true;
    ta.value = '';
    ta.style.height = 'auto';
    document.getElementById('chatSendBtn').disabled = true;

    _appendUser(msg);
    _appendLoading();

    fetch('/features/chat-roller/api/send-message.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis_id: _analysisId, content: msg })
    })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      _sending = false;
      document.getElementById('chatSendBtn').disabled = false;
      _removeLoading();
      if (!d.ok) { _appendSystem('Ошибка'); return; }
      if (d.reply) _appendAI(d.reply);
      if (d.completed && _opts.onComplete) {
        _analysisId = null;
        _opts.onComplete(Object.assign({}, d));
      }
    })
    .catch(function () {
      _sending = false;
      document.getElementById('chatSendBtn').disabled = false;
      _removeLoading();
      _appendSystem('Ошибка соединения');
    });
  }

  var AI_AVATAR =
    '<div style="width:32px;height:32px;border-radius:50%;background:#0D0B1E;' +
         'display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8">' +
        '<circle cx="12" cy="12" r="10"/>' +
        '<path d="M8 14s1.5 2 4 2 4-2 4-2"/>' +
        '<line x1="9" y1="9" x2="9.01" y2="9"/>' +
        '<line x1="15" y1="9" x2="15.01" y2="9"/>' +
      '</svg>' +
    '</div>';

  function _appendAI(text) {
    var msgs = document.getElementById('chatMessages');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'msg-ai';
    div.innerHTML = AI_AVATAR + '<div class="msg-ai-bubble">' + _nl2br(_esc(text)) + '</div>';
    msgs.appendChild(div);
    _scrollBottom();
  }

  function _appendUser(text) {
    var msgs = document.getElementById('chatMessages');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'msg-user';
    div.innerHTML = '<div class="msg-user-bubble">' + _nl2br(_esc(text)) + '</div>';
    msgs.appendChild(div);
    _scrollBottom();
  }

  function _appendSystem(text) {
    var msgs = document.getElementById('chatMessages');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'msg-system';
    div.textContent = text;
    msgs.appendChild(div);
    _scrollBottom();
  }

  function _appendLoading() {
    var msgs = document.getElementById('chatMessages');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'msg-ai';
    div.id = 'chatLoading';
    div.innerHTML =
      AI_AVATAR +
      '<div class="msg-ai-bubble loading">' +
        '<span style="width:7px;height:7px;border-radius:50%;background:#999;display:inline-block;margin:0 2px;animation:chatDot 1.2s ease infinite"></span>' +
        '<span style="width:7px;height:7px;border-radius:50%;background:#999;display:inline-block;margin:0 2px;animation:chatDot 1.2s ease .2s infinite"></span>' +
        '<span style="width:7px;height:7px;border-radius:50%;background:#999;display:inline-block;margin:0 2px;animation:chatDot 1.2s ease .4s infinite"></span>' +
      '</div>';
    msgs.appendChild(div);
    _scrollBottom();
  }

  function _removeLoading() {
    var el = document.getElementById('chatLoading');
    if (el) el.remove();
  }

  function _scrollBottom() {
    var msgs = document.getElementById('chatMessages');
    if (msgs) setTimeout(function () { msgs.scrollTop = msgs.scrollHeight; }, 50);
  }

  function _esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function _nl2br(s) { return s.replace(/\n/g, '<br>'); }

  return { init: init, getAnalysisId: function () { return _analysisId; } };
})();