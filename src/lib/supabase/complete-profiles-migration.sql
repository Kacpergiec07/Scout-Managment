-- COMPLETE PROFILES TABLE MIGRATION
-- Run this in your Supabase SQL Editor to add missing columns and fix schema issues
-- This script handles both bio column addition and ensures all required columns exist

-- First, ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can only view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can only insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can only update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can only delete their own profile" ON profiles;

-- Add missing bio column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'bio'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio column to profiles table';
    ELSE
        RAISE NOTICE 'bio column already exists in profiles table';
    END IF;
END $$;

-- Add missing years_experience column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'years_experience'
    ) THEN
        ALTER TABLE profiles ADD COLUMN years_experience INTEGER DEFAULT 0;
        RAISE NOTICE 'Added years_experience column to profiles table';
    ELSE
        RAISE NOTICE 'years_experience column already exists in profiles table';
    END IF;
END $$;

-- Add missing players_watched_count column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'players_watched_count'
    ) THEN
        ALTER TABLE profiles ADD COLUMN players_watched_count INTEGER DEFAULT 0 NOT NULL;
        RAISE NOTICE 'Added players_watched_count column to profiles table';
    ELSE
        RAISE NOTICE 'players_watched_count column already exists in profiles table';
    END IF;
END $$;

-- Add missing active_scouting_count column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'active_scouting_count'
    ) THEN
        ALTER TABLE profiles ADD COLUMN active_scouting_count INTEGER DEFAULT 0 NOT NULL;
        RAISE NOTICE 'Added active_scouting_count column to profiles table';
    ELSE
        RAISE NOTICE 'active_scouting_count column already exists in profiles table';
    END IF;
END $$;

-- Add missing reports_created_count column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'reports_created_count'
    ) THEN
        ALTER TABLE profiles ADD COLUMN reports_created_count INTEGER DEFAULT 0 NOT NULL;
        RAISE NOTICE 'Added reports_created_count column to profiles table';
    ELSE
        RAISE NOTICE 'reports_created_count column already exists in profiles table';
    END IF;
END $$;

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

-- Verify all columns exist and show current schema
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY column_name;

-- Verify policies were created successfully
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;