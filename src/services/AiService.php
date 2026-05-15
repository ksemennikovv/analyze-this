<?php
require_once __DIR__ . '/../../config/ai.php';

class AiService {

    public function chat(string $system, array $messages): ?string {
        if (ACTIVE_PROVIDER === 'claude') {
            return $this->chatClaude($system, $messages);
        }
        return $this->chatOpenAICompat($system, $messages);
    }

    private function chatClaude(string $system, array $messages): ?string {
        $ch = curl_init('https://api.anthropic.com/v1/messages');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode([
                'model'      => CLAUDE_MODEL,
                'max_tokens' => 2048,
                'system'     => $system,
                'messages'   => $messages,
            ]),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'x-api-key: ' . CLAUDE_API_KEY,
                'anthropic-version: 2023-06-01',
            ],
            CURLOPT_TIMEOUT => 60,
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
        if (!$response) return null;
        $data = json_decode($response, true);
        return $data['content'][0]['text'] ?? null;
    }

    private function chatOpenAICompat(string $system, array $messages): ?string {
        $url    = ACTIVE_PROVIDER === 'openai'
            ? 'https://api.openai.com/v1/chat/completions'
            : 'https://api.deepseek.com/v1/chat/completions';
        $apiKey = ACTIVE_PROVIDER === 'openai' ? OPENAI_API_KEY : DEEPSEEK_API_KEY;
        $model  = ACTIVE_PROVIDER === 'openai' ? OPENAI_MODEL   : DEEPSEEK_MODEL;

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode([
                'model'      => $model,
                'messages'   => array_merge([['role' => 'system', 'content' => $system]], $messages),
                'max_tokens' => 2048,
                'stream'     => false,
            ]),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey,
            ],
            CURLOPT_CONNECTTIMEOUT => 15,
            CURLOPT_TIMEOUT        => 120,
        ]);
        $body = curl_exec($ch);
        $err  = curl_errno($ch) ? curl_error($ch) : null;
        curl_close($ch);
        if ($err || !$body) return null;
        $json = json_decode($body, true);
        if (isset($json['error'])) return null;
        return $json['choices'][0]['message']['content'] ?? null;
    }

    public function streamAnalysis(array $messages, string $systemPrompt): void {
        if (ob_get_level()) ob_end_clean();
        ini_set('output_buffering', 'off');
        ini_set('zlib.output_compression', false);
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('X-Accel-Buffering: no');

        if (ACTIVE_PROVIDER === 'claude') {
            $this->streamClaude($messages, $systemPrompt);
        } else {
            $this->streamOpenAICompat($messages, $systemPrompt);
        }
    }

    private function streamClaude(array $messages, string $system): void {
        $payload = json_encode([
            'model'      => CLAUDE_MODEL,
            'max_tokens' => 3000,
            'system'     => $system,
            'messages'   => $messages,
            'stream'     => true,
        ]);

        $ch = curl_init('https://api.anthropic.com/v1/messages');
        curl_setopt_array($ch, [
            CURLOPT_POST          => true,
            CURLOPT_POSTFIELDS    => $payload,
            CURLOPT_HTTPHEADER    => [
                'Content-Type: application/json',
                'x-api-key: ' . CLAUDE_API_KEY,
                'anthropic-version: 2023-06-01',
            ],
            CURLOPT_WRITEFUNCTION => function ($ch, $data) {
                echo $data;
                if (ob_get_level()) ob_flush();
                flush();
                return strlen($data);
            },
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_TIMEOUT        => 120,
        ]);
        curl_exec($ch);
        curl_close($ch);
    }

    private function streamOpenAICompat(array $messages, string $system): void {
        $url    = ACTIVE_PROVIDER === 'openai'
            ? 'https://api.openai.com/v1/chat/completions'
            : 'https://api.deepseek.com/v1/chat/completions';
        $apiKey = ACTIVE_PROVIDER === 'openai' ? OPENAI_API_KEY : DEEPSEEK_API_KEY;
        $model  = ACTIVE_PROVIDER === 'openai' ? OPENAI_MODEL   : DEEPSEEK_MODEL;

        $oaiMessages = array_merge([['role' => 'system', 'content' => $system]], $messages);
        $payload = json_encode([
            'model'      => $model,
            'messages'   => $oaiMessages,
            'stream'     => false,
            'max_tokens' => 3000,
        ]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1,
            CURLOPT_CONNECTTIMEOUT => 15,
            CURLOPT_TIMEOUT        => 120,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey,
            ],
        ]);

        $body     = curl_exec($ch);
        $curlErr  = curl_errno($ch) ? curl_error($ch) : null;
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($curlErr) {
            $this->sseError('cURL: ' . $curlErr);
            return;
        }

        $json = $body ? json_decode($body, true) : null;
        if (!$json) {
            $this->sseError("Пустой ответ (HTTP $httpCode)");
            return;
        }
        if (isset($json['error'])) {
            $this->sseError($json['error']['message'] ?? 'API error');
            return;
        }

        $text = $json['choices'][0]['message']['content'] ?? null;
        if ($text === null || $text === '') {
            $this->sseError("Пустой ответ от модели (HTTP $httpCode)");
            return;
        }

        echo 'data: ' . json_encode([
            'type'  => 'content_block_delta',
            'delta' => ['type' => 'text_delta', 'text' => $text],
        ]) . "\n\n";
        if (ob_get_level()) ob_flush();
        flush();
        echo "data: [DONE]\n\n";
        if (ob_get_level()) ob_flush();
        flush();
    }

    private function sseError(string $message): void {
        echo 'data: ' . json_encode(['type' => 'error', 'error' => ['message' => $message]]) . "\n\n";
        if (ob_get_level()) ob_flush();
        flush();
    }
}
