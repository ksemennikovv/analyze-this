<?php
class ClaudeService {
    private $apiKey;
    private $model;
    private $maxTokens;

    public function __construct() {
        $this->apiKey    = defined('AI_API_KEY')    ? AI_API_KEY    : '';
        $this->model     = defined('AI_MODEL')      ? AI_MODEL      : 'claude-sonnet-4-6';
        $this->maxTokens = defined('AI_MAX_TOKENS') ? AI_MAX_TOKENS : 1024;
    }

    public function chat(string $system, array $messages): ?string {
        if (!$this->apiKey) return null;

        $payload = [
            'model'      => $this->model,
            'max_tokens' => $this->maxTokens,
            'system'     => $system,
            'messages'   => $messages,
        ];

        $ch = curl_init('https://api.anthropic.com/v1/messages');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'x-api-key: ' . $this->apiKey,
                'anthropic-version: 2023-06-01',
            ],
            CURLOPT_TIMEOUT        => 60,
        ]);

        $response = curl_exec($ch);
        $err      = curl_error($ch);
        curl_close($ch);

        if ($err || !$response) return null;

        $data = json_decode($response, true);
        return $data['content'][0]['text'] ?? null;
    }

    public function streamChat(string $system, array $messages, callable $onChunk): void {
        if (!$this->apiKey) { $onChunk('', true); return; }

        $payload = [
            'model'      => $this->model,
            'max_tokens' => $this->maxTokens,
            'system'     => $system,
            'messages'   => $messages,
            'stream'     => true,
        ];

        $buffer = '';
        $ch = curl_init('https://api.anthropic.com/v1/messages');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'x-api-key: ' . $this->apiKey,
                'anthropic-version: 2023-06-01',
            ],
            CURLOPT_TIMEOUT        => 120,
            CURLOPT_WRITEFUNCTION  => function ($ch, $data) use (&$buffer, $onChunk) {
                $buffer .= $data;
                $lines = explode("\n", $buffer);
                $buffer = array_pop($lines);
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (strpos($line, 'data: ') === 0) {
                        $json = substr($line, 6);
                        $obj  = json_decode($json, true);
                        if (isset($obj['delta']['text'])) {
                            $onChunk($obj['delta']['text'], false);
                        }
                    }
                }
                return strlen($data);
            }
        ]);
        curl_exec($ch);
        curl_close($ch);
        $onChunk('', true);
    }
}
