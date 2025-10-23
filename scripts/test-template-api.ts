import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function testTemplateAPI() {
  try {
    console.log('🔍 Testing template API logic...');
    
    // Test getting default template
    const defaultTemplate = await db
      .select()
      .from(templates)
      .where(eq(templates.isDefault, true))
      .limit(1);
    
    console.log('🎨 Default template found:', defaultTemplate.length > 0);
    if (defaultTemplate.length > 0) {
      console.log('📋 Template data:', {
        id: defaultTemplate[0].id,
        name: defaultTemplate[0].name,
        slug: defaultTemplate[0].slug,
        isDefault: defaultTemplate[0].isDefault
      });
    }
    
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/public-templates/f2957bf7-74d1-4362-9a35-8bd6b45e3c7e');
    const result = await response.json();
    console.log('📡 API Response status:', response.status);
    console.log('📦 API Response data:', result);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testTemplateAPI();

