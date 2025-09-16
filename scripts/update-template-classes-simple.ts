#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { pgTable, text, boolean, jsonb, uuid, timestamp } from 'drizzle-orm/pg-core';

// Load environment variables first
config({ path: '.env.local' });

// Define templates table directly to avoid Supabase client import
const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  previewImage: text('preview_image'),
  isActive: boolean('is_active').default(true),
  isPremium: boolean('is_premium').default(false),
  isDefault: boolean('is_default').default(false),
  userId: uuid('user_id'),
  colors: jsonb('colors').notNull().default('{}'),
  typography: jsonb('typography').notNull().default('{}'),
  content: jsonb('content').notNull().default('{}'),
  layout: jsonb('layout').notNull().default('{}'),
  advanced: jsonb('advanced').notNull().default('{}'),
  classes: jsonb('classes').notNull().default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Import theme templates after env vars are loaded
import { fallbackTemplates as themeTemplates } from '../src/theme/theme';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function updateTemplateClasses() {
  console.log('🚀 Starting template classes update...');

  try {
    // Update template1 with proper classes
    console.log('📝 Updating template1 classes...');
    await db.update(templates)
      .set({
        classes: themeTemplates.template1.classes,
        colors: themeTemplates.template1.colors,
        typography: themeTemplates.template1.typography,
        content: themeTemplates.template1.content,
        layout: themeTemplates.template1.layout,
        advanced: themeTemplates.template1.advanced,
      })
      .where(eq(templates.slug, 'template1'));

    // Update template2 with proper classes
    console.log('📝 Updating template2 classes...');
    await db.update(templates)
      .set({
        classes: themeTemplates.template2.classes,
        colors: themeTemplates.template2.colors,
        typography: themeTemplates.template2.typography,
        content: themeTemplates.template2.content,
        layout: themeTemplates.template2.layout,
        advanced: themeTemplates.template2.advanced,
      })
      .where(eq(templates.slug, 'template2'));

    console.log('✅ Template classes updated successfully!');
    console.log('📊 Updated template1 with complete classes data');
    console.log('📊 Updated template2 with complete classes data');

    // Verify the updates
    console.log('🔍 Verifying updates...');
    const updatedTemplates = await db.select().from(templates).where(eq(templates.isDefault, true));
    
    for (const template of updatedTemplates) {
      console.log(`✅ ${template.slug}:`, {
        hasClasses: !!template.classes,
        classesKeys: template.classes ? Object.keys(template.classes) : [],
        hasColors: !!template.colors,
        hasTypography: !!template.typography,
        hasContent: !!template.content,
        hasLayout: !!template.layout,
        hasAdvanced: !!template.advanced,
      });
    }

  } catch (error) {
    console.error('❌ Error updating template classes:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the script
updateTemplateClasses();


