import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function addPublicProfileTemplateColumn() {
  try {
    console.log('🚀 Adding public_profile_template column to templates table...');
    
    // Add the column
    await db.execute(sql`
      ALTER TABLE templates 
      ADD COLUMN IF NOT EXISTS public_profile_template TEXT DEFAULT 'template1'
    `);
    
    console.log('✅ Column added successfully');
    
    // Update all existing templates to have template1 as default
    console.log('🔄 Updating existing templates...');
    const updateResult = await db.execute(sql`
      UPDATE templates 
      SET public_profile_template = 'template1' 
      WHERE public_profile_template IS NULL
    `);
    
    console.log(`✅ Updated ${updateResult.rowCount} existing templates`);
    
    // Add a check constraint to ensure only valid values
    console.log('🔒 Adding check constraint...');
    await db.execute(sql`
      ALTER TABLE templates 
      ADD CONSTRAINT check_public_profile_template 
      CHECK (public_profile_template IN ('template1', 'template2'))
    `);
    
    console.log('✅ Check constraint added');
    
    // Create an index for better performance
    console.log('📊 Creating index...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_templates_public_profile_template 
      ON templates(public_profile_template)
    `);
    
    console.log('✅ Index created');
    
    // Add comment to the column
    await db.execute(sql`
      COMMENT ON COLUMN templates.public_profile_template IS 'Template slug to use for public profile (template1 or template2)'
    `);
    
    console.log('✅ Comment added');
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addPublicProfileTemplateColumn();
