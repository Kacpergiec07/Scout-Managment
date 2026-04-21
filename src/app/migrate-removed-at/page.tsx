'use client'

import { useState } from 'react'

export default function MigrateRemovedAtPage() {
  const [copied, setCopied] = useState(false)

  const migrationSQL = `-- Add removed_at column to watchlist table for tracking when players were removed
ALTER TABLE watchlist
ADD COLUMN IF NOT EXISTS removed_at TIMESTAMPTZ;

-- Add index for better performance on queries filtering by removed status
CREATE INDEX IF NOT EXISTS idx_watchlist_removed_at ON watchlist(removed_at DESC);

-- Add index for status queries to improve history page performance
CREATE INDEX IF NOT EXISTS idx_watchlist_status_removed ON watchlist(status, removed_at DESC);`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(migrationSQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">Add removed_at Column Migration</h1>

        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Why this migration?</h2>
          <p className="mb-4 text-muted-foreground">
            The watchlist table needs a <code className="bg-muted px-1 py-0.5 rounded">removed_at</code> column to track
            when players are removed from the active watchlist. This enables the History page functionality
            that shows previously watched players.
          </p>
          <p className="text-sm text-muted-foreground">
            This migration will add the following to the watchlist table:
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
            <li><code className="bg-muted px-1 py-0.5 rounded">removed_at</code> column to track removal timestamps</li>
            <li>Index on <code className="bg-muted px-1 py-0.5 rounded">removed_at</code> for better query performance</li>
            <li>Composite index on <code className="bg-muted px-1 py-0.5 rounded">status</code> and <code className="bg-muted px-1 py-0.5 rounded">removed_at</code></li>
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

        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Alternative: Use Supabase CLI</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            If you have the Supabase CLI installed, you can run:
          </p>
          <pre className="overflow-x-auto rounded bg-muted p-4 text-xs">
            {`supabase db reset`}
          </pre>
          <p className="mt-2 text-sm text-muted-foreground">
            This will reset your database and apply all migrations including the new schema.
          </p>
        </div>

        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-6">
          <h2 className="mb-2 text-lg font-semibold text-blue-500">Next Steps</h2>
          <p className="text-sm text-muted-foreground">
            After running the migration, you can:
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
            <li>Go to the <a href="/watchlist" className="text-blue-500 hover:underline">Watchlist page</a> and remove a player</li>
            <li>Check the <a href="/history" className="text-blue-500 hover:underline">History page</a> to see removed players</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
