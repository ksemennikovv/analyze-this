/* Run this on the existing database to add new columns (MySQL 5.7 compatible) */
/* If you get "Duplicate column name" errors, those columns already exist — that is fine. */

ALTER TABLE `users` MODIFY `password` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `email_verified` TINYINT(1) NOT NULL DEFAULT 0 AFTER `name`;
ALTER TABLE `users` ADD COLUMN `verify_code`    VARCHAR(6) DEFAULT NULL          AFTER `email_verified`;
ALTER TABLE `users` ADD COLUMN `verify_expires` DATETIME DEFAULT NULL             AFTER `verify_code`;
ALTER TABLE `users` ADD COLUMN `video_url`      VARCHAR(500) DEFAULT NULL         AFTER `verify_expires`;
