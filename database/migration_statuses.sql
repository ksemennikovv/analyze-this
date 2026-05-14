-- Migration: update analyses.status ENUM to match spec
-- Run in phpMyAdmin on u94574gq_danalyz

-- Step 1: update existing rows to new status names
UPDATE `analyses` SET `status` = 'chat_in_progress'      WHERE `status` = 'in_chat';
UPDATE `analyses` SET `status` = 'analysis_completed'    WHERE `status` = 'practice_pending';
UPDATE `analyses` SET `status` = 'reflection_in_progress' WHERE `status` = 'reflection_pending';

-- Step 2: alter the ENUM column
ALTER TABLE `analyses` MODIFY COLUMN `status`
  ENUM('draft_started','chat_in_progress','analysis_completed','practice_assigned',
       'practice_completed','reflection_in_progress','completed','abandoned')
  NOT NULL DEFAULT 'draft_started';
