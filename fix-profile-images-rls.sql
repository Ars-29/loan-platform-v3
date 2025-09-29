-- Fix RLS policies for profile-images bucket to allow user avatar uploads
-- Run this in your Supabase SQL editor

-- Option 1: Temporarily disable RLS for profile-images bucket (QUICK FIX)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Option 2: Create permissive policies for profile-images bucket (RECOMMENDED)

-- Drop existing policies for profile-images bucket
DROP POLICY IF EXISTS "Enable public uploads for profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Enable public read access for profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Enable public updates for profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Enable public deletes for profile-images" ON storage.objects;

-- Create new permissive policies for profile-images bucket
CREATE POLICY "Enable public uploads for profile-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Enable public read access for profile-images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Enable public updates for profile-images" ON storage.objects
FOR UPDATE USING (bucket_id = 'profile-images');

CREATE POLICY "Enable public deletes for profile-images" ON storage.objects
FOR DELETE USING (bucket_id = 'profile-images');

-- Verify policies were created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
