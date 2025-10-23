DROP INDEX "template_category_idx";--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "colors" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "typography" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "content" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "layout" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "advanced" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "classes" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "templates" DROP COLUMN "config";--> statement-breakpoint
ALTER TABLE "templates" DROP COLUMN "sections";