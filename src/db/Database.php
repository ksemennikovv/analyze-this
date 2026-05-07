<?php
class Database {
    private static ?mysqli $conn = null;

    public static function getInstance(): mysqli {
        if (self::$conn === null) {
            mysqli_report(MYSQLI_REPORT_OFF);
            try {
                self::$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
                if (self::$conn->connect_error) {
                    http_response_code(500);
                    die(json_encode(['ok' => false, 'error' => 'Ошибка сервера. Попробуйте позже.']));
                }
                self::$conn->set_charset('utf8mb4');
            } catch (Exception $e) {
                http_response_code(500);
                die(json_encode(['ok' => false, 'error' => 'Ошибка сервера. Попробуйте позже.']));
            }
        }
        return self::$conn;
    }
}

/* Legacy compatibility wrapper */
function db(): mysqli {
    return Database::getInstance();
}
