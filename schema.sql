CREATE TABLE IF NOT EXISTS `users` (
  `id`             INT AUTO_INCREMENT PRIMARY KEY,
  `email`          VARCHAR(255) UNIQUE NOT NULL,
  `password`       VARCHAR(255) DEFAULT NULL,
  `name`           VARCHAR(100) DEFAULT NULL,
  `email_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `verify_code`    VARCHAR(6) DEFAULT NULL,
  `verify_expires` DATETIME DEFAULT NULL,
  `video_url`      VARCHAR(500) DEFAULT NULL,
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`    INT NOT NULL,
  `role`       ENUM('user','assistant') NOT NULL,
  `content`    MEDIUMTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
