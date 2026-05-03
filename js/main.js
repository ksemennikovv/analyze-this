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

/* ---- video carousel — pauses video on slide change ---- */
(function(){
  var container = document.getElementById('vidSlides');
  if(!container) return;
  var slides = Array.from(container.children);
  var total  = slides.length;
  var idx    = 0;
  slides[0].classList.add('active');

  function go(newIdx){
    var outVideo = slides[idx].querySelector('.vid-video');
    if(outVideo){ outVideo.pause(); outVideo.currentTime = 0; }
    slides[idx].classList.remove('active');
    idx = (newIdx + total) % total;
    slides[idx].classList.add('active');
  }

  var prev = document.getElementById('vidPrev');
  var next = document.getElementById('vidNext');
  if(prev) prev.addEventListener('click', function(){ go(idx - 1); });
  if(next) next.addEventListener('click', function(){ go(idx + 1); });
})();

/* ---- video circle player with ring progress ---- */
(function(){
  var CIRCUM = 2 * Math.PI * 116; /* r=116 → 729 */

  document.querySelectorAll('.vid-circle-wrap').forEach(function(wrap){
    var circle  = wrap.querySelector('.vid-circle-big');
    var video   = wrap.querySelector('.vid-video');
    var playBtn = wrap.querySelector('.vid-play-big');
    var durEl   = wrap.querySelector('.vid-dur-big');
    var prog    = wrap.querySelector('.vid-ring__prog');

    if(!video) return;

    prog.style.strokeDasharray  = CIRCUM;
    prog.style.strokeDashoffset = CIRCUM;

    function fmt(sec){
      var m = Math.floor(sec / 60);
      var s = Math.floor(sec % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    circle.addEventListener('click', function(){
      if(video.paused) video.play(); else video.pause();
    });

    video.addEventListener('play', function(){
      playBtn.style.opacity = '0';
      playBtn.style.pointerEvents = 'none';
    });

    video.addEventListener('pause', function(){
      playBtn.style.opacity = '1';
      playBtn.style.pointerEvents = '';
    });

    video.addEventListener('ended', function(){
      video.currentTime = 0;
      prog.style.strokeDashoffset = CIRCUM;
      video.play();
    });

    video.addEventListener('timeupdate', function(){
      if(!video.duration) return;
      var pct    = video.currentTime / video.duration;
      prog.style.strokeDashoffset = CIRCUM * (1 - pct);
      durEl.textContent = fmt(video.duration - video.currentTime);
    });

    video.addEventListener('loadedmetadata', function(){
      durEl.textContent = fmt(video.duration);
    });
  });
})();

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
  var micBtn  = document.getElementById('micBtn');
  var textarea = document.getElementById('userText');
  var _spacer  = document.getElementById('heroInputSpacer');

  if(!SpeechRecognition || !micBtn){ if(micBtn) micBtn.style.display='none'; return; }

  /* contenteditable helpers */
  function _getVal(){
    if(!_spacer) return textarea.value;
    return (textarea.innerText || '').trim();
  }
  function _setVal(v){
    if(!_spacer){ textarea.value = v; return; }
    Array.from(textarea.childNodes).forEach(function(n){ if(n !== _spacer) textarea.removeChild(n); });
    if(v) textarea.appendChild(document.createTextNode(v));
    textarea.classList.toggle('is-empty', !(v || '').trim());
  }
  function _updatePlaceholder(){
    if(_spacer) textarea.classList.toggle('is-empty', !_getVal());
  }

  /* init placeholder */
  if(_spacer){
    textarea.classList.add('is-empty');
    textarea.addEventListener('input', _updatePlaceholder);
  }

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
    if(final){ baseText += final; }
    _setVal(baseText + interim);
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
    baseText = _getVal();
    interim = '';
    recording = true;
    micBtn.classList.add('input-mic--recording');
    recognition.start();
  }

  function stopRec(keepText){
    recording = false;
    micBtn.classList.remove('input-mic--recording');
    recognition.onend = null;
    try{ recognition.stop(); }catch(e){}
    recognition.onend = function(){ if(recording) recognition.start(); };
    if(!keepText) _setVal(baseText);
  }

  micBtn.addEventListener('click', function(){
    if(recording){ stopRec(); } else { startRec(); }
  });

  window.__stopHeroMic = function(){ stopRec(true); };
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

  /* always scroll to bottom — keeps input pinned like ChatGPT */
  var _scrollTimer = null;
  function scrollBottom(smooth){
    clearTimeout(_scrollTimer);
    _scrollTimer = setTimeout(function(){
      var se = document.scrollingElement || document.documentElement;
      if(smooth) se.scrollTo({top: se.scrollHeight, behavior:'smooth'});
      else       se.scrollTop = se.scrollHeight;
    }, smooth ? 0 : 50);
  }

  /* ---------- CTA + hero send button ---------- */
  var heroSend = document.getElementById('heroSend');
  function doHeroSubmit(){
    var text = userArea
      ? (userArea.tagName === 'TEXTAREA' ? userArea.value.trim() : (userArea.innerText || '').trim())
      : '';
    if(window.__stopHeroMic) window.__stopHeroMic();
    if(!text){ if(userArea) userArea.focus(); return; }

    var hero = document.getElementById('heroSection');
    if(hero) hero.style.display = 'none';

    chatSect.style.display = 'block';
    setTimeout(function(){ scrollBottom(true); }, 60);

    if(userArea){
      if(userArea.tagName === 'TEXTAREA'){
        userArea.value = '';
      } else {
        var _sp = document.getElementById('heroInputSpacer');
        Array.from(userArea.childNodes).forEach(function(n){ if(n !== _sp) userArea.removeChild(n); });
        userArea.classList.add('is-empty');
      }
    }
    dispatch(text);
  }
  ctaBtn.addEventListener('click', doHeroSubmit);
  if(heroSend) heroSend.addEventListener('click', doHeroSubmit);
  if(userArea) userArea.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); doHeroSubmit(); }
  });

  /* ---------- send on button / Enter ---------- */
  sendBtn.addEventListener('click', function(){ submit(); });
  chatInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); submit(); }
  });

  function submit(){
    var t = chatInput.value.trim();
    if(!t || busy) return;
    if(window.__stopChatMic) window.__stopChatMic();
    chatInput.value = '';
    dispatch(t);
  }

  /* ---------- save message to DB (logged-in users only) ---------- */
  function saveMsg(role, content){
    if(!window.__isLoggedIn) return;
    fetch('php/history.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({role:role, content:content})
    });
  }

  /* ---------- core ---------- */
  function dispatch(text){
    history.push({role:'user', content: text});
    saveMsg('user', text);
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
      var reader   = resp.body.getReader();
      var decoder  = new TextDecoder();
      var buf      = '';
      var full     = '';
      var hadError = false;

      function read(){
        reader.read().then(function(chunk){
          if(chunk.done){
            if(!full){
              if(!hadError) onErr(botBubble, 'Пустой ответ от сервера');
              return;
            }

            var ended = full.indexOf('[END_SESSION]') !== -1;
            full = full.replace('[END_SESSION]', '').trim();

            botBubble.className = 'chat-bubble';
            botBubble.textContent = full;
            history.push({role:'assistant', content: full});
            saveMsg('assistant', full);
            busy = false;
            sendBtn.disabled = false;

            scrollBottom(true);
            if(chatInput && chatInputBox && chatInputBox.style.display !== 'none') chatInput.focus();

            /* only trigger reg flow for anonymous users */
            if(!window.__isLoggedIn && (ended || history.length >= SESSION_TRIGGER)){
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
                hadError = true;
                onErr(botBubble, ev.error && ev.error.message ? ev.error.message : 'Ошибка API');
              }
              if(ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta'){
                full += ev.delta.text;
                botBubble.className = 'chat-bubble';
                botBubble.textContent = full.replace('[END_SESSION]', '').trim();
                scrollBottom(false);
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
    scrollBottom(true);
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

  function onResult(e){
    interim = '';
    var final = '';
    for(var i = e.resultIndex; i < e.results.length; i++){
      if(e.results[i].isFinal) final += e.results[i][0].transcript;
      else interim += e.results[i][0].transcript;
    }
    if(final) baseText += final;
    input.value = baseText + interim;
  }
  recognition.onresult = onResult;

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

  function stopRec(keepText){
    recording = false;
    micBtn.classList.remove('input-mic--recording');
    recognition.onresult = null; /* block late final results */
    recognition.onend = null;
    try{ recognition.stop(); }catch(e){}
    recognition.onresult = onResult;
    recognition.onend = function(){ if(recording) recognition.start(); };
    if(!keepText) input.value = baseText;
  }

  micBtn.addEventListener('click', function(){
    if(recording) stopRec(); else startRec();
  });

  window.__stopChatMic = function(){ stopRec(true); };
})();

/* ============ WELCOME BANNER ============ */
(function(){
  if(new URLSearchParams(window.location.search).get('welcome') === '1'){
    var banner = document.getElementById('welcomeBanner');
    if(banner) banner.style.display = 'block';
    history.replaceState({}, '', '/');
  }
  var closeBtn = document.getElementById('welcomeClose');
  if(closeBtn) closeBtn.addEventListener('click', function(){
    var banner = document.getElementById('welcomeBanner');
    if(banner) banner.style.display = 'none';
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

  /* ---------- load chat history from DB and show chatSection ---------- */
  function loadHistory(cb){
    var chatSect = document.getElementById('chatSection');
    var msgsList = document.getElementById('chatMessages');

    fetch('php/history.php')
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(d.ok && d.messages && d.messages.length){
          if(chatSect) chatSect.style.display = 'block';
          window.__chatHistory = window.__chatHistory || [];
          d.messages.forEach(function(m){
            window.__chatHistory.push({role: m.role, content: m.content});
            var wrap   = document.createElement('div');
            wrap.className = 'chat-msg chat-msg--' + (m.role === 'user' ? 'user' : 'bot');
            var bubble = document.createElement('div');
            bubble.className = 'chat-bubble';
            bubble.textContent = m.content;
            wrap.appendChild(bubble);
            msgsList.appendChild(wrap);
          });
        }
        if(cb) cb();
      })
      .catch(function(){ if(cb) cb(); });
  }
  window.__loadHistory = loadHistory;

  /* ---------- session check on page load ---------- */
  var fd = new FormData();
  fd.append('action', 'check');
  fetch('php/auth.php', {method:'POST', body:fd})
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(d.ok){
        if(heroSection) heroSection.style.display = 'none';
        if(window.__setMenuUser) window.__setMenuUser(d.name, '');
        loadHistory(function(){ showVideo(d.name, d.video); });
      }
    });

  /* ---------- called when chat ends (from chat IIFE) ---------- */
  window.__onChatEnd = function(history){
    window.__pendingHistory = history;
    var wolfSection = document.getElementById('wolfSection');
    if(wolfSection) wolfSection.style.display = 'block';
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
    var wolfSection = document.getElementById('wolfSection');
    if(wolfSection) wolfSection.style.display = 'block';
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
  var toggle         = document.getElementById('menuToggle');
  var menu           = document.getElementById('sideMenu');
  var overlay        = document.getElementById('sideMenuOverlay');
  var closeBtn       = document.getElementById('sideMenuClose');
  var nameEl         = document.getElementById('menuUserName');
  var logoutBtn      = document.getElementById('menuLogoutBtn');
  var loginArea      = document.getElementById('menuLoginArea');
  var authedArea     = document.getElementById('menuAuthedArea');
  var loginErrEl     = document.getElementById('menuLoginError');
  var stepLogin      = document.getElementById('menuStepLogin');
  var stepForgot     = document.getElementById('menuStepForgot');
  var stepReset      = document.getElementById('menuStepReset');
  var emailEl        = document.getElementById('menuEmail');
  var passEl         = document.getElementById('menuPass');
  var loginBtn       = document.getElementById('menuLoginBtn');
  var forgotLink     = document.getElementById('menuForgotLink');
  var forgotEmailEl  = document.getElementById('menuForgotEmail');
  var forgotSendBtn  = document.getElementById('menuForgotSendBtn');
  var backToLoginEl  = document.getElementById('menuBackToLogin');
  var resetCodeEl    = document.getElementById('menuResetCode');
  var resetPassEl    = document.getElementById('menuResetPass');
  var resetBtn       = document.getElementById('menuResetBtn');

  var menuForgotEmail = '';

  function openMenu(){ menu.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow='hidden'; }
  function closeMenu(){ menu.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow=''; }
  function showStep(step){
    [stepLogin, stepForgot, stepReset].forEach(function(s){ if(s) s.style.display = 'none'; });
    if(step) step.style.display = 'block';
    if(loginErrEl) loginErrEl.textContent = '';
  }

  if(toggle)   toggle.addEventListener('click', openMenu);
  if(closeBtn) closeBtn.addEventListener('click', closeMenu);
  if(overlay)  overlay.addEventListener('click', closeMenu);
  if(forgotLink)    forgotLink.addEventListener('click', function(){ showStep(stepForgot); if(forgotEmailEl) forgotEmailEl.focus(); });
  if(backToLoginEl) backToLoginEl.addEventListener('click', function(){ showStep(stepLogin); });

  /* ---------- login: email + password ---------- */
  function doLogin(){
    if(loginErrEl) loginErrEl.textContent = '';
    var email = emailEl ? emailEl.value.trim() : '';
    var pass  = passEl  ? passEl.value         : '';
    if(!email || !pass){ if(loginErrEl) loginErrEl.textContent = 'Введите email и пароль'; return; }
    if(loginBtn){ loginBtn.disabled = true; loginBtn.textContent = 'Входим…'; }
    var fd = new FormData();
    fd.append('action', 'login'); fd.append('email', email); fd.append('password', pass);
    fetch('php/auth.php', {method:'POST', body:fd})
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(loginBtn){ loginBtn.disabled = false; loginBtn.textContent = 'Войти'; }
        if(!d.ok){ if(loginErrEl) loginErrEl.textContent = d.error || 'Неверный email или пароль'; return; }
        if(passEl) passEl.value = '';
        closeMenu();
        window.__setMenuUser(d.name || '', email);
        var heroSection = document.getElementById('heroSection');
        if(heroSection) heroSection.style.display = 'none';
        var fd2 = new FormData(); fd2.append('action','check');
        fetch('php/auth.php',{method:'POST',body:fd2}).then(function(r){ return r.json(); }).then(function(d2){
          if(!d2.ok) return;
          if(window.__loadHistory) window.__loadHistory(function(){ if(window.__showVideo) window.__showVideo(d2.name, d2.video); });
          else if(window.__showVideo) window.__showVideo(d2.name, d2.video);
        });
      })
      .catch(function(){
        if(loginBtn){ loginBtn.disabled = false; loginBtn.textContent = 'Войти'; }
        if(loginErrEl) loginErrEl.textContent = 'Ошибка соединения';
      });
  }

  /* ---------- forgot: send code ---------- */
  function doForgotSend(){
    if(loginErrEl) loginErrEl.textContent = '';
    var email = forgotEmailEl ? forgotEmailEl.value.trim() : '';
    if(!email){ if(loginErrEl) loginErrEl.textContent = 'Введите email'; return; }
    if(forgotSendBtn){ forgotSendBtn.disabled = true; forgotSendBtn.textContent = 'Отправляем…'; }
    menuForgotEmail = email;
    var fd = new FormData(); fd.append('action','forgot'); fd.append('email', email);
    fetch('php/auth.php',{method:'POST',body:fd})
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(forgotSendBtn){ forgotSendBtn.disabled = false; forgotSendBtn.textContent = 'Отправить код'; }
        if(!d.ok){ if(loginErrEl) loginErrEl.textContent = d.error || 'Ошибка'; return; }
        showStep(stepReset);
        if(resetCodeEl) resetCodeEl.focus();
      })
      .catch(function(){
        if(forgotSendBtn){ forgotSendBtn.disabled = false; forgotSendBtn.textContent = 'Отправить код'; }
        if(loginErrEl) loginErrEl.textContent = 'Ошибка соединения';
      });
  }

  /* ---------- forgot: verify code + new password ---------- */
  function doReset(){
    if(loginErrEl) loginErrEl.textContent = '';
    var code = resetCodeEl ? resetCodeEl.value.trim() : '';
    var pass = resetPassEl ? resetPassEl.value        : '';
    if(code.length !== 6){ if(loginErrEl) loginErrEl.textContent = 'Введите 6-значный код'; return; }
    if(pass.length < 6){   if(loginErrEl) loginErrEl.textContent = 'Пароль не менее 6 символов'; return; }
    if(resetBtn){ resetBtn.disabled = true; resetBtn.textContent = 'Сохраняем…'; }
    var fd = new FormData();
    fd.append('action','reset'); fd.append('email', menuForgotEmail);
    fd.append('code', code); fd.append('password', pass);
    fetch('php/auth.php',{method:'POST',body:fd})
      .then(function(r){ return r.json(); })
      .then(function(d){
        if(resetBtn){ resetBtn.disabled = false; resetBtn.textContent = 'Сохранить пароль'; }
        if(!d.ok){ if(loginErrEl) loginErrEl.textContent = d.error || 'Ошибка'; return; }
        if(resetCodeEl) resetCodeEl.value = '';
        if(resetPassEl) resetPassEl.value = '';
        showStep(stepLogin);
        closeMenu();
        window.__setMenuUser(d.name || '', menuForgotEmail);
        var heroSection = document.getElementById('heroSection');
        if(heroSection) heroSection.style.display = 'none';
        if(window.__loadHistory) window.__loadHistory(function(){ if(window.__showVideo) window.__showVideo(d.name, d.video); });
        else if(window.__showVideo) window.__showVideo(d.name, d.video);
      })
      .catch(function(){
        if(resetBtn){ resetBtn.disabled = false; resetBtn.textContent = 'Сохранить пароль'; }
        if(loginErrEl) loginErrEl.textContent = 'Ошибка соединения';
      });
  }

  if(loginBtn)      loginBtn.addEventListener('click', doLogin);
  if(forgotSendBtn) forgotSendBtn.addEventListener('click', doForgotSend);
  if(resetBtn)      resetBtn.addEventListener('click', doReset);
  if(emailEl)       emailEl.addEventListener('keydown',       function(e){ if(e.key==='Enter') doLogin(); });
  if(passEl)        passEl.addEventListener('keydown',        function(e){ if(e.key==='Enter') doLogin(); });
  if(forgotEmailEl) forgotEmailEl.addEventListener('keydown', function(e){ if(e.key==='Enter') doForgotSend(); });
  if(resetCodeEl)   resetCodeEl.addEventListener('keydown',   function(e){ if(e.key==='Enter') doReset(); });
  if(resetPassEl)   resetPassEl.addEventListener('keydown',   function(e){ if(e.key==='Enter') doReset(); });

  /* ---------- set user (called after login/verify/session check) ---------- */
  window.__setMenuUser = function(name, email){
    window.__isLoggedIn = true;
    if(nameEl) nameEl.textContent = name || (email ? email.split('@')[0] : 'Пользователь');
    if(loginArea)  loginArea.style.display  = 'none';
    if(authedArea) authedArea.style.display = 'block';
    if(logoutBtn)  logoutBtn.style.display  = 'flex';
  };

  /* ---------- logout ---------- */
  if(logoutBtn){
    logoutBtn.addEventListener('click', function(){
      var fd = new FormData();
      fd.append('action','logout');
      fetch('php/auth.php',{method:'POST',body:fd}).then(function(){
        closeMenu();
        if(loginArea)  loginArea.style.display  = 'flex';
        if(authedArea) authedArea.style.display = 'none';
        if(logoutBtn)  logoutBtn.style.display  = 'none';
        if(emailEl)    emailEl.value = '';
        if(passEl)     passEl.value  = '';
        if(loginErrEl) loginErrEl.textContent = '';
        var heroSection   = document.getElementById('heroSection');
        var chatSection   = document.getElementById('chatSection');
        var regSection    = document.getElementById('regSection');
        var verifySection = document.getElementById('verifySection');
        var videoSection  = document.getElementById('videoSection');
        var msgs          = document.getElementById('chatMessages');
        var chatInputBox  = document.getElementById('chatInputBox');
        var wolfSection = document.getElementById('wolfSection');
        if(heroSection)   heroSection.style.display = 'block';
        if(chatSection)   chatSection.style.display = 'none';
        if(wolfSection)   wolfSection.style.display  = 'none';
        if(regSection)    regSection.style.display  = 'none';
        if(verifySection) verifySection.style.display = 'none';
        if(videoSection)  videoSection.style.display = 'none';
        if(msgs)          msgs.innerHTML = '';
        if(chatInputBox)  chatInputBox.style.display = '';
        showStep(stepLogin);
        if(emailEl)    emailEl.value = '';
        if(passEl)     passEl.value  = '';
        menuForgotEmail = '';
        window.__isLoggedIn     = false;
        window.__chatHistory    = [];
        window.__pendingHistory = null;
      });
    });
  }

  /* ---------- language toggle ---------- */
  document.querySelectorAll('.lang-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.lang-btn').forEach(function(b){ b.classList.remove('lang-btn--active'); });
      btn.classList.add('lang-btn--active');
    });
  });
})();
