<?php
class PromptService {
    private string $promptsDir;

    public function __construct() {
        $this->promptsDir = __DIR__ . '/../../prompts/';
    }

    public function load(string $name): string {
        $file = $this->promptsDir . $name . '.txt';
        if (!file_exists($file)) {
            return '';
        }
        return trim(file_get_contents($file));
    }

    public function analysis(): string   { return $this->load('analysis-system-prompt'); }
    public function report(): string     { return $this->load('practice-report-system-prompt'); }
    public function reflection(): string { return $this->load('reflection-system-prompt'); }
    public function safety(): string     { return $this->load('safety-system-prompt'); }
    public function memory(): string     { return $this->load('memory-update-prompt'); }
}
