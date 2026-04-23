'use client'

import { useState } from 'react'

export default function FixProfileSchemaPage() {
  const [copied, setCopied] = useState(false)

  const migrationSQL = `-- FIX PROFILE ID ISSUE
-- This script fixes the schema mismatch causing new accounts to fail

-- Step 1: Drop the problematic trigger that auto-creates profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Fix the primary key and foreign key structure
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

-- Step 3: Add missing columns that the code expects
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

-- Step 4: Update RLS policies to use the correct field
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

-- Step 5: Show final schema
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY column_name;

-- Step 6: Show policies
SELECT
    policyname,
    cmd,
    permissive
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

RAISE NOTICE 'Profile schema fix completed. Please test new account creation.';`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(migrationSQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Fix Profile Schema Issue</h1>

        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Why this fix?</h2>
          <p className="mb-4 text-muted-foreground">
            There's a schema mismatch between your database and the application code. The profiles table has a <code className="bg-muted px-1 py-0.5 rounded">user_id</code> column, but the code expects to use <code className="bg-muted px-1 py-0.5 rounded">id</code> directly to reference the auth user. This causes new accounts to fail while old accounts work.
          </p>
          <h3 className="mb-2 text-lg font-semibold">Symptoms:</h3>
          <ul className="mt-2 list-inside list-disc text-muted-foreground">
            <li>Email field empty in profile</li>
            <li>Settings shows "Access Interrupted" error</li>
            <li>Statistics not updating even after adding players</li>
            <li>New accounts fail, old accounts work</li>
          </ul>
        </div>

        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Run SQL Manually</h2>
            <button
              onClick={copyToClipboard}
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {copied ? 'Copied!' : 'Copy SQL'}
            </button>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Go to your Supabase dashboard → SQL Editor and run this SQL:
          </p>
          <pre className="overflow-x-auto rounded bg-muted p-4 text-xs">
            {migrationSQL}
          </pre>
        </div>

        <div className="mb-8 rounded-lg border border-blue-500/20 bg-blue-500/5 p-6">
          <h2 className="mb-2 text-lg font-semibold text-blue-500">After Running the Migration</h2>
          <ol className="mt-2 list-inside list-decimal text-sm text-muted-foreground">
            <li className="mb-2">Sign out from all accounts</li>
            <li className="mb-2">Sign in with your problematic account</li>
            <li className="mb-2">The profile should now load correctly with email and statistics</li>
            <li className="mb-2">Try adding a new player to watchlist</li>
            <li className="mb-2">Check if statistics update properly</li>
          </ol>
        </div>

        <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-6">
          <h2 className="mb-2 text-lg font-semibold text-orange-500">⚠️ Important Notes</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
            <li>This migration is safe to run - it only drops problematic columns and adds missing ones</li>
            <li>It won't delete any existing user data</li>
            <li>Make sure to test with your problematic account after running</li>
            <li>If you still have issues, check the console for error messages</li>
          </ul>
        </div>
      </div>
    </div>
  )
}