'use client'

import { useState } from 'react'

export default function DiagnoseProfileIssuePage() {
  const [copied, setCopied] = useState(false)

  const diagnosticSQL = `-- DIAGNOSTIC QUERY - Run this in Supabase SQL Editor
-- This will help us understand the actual database structure and data

-- Step 1: Check the actual profiles table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY column_name;

-- Step 2: Check existing profiles data
SELECT
    id,
    user_id,
    email,
    full_name,
    assigned_region,
    role,
    bio,
    players_watched_count,
    active_scouting_count,
    reports_created_count,
    created_at
FROM profiles
LIMIT 10;

-- Step 3: Check watchlist data for your new account
-- Replace YOUR_EMAIL_HERE with your actual email
SELECT
    w.id,
    w.user_id,
    w.player_name,
    w.status,
    w.created_at,
    u.email
FROM watchlist w
JOIN auth.users u ON w.user_id = u.id
WHERE u.email LIKE '%YOUR_EMAIL_HERE%'
ORDER BY w.created_at DESC
LIMIT 10;

-- Step 4: Check current RLS policies
SELECT
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 5: Check if the problematic user has a profile
-- Replace YOUR_EMAIL_HERE with your actual email
SELECT
    p.*,
    u.email as user_email
FROM profiles p
FULL OUTER JOIN auth.users u ON (p.id = u.id OR p.user_id = u.id)
WHERE u.email LIKE '%YOUR_EMAIL_HERE%'
   OR p.email LIKE '%YOUR_EMAIL_HERE%';

-- Step 6: Get user ID from email
-- Replace YOUR_EMAIL_HERE with your actual email
SELECT
    id,
    email,
    created_at,
    last_sign_in_at,
    email_confirmed_at
FROM auth.users
WHERE email LIKE '%YOUR_EMAIL_HERE%';`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(diagnosticSQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Diagnose Profile Issue</h1>

        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Diagnostic Query</h2>
          <p className="mb-4 text-muted-foreground">
            Run this query in your Supabase SQL Editor to see what's actually in your database.
            This will help us identify the exact issue.
          </p>

          <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <h3 className="font-semibold text-yellow-500 mb-2">⚠️ Important:</h3>
            <p className="text-sm text-muted-foreground">
              Replace <code className="bg-yellow-500/20 px-1 py-0.5 rounded">YOUR_EMAIL_HERE</code> with your actual email address in steps 3 and 5.
            </p>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium">Click to copy:</span>
            <button
              onClick={copyToClipboard}
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {copied ? 'Copied!' : 'Copy SQL'}
            </button>
          </div>

          <pre className="overflow-x-auto rounded bg-muted p-4 text-xs max-h-96 overflow-y-auto">
            {diagnosticSQL}
          </pre>
        </div>

        <div className="mb-8 rounded-lg border border-blue-500/20 bg-blue-500/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-blue-500">What to Look For:</h2>
          <ol className="mt-2 list-inside list-decimal text-sm text-muted-foreground space-y-2">
            <li><strong>Step 1:</strong> Check if profiles table has the correct columns (id, email, assigned_region, bio, etc.)</li>
            <li><strong>Step 2:</strong> See what profiles actually exist and their structure</li>
            <li><strong>Step 3:</strong> Check if your new account has watchlist entries</li>
            <li><strong>Step 4:</strong> Verify RLS policies are correct</li>
            <li><strong>Step 5:</strong> Check if your problematic user has a profile row</li>
            <li><strong>Step 6:</strong> Get your actual user ID from auth.users</li>
          </ol>
        </div>

        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-green-500">📋 Share Results:</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            After running the diagnostic query, share the results with me. I need to see:
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground space-y-1">
            <li>Actual profiles table structure (from Step 1)</li>
            <li>Existing profiles data (from Step 2)</li>
            <li>Whether your problematic user has a profile (from Step 5)</li>
            <li>Your user ID from auth.users (from Step 6)</li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            This will help me create the exact fix needed for your specific database setup.
          </p>
        </div>
      </div>
    </div>
  )
}