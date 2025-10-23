#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { templates } from '../src/lib/db/schema';
import { fallbackTemplates as themeTemplates } from '../src/theme/theme';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function populateTemplates() {
  console.log('🚀 Starting template population...');

  try {
    // Clear existing templates
    console.log('🧹 Clearing existing templates...');
    await db.delete(templates);

    // Insert template1
    console.log('📝 Inserting template1...');
    await db.insert(templates).values({
      name: 'Blue Theme',
      slug: 'template1',
      description: 'Modern blue theme with clean design',
      previewImage: '/templates/template1-preview.png',
      isActive: true,
      isPremium: false,
      colors: themeTemplates.template1.colors,
      typography: themeTemplates.template1.typography,
      content: themeTemplates.template1.content,
      layout: themeTemplates.template1.layout,
      advanced: themeTemplates.template1.advanced,
      classes: themeTemplates.template1.classes,
    });

    // Insert template2
    console.log('📝 Inserting template2...');
    await db.insert(templates).values({
      name: 'Purple Theme',
      slug: 'template2',
      description: 'Elegant purple and red theme with professional look',
      previewImage: '/templates/template2-preview.png',
      isActive: true,
      isPremium: false,
      colors: themeTemplates.template2.colors,
      typography: themeTemplates.template2.typography,
      content: themeTemplates.template2.content,
      layout: themeTemplates.template2.layout,
      advanced: themeTemplates.template2.advanced,
      classes: themeTemplates.template2.classes,
    });

    console.log('✅ Templates populated successfully!');
    console.log('📊 Template1 (Blue Theme) - ID: template1');
    console.log('📊 Template2 (Purple Theme) - ID: template2');

  } catch (error) {
    console.error('❌ Error populating templates:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the script
populateTemplates();
