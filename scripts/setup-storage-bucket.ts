import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorageBucket() {
  try {
    console.log('🚀 Setting up Supabase Storage bucket...');

    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
    
    if (avatarsBucket) {
      console.log('✅ Avatars bucket already exists');
      return;
    }

    // Create the avatars bucket
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 10485760 // 10MB in bytes
    });

    if (error) {
      console.error('❌ Error creating bucket:', error);
      return;
    }

    console.log('✅ Successfully created avatars bucket:', data);

    // Set up RLS policies for the bucket
    console.log('🔒 Setting up RLS policies...');

    // Policy 1: Allow authenticated users to upload their own avatars
    const { error: uploadPolicyError } = await supabase.rpc('create_policy', {
      policy_name: 'Users can upload their own avatars',
      table_name: 'storage.objects',
      policy_definition: `
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
      `,
      policy_command: 'INSERT',
      policy_check: 'true'
    });

    if (uploadPolicyError) {
      console.log('⚠️  Could not create upload policy (may already exist):', uploadPolicyError.message);
    } else {
      console.log('✅ Upload policy created');
    }

    // Policy 2: Allow public read access to avatars
    const { error: readPolicyError } = await supabase.rpc('create_policy', {
      policy_name: 'Public can read avatars',
      table_name: 'storage.objects',
      policy_definition: `bucket_id = 'avatars'`,
      policy_command: 'SELECT',
      policy_check: 'true'
    });

    if (readPolicyError) {
      console.log('⚠️  Could not create read policy (may already exist):', readPolicyError.message);
    } else {
      console.log('✅ Read policy created');
    }

    // Policy 3: Allow users to update their own avatars
    const { error: updatePolicyError } = await supabase.rpc('create_policy', {
      policy_name: 'Users can update their own avatars',
      table_name: 'storage.objects',
      policy_definition: `
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
      `,
      policy_command: 'UPDATE',
      policy_check: 'true'
    });

    if (updatePolicyError) {
      console.log('⚠️  Could not create update policy (may already exist):', updatePolicyError.message);
    } else {
      console.log('✅ Update policy created');
    }

    // Policy 4: Allow users to delete their own avatars
    const { error: deletePolicyError } = await supabase.rpc('create_policy', {
      policy_name: 'Users can delete their own avatars',
      table_name: 'storage.objects',
      policy_definition: `
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
      `,
      policy_command: 'DELETE',
      policy_check: 'true'
    });

    if (deletePolicyError) {
      console.log('⚠️  Could not create delete policy (may already exist):', deletePolicyError.message);
    } else {
      console.log('✅ Delete policy created');
    }

    console.log('🎉 Storage bucket setup complete!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to Storage > Policies');
    console.log('   3. Verify the policies were created correctly');
    console.log('   4. Test avatar upload in your application');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
setupStorageBucket();