-- Add removed_at column to watchlist table for tracking when players were removed
ALTER TABLE watchlist
ADD COLUMN IF NOT EXISTS removed_at TIMESTAMPTZ;

-- Add index for better performance on queries filtering by removed status
CREATE INDEX IF NOT EXISTS idx_watchlist_removed_at ON watchlist(removed_at DESC);

-- Add index for status queries to improve history page performance
CREATE INDEX IF NOT EXISTS idx_watchlist_status_removed ON watchlist(status, removed_at DESC);