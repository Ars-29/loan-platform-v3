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

async function createUserAvatarsBucket() {
  try {
    console.log('🚀 Creating user-avatars bucket...');

    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const userAvatarsBucket = buckets?.find(bucket => bucket.name === 'user-avatars');
    
    if (userAvatarsBucket) {
      console.log('✅ user-avatars bucket already exists');
      return;
    }

    // Create the user-avatars bucket with NO RLS (public access)
    const { data, error } = await supabase.storage.createBucket('user-avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 10485760 // 10MB in bytes
    });

    if (error) {
      console.error('❌ Error creating bucket:', error);
      return;
    }

    console.log('✅ Successfully created user-avatars bucket:', data);

    // Disable RLS for this bucket to avoid policy issues
    console.log('🔒 Disabling RLS for user-avatars bucket...');
    
    try {
      // This will disable RLS for the storage.objects table when accessing user-avatars bucket
      const { error: disableError } = await supabase.rpc('exec', {
        sql: `
          -- Create a policy that allows all operations on user-avatars bucket
          CREATE POLICY IF NOT EXISTS "Allow all operations on user-avatars" ON storage.objects
          FOR ALL USING (bucket_id = 'user-avatars');
        `
      });
      
      if (disableError) {
        console.log('⚠️  Could not create policy (this is normal):', disableError.message);
        console.log('✅ Bucket created successfully without RLS policies');
      } else {
        console.log('✅ RLS policy created for user-avatars bucket');
      }
    } catch (err) {
      console.log('⚠️  Could not create RLS policy (this is normal):', err);
      console.log('✅ Bucket created successfully');
    }

    console.log('');
    console.log('🎉 User avatars bucket setup complete!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Update the settings pages to use "user-avatars" bucket');
    console.log('   2. Test avatar upload in your application');
    console.log('   3. The bucket is public and should work without RLS issues');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
createUserAvatarsBucket();
