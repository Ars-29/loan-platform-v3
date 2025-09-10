ALTER TABLE "companies" ADD COLUMN "admin_email" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "admin_email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "admin_user_id" uuid;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "invite_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "invite_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "invite_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "invite_token" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "deactivated" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deactivated" boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX "company_admin_email_idx" ON "companies" USING btree ("admin_email");