<?php
class ChatService {
    private mysqli $db;

    public function __construct(mysqli $db) {
        $this->db = $db;
    }

    public function getHistory(int $userId): array {
        $stmt = $this->db->prepare(
            'SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC'
        );
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function saveMessage(int $userId, string $role, string $content): void {
        $stmt = $this->db->prepare(
            'INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)'
        );
        $stmt->bind_param('iss', $userId, $role, $content);
        $stmt->execute();
    }

    public function saveBulk(int $userId, array $messages): void {
        $stmt = $this->db->prepare(
            'INSERT IGNORE INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)'
        );
        foreach ($messages as $m) {
            if (isset($m['role'], $m['content']) && in_array($m['role'], ['user', 'assistant'], true)) {
                $stmt->bind_param('iss', $userId, $m['role'], $m['content']);
                $stmt->execute();
            }
        }
    }
}
