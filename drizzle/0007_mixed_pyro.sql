CREATE TABLE "loan_officer_public_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"public_slug" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loan_officer_public_links_public_slug_unique" UNIQUE("public_slug")
);
--> statement-breakpoint
CREATE TABLE "public_link_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"link_id" uuid NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"referrer" text,
	"accessed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "conversion_stage" text DEFAULT 'lead';--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "conversion_date" timestamp;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "application_date" timestamp;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "approval_date" timestamp;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "closing_date" timestamp;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "loan_amount_closed" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "commission_earned" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "response_time_hours" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "last_contact_date" timestamp;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "contact_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "lead_quality_score" integer;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "geographic_location" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "layout_config" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "is_selected" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "loan_officer_public_links" ADD CONSTRAINT "loan_officer_public_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_officer_public_links" ADD CONSTRAINT "loan_officer_public_links_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_link_usage" ADD CONSTRAINT "public_link_usage_link_id_loan_officer_public_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."loan_officer_public_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_link_idx" ON "loan_officer_public_links" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "company_link_idx" ON "loan_officer_public_links" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "public_slug_idx" ON "loan_officer_public_links" USING btree ("public_slug");--> statement-breakpoint
CREATE INDEX "public_link_active_idx" ON "loan_officer_public_links" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "link_usage_idx" ON "public_link_usage" USING btree ("link_id");--> statement-breakpoint
CREATE INDEX "access_time_idx" ON "public_link_usage" USING btree ("accessed_at");--> statement-breakpoint
CREATE INDEX "leads_conversion_stage_idx" ON "leads" USING btree ("conversion_stage");--> statement-breakpoint
CREATE INDEX "leads_conversion_date_idx" ON "leads" USING btree ("conversion_date");--> statement-breakpoint
CREATE INDEX "leads_closing_date_idx" ON "leads" USING btree ("closing_date");--> statement-breakpoint
CREATE INDEX "leads_response_time_idx" ON "leads" USING btree ("response_time_hours");--> statement-breakpoint
CREATE INDEX "leads_quality_score_idx" ON "leads" USING btree ("lead_quality_score");--> statement-breakpoint
CREATE INDEX "leads_location_idx" ON "leads" USING btree ("geographic_location");