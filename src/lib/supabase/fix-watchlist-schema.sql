-- Add missing columns to watchlist table to support player details
ALTER TABLE watchlist
ADD COLUMN IF NOT EXISTS club TEXT,
ADD COLUMN IF NOT EXISTS club_logo TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS league TEXT,
ADD COLUMN IF NOT EXISTS player_photo TEXT,
ADD COLUMN IF NOT EXISTS market_value TEXT,
ADD COLUMN IF NOT EXISTS weight TEXT,
ADD COLUMN IF NOT EXISTS height TEXT,
ADD COLUMN IF NOT EXISTS age TEXT;

-- Update the updated_at trigger function to include the new columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists for the watchlist table
DROP TRIGGER IF EXISTS update_watchlist_updated_at ON watchlist;
CREATE TRIGGER update_watchlist_updated_at
  BEFORE UPDATE ON watchlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_player_id ON watchlist(player_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_status ON watchlist(status);
CREATE INDEX IF NOT EXISTS idx_watchlist_created_at ON watchlist(created_at DESC);