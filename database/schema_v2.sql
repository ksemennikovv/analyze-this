-- ================================================================
-- Nirva AI — Schema v2
-- ================================================================
SET NAMES utf8mb4;
SET foreign_key_checks = 0;

-- Drop all tables (child tables first, then parents)
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `diary_messages`;
DROP TABLE IF EXISTS `analysis_messages`;
DROP TABLE IF EXISTS `portrait_history`;
DROP TABLE IF EXISTS `portrait`;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `referrals`;
DROP TABLE IF EXISTS `referral_codes`;
DROP TABLE IF EXISTS `subscriptions`;
DROP TABLE IF EXISTS `meditations`;
DROP TABLE IF EXISTS `analyses`;
DROP TABLE IF EXISTS `guest_sessions`;
-- old tables
DROP TABLE IF EXISTS `user_meditations`;
DROP TABLE IF EXISTS `user_practices`;
DROP TABLE IF EXISTS `practice_reports`;
DROP TABLE IF EXISTS `user_memory`;
DROP TABLE IF EXISTS `user_media_sessions`;
DROP TABLE IF EXISTS `analysis_usage`;
DROP TABLE IF EXISTS `analysis_credits`;
DROP TABLE IF EXISTS `pricing_campaigns`;
DROP TABLE IF EXISTS `subscription_bonus_months`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `flow_steps`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `conversations`;
DROP TABLE IF EXISTS `practices`;
DROP TABLE IF EXISTS `diary_entries`;
DROP TABLE IF EXISTS `users`;

SET foreign_key_checks = 1;

-- ----------------------------------------------------------------
-- users
-- ----------------------------------------------------------------
CREATE TABLE `users` (
  `id`             INT NOT NULL AUTO_INCREMENT,
  `email`          VARCHAR(255) NOT NULL,
  `password`       VARCHAR(255) NOT NULL,
  `name`           VARCHAR(100) DEFAULT NULL,
  `lang`           VARCHAR(10)  DEFAULT 'ru',
  `email_verified` TINYINT(1)   NOT NULL DEFAULT 0,
  `verify_code`    VARCHAR(10)  DEFAULT NULL,
  `verify_expires` DATETIME     DEFAULT NULL,
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- guest_sessions
-- ----------------------------------------------------------------
CREATE TABLE `guest_sessions` (
  `id`         VARCHAR(64)  NOT NULL,
  `data`       JSON,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- analyses
-- ----------------------------------------------------------------
CREATE TABLE `analyses` (
  `id`               INT NOT NULL AUTO_INCREMENT,
  `user_id`          INT NOT NULL,
  `title`            VARCHAR(255) DEFAULT NULL,
  `status`           ENUM('in_chat','practice_pending','reflection_pending','completed') NOT NULL DEFAULT 'in_chat',
  `practice_num`     INT DEFAULT NULL,
  `personal_task`    TEXT DEFAULT NULL,
  `summary`          TEXT DEFAULT NULL,
  `next_analysis_at` DATETIME DEFAULT NULL,
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at`     DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_analyses_user` (`user_id`),
  CONSTRAINT `fk_analyses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- analysis_messages
-- ----------------------------------------------------------------
CREATE TABLE `analysis_messages` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `analysis_id` INT NOT NULL,
  `user_id`     INT NOT NULL,
  `role`        ENUM('user','assistant','system') NOT NULL,
  `content`     TEXT NOT NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_amsg_analysis` (`analysis_id`),
  CONSTRAINT `fk_amsg_analysis` FOREIGN KEY (`analysis_id`) REFERENCES `analyses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_amsg_user`     FOREIGN KEY (`user_id`)     REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- diary_entries
-- ----------------------------------------------------------------
CREATE TABLE `diary_entries` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `user_id`      INT NOT NULL,
  `title`        VARCHAR(255) DEFAULT NULL,
  `status`       ENUM('in_chat','completed') NOT NULL DEFAULT 'in_chat',
  `summary`      TEXT DEFAULT NULL,
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_diary_user` (`user_id`),
  CONSTRAINT `fk_diary_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- diary_messages
-- ----------------------------------------------------------------
CREATE TABLE `diary_messages` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `entry_id`   INT NOT NULL,
  `user_id`    INT NOT NULL,
  `role`       ENUM('user','assistant') NOT NULL,
  `content`    TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dmsg_entry` (`entry_id`),
  CONSTRAINT `fk_dmsg_entry` FOREIGN KEY (`entry_id`) REFERENCES `diary_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dmsg_user`  FOREIGN KEY (`user_id`)  REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- portrait
-- ----------------------------------------------------------------
CREATE TABLE `portrait` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `user_id`    INT NOT NULL,
  `content`    TEXT,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_portrait_user` (`user_id`),
  CONSTRAINT `fk_portrait_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- portrait_history
-- ----------------------------------------------------------------
CREATE TABLE `portrait_history` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `user_id`    INT NOT NULL,
  `content`    TEXT,
  `source`     ENUM('analysis','reflection','diary') NOT NULL,
  `source_id`  INT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ph_user` (`user_id`),
  CONSTRAINT `fk_ph_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- meditations
-- ----------------------------------------------------------------
CREATE TABLE `meditations` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `user_id`      INT NOT NULL,
  `analysis_id`  INT DEFAULT NULL,
  `title`        VARCHAR(255) NOT NULL,
  `description`  TEXT,
  `theme`        VARCHAR(100) DEFAULT NULL,
  `audio_url`    VARCHAR(500) DEFAULT NULL,
  `cover_url`    VARCHAR(500) DEFAULT NULL,
  `duration_sec` INT DEFAULT NULL,
  `status`       ENUM('generating','ready','failed') NOT NULL DEFAULT 'generating',
  `price`        DECIMAL(10,2) NOT NULL DEFAULT 390.00,
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_med_user` (`user_id`),
  CONSTRAINT `fk_med_user`     FOREIGN KEY (`user_id`)     REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_med_analysis` FOREIGN KEY (`analysis_id`) REFERENCES `analyses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- cart_items
-- ----------------------------------------------------------------
CREATE TABLE `cart_items` (
  `id`            INT NOT NULL AUTO_INCREMENT,
  `user_id`       INT NOT NULL,
  `meditation_id` INT NOT NULL,
  `added_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cart` (`user_id`, `meditation_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`)       REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_med`  FOREIGN KEY (`meditation_id`) REFERENCES `meditations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- subscriptions
-- ----------------------------------------------------------------
CREATE TABLE `subscriptions` (
  `id`                   INT NOT NULL AUTO_INCREMENT,
  `user_id`              INT NOT NULL,
  `plan`                 ENUM('start','base','transformation') NOT NULL DEFAULT 'start',
  `analyses_per_month`   INT NOT NULL DEFAULT 1,
  `status`               ENUM('active','cancelled','expired','trial') NOT NULL DEFAULT 'active',
  `period_start`         DATE NOT NULL,
  `period_end`           DATE NOT NULL,
  `auto_renew`           TINYINT(1) NOT NULL DEFAULT 1,
  `payment_ref`          VARCHAR(255) DEFAULT NULL,
  `created_at`           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cancelled_at`         DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sub_user` (`user_id`),
  CONSTRAINT `fk_sub_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- transactions
-- ----------------------------------------------------------------
CREATE TABLE `transactions` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `user_id`      INT NOT NULL,
  `type`         ENUM('subscription','meditation','meditation_bundle') NOT NULL,
  `amount`       DECIMAL(10,2) NOT NULL,
  `currency`     VARCHAR(3) NOT NULL DEFAULT 'RUB',
  `status`       ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  `provider`     VARCHAR(50) DEFAULT NULL,
  `provider_ref` VARCHAR(255) DEFAULT NULL,
  `meta`         JSON,
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tx_user` (`user_id`),
  CONSTRAINT `fk_tx_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- referral_codes
-- ----------------------------------------------------------------
CREATE TABLE `referral_codes` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `user_id`    INT NOT NULL,
  `code`       VARCHAR(20) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ref_code` (`code`),
  UNIQUE KEY `uq_ref_user` (`user_id`),
  CONSTRAINT `fk_ref_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- referrals
-- ----------------------------------------------------------------
CREATE TABLE `referrals` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `referrer_id` INT NOT NULL,
  `referred_id` INT NOT NULL,
  `code_id`     INT NOT NULL,
  `status`      ENUM('registered','paid','rewarded') NOT NULL DEFAULT 'registered',
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `rewarded_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_referred` (`referred_id`),
  KEY `idx_referrer` (`referrer_id`),
  CONSTRAINT `fk_ref_referrer` FOREIGN KEY (`referrer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ref_referred` FOREIGN KEY (`referred_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ref_code`     FOREIGN KEY (`code_id`)     REFERENCES `referral_codes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
