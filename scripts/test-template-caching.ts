#!/usr/bin/env tsx

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables first
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTemplateCaching() {
  console.log('🧪 Testing Template Caching System...\n');

  try {
    // Test 1: Check if templates exist
    console.log('1️⃣ Checking if templates exist...');
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('slug, name, is_default, user_id')
      .eq('is_active', true);

    if (templatesError) {
      console.error('❌ Error fetching templates:', templatesError);
      return;
    }

    console.log('✅ Templates found:', templates?.length || 0);
    templates?.forEach(template => {
      console.log(`   - ${template.slug}: ${template.name} (${template.is_default ? 'default' : 'user'})`);
    });

    // Test 2: Check default templates
    console.log('\n2️⃣ Checking default templates...');
    const { data: defaultTemplates, error: defaultError } = await supabase
      .from('templates')
      .select('*')
      .eq('is_default', true)
      .is('user_id', null)
      .eq('is_active', true);

    if (defaultError) {
      console.error('❌ Error fetching default templates:', defaultError);
      return;
    }

    console.log('✅ Default templates found:', defaultTemplates?.length || 0);
    defaultTemplates?.forEach(template => {
      console.log(`   - ${template.slug}: ${template.name}`);
      console.log(`     Colors: ${JSON.stringify(template.colors)}`);
      console.log(`     Classes: ${Object.keys(template.classes || {}).length} classes`);
    });

    // Test 3: Check user templates
    console.log('\n3️⃣ Checking user templates...');
    const { data: userTemplates, error: userError } = await supabase
      .from('templates')
      .select('*')
      .eq('is_default', false)
      .not('user_id', 'is', null)
      .eq('is_active', true);

    if (userError) {
      console.error('❌ Error fetching user templates:', userError);
      return;
    }

    console.log('✅ User templates found:', userTemplates?.length || 0);
    userTemplates?.forEach(template => {
      console.log(`   - ${template.slug}: ${template.name} (User: ${template.user_id})`);
    });

    // Test 4: Simulate API call timing
    console.log('\n4️⃣ Testing API call timing...');
    const startTime = Date.now();
    
    // Simulate multiple calls to the same template
    const promises = Array(5).fill(null).map(async (_, index) => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('slug', 'template1')
        .eq('is_default', true)
        .is('user_id', null)
        .eq('is_active', true)
        .limit(1);
      
      if (error) {
        console.error(`❌ Call ${index + 1} failed:`, error);
        return null;
      }
      
      console.log(`✅ Call ${index + 1} completed`);
      return data;
    });

    await Promise.all(promises);
    const endTime = Date.now();
    console.log(`⏱️ Total time for 5 parallel calls: ${endTime - startTime}ms`);

    console.log('\n🎉 Template caching test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTemplateCaching();










