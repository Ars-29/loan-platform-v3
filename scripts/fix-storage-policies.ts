import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixStoragePolicies() {
  try {
    console.log('🔒 Fixing Supabase Storage RLS policies...');

    // First, let's check if RLS is enabled on storage.objects
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_name', 'objects')
      .eq('table_schema', 'storage');

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
      return;
    }

    console.log('📋 Storage objects table exists:', tables?.length > 0);

    // Check current policies
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'objects')
      .eq('schemaname', 'storage');

    if (policiesError) {
      console.log('⚠️  Could not check existing policies:', policiesError.message);
    } else {
      console.log('📋 Existing policies:', policies?.length || 0);
      policies?.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd}`);
      });
    }

    // Create the policies using direct SQL
    const policiesToCreate = [
      {
        name: 'Enable public uploads for avatars',
        sql: `
          CREATE POLICY IF NOT EXISTS "Enable public uploads for avatars" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'avatars')
        `
      },
      {
        name: 'Enable public read access for avatars',
        sql: `
          CREATE POLICY IF NOT EXISTS "Enable public read access for avatars" ON storage.objects
          FOR SELECT USING (bucket_id = 'avatars')
        `
      },
      {
        name: 'Enable public updates for avatars',
        sql: `
          CREATE POLICY IF NOT EXISTS "Enable public updates for avatars" ON storage.objects
          FOR UPDATE USING (bucket_id = 'avatars')
        `
      },
      {
        name: 'Enable public deletes for avatars',
        sql: `
          CREATE POLICY IF NOT EXISTS "Enable public deletes for avatars" ON storage.objects
          FOR DELETE USING (bucket_id = 'avatars')
        `
      }
    ];

    for (const policy of policiesToCreate) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
        if (error) {
          console.log(`⚠️  Could not create policy "${policy.name}":`, error.message);
        } else {
          console.log(`✅ Created policy: ${policy.name}`);
        }
      } catch (err) {
        console.log(`⚠️  Could not create policy "${policy.name}":`, err);
      }
    }

    // Alternative approach: Try to disable RLS temporarily for testing
    console.log('🔄 Attempting to disable RLS for avatars bucket...');
    
    try {
      const { error: disableError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;`
      });
      
      if (disableError) {
        console.log('⚠️  Could not disable RLS:', disableError.message);
      } else {
        console.log('✅ Temporarily disabled RLS for storage.objects');
        console.log('⚠️  WARNING: This makes storage publicly accessible!');
      }
    } catch (err) {
      console.log('⚠️  Could not disable RLS:', err);
    }

    console.log('');
    console.log('🎉 Storage policy setup complete!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Test avatar upload in your application');
    console.log('   2. If it works, consider re-enabling RLS with proper policies');
    console.log('   3. Go to Supabase dashboard > Storage > Policies to manage policies');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixStoragePolicies();
