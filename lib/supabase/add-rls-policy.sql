-- ADD ROW LEVEL SECURITY POLICY FOR PROFILES TABLE
-- Run this in your Supabase SQL Editor to ensure users can update their own profiles

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can only view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can only insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can only update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can only delete their own profile" ON profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can only view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = id);

CREATE POLICY "Users can only insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() = id);

CREATE POLICY "Users can only update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = id)
WITH CHECK (auth.uid() = user_id OR auth.uid() = id);

CREATE POLICY "Users can only delete their own profile"
ON profiles FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = id);

-- Allow service role to perform any operation (optional - for system operations)
-- CREATE POLICY "Service role can do anything"
-- ON profiles FOR ALL
-- USING (auth.jwt() ->> 'role' = 'service_role');

-- Test the policies
-- This query should work when user is authenticated
SELECT * FROM profiles WHERE id = auth.uid();

-- Verify policies are created correctly
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;