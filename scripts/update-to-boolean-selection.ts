import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function updateToBooleanSelection() {
  try {
    console.log('🚀 Updating public profile template selection to boolean...');
    
    // First, drop the old column and constraint
    console.log('🗑️ Dropping old column and constraint...');
    await db.execute(sql`
      ALTER TABLE templates 
      DROP CONSTRAINT IF EXISTS check_public_profile_template
    `);
    
    await db.execute(sql`
      ALTER TABLE templates 
      DROP COLUMN IF EXISTS public_profile_template
    `);
    
    console.log('✅ Old column and constraint dropped');
    
    // Add the new boolean column
    console.log('➕ Adding new boolean column...');
    await db.execute(sql`
      ALTER TABLE templates 
      ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT false
    `);
    
    console.log('✅ New boolean column added');
    
    // Update existing templates - set template1 as selected by default
    console.log('🔄 Updating existing templates...');
    await db.execute(sql`
      UPDATE templates 
      SET is_selected = true 
      WHERE slug = 'template1' AND is_selected IS NULL
    `);
    
    console.log(`✅ Updated template1 rows to be selected`);
    
    // Create an index for better performance
    console.log('📊 Creating index...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_templates_is_selected 
      ON templates(is_selected)
    `);
    
    console.log('✅ Index created');
    
    // Add comment to the column
    await db.execute(sql`
      COMMENT ON COLUMN templates.is_selected IS 'True if this template is selected for public profile'
    `);
    
    console.log('✅ Comment added');
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

updateToBooleanSelection();
