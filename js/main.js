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

  var history  = [];
  var busy     = false;

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
      var reader  = resp.body.getReader();
      var decoder = new TextDecoder();
      var buf     = '';
      var full    = '';

      function read(){
        reader.read().then(function(chunk){
          if(chunk.done){
            history.push({role:'assistant', content: full});
            busy = false;
            sendBtn.disabled = false;
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
              if(ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta'){
                full += ev.delta.text;
                botBubble.textContent = full;
                botBubble.parentNode.scrollIntoView({behavior:'smooth', block:'end'});
              }
            }catch(e){}
          });

          read();
        }).catch(function(){ onErr(botBubble); });
      }
      read();
    })
    .catch(function(){ onErr(botBubble); });
  }

  function onErr(bubble){
    bubble.textContent = 'Ошибка соединения. Попробуйте ещё раз.';
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
