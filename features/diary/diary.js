var Diary = (function () {
  var currentEntryId = null;
  var sending = false;

  function newEntry() {
    currentEntryId = null;
    Roller.open({
      id: 'diary-new',
      title: 'Новая запись',
      content: _chatHtml(),
      onOpen: function () {
        _bindInput('diary-new');
        _appendTyping();
        fetch('/features/diary/api/start.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          _removeTyping();
          if (!d.ok) {
            if (d.error === 'paywall') { Roller.close(); window.location.href = '/billing.php'; }
            return;
          }
          currentEntryId = d.entry_id;
          Roller.setTitle('diary-new', d.title || 'Дневник');
          _appendMsg('assistant', d.message);
        });
      }
    });
  }

  function openEntry(id, title) {
    currentEntryId = id;
    Roller.open({
      id: 'diary-' + id,
      title: title,
      content: _chatHtml(),
      onOpen: function () {
        _bindInput('diary-' + id);
        fetch('/features/diary/api/history.php?id=' + id)
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (d.ok) d.messages.forEach(function (m) { _appendMsg(m.role, m.content); });
          });
      }
    });
  }

  function _chatHtml() {
    return '<div class="diary-roller-body">'
      + '<div class="diary-messages" id="diaryMessages"></div>'
      + '<div class="diary-input-bar">'
      +   '<textarea class="diary-input" id="diaryInput" placeholder="Напишите что думаете…" rows="1"></textarea>'
      +   '<button class="diary-send-btn" id="diarySendBtn">'
      +     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" stroke="none"/></svg>'
      +   '</button>'
      + '</div></div>';
  }

  function _bindInput() {
    var input = document.getElementById('diaryInput');
    var btn   = document.getElementById('diarySendBtn');
    if (!input || !btn) return;
    btn.addEventListener('click', _send);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); _send(); }
    });
    input.addEventListener('input', function () {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
  }

  function _send() {
    if (sending || !currentEntryId) return;
    var input = document.getElementById('diaryInput');
    var text  = (input ? input.value : '').trim();
    if (!text) return;
    input.value = ''; input.style.height = 'auto';
    _appendMsg('user', text);
    _appendTyping();
    sending = true;
    fetch('/features/diary/api/message.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_id: currentEntryId, message: text })
    })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      _removeTyping(); sending = false;
      if (d.ok) _appendMsg('assistant', d.reply);
    })
    .catch(function () { _removeTyping(); sending = false; });
  }

  function _appendMsg(role, text) {
    var msgs = document.getElementById('diaryMessages');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'diary-msg diary-msg--' + role;
    div.innerHTML = '<div class="diary-bubble">' + _esc(text) + '</div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function _appendTyping() {
    var msgs = document.getElementById('diaryMessages');
    if (!msgs || document.getElementById('diaryTyping')) return;
    var div = document.createElement('div');
    div.className = 'diary-msg diary-msg--assistant diary-typing';
    div.id = 'diaryTyping';
    div.innerHTML = '<div class="diary-bubble"><span class="diary-dot"></span><span class="diary-dot"></span><span class="diary-dot"></span></div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function _removeTyping() {
    var t = document.getElementById('diaryTyping');
    if (t) t.remove();
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var b1 = document.getElementById('diaryNewBtn');
    var b2 = document.getElementById('diaryNewBtn2');
    if (b1) b1.addEventListener('click', newEntry);
    if (b2) b2.addEventListener('click', newEntry);
  });

  return { newEntry: newEntry, openEntry: openEntry };
})();
