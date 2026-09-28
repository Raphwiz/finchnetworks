CREATE TABLE `customer_sessions` (
	`hash` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_customer_sessions_expiry` ON `customer_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `oauth_flows` (
	`hash` text PRIMARY KEY NOT NULL,
	`nonce` text NOT NULL,
	`verifier` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_oauth_flows_expiry` ON `oauth_flows` (`expires_at`);--> statement-breakpoint
ALTER TABLE `commerce` ADD `customer_id` text;--> statement-breakpoint
CREATE INDEX `idx_commerce_customer` ON `commerce` (`customer_id`);--> statement-breakpoint
ALTER TABLE `enquiries` ADD `customer_id` text;--> statement-breakpoint
CREATE INDEX `idx_enquiries_customer` ON `enquiries` (`customer_id`);