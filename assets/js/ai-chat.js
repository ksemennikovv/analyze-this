/* ================================================================
 * ai-chat.js — универсальный AI-chat модуль (streaming SSE)
 * ================================================================ */
var AiChat = (function() {

    function addBubble(container, role, text) {
        var wrap   = document.createElement('div');
        wrap.className = 'chat-msg chat-msg--' + (role === 'user' ? 'user' : 'bot');
        var bubble = document.createElement('div');
        if (text === null) {
            bubble.className = 'chat-bubble chat-typing';
            bubble.innerHTML = '<span></span><span></span><span></span>';
        } else {
            bubble.className = 'chat-bubble';
            bubble.textContent = text;
        }
        wrap.appendChild(bubble);
        container.appendChild(wrap);
        UI.scrollToBottom(true);
        return bubble;
    }

    function parseSSE(resp, onChunk, onDone, onError) {
        var reader  = resp.body.getReader();
        var decoder = new TextDecoder();
        var buf     = '';
        var full    = '';
        var hadError = false;

        function read() {
            reader.read().then(function(chunk) {
                if (chunk.done) {
                    if (!hadError) onDone(full);
                    return;
                }
                buf += decoder.decode(chunk.value, { stream: true });
                var lines = buf.split('\n');
                buf = lines.pop();

                lines.forEach(function(line) {
                    if (!line.startsWith('data: ')) return;
                    var raw = line.slice(6).trim();
                    if (raw === '[DONE]') return;
                    try {
                        var ev = JSON.parse(raw);
                        if (ev.type === 'error') {
                            hadError = true;
                            onError(ev.error && ev.error.message ? ev.error.message : 'Ошибка API');
                        }
                        if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') {
                            full += ev.delta.text;
                            onChunk(full.replace('[END_SESSION]', '').trim());
                            UI.scrollToBottom(false);
                        }
                    } catch (e) {}
                });
                read();
            }).catch(function() { onError('Ошибка чтения потока'); });
        }
        read();
    }

    function send(options) {
        /* options: container, messages, sendBtn, onEnd */
        var container = options.container;
        var messages  = options.messages;
        var sendBtn   = options.sendBtn;
        var onEnd     = options.onEnd;

        var botBubble = addBubble(container, 'bot', null);
        if (sendBtn) sendBtn.disabled = true;

        API.sendAnalysisMessage(messages)
            .then(function(resp) {
                if (!resp.ok) {
                    resp.text().then(function(t) { onErr(botBubble, 'Ошибка ' + resp.status); });
                    return;
                }
                parseSSE(
                    resp,
                    function(partial) {
                        botBubble.className = 'chat-bubble';
                        botBubble.textContent = partial;
                    },
                    function(full) {
                        var ended = full.indexOf('[END_SESSION]') !== -1;
                        full = full.replace('[END_SESSION]', '').trim();
                        botBubble.className = 'chat-bubble';
                        botBubble.textContent = full;
                        if (sendBtn) sendBtn.disabled = false;
                        UI.scrollToBottom(true);
                        if (onEnd) onEnd(full, ended);
                    },
                    function(msg) { onErr(botBubble, msg); if (sendBtn) sendBtn.disabled = false; }
                );
            })
            .catch(function(e) { onErr(botBubble, 'Сеть: ' + e.message); if (sendBtn) sendBtn.disabled = false; });
    }

    function onErr(bubble, msg) {
        bubble.className = 'chat-bubble';
        bubble.textContent = '⚠ ' + (msg || 'Ошибка соединения');
    }

    return { send: send, addBubble: addBubble };
})();
