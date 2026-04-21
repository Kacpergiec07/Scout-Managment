-- MIGRATION: Add statistics columns to existing profiles table
-- Run this in your Supabase SQL Editor to update existing profiles table

-- Add statistics columns if they don't exist
DO $$
BEGIN
    -- Add years_experience column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'years_experience'
    ) THEN
        ALTER TABLE profiles ADD COLUMN years_experience INTEGER DEFAULT 0;
        RAISE NOTICE 'Added years_experience column';
    END IF;

    -- Add players_watched_count column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'players_watched_count'
    ) THEN
        ALTER TABLE profiles ADD COLUMN players_watched_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added players_watched_count column';
    END IF;

    -- Add active_scouting_count column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'active_scouting_count'
    ) THEN
        ALTER TABLE profiles ADD COLUMN active_scouting_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added active_scouting_count column';
    END IF;

    -- Add reports_created_count column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'reports_created_count'
    ) THEN
        ALTER TABLE profiles ADD COLUMN reports_created_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added reports_created_count column';
    END IF;
END
$$;

-- Verify the columns were added
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name IN ('years_experience', 'players_watched_count', 'active_scouting_count', 'reports_created_count')
ORDER BY column_name;