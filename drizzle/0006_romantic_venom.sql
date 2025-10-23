ALTER TABLE "templates" ADD COLUMN "header_modifications" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "body_modifications" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "right_sidebar_modifications" jsonb DEFAULT '{}';