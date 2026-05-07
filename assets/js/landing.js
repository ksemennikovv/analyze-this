/* ================================================================
 * landing.js — инициализация лендинга, использует модули
 * ================================================================ */
(function() {

    /* ---- carousels ---- */
    initCarousel('rvSlides',  'rvPrev',  'rvNext');
    initCarousel('vidSlides', 'vidPrev', 'vidNext');

    /* ---- social counter ---- */
    (function() {
        var el = document.getElementById('socialCount');
        if (!el) return;
        var count = 23432;
        function format(n) {
            return n.toLocaleString('ru-RU').replace(/ /g, ' ') + '+ уже попробовали';
        }
        el.textContent = format(count);
        function tick() {
            count += 1;
            el.textContent = format(count);
            el.classList.add('bump');
            setTimeout(function() { el.classList.remove('bump'); }, 500);
            setTimeout(tick, (5 + Math.random() * 25) * 1000);
        }
        setTimeout(tick, (5 + Math.random() * 25) * 1000);
    })();

    /* ---- welcome banner ---- */
    (function() {
        if (new URLSearchParams(window.location.search).get('welcome') === '1') {
            var banner = document.getElementById('welcomeBanner');
            if (banner) banner.style.display = 'block';
            history.replaceState({}, '', '/');
        }
    })();

    /* ---- voice inputs ---- */
    var heroInput = document.getElementById('heroInput');
    var heroSpacer = document.getElementById('heroInputSpacer');
    var heroVoice = initVoiceInput('micBtn', heroInput, {
        contentEditable: !!heroSpacer,
        spacer: heroSpacer,
        lang: 'ru-RU'
    });

    var chatVoice = initVoiceInput('chatMicBtn', document.getElementById('chatInput'), { lang: 'ru-RU' });

    /* ---- hero submit ---- */
    var ctaBtn      = document.getElementById('ctaMain');
    var heroSendBtn = document.getElementById('heroSend');
    var chatSection = document.getElementById('chatSection');
    var msgsList    = document.getElementById('chatMessages');
    var chatInput   = document.getElementById('chatInput');
    var sendBtn     = document.getElementById('chatSend');
    var chatInputBox = document.getElementById('chatInputBox');

    var SESSION_TRIGGER = 6;
    var busy = false;

    function getHeroText() {
        if (!heroInput) return '';
        return heroInput.tagName === 'TEXTAREA'
            ? heroInput.value.trim()
            : (heroInput.innerText || '').trim();
    }
    function clearHeroInput() {
        if (!heroInput) return;
        if (heroInput.tagName === 'TEXTAREA') {
            heroInput.value = '';
        } else {
            var sp = document.getElementById('heroInputSpacer');
            Array.from(heroInput.childNodes).forEach(function(n) {
                if (n !== sp) heroInput.removeChild(n);
            });
            heroInput.classList.add('is-empty');
        }
    }

    function doHeroSubmit() {
        var text = getHeroText();
        if (heroVoice) heroVoice.stop();
        if (!text) { if (heroInput) heroInput.focus(); return; }
        var heroForm = document.getElementById('heroForm');
        if (heroForm) heroForm.style.display = 'none';
        clearHeroInput();
        if (chatSection) chatSection.style.display = 'block';
        UI.scrollToBottom(true);
        dispatch(text);
    }

    if (ctaBtn)      ctaBtn.addEventListener('click',   doHeroSubmit);
    if (heroSendBtn) heroSendBtn.addEventListener('click', doHeroSubmit);
    if (heroInput)   heroInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doHeroSubmit(); }
    });

    /* ---- chat send ---- */
    if (sendBtn) sendBtn.addEventListener('click', submit);
    if (chatInput) chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    });

    function submit() {
        var t = chatInput ? chatInput.value.trim() : '';
        if (!t || busy) return;
        if (chatVoice) chatVoice.stop();
        if (chatInput) chatInput.value = '';
        dispatch(t);
    }

    /* ---- dispatch message ---- */
    function dispatch(text) {
        AppState.chatHistory.push({ role: 'user', content: text });
        AiChat.addBubble(msgsList, 'user', text);

        AiChat.send({
            container: msgsList,
            messages:  AppState.chatHistory,
            sendBtn:   sendBtn,
            onEnd: function(full, ended) {
                AppState.chatHistory.push({ role: 'assistant', content: full });
                busy = false;
                if (!AppState.isLoggedIn && (ended || AppState.chatHistory.length >= SESSION_TRIGGER)) {
                    if (chatInputBox) chatInputBox.style.display = 'none';
                    showRegSection();
                }
            }
        });
        busy = true;
    }

    /* ---- registration gate ---- */
    function showRegSection() {
        var wolfSection = document.getElementById('wolfSection');
        var regSection  = document.getElementById('regSection');
        if (wolfSection) wolfSection.style.display = 'block';
        if (regSection) {
            regSection.style.display = 'block';
            setTimeout(function() { regSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
        }
        Flow.afterChatStart();
    }

    var regEmail  = document.getElementById('regEmail');
    var regCheck1 = document.getElementById('regCheck1');
    var regCheck2 = document.getElementById('regCheck2');
    var regSubmit = document.getElementById('regSubmit');
    var regError  = document.getElementById('regError');

    function extractName(hist) {
        for (var i = 1; i < hist.length; i++) {
            if (hist[i - 1].role === 'assistant' &&
                /им[яе]|зовут|назыв/i.test(hist[i - 1].content) &&
                hist[i].role === 'user') {
                var n = hist[i].content.trim();
                if (n.length < 40) return n;
            }
        }
        return '';
    }

    function submitReg() {
        UI.clearError(regError);
        var email = regEmail ? regEmail.value.trim() : '';
        if (!email) { UI.renderError(regError, 'Введите email'); return; }
        if (!regCheck1 || !regCheck1.checked) { UI.renderError(regError, 'Подтвердите условия использования'); return; }
        if (!regCheck2 || !regCheck2.checked) { UI.renderError(regError, 'Подтвердите согласие на обработку данных'); return; }

        UI.disableButton(regSubmit, 'Отправляем…');

        API.register({
            email:   email,
            name:    extractName(AppState.chatHistory),
            history: AppState.chatHistory
        }).then(function(d) {
            UI.enableButton(regSubmit, 'Получить практику');
            if (!d.ok) { UI.renderError(regError, d.error || 'Ошибка'); return; }
            AppState.pendingEmail = email;
            var regSection    = document.getElementById('regSection');
            var verifySection = document.getElementById('verifySection');
            if (regSection)    regSection.style.display = 'none';
            if (verifySection) {
                verifySection.style.display = 'block';
                setTimeout(function() { verifySection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
                var vc = document.getElementById('verifyCode');
                if (vc) vc.focus();
            }
            Flow.afterRegister();
        }).catch(function() {
            UI.enableButton(regSubmit, 'Получить практику');
            UI.renderError(regError, 'Ошибка соединения');
        });
    }

    if (regSubmit) regSubmit.addEventListener('click', submitReg);
    if (regEmail)  regEmail.addEventListener('keydown', function(e) { if (e.key === 'Enter') submitReg(); });

    /* ---- resend verification ---- */
    var resendCode = document.getElementById('resendCode');
    if (resendCode) {
        resendCode.addEventListener('click', function() {
            if (!AppState.pendingEmail) return;
            API.resendVerification(AppState.pendingEmail).then(function() {
                var ve = document.getElementById('verifyError');
                if (ve) { ve.textContent = 'Код отправлен повторно'; ve.style.color = 'var(--clr-ok, green)'; }
            }).catch(function() {});
        });
    }

    /* ---- verify email ---- */
    var verifyCode   = document.getElementById('verifyCode');
    var verifySubmit = document.getElementById('verifySubmit');
    var verifyError  = document.getElementById('verifyError');

    function submitVerify() {
        UI.clearError(verifyError);
        var code = verifyCode ? verifyCode.value.trim() : '';
        if (code.length !== 6) { UI.renderError(verifyError, 'Введите 6-значный код'); return; }
        UI.disableButton(verifySubmit, 'Проверяем…');
        API.post('/api/auth-verify-email.php', { email: AppState.pendingEmail, code: code })
            .then(function(d) {
                UI.enableButton(verifySubmit, 'Подтвердить');
                if (!d.ok) { UI.renderError(verifyError, d.error || 'Ошибка'); return; }
                AppState.isLoggedIn = true;
                AppState.user = d;
                var verifySection = document.getElementById('verifySection');
                if (verifySection) verifySection.style.display = 'none';
                showVideoSection(d.name, d.video);
                if (typeof applyAuthState === 'function') applyAuthState(d);
                Flow.afterVerify();
            }).catch(function() {
                UI.enableButton(verifySubmit, 'Подтвердить');
                UI.renderError(verifyError, 'Ошибка соединения');
            });
    }

    if (verifySubmit) verifySubmit.addEventListener('click', submitVerify);
    if (verifyCode)   verifyCode.addEventListener('keydown', function(e) { if (e.key === 'Enter') submitVerify(); });

    /* ---- show video section ---- */
    function showVideoSection(name, videoUrl) {
        var videoSection    = document.getElementById('videoSection');
        var wolfSection     = document.getElementById('wolfSection');
        var videoGreeting   = document.getElementById('videoGreeting');
        var practiceVideo   = document.getElementById('practiceVideo');
        var videoPlaceholder = document.getElementById('videoPlaceholder');
        if (!videoSection) return;
        if (wolfSection) wolfSection.style.display = 'block';
        videoSection.style.display = 'block';
        setTimeout(function() { videoSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
        if (videoGreeting) {
            videoGreeting.textContent = 'Здравствуйте' + (name ? ', ' + name : '') + '! Вот ваша практика:';
        }
        var src = videoUrl || 'videos/practice.mp4';
        if (practiceVideo) {
            practiceVideo.addEventListener('loadeddata', function() {
                if (videoPlaceholder) videoPlaceholder.style.display = 'none';
                practiceVideo.style.display = 'block';
            }, { once: true });
            practiceVideo.addEventListener('error', function() {
                practiceVideo.style.display = 'none';
                if (videoPlaceholder) videoPlaceholder.style.display = 'flex';
            }, { once: true });
            practiceVideo.src = src;
            practiceVideo.load();
        }
    }

    /* ---- load history for returning users ---- */
    function loadHistory(cb) {
        API.get('/api/chat-get-history.php').then(function(d) {
            if (d.ok && d.messages && d.messages.length) {
                if (chatSection) chatSection.style.display = 'block';
                d.messages.forEach(function(m) {
                    AppState.chatHistory.push({ role: m.role, content: m.content });
                    AiChat.addBubble(msgsList, m.role, m.content);
                });
            }
            if (cb) cb();
        }).catch(function() { if (cb) cb(); });
    }

    /* ---- session check on load ---- */
    API.getSession().then(function(res) {
        if (res.loggedIn) {
            AppState.isLoggedIn = true;
            AppState.user = res;
            var heroForm = document.getElementById('heroForm');
            if (heroForm) heroForm.style.display = 'none';
            loadHistory(function() { showVideoSection(res.name, res.video); });
        }
    }).catch(function() {});

})();
