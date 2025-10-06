import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function addLayoutConfig() {
  console.log('🚀 Adding layout_config field to templates table...');

  try {
    // Add layout_config column if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'templates' 
              AND column_name = 'layout_config'
          ) THEN
              ALTER TABLE templates ADD COLUMN layout_config jsonb DEFAULT '{}';
          END IF;
      END $$;
    `);

    console.log('✅ Added layout_config column');

    // Update Template1 with centered layout
    await db.execute(sql`
      UPDATE templates 
      SET layout_config = '{
        "headerLayout": {
          "type": "centered",
          "avatarPosition": "center",
          "avatarSize": "medium",
          "officerInfoPosition": "center",
          "companyInfoPosition": "center",
          "buttonsPosition": "center",
          "spacing": {
            "avatarToOfficer": 16,
            "officerToCompany": 16,
            "companyToButtons": 16
          }
        },
        "mainContentLayout": {
          "type": "grid",
          "sidebarPosition": "right",
          "sidebarWidth": "narrow",
          "contentAreaWidth": "full"
        }
      }'::jsonb
      WHERE slug = 'template1' AND layout_config = '{}';
    `);

    console.log('✅ Updated Template1 with centered layout');

    // Update Template2 with horizontal layout
    await db.execute(sql`
      UPDATE templates 
      SET layout_config = '{
        "headerLayout": {
          "type": "horizontal",
          "avatarPosition": "left",
          "avatarSize": "large",
          "officerInfoPosition": "left",
          "companyInfoPosition": "center",
          "buttonsPosition": "right",
          "spacing": {
            "avatarToOfficer": 24,
            "officerToCompany": 32,
            "companyToButtons": 48
          }
        },
        "mainContentLayout": {
          "type": "sidebar",
          "sidebarPosition": "left",
          "sidebarWidth": "wide",
          "contentAreaWidth": "reduced"
        }
      }'::jsonb
      WHERE slug = 'template2' AND layout_config = '{}';
    `);

    console.log('✅ Updated Template2 with horizontal layout');

    // Add index for layout_config queries
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS template_layout_config_idx ON templates USING GIN (layout_config);
    `);

    console.log('✅ Added layout_config index');

    console.log('🎉 Layout config migration completed successfully!');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration
addLayoutConfig().catch(console.error);
