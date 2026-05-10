<?php
class ChatService {
    private mysqli $db;

    public function __construct(mysqli $db) {
        $this->db = $db;
    }

    private function getOrCreateConversation(int $userId): int {
        $stmt = $this->db->prepare(
            'SELECT id FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
        );
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if ($row) return (int)$row['id'];

        $stmt = $this->db->prepare(
            'INSERT INTO conversations (user_id, type) VALUES (?, ?)'
        );
        $type = 'analysis';
        $stmt->bind_param('is', $userId, $type);
        $stmt->execute();
        $id = $this->db->insert_id;
        $stmt->close();
        return $id;
    }

    public function getHistory(int $userId): array {
        $stmt = $this->db->prepare(
            'SELECT role, content FROM messages WHERE user_id = ? ORDER BY created_at ASC'
        );
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();
        return $rows;
    }

    public function saveMessage(int $userId, string $role, string $content): void {
        $convId = $this->getOrCreateConversation($userId);
        $stmt = $this->db->prepare(
            'INSERT INTO messages (conversation_id, user_id, role, content) VALUES (?, ?, ?, ?)'
        );
        $stmt->bind_param('iiss', $convId, $userId, $role, $content);
        $stmt->execute();
        $stmt->close();
    }

    public function saveBulk(int $userId, array $messages): void {
        if (empty($messages)) return;
        $convId = $this->getOrCreateConversation($userId);
        $stmt = $this->db->prepare(
            'INSERT INTO messages (conversation_id, user_id, role, content) VALUES (?, ?, ?, ?)'
        );
        foreach ($messages as $m) {
            if (isset($m['role'], $m['content']) && in_array($m['role'], ['user', 'assistant'], true)) {
                $stmt->bind_param('iiss', $convId, $userId, $m['role'], $m['content']);
                $stmt->execute();
            }
        }
        $stmt->close();
    }
}
