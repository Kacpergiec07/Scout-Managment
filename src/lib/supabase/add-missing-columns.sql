-- ADD MISSING PROFILE COLUMNS
-- This migration adds columns that are missing from your database
-- Run this in your Supabase SQL Editor

-- Add active_scouting_count column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'active_scouting_count'
    ) THEN
        ALTER TABLE profiles ADD COLUMN active_scouting_count INTEGER DEFAULT 0 NOT NULL;
        RAISE NOTICE 'Added active_scouting_count column';
    ELSE
        RAISE NOTICE 'active_scouting_count column already exists';
    END IF;
END $$;

-- Add reports_created_count column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'reports_created_count'
    ) THEN
        ALTER TABLE profiles ADD COLUMN reports_created_count INTEGER DEFAULT 0 NOT NULL;
        RAISE NOTICE 'Added reports_created_count column';
    ELSE
        RAISE NOTICE 'reports_created_count column already exists';
    END IF;
END $$;

-- Add players_watched_count column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'players_watched_count'
    ) THEN
        ALTER TABLE profiles ADD COLUMN players_watched_count INTEGER DEFAULT 0 NOT NULL;
        RAISE NOTICE 'Added players_watched_count column';
    ELSE
        RAISE NOTICE 'players_watched_count column already exists';
    END IF;
END $$;

-- Add assigned_region column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'assigned_region'
    ) THEN
        ALTER TABLE profiles ADD COLUMN assigned_region TEXT DEFAULT 'Global';
        RAISE NOTICE 'Added assigned_region column';
    ELSE
        RAISE NOTICE 'assigned_region column already exists';
    END IF;
END $$;

-- Add email column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'email'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
        RAISE NOTICE 'Added email column';
    ELSE
        RAISE NOTICE 'email column already exists';
    END IF;
END $$;

-- Add bio column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'bio'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio column';
    ELSE
        RAISE NOTICE 'bio column already exists';
    END IF;
END $$;

-- Add years_experience column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'years_experience'
    ) THEN
        ALTER TABLE profiles ADD COLUMN years_experience INTEGER DEFAULT 0;
        RAISE NOTICE 'Added years_experience column';
    ELSE
        RAISE NOTICE 'years_experience column already exists';
    END IF;
END $$;

-- Verify all columns are now present
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY column_name;

RAISE NOTICE 'Migration completed! All missing columns have been added.';