-- ================================================================
-- NirvaBody Database Schema
-- ================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

-- ----------------------------------------------------------------
-- users
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`                  INT          NOT NULL AUTO_INCREMENT,
  `email`               VARCHAR(255) NOT NULL,
  `password_hash`       VARCHAR(255) NOT NULL,
  `name`                VARCHAR(100)          DEFAULT NULL,
  `lang`                VARCHAR(10)           DEFAULT 'ru',
  `email_verified`      TINYINT(1)   NOT NULL DEFAULT 0,
  `verify_code`         VARCHAR(10)           DEFAULT NULL,
  `verify_code_expires` DATETIME              DEFAULT NULL,
  `reset_code`          VARCHAR(10)           DEFAULT NULL,
  `reset_code_expires`  DATETIME              DEFAULT NULL,
  `created_at`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- conversations  (одна на пользователя — расширяемо)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `conversations` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `user_id`    INT NOT NULL,
  `type`       VARCHAR(50)  NOT NULL DEFAULT 'analysis',
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conv_user` (`user_id`),
  CONSTRAINT `fk_conv_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- messages
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `messages` (
  `id`              INT NOT NULL AUTO_INCREMENT,
  `conversation_id` INT NOT NULL,
  `user_id`         INT NOT NULL,
  `role`            ENUM('user','assistant','system') NOT NULL,
  `content`         TEXT         NOT NULL,
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_msg_conv`    (`conversation_id`),
  KEY `idx_msg_user`    (`user_id`),
  KEY `idx_msg_created` (`created_at`),
  CONSTRAINT `fk_msg_conv` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_msg_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- user_memory  (AI-контекст: краткое резюме)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_memory` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `user_id`      INT NOT NULL,
  `summary`      TEXT,
  `key_topics`   JSON,
  `emotional_state` VARCHAR(255) DEFAULT NULL,
  `progress_notes`  TEXT,
  `updated_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_memory_user` (`user_id`),
  CONSTRAINT `fk_memory_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- practices  (библиотека)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `practices` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `number`      INT NOT NULL,
  `title`       VARCHAR(255) NOT NULL,
  `description` TEXT,
  `video_url`   VARCHAR(500),
  `duration_sec` INT DEFAULT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_practice_number` (`number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- flow_steps  (ядро системы состояний)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `flow_steps` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `user_id`      INT NOT NULL,
  `type`         ENUM(
                   'initial_analysis',
                   'practice_assigned',
                   'practice_started',
                   'practice_completed',
                   'report_in_progress',
                   'report_done',
                   'reflection',
                   'topic_confirmation',
                   'next_analysis',
                   'payment_gate'
                 ) NOT NULL,
  `status`       ENUM('active','completed','skipped') NOT NULL DEFAULT 'active',
  `practice_id`  INT DEFAULT NULL,
  `topic`        VARCHAR(255) DEFAULT NULL,
  `data`         JSON,
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_flow_user_status` (`user_id`, `status`),
  KEY `idx_flow_created`     (`created_at`),
  CONSTRAINT `fk_flow_user`     FOREIGN KEY (`user_id`)     REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_flow_practice` FOREIGN KEY (`practice_id`) REFERENCES `practices` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- user_practices
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_practices` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `user_id`     INT NOT NULL,
  `practice_id` INT NOT NULL,
  `step_id`     INT DEFAULT NULL,
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `started_at`  DATETIME DEFAULT NULL,
  `completed_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_up_user` (`user_id`),
  CONSTRAINT `fk_up_user`     FOREIGN KEY (`user_id`)     REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_up_practice` FOREIGN KEY (`practice_id`) REFERENCES `practices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_up_step`     FOREIGN KEY (`step_id`)     REFERENCES `flow_steps` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- practice_reports
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `practice_reports` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `user_id`     INT NOT NULL,
  `step_id`     INT NOT NULL,
  `practice_id` INT NOT NULL,
  `summary`     TEXT,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pr_user` (`user_id`),
  CONSTRAINT `fk_pr_user`     FOREIGN KEY (`user_id`)     REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pr_step`     FOREIGN KEY (`step_id`)     REFERENCES `flow_steps` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pr_practice` FOREIGN KEY (`practice_id`) REFERENCES `practices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- meditations
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `meditations` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `title`       VARCHAR(255) NOT NULL,
  `description` TEXT,
  `audio_url`   VARCHAR(500),
  `duration_sec` INT DEFAULT NULL,
  `is_free`     TINYINT(1)   NOT NULL DEFAULT 0,
  `price`       DECIMAL(10,2)         DEFAULT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- user_meditations
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_meditations` (
  `id`            INT NOT NULL AUTO_INCREMENT,
  `user_id`       INT NOT NULL,
  `meditation_id` INT NOT NULL,
  `unlocked_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unlock_type`   ENUM('free','purchased','bonus') NOT NULL DEFAULT 'purchased',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_um` (`user_id`, `meditation_id`),
  CONSTRAINT `fk_um_user`       FOREIGN KEY (`user_id`)       REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_um_meditation` FOREIGN KEY (`meditation_id`) REFERENCES `meditations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- subscriptions
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id`             INT NOT NULL AUTO_INCREMENT,
  `user_id`        INT NOT NULL,
  `status`         ENUM('active','cancelled','expired','trial') NOT NULL DEFAULT 'active',
  `period_start`   DATE         NOT NULL,
  `period_end`     DATE         NOT NULL,
  `auto_renew`     TINYINT(1)   NOT NULL DEFAULT 1,
  `payment_ref`    VARCHAR(255)          DEFAULT NULL,
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cancelled_at`   DATETIME              DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sub_user` (`user_id`),
  KEY `idx_sub_end`  (`period_end`),
  CONSTRAINT `fk_sub_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- subscription_bonus_months  (реферальные бонусные месяцы)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `subscription_bonus_months` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `user_id`    INT NOT NULL,
  `months`     INT          NOT NULL DEFAULT 1,
  `reason`     VARCHAR(255),
  `applied`    TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sbm_user` (`user_id`),
  CONSTRAINT `fk_sbm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- analysis_credits  (пакеты дополнительных анализов)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `analysis_credits` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `user_id`     INT NOT NULL,
  `amount`      INT          NOT NULL DEFAULT 1,
  `used`        INT          NOT NULL DEFAULT 0,
  `expires_at`  DATETIME              DEFAULT NULL,
  `payment_ref` VARCHAR(255)          DEFAULT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ac_user` (`user_id`),
  CONSTRAINT `fk_ac_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- analysis_usage  (лог использования анализов)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `analysis_usage` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `user_id`     INT NOT NULL,
  `credit_id`   INT          DEFAULT NULL,
  `flow_step_id` INT         DEFAULT NULL,
  `type`        ENUM('included','credit') NOT NULL DEFAULT 'included',
  `period`      VARCHAR(7)   NOT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_au_user`   (`user_id`),
  KEY `idx_au_period` (`user_id`, `period`),
  CONSTRAINT `fk_au_user`   FOREIGN KEY (`user_id`)      REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_au_credit` FOREIGN KEY (`credit_id`)    REFERENCES `analysis_credits` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_au_step`   FOREIGN KEY (`flow_step_id`) REFERENCES `flow_steps` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- payments
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payments` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `user_id`      INT NOT NULL,
  `type`         ENUM('subscription','analysis_package','meditation') NOT NULL,
  `amount`       DECIMAL(10,2) NOT NULL,
  `currency`     VARCHAR(3)    NOT NULL DEFAULT 'RUB',
  `status`       ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  `provider`     VARCHAR(50)           DEFAULT NULL,
  `provider_ref` VARCHAR(255)          DEFAULT NULL,
  `item_id`      INT          DEFAULT NULL,
  `meta`         JSON,
  `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pay_user`   (`user_id`),
  KEY `idx_pay_status` (`status`),
  CONSTRAINT `fk_pay_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- referral_codes
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `referral_codes` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `user_id`    INT NOT NULL,
  `code`       VARCHAR(20)  NOT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ref_code`   (`code`),
  UNIQUE KEY `uq_ref_user`   (`user_id`),
  CONSTRAINT `fk_ref_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- referrals
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `referrals` (
  `id`             INT NOT NULL AUTO_INCREMENT,
  `referrer_id`    INT NOT NULL,
  `referred_id`    INT NOT NULL,
  `code_id`        INT NOT NULL,
  `status`         ENUM('clicked','registered','paid','rewarded') NOT NULL DEFAULT 'registered',
  `reward_claimed` TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `rewarded_at`    DATETIME              DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_referral_referred` (`referred_id`),
  KEY `idx_referral_referrer` (`referrer_id`),
  CONSTRAINT `fk_referral_referrer` FOREIGN KEY (`referrer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_referral_referred` FOREIGN KEY (`referred_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_referral_code`     FOREIGN KEY (`code_id`)     REFERENCES `referral_codes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- pricing_campaigns  (динамические цены / акции)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pricing_campaigns` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100) NOT NULL,
  `type`       VARCHAR(50)  NOT NULL,
  `price`      DECIMAL(10,2) NOT NULL,
  `active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `starts_at`  DATETIME              DEFAULT NULL,
  `ends_at`    DATETIME              DEFAULT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------
-- user_media_sessions  (трекинг видео/аудио)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_media_sessions` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `session_id`   VARCHAR(100) NOT NULL,
  `user_id`      INT          DEFAULT NULL,
  `media_id`     INT          DEFAULT NULL,
  `media_type`   ENUM('practice','meditation','other') NOT NULL DEFAULT 'other',
  `event`        ENUM('start','progress','complete','abandon') NOT NULL,
  `progress_pct` TINYINT      DEFAULT NULL,
  `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ums_session` (`session_id`),
  KEY `idx_ums_user`    (`user_id`),
  CONSTRAINT `fk_ums_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET foreign_key_checks = 1;
