#!/usr/bin/env tsx

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables first
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testGlobalTemplateSystem() {
  console.log('🧪 Testing Global Template System...\n');

  try {
    // Test 1: Check if templates are properly structured
    console.log('1️⃣ Checking template structure...');
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('slug, name, colors, classes, is_default, user_id')
      .eq('is_active', true)
      .order('is_default', { ascending: false });

    if (templatesError) {
      console.error('❌ Error fetching templates:', templatesError);
      return;
    }

    console.log('✅ Templates found:', templates?.length || 0);
    templates?.forEach(template => {
      console.log(`   - ${template.slug}: ${template.name}`);
      console.log(`     Colors: ${JSON.stringify(template.colors)}`);
      console.log(`     Classes: ${Object.keys(template.classes || {}).length} classes`);
      console.log(`     Type: ${template.is_default ? 'Default' : 'User'} (${template.user_id || 'N/A'})`);
    });

    // Test 2: Verify template data consistency
    console.log('\n2️⃣ Verifying template data consistency...');
    const template1Default = templates?.find(t => t.slug === 'template1' && t.is_default);
    const template2Default = templates?.find(t => t.slug === 'template2' && t.is_default);
    
    if (template1Default && template2Default) {
      console.log('✅ Both default templates found');
      console.log(`   Template1 colors: ${JSON.stringify(template1Default.colors)}`);
      console.log(`   Template2 colors: ${JSON.stringify(template2Default.colors)}`);
      
      // Check if colors are different (they should be)
      if (JSON.stringify(template1Default.colors) !== JSON.stringify(template2Default.colors)) {
        console.log('✅ Templates have different color schemes');
      } else {
        console.log('⚠️ Templates have identical color schemes');
      }
    } else {
      console.log('❌ Missing default templates');
    }

    // Test 3: Check user templates
    console.log('\n3️⃣ Checking user templates...');
    const userTemplates = templates?.filter(t => !t.is_default);
    console.log(`✅ User templates found: ${userTemplates?.length || 0}`);
    
    userTemplates?.forEach(template => {
      console.log(`   - ${template.slug}: ${template.name} (User: ${template.user_id})`);
    });

    // Test 4: Simulate API response structure
    console.log('\n4️⃣ Testing API response structure...');
    const testTemplate = template1Default || templates?.[0];
    if (testTemplate) {
      const mockApiResponse = {
        success: true,
        data: {
          template: {
            id: 'test-id',
            slug: testTemplate.slug,
            name: testTemplate.name,
            colors: testTemplate.colors,
            typography: {},
            content: {},
            layout: {},
            advanced: {},
            classes: testTemplate.classes
          },
          userInfo: {
            userId: 'test-user',
            companyId: 'test-company',
            companyName: 'Test Company',
            userRole: 'employee',
            hasCustomSettings: false
          },
          metadata: {
            templateSlug: testTemplate.slug,
            isCustomized: false,
            isPublished: false
          }
        }
      };
      
      console.log('✅ Mock API response structure:');
      console.log(`   Template: ${mockApiResponse.data.template.name}`);
      console.log(`   Colors: ${JSON.stringify(mockApiResponse.data.template.colors)}`);
      console.log(`   Classes: ${Object.keys(mockApiResponse.data.template.classes || {}).length} classes`);
    }

    console.log('\n🎉 Global Template System test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Total templates: ${templates?.length || 0}`);
    console.log(`   - Default templates: ${templates?.filter(t => t.is_default).length || 0}`);
    console.log(`   - User templates: ${templates?.filter(t => !t.is_default).length || 0}`);
    console.log(`   - All templates have colors: ${templates?.every(t => t.colors) ? 'Yes' : 'No'}`);
    console.log(`   - All templates have classes: ${templates?.every(t => t.classes) ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testGlobalTemplateSystem();


