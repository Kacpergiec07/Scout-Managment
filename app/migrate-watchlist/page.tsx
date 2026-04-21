'use client'

import { useState } from 'react'

export default function MigrateWatchlistPage() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const runMigration = async () => {
    setStatus('idle')
    setMessage('Starting migration...')

    try {
      const response = await fetch('/api/migrate-watchlist', {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        setStatus('success')
        setMessage(result.message)
      } else {
        setStatus('error')
        setMessage(result.error || 'Migration failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage(`Error: ${(error as Error).message}`)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">Watchlist Schema Migration</h1>

        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Why this migration?</h2>
          <p className="mb-4 text-muted-foreground">
            The watchlist table needs additional columns to store player details
            like club, position, league, photos, and physical attributes.
          </p>
          <p className="text-sm text-muted-foreground">
            This migration will add the following columns to the watchlist table:
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
            <li>club</li>
            <li>club_logo</li>
            <li>position</li>
            <li>league</li>
            <li>player_photo</li>
            <li>market_value</li>
            <li>weight</li>
            <li>height</li>
            <li>age</li>
          </ul>
        </div>

        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Alternative: Run SQL Manually</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            If the automated migration doesn't work, you can run this SQL in your
            Supabase SQL editor:
          </p>
          <pre className="overflow-x-auto rounded bg-muted p-4 text-xs">
{`ALTER TABLE watchlist
ADD COLUMN IF NOT EXISTS club TEXT,
ADD COLUMN IF NOT EXISTS club_logo TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS league TEXT,
ADD COLUMN IF NOT EXISTS player_photo TEXT,
ADD COLUMN IF NOT EXISTS market_value TEXT,
ADD COLUMN IF NOT EXISTS weight TEXT,
ADD COLUMN IF NOT EXISTS height TEXT,
ADD COLUMN IF NOT EXISTS age TEXT;

CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_player_id ON watchlist(player_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_status ON watchlist(status);
CREATE INDEX IF NOT EXISTS idx_watchlist_created_at ON watchlist(created_at DESC);`}
          </pre>
        </div>

        <button
          onClick={runMigration}
          disabled={status !== 'idle'}
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'idle' ? 'Run Migration' : 'Processing...'}
        </button>

        {message && (
          <div
            className={`mt-4 rounded-lg p-4 ${
              status === 'success'
                ? 'bg-green-500/10 text-green-500'
                : 'bg-red-500/10 text-red-500'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}