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
  var ctaBtn       = document.getElementById('ctaMain');
  var chatSect     = document.getElementById('chatSection');
  var msgsList     = document.getElementById('chatMessages');
  var chatInput    = document.getElementById('chatInput');
  var sendBtn      = document.getElementById('chatSend');
  var userArea     = document.getElementById('userText');
  var chatInputBox = document.getElementById('chatInputBox');

  if(!ctaBtn || !chatSect) return;

  var history         = (window.__chatHistory = window.__chatHistory || []);
  var busy            = false;
  var SESSION_TRIGGER = 6; /* history entries (user+assistant) before forced trigger */

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

    var botBubble = addBubble('bot', null);
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
            if(!full) { onErr(botBubble, 'Пустой ответ от сервера'); return; }

            var ended = full.indexOf('[END_SESSION]') !== -1;
            full = full.replace('[END_SESSION]', '').trim();

            botBubble.className = 'chat-bubble';
            botBubble.textContent = full;
            history.push({role:'assistant', content: full});
            busy = false;
            sendBtn.disabled = false;

            if(ended || history.length >= SESSION_TRIGGER){
              if(chatInputBox) chatInputBox.style.display = 'none';
              if(window.__onChatEnd) window.__onChatEnd(history);
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
                botBubble.textContent = full.replace('[END_SESSION]', '').trim();
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

  function addBubble(role, text){
    var wrap   = document.createElement('div');
    wrap.className = 'chat-msg chat-msg--' + role;
    var bubble = document.createElement('div');

    if(text === null){
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

/* ============ AUTH FLOW ============ */
(function(){
  var heroSection   = document.getElementById('heroSection');
  var regSection    = document.getElementById('regSection');
  var verifySection = document.getElementById('verifySection');
  var videoSection  = document.getElementById('videoSection');
  var regEmail      = document.getElementById('regEmail');
  var regCheck1     = document.getElementById('regCheck1');
  var regCheck2     = document.getElementById('regCheck2');
  var regSubmit     = document.getElementById('regSubmit');
  var regError      = document.getElementById('regError');
  var verifyCode    = document.getElementById('verifyCode');
  var verifySubmit  = document.getElementById('verifySubmit');
  var verifyError   = document.getElementById('verifyError');
  var resendCode    = document.getElementById('resendCode');
  var videoGreeting = document.getElementById('videoGreeting');
  var practiceVideo = document.getElementById('practiceVideo');
  var videoPlaceholder = document.getElementById('videoPlaceholder');

  var pendingEmail = '';

  /* ---------- session check on page load ---------- */
  var fd = new FormData();
  fd.append('action', 'check');
  fetch('php/auth.php', {method:'POST', body:fd})
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(d.ok){
        if(heroSection) heroSection.style.display = 'none';
        showVideo(d.name, d.video);
        if(window.__setMenuUser) window.__setMenuUser(d.name, '');
      }
    });

  /* ---------- called when chat ends (from chat IIFE) ---------- */
  window.__onChatEnd = function(history){
    window.__pendingHistory = history;
    if(regSection){
      regSection.style.display = 'block';
      setTimeout(function(){ regSection.scrollIntoView({behavior:'smooth', block:'start'}); }, 60);
    }
  };

  /* ---------- extract name from chat history ---------- */
  function extractName(history){
    for(var i = 1; i < history.length; i++){
      if(history[i-1].role === 'assistant' &&
         /им[яе]|зовут|назыв/i.test(history[i-1].content) &&
         history[i].role === 'user'){
        var n = history[i].content.trim();
        if(n.length < 40) return n;
      }
    }
    return '';
  }

  /* ---------- registration form ---------- */
  function submitReg(){
    if(regError) regError.textContent = '';
    var email = regEmail ? regEmail.value.trim() : '';
    if(!email){ if(regError) regError.textContent = 'Введите email'; return; }
    if(!regCheck1 || !regCheck1.checked){ if(regError) regError.textContent = 'Подтвердите условия использования'; return; }
    if(!regCheck2 || !regCheck2.checked){ if(regError) regError.textContent = 'Подтвердите согласие на обработку данных'; return; }

    pendingEmail = email;
    if(regSubmit){ regSubmit.disabled = true; regSubmit.textContent = 'Отправляем…'; }

    fetch('php/register.php', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email:   email,
        name:    extractName(window.__pendingHistory || []),
        history: window.__pendingHistory || []
      })
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(regSubmit){ regSubmit.disabled = false; regSubmit.textContent = 'Получить практику'; }
      if(!d.ok){ if(regError) regError.textContent = d.error || 'Ошибка'; return; }
      if(regSection) regSection.style.display = 'none';
      if(verifySection){
        verifySection.style.display = 'block';
        setTimeout(function(){ verifySection.scrollIntoView({behavior:'smooth', block:'start'}); }, 60);
        if(verifyCode) verifyCode.focus();
      }
    })
    .catch(function(){
      if(regSubmit){ regSubmit.disabled = false; regSubmit.textContent = 'Получить практику'; }
      if(regError) regError.textContent = 'Ошибка соединения';
    });
  }

  if(regSubmit) regSubmit.addEventListener('click', submitReg);
  if(regEmail)  regEmail.addEventListener('keydown', function(e){ if(e.key==='Enter') submitReg(); });

  /* ---------- resend code ---------- */
  if(resendCode){
    resendCode.addEventListener('click', function(){
      if(!pendingEmail) return;
      fetch('php/register.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: pendingEmail, history: window.__pendingHistory || []})
      });
      if(verifyError) verifyError.textContent = 'Код отправлен повторно';
    });
  }

  /* ---------- verification form ---------- */
  function submitVerify(){
    if(verifyError) verifyError.textContent = '';
    var code = verifyCode ? verifyCode.value.trim() : '';
    if(code.length !== 6){ if(verifyError) verifyError.textContent = 'Введите 6-значный код'; return; }

    if(verifySubmit){ verifySubmit.disabled = true; verifySubmit.textContent = 'Проверяем…'; }

    fetch('php/verify.php', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: pendingEmail, code: code})
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(verifySubmit){ verifySubmit.disabled = false; verifySubmit.textContent = 'Подтвердить'; }
      if(!d.ok){ if(verifyError) verifyError.textContent = d.error || 'Ошибка'; return; }
      if(verifySection) verifySection.style.display = 'none';
      showVideo(d.name, d.video);
      if(window.__setMenuUser) window.__setMenuUser(d.name, pendingEmail);
    })
    .catch(function(){
      if(verifySubmit){ verifySubmit.disabled = false; verifySubmit.textContent = 'Подтвердить'; }
      if(verifyError) verifyError.textContent = 'Ошибка соединения';
    });
  }

  if(verifySubmit) verifySubmit.addEventListener('click', submitVerify);
  if(verifyCode)   verifyCode.addEventListener('keydown', function(e){ if(e.key==='Enter') submitVerify(); });

  /* ---------- show video section ---------- */
  function showVideo(name, videoUrl){
    if(!videoSection) return;
    videoSection.style.display = 'block';
    setTimeout(function(){ videoSection.scrollIntoView({behavior:'smooth', block:'start'}); }, 60);

    if(videoGreeting){
      videoGreeting.textContent = 'Здравствуйте' + (name ? ', ' + name : '') + '! Вот ваша практика:';
    }

    var src = videoUrl || 'videos/practice.mp4';
    if(practiceVideo){
      practiceVideo.addEventListener('loadeddata', function(){
        if(videoPlaceholder) videoPlaceholder.style.display = 'none';
        practiceVideo.style.display = 'block';
      }, {once: true});
      practiceVideo.addEventListener('error', function(){
        practiceVideo.style.display = 'none';
        if(videoPlaceholder) videoPlaceholder.style.display = 'flex';
      }, {once: true});
      practiceVideo.src = src;
      practiceVideo.load();
    }
  }

  window.__showVideo = showVideo;
})();

/* ============ SIDE MENU ============ */
(function(){
  var toggle   = document.getElementById('menuToggle');
  var menu     = document.getElementById('sideMenu');
  var overlay  = document.getElementById('sideMenuOverlay');
  var closeBtn = document.getElementById('sideMenuClose');
  var nameEl   = document.getElementById('menuUserName');
  var logoutBtn= document.getElementById('menuLogoutBtn');

  function openMenu(){ menu.classList.add('open'); overlay.classList.add('open'); }
  function closeMenu(){ menu.classList.remove('open'); overlay.classList.remove('open'); }

  if(toggle)   toggle.addEventListener('click', openMenu);
  if(closeBtn) closeBtn.addEventListener('click', closeMenu);
  if(overlay)  overlay.addEventListener('click', closeMenu);

  /* set username from auth */
  window.__setMenuUser = function(name, email){
    if(!nameEl) return;
    nameEl.textContent = name || (email ? email.split('@')[0] : 'Пользователь');
    if(toggle) toggle.style.display = 'flex';
  };

  /* logout */
  if(logoutBtn){
    logoutBtn.addEventListener('click', function(){
      var fd = new FormData();
      fd.append('action','logout');
      fetch('php/auth.php',{method:'POST',body:fd}).then(function(){
        closeMenu();
        if(toggle) toggle.style.display = 'none';
        var heroSection   = document.getElementById('heroSection');
        var chatSection   = document.getElementById('chatSection');
        var regSection    = document.getElementById('regSection');
        var verifySection = document.getElementById('verifySection');
        var videoSection  = document.getElementById('videoSection');
        var msgs          = document.getElementById('chatMessages');
        var chatInputBox  = document.getElementById('chatInputBox');
        if(heroSection)   heroSection.style.display = 'block';
        if(chatSection)   chatSection.style.display = 'none';
        if(regSection)    regSection.style.display = 'none';
        if(verifySection) verifySection.style.display = 'none';
        if(videoSection)  videoSection.style.display = 'none';
        if(msgs)          msgs.innerHTML = '';
        if(chatInputBox)  chatInputBox.style.display = '';
        window.__chatHistory     = [];
        window.__pendingHistory  = null;
      });
    });
  }

  /* language toggle */
  document.querySelectorAll('.lang-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.lang-btn').forEach(function(b){ b.classList.remove('lang-btn--active'); });
      btn.classList.add('lang-btn--active');
      /* language switching UI only for now */
    });
  });
})();
