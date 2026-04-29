function initCarousel(slidesId, prevId, nextId){
  const slidesContainer = document.getElementById(slidesId);
  if(!slidesContainer) return;
  const slides = Array.from(slidesContainer.children);
  const total = slides.length;
  let idx = 0;
  slides[0].classList.add('active');
  function go(newIdx){
    slides[idx].classList.remove('active');
    idx = (newIdx + total) % total;
    slides[idx].classList.add('active');
  }
  document.getElementById(prevId).addEventListener('click', () => go(idx - 1));
  document.getElementById(nextId).addEventListener('click', () => go(idx + 1));
}
initCarousel('rvSlides','rvPrev','rvNext');
initCarousel('vidSlides','vidPrev','vidNext');

(function(){
  const el = document.getElementById('socialCount');
  if(!el) return;
  let count = 23432;
  function format(n){
    return n.toLocaleString('ru-RU').replace(/\u00A0/g,' ') + '+ уже попробовали';
  }
  el.textContent = format(count);
  function tick(){
    count += 1;
    el.textContent = format(count);
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 500);
    const next = (5 + Math.random() * 25) * 1000;
    setTimeout(tick, next);
  }
  setTimeout(tick, (5 + Math.random() * 25) * 1000);
})();

(function(){
  var orb=document.getElementById('logoOrb');
  if(!orb)return;
  orb.addEventListener('click',function(){
    orb.classList.add('is-active');
    if(navigator.vibrate)try{navigator.vibrate(12)}catch(e){}
    setTimeout(function(){orb.classList.remove('is-active')},900);
  });
})();

(function(){
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var micBtn = document.getElementById('micBtn');
  var textarea = document.getElementById('userText');

  if(!SpeechRecognition || !micBtn){ if(micBtn) micBtn.style.display='none'; return; }

  var recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'ru-RU';

  var recording = false;
  var interim = '';
  var baseText = '';

  recognition.onresult = function(e){
    interim = '';
    var final = '';
    for(var i = e.resultIndex; i < e.results.length; i++){
      if(e.results[i].isFinal){
        final += e.results[i][0].transcript;
      } else {
        interim += e.results[i][0].transcript;
      }
    }
    if(final){
      baseText += final;
    }
    textarea.value = baseText + interim;
  };

  recognition.onerror = function(e){
    if(e.error === 'not-allowed' || e.error === 'service-not-allowed'){
      micBtn.style.display = 'none';
    }
    stopRec();
  };

  recognition.onend = function(){
    if(recording) recognition.start();
  };

  function startRec(){
    baseText = textarea.value;
    interim = '';
    recording = true;
    micBtn.classList.add('input-mic--recording');
    recognition.start();
  }

  function stopRec(){
    recording = false;
    micBtn.classList.remove('input-mic--recording');
    recognition.onend = null;
    try{ recognition.stop(); }catch(e){}
    recognition.onend = function(){ if(recording) recognition.start(); };
    textarea.value = baseText;
  }

  micBtn.addEventListener('click', function(){
    if(recording){ stopRec(); } else { startRec(); }
  });
})();

(function(){
  var ctaBtn    = document.querySelector('.cta-btn');
  var chatSect  = document.getElementById('chatSection');
  var msgsList  = document.getElementById('chatMessages');
  var chatInput = document.getElementById('chatInput');
  var sendBtn   = document.getElementById('chatSend');
  var userArea  = document.getElementById('userText');

  if(!ctaBtn || !chatSect) return;

  var history = (window.__chatHistory = window.__chatHistory || []);
  var busy    = false;

  function saveMsg(role, content){
    fetch('php/history.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({role:role, content:content})
    });
  }

  /* ---------- CTA click ---------- */
  ctaBtn.addEventListener('click', function(){
    var text = userArea ? userArea.value.trim() : '';
    if(!text){ if(userArea) userArea.focus(); return; }

    chatSect.style.display = 'block';
    setTimeout(function(){ chatSect.scrollIntoView({behavior:'smooth', block:'start'}); }, 60);

    if(userArea) userArea.value = '';
    dispatch(text);
  });

  /* ---------- send on button / Enter ---------- */
  sendBtn.addEventListener('click', function(){ submit(); });
  chatInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); submit(); }
  });

  function submit(){
    var t = chatInput.value.trim();
    if(!t || busy) return;
    chatInput.value = '';
    dispatch(t);
  }

  /* ---------- core ---------- */
  function dispatch(text){
    history.push({role:'user', content: text});
    saveMsg('user', text);
    addBubble('user', text);

    var botBubble = addBubble('bot', null); /* null = typing dots */
    busy = true;
    sendBtn.disabled = true;

    fetch('php/api.php', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({messages: history})
    })
    .then(function(resp){
      if(!resp.ok){
        resp.text().then(function(t){ onErr(botBubble, 'Ошибка ' + resp.status + ': ' + t.slice(0,120)); });
        return;
      }
      var reader  = resp.body.getReader();
      var decoder = new TextDecoder();
      var buf     = '';
      var full    = '';

      function read(){
        reader.read().then(function(chunk){
          if(chunk.done){
            if(!full) onErr(botBubble, 'Пустой ответ от сервера');
            else {
              botBubble.className = 'chat-bubble';
              history.push({role:'assistant', content: full});
              saveMsg('assistant', full);
              busy = false;
              sendBtn.disabled = false;
            }
            return;
          }
          buf += decoder.decode(chunk.value, {stream:true});
          var lines = buf.split('\n');
          buf = lines.pop();

          lines.forEach(function(line){
            if(!line.startsWith('data: ')) return;
            var raw = line.slice(6).trim();
            if(raw === '[DONE]') return;
            try{
              var ev = JSON.parse(raw);
              if(ev.type === 'error'){
                onErr(botBubble, ev.error && ev.error.message ? ev.error.message : 'Ошибка API');
              }
              if(ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta'){
                full += ev.delta.text;
                botBubble.className = 'chat-bubble';
                botBubble.textContent = full;
                botBubble.parentNode.scrollIntoView({behavior:'smooth', block:'end'});
              }
            }catch(e){}
          });

          read();
        }).catch(function(){ onErr(botBubble, 'Ошибка чтения потока'); });
      }
      read();
    })
    .catch(function(e){ onErr(botBubble, 'Сеть: ' + e.message); });
  }

  function onErr(bubble, msg){
    bubble.className = 'chat-bubble';
    bubble.textContent = '⚠ ' + (msg || 'Ошибка соединения');
    busy = false;
    sendBtn.disabled = false;
  }

  /* ---------- DOM helpers ---------- */
  function addBubble(role, text){
    var wrap   = document.createElement('div');
    wrap.className = 'chat-msg chat-msg--' + role;
    var bubble = document.createElement('div');

    if(text === null){
      /* typing indicator */
      bubble.className = 'chat-bubble chat-typing';
      bubble.innerHTML = '<span></span><span></span><span></span>';
    } else {
      bubble.className = 'chat-bubble';
      bubble.textContent = text;
    }

    wrap.appendChild(bubble);
    msgsList.appendChild(wrap);
    wrap.scrollIntoView({behavior:'smooth', block:'end'});
    return bubble;
  }
})();

(function(){
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var micBtn  = document.getElementById('chatMicBtn');
  var input   = document.getElementById('chatInput');

  if(!SpeechRecognition || !micBtn){ if(micBtn) micBtn.style.display='none'; return; }

  var recognition = new SpeechRecognition();
  recognition.continuous    = true;
  recognition.interimResults = true;
  recognition.lang          = 'ru-RU';

  var recording = false;
  var baseText  = '';
  var interim   = '';

  recognition.onresult = function(e){
    interim = '';
    var final = '';
    for(var i = e.resultIndex; i < e.results.length; i++){
      if(e.results[i].isFinal) final += e.results[i][0].transcript;
      else interim += e.results[i][0].transcript;
    }
    if(final) baseText += final;
    input.value = baseText + interim;
  };

  recognition.onerror = function(e){
    if(e.error === 'not-allowed' || e.error === 'service-not-allowed') micBtn.style.display = 'none';
    stopRec();
  };

  recognition.onend = function(){ if(recording) recognition.start(); };

  function startRec(){
    baseText = input.value;
    interim  = '';
    recording = true;
    micBtn.classList.add('input-mic--recording');
    recognition.start();
  }

  function stopRec(){
    recording = false;
    micBtn.classList.remove('input-mic--recording');
    recognition.onend = null;
    try{ recognition.stop(); }catch(e){}
    recognition.onend = function(){ if(recording) recognition.start(); };
    input.value = baseText;
  }

  micBtn.addEventListener('click', function(){
    if(recording) stopRec(); else startRec();
  });
})();

/* ============ AUTH + HISTORY ============ */
(function(){
  var modal    = document.getElementById('authModal');
  var emailEl  = document.getElementById('authEmail');
  var passEl   = document.getElementById('authPass');
  var submitEl = document.getElementById('authSubmit');
  var errorEl  = document.getElementById('authError');
  var switchEl = document.getElementById('authSwitch');

  var mode = 'login'; // 'login' | 'register'

  /* toggle login/register */
  switchEl.addEventListener('click', function(){
    mode = mode === 'login' ? 'register' : 'login';
    submitEl.textContent  = mode === 'login' ? 'Войти' : 'Зарегистрироваться';
    switchEl.textContent  = mode === 'login' ? 'Зарегистрироваться' : 'Войти';
    submitEl.previousElementSibling.textContent =
      mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?';
    errorEl.textContent = '';
  });

  /* submit */
  submitEl.addEventListener('click', function(){ doAuth(); });
  [emailEl, passEl].forEach(function(el){
    el.addEventListener('keydown', function(e){ if(e.key==='Enter') doAuth(); });
  });

  function doAuth(){
    errorEl.textContent = '';
    var fd = new FormData();
    fd.append('action',   mode);
    fd.append('email',    emailEl.value.trim());
    fd.append('password', passEl.value);

    fetch('php/auth.php', {method:'POST', body:fd})
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(!d.ok){ errorEl.textContent = d.error || 'Ошибка'; return; }
        onAuthed();
      })
      .catch(function(){ errorEl.textContent = 'Ошибка соединения'; });
  }

  function onAuthed(){
    modal.classList.add('hidden');
    loadHistory();
  }

  /* load history from DB */
  function loadHistory(){
    fetch('php/history.php')
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(!d.ok || !d.messages.length) return;

        var chatSect  = document.getElementById('chatSection');
        var msgsList  = document.getElementById('chatMessages');
        var histArr   = window.__chatHistory || [];

        chatSect.style.display = 'block';
        d.messages.forEach(function(m){
          histArr.push({role: m.role, content: m.content});
          var wrap   = document.createElement('div');
          wrap.className = 'chat-msg chat-msg--' + (m.role === 'user' ? 'user' : 'bot');
          var bubble = document.createElement('div');
          bubble.className = 'chat-bubble';
          bubble.textContent = m.content;
          wrap.appendChild(bubble);
          msgsList.appendChild(wrap);
        });
        window.__chatHistory = histArr;
      });
  }

  /* check session on load */
  var fd = new FormData();
  fd.append('action','check');
  fetch('php/auth.php', {method:'POST', body:fd})
    .then(function(r){ return r.json(); })
    .then(function(d){ if(d.ok) onAuthed(); });

})();
