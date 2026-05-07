/* ================================================================
 * voice-input.js — SpeechRecognition, start/stop, real-time transcription
 * ================================================================ */
function initVoiceInput(micBtnId, inputEl, opts) {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var micBtn = document.getElementById(micBtnId);
    if (!SpeechRecognition || !micBtn) {
        if (micBtn) micBtn.style.display = 'none';
        return null;
    }

    opts = opts || {};
    var lang      = opts.lang || 'ru-RU';
    var isContent = opts.contentEditable || false;
    var spacerEl  = opts.spacer || null;

    var recognition = new SpeechRecognition();
    recognition.continuous    = true;
    recognition.interimResults = true;
    recognition.lang          = lang;

    var recording = false;
    var baseText  = '';
    var interim   = '';

    function getVal() {
        if (isContent) return (inputEl.innerText || '').trim();
        return inputEl.value;
    }
    function setVal(v) {
        if (isContent) {
            Array.from(inputEl.childNodes).forEach(function(n) { if (n !== spacerEl) inputEl.removeChild(n); });
            if (v) inputEl.appendChild(document.createTextNode(v));
            if (spacerEl) inputEl.classList.toggle('is-empty', !v.trim());
        } else {
            inputEl.value = v;
        }
    }

    if (isContent && spacerEl) {
        inputEl.classList.add('is-empty');
        inputEl.addEventListener('input', function() {
            inputEl.classList.toggle('is-empty', !(getVal() || '').trim());
        });
    }

    recognition.onresult = function(e) {
        interim = '';
        var final = '';
        for (var i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) final += e.results[i][0].transcript;
            else interim += e.results[i][0].transcript;
        }
        if (final) baseText += final;
        setVal(baseText + interim);
    };

    recognition.onerror = function(e) {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
            micBtn.style.display = 'none';
        }
        stopRec();
    };

    recognition.onend = function() { if (recording) recognition.start(); };

    function startRec() {
        baseText = getVal();
        interim  = '';
        recording = true;
        micBtn.classList.add('input-mic--recording');
        inputEl.blur();
        recognition.start();
    }

    function stopRec(keepText) {
        recording = false;
        micBtn.classList.remove('input-mic--recording');
        recognition.onend = null;
        try { recognition.stop(); } catch (e) {}
        recognition.onend = function() { if (recording) recognition.start(); };
        if (!keepText) setVal(baseText);
    }

    micBtn.addEventListener('click', function() {
        if (recording) stopRec(); else startRec();
    });

    return { stop: function(keepText) { stopRec(keepText !== false); } };
}
