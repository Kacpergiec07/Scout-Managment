'use client'

import { useState } from 'react'

export default function AddMissingColumnsPage() {
  const [copied, setCopied] = useState(false)

  const migrationSQL = `-- ADD MISSING PROFILE COLUMNS
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

RAISE NOTICE 'Migration completed! All missing columns have been added.';`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(migrationSQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Add Missing Profile Columns</h1>

        <div className="mb-8 rounded-lg border border-red-500/20 bg-red-500/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-red-500">🔴 Database Schema Issue Found</h2>
          <p className="mb-4 text-muted-foreground">
            Your database is missing the <code className="bg-red-500/20 px-1 py-0.5 rounded">active_scouting_count</code> column
            (and potentially others). This is why your profile isn't working.
          </p>
          <h3 className="font-semibold text-red-500 mb-2">The Fix:</h3>
          <ol className="mt-2 list-inside list-decimal text-sm text-muted-foreground space-y-2">
            <li><strong>Click "Copy SQL" below</strong></li>
            <li><strong>Go to your Supabase Dashboard</strong> → SQL Editor</li>
            <li><strong>Paste the SQL</strong> and click "Run"</li>
            <li><strong>Refresh your profile page</strong></li>
            <li><strong>Everything should work!</strong></li>
          </ol>
        </div>

        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Migration SQL</h2>
            <button
              onClick={copyToClipboard}
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {copied ? 'Copied!' : 'Copy SQL'}
            </button>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            This SQL safely adds all missing columns to your profiles table.
          </p>
          <pre className="overflow-x-auto rounded bg-muted p-4 text-xs max-h-96 overflow-y-auto">
            {migrationSQL}
          </pre>
        </div>

        <div className="mb-8 rounded-lg border border-blue-500/20 bg-blue-500/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-blue-500">What This Fixes:</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground space-y-1">
            <li>Adds missing <code className="bg-blue-500/20 px-1 py-0.5 rounded">active_scouting_count</code> column</li>
            <li>Adds missing <code className="bg-blue-500/20 px-1 py-0.5 rounded">reports_created_count</code> column</li>
            <li>Adds missing <code className="bg-blue-500/20 px-1 py-0.5 rounded">players_watched_count</code> column</li>
            <li>Adds missing <code className="bg-blue-500/20 px-1 py-0.5 rounded">assigned_region</code> column</li>
            <li>Adds missing <code className="bg-blue-500/20 px-1 py-0.5 rounded">email</code> column</li>
            <li>Adds missing <code className="bg-blue-500/20 px-1 py-0.5 rounded">bio</code> column</li>
            <li>Adds missing <code className="bg-blue-500/20 px-1 py-0.5 rounded">years_experience</code> column</li>
          </ul>
        </div>

        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-green-500">✅ After Running This:</h2>
          <ol className="mt-2 list-inside list-decimal text-sm text-muted-foreground space-y-2">
            <li>Refresh your profile page - email should appear</li>
            <li>Settings should load without "Access Interrupted" error</li>
            <li>Statistics should update when you add players to watchlist</li>
            <li>New accounts will work exactly like your old account</li>
          </ol>
        </div>
      </div>
    </div>
  )
}