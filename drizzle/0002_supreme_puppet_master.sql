ALTER TABLE "users" ADD COLUMN "invite_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "invite_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "invite_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "invite_token" text;