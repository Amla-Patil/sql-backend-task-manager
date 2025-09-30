-- 1) Add accepted_by column to tasks (nullable)
ALTER TABLE `tasks`
  ADD COLUMN `accepted_by` INT(11) NULL AFTER `status`;

-- 2) Create payments table to record fake payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` double(10,2) NOT NULL,
  `status` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `payments_ibfk_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `payments_ibfk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) Add foreign key constraint for tasks.accepted_by -> users.id (optional)
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_accepted_by_fk` FOREIGN KEY (`accepted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
