import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { createPersonalTemplatesForUser } from '../src/lib/template-manager';

// Load environment variables
config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTemplatesForExistingUsers() {
  try {
    console.log('🎨 Creating personal templates for existing loan officers...');

    // Get all active loan officers (employees)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('role', 'employee')
      .eq('is_active', true);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️ No active loan officers found');
      return;
    }

    console.log(`📋 Found ${users.length} active loan officers`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`\n🔄 Processing user: ${user.email} (${user.id})`);
        
        // Check if user already has personal templates
        const { data: existingTemplates } = await supabase
          .from('templates')
          .select('id, slug')
          .eq('user_id', user.id)
          .eq('is_default', false);

        if (existingTemplates && existingTemplates.length >= 2) {
          console.log(`✅ User ${user.email} already has ${existingTemplates.length} personal templates, skipping...`);
          continue;
        }

        // Create personal templates
        await createPersonalTemplatesForUser(user.id, user.first_name, user.last_name);
        console.log(`✅ Created personal templates for ${user.email}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error creating templates for ${user.email}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 Template creation completed!`);
    console.log(`✅ Successfully processed: ${successCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);

  } catch (error) {
    console.error('❌ Error in template creation process:', error);
  }
}

// Run the script
createTemplatesForExistingUsers();
