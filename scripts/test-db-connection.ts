import { db } from '../src/lib/db';
import { pageSettings, templates } from '../src/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const testQuery = await db.select().from(templates).limit(1);
    console.log('✅ Database connection successful');
    console.log('📋 Templates found:', testQuery.length);
    
    if (testQuery.length > 0) {
      console.log('🎨 Sample template:', testQuery[0]);
    }
    
    // Test page settings query
    const userId = 'f2957bf7-74d1-4362-9a35-8bd6b45e3c7e';
    console.log('🔍 Testing page settings query for userId:', userId);
    
    const pageSettingsData = await db
      .select({
        template: pageSettings.template,
        settings: pageSettings.settings,
        templateId: pageSettings.templateId,
        isPublished: pageSettings.isPublished,
        updatedAt: pageSettings.updatedAt,
      })
      .from(pageSettings)
      .where(
        and(
          eq(pageSettings.officerId, userId),
          eq(pageSettings.isPublished, true)
        )
      )
      .orderBy(desc(pageSettings.updatedAt))
      .limit(1);

    console.log('📋 Page settings result:', pageSettingsData);
    
    if (pageSettingsData.length === 0) {
      console.log('❌ No published page settings found for this user');
      
      // Check if there are any page settings at all for this user
      const allPageSettings = await db
        .select()
        .from(pageSettings)
        .where(eq(pageSettings.officerId, userId))
        .limit(5);
      
      console.log('📋 All page settings for this user:', allPageSettings);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testDatabaseConnection();