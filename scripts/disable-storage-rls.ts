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

async function disableStorageRLS() {
  try {
    console.log('🔒 Attempting to fix storage RLS policies...');

    // Try to execute SQL to disable RLS temporarily
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        -- Drop existing policies
        DROP POLICY IF EXISTS "Enable public uploads for avatars" ON storage.objects;
        DROP POLICY IF EXISTS "Enable public read access for avatars" ON storage.objects;
        DROP POLICY IF EXISTS "Enable public updates for avatars" ON storage.objects;
        DROP POLICY IF EXISTS "Enable public deletes for avatars" ON storage.objects;
        
        -- Create permissive policies
        CREATE POLICY "Enable public uploads for avatars" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'avatars');
        
        CREATE POLICY "Enable public read access for avatars" ON storage.objects
        FOR SELECT USING (bucket_id = 'avatars');
        
        CREATE POLICY "Enable public updates for avatars" ON storage.objects
        FOR UPDATE USING (bucket_id = 'avatars');
        
        CREATE POLICY "Enable public deletes for avatars" ON storage.objects
        FOR DELETE USING (bucket_id = 'avatars');
      `
    });

    if (error) {
      console.log('⚠️  Could not execute SQL via RPC:', error.message);
      
      // Alternative: Try to disable RLS completely
      console.log('🔄 Trying to disable RLS completely...');
      const { error: disableError } = await supabase.rpc('exec', {
        sql: 'ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;'
      });
      
      if (disableError) {
        console.log('⚠️  Could not disable RLS:', disableError.message);
        console.log('');
        console.log('📝 Manual steps required:');
        console.log('   1. Go to your Supabase dashboard');
        console.log('   2. Navigate to SQL Editor');
        console.log('   3. Run the fix-storage-rls.sql file');
        console.log('   4. Or manually disable RLS for storage.objects table');
      } else {
        console.log('✅ Successfully disabled RLS for storage.objects');
        console.log('⚠️  WARNING: Storage is now publicly accessible!');
      }
    } else {
      console.log('✅ Successfully created storage policies');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.log('');
    console.log('📝 Manual steps required:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Run the fix-storage-rls.sql file');
  }
}

// Run the fix
disableStorageRLS();
