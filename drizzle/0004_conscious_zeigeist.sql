ALTER TABLE "templates" ADD COLUMN "is_default" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "template_default_idx" ON "templates" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "template_user_idx" ON "templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "template_user_slug_idx" ON "templates" USING btree ("user_id","slug");