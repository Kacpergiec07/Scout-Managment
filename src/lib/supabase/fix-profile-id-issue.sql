-- FIX PROFILE ID ISSUE
-- This script fixes the schema mismatch causing new accounts to fail

-- Step 1: Check if we need to fix the profiles table structure
DO $$
BEGIN
    -- Check if profiles table has the old structure
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'user_id'
    ) THEN
        -- Check if id column references auth.users directly
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'profiles'
            AND column_name = 'id'
            AND data_type = 'uuid'
        ) THEN
            RAISE NOTICE 'Profiles table has both id and user_id columns';
        END IF;
    END IF;
END $$;

-- Step 2: Drop the problematic trigger that auto-creates profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Update profiles table to match the expected schema
-- First, let's see what columns we have
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY column_name;

-- Step 4: Fix the primary key and foreign key structure
-- Remove the user_id column if it exists and make id the direct reference
DO $$
BEGIN
    -- Check if user_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'user_id'
    ) THEN
        -- Drop foreign key constraint if it exists
        ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

        -- Drop user_id column
        ALTER TABLE profiles DROP COLUMN IF EXISTS user_id;

        RAISE NOTICE 'Dropped user_id column from profiles table';
    END IF;
END $$;

-- Step 5: Add missing columns that the code expects
DO $$
BEGIN
    -- Add email column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'email'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
        RAISE NOTICE 'Added email column';
    END IF;

    -- Add assigned_region column (replace region if needed)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'assigned_region'
    ) THEN
        ALTER TABLE profiles ADD COLUMN assigned_region TEXT DEFAULT 'Global';
        RAISE NOTICE 'Added assigned_region column';
    END IF;

    -- Ensure bio column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'bio'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio column';
    END IF;
END $$;

-- Step 6: Update RLS policies to use the correct field
DROP POLICY IF EXISTS "Users can only view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can only insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can only update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can only delete their own profile" ON profiles;

CREATE POLICY "Users can only view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can only insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can only update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can only delete their own profile"
ON profiles FOR DELETE
USING (auth.uid() = id);

-- Step 7: Show final schema
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY column_name;

-- Step 8: Show policies
SELECT
    policyname,
    cmd,
    permissive
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

RAISE NOTICE 'Profile schema fix completed. Please test new account creation.';
