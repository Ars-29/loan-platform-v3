-- Fix storage RLS policies for avatar uploads
-- Run this in your Supabase SQL editor

-- Option 1: Temporarily disable RLS for testing (NOT recommended for production)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Option 2: Create permissive policies for avatars bucket (RECOMMENDED)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable public uploads for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Enable public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Enable public updates for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Enable public deletes for avatars" ON storage.objects;

-- Create new permissive policies for avatars bucket
CREATE POLICY "Enable public uploads for avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Enable public read access for avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Enable public updates for avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY "Enable public deletes for avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars');

-- Verify policies were created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
