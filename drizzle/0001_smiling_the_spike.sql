CREATE TABLE `commerce` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`data` text NOT NULL,
	`status` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`rate_key` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_commerce_kind_time` ON `commerce` (`kind`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_commerce_rate_time` ON `commerce` (`rate_key`,`created_at`);