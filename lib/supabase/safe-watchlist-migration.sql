-- First, let's check current table structure and add missing columns safely
-- Run this step by step in Supabase SQL Editor

-- Step 1: Add basic columns if they don't exist
DO $$
BEGIN
  -- Check and add status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist' AND column_name = 'status'
  ) THEN
    ALTER TABLE watchlist ADD COLUMN status TEXT NOT NULL DEFAULT 'following';
  END IF;

  -- Check and add club column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist' AND column_name = 'club'
  ) THEN
    ALTER TABLE watchlist ADD COLUMN club TEXT;
  END IF;

  -- Check and add club_logo column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist' AND column_name = 'club_logo'
  ) THEN
    ALTER TABLE watchlist ADD COLUMN club_logo TEXT;
  END IF;

  -- Check and add position column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist' AND column_name = 'position'
  ) THEN
    ALTER TABLE watchlist ADD COLUMN position TEXT;
  END IF;

  -- Check and add league column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist' AND column_name = 'league'
  ) THEN
    ALTER TABLE watchlist ADD COLUMN league TEXT;
  END IF;

  -- Check and add player_photo column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist' AND column_name = 'player_photo'
  ) THEN
    ALTER TABLE watchlist ADD COLUMN player_photo TEXT;
  END IF;

  -- Check and add market_value column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist' AND column_name = 'market_value'
  ) THEN
    ALTER TABLE watchlist ADD COLUMN market_value TEXT;
  END IF;

  -- Check and add weight column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist' AND column_name = 'weight'
  ) THEN
    ALTER TABLE watchlist ADD COLUMN weight TEXT;
  END IF;

  -- Check and add height column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist' AND column_name = 'height'
  ) THEN
    ALTER TABLE watchlist ADD COLUMN height TEXT;
  END IF;

  -- Check and add age column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist' AND column_name = 'age'
  ) THEN
    ALTER TABLE watchlist ADD COLUMN age TEXT;
  END IF;

  -- Check and add score column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist' AND column_name = 'score'
  ) THEN
    ALTER TABLE watchlist ADD COLUMN score INTEGER;
  END IF;

  -- Check and add notes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'watchlist' AND column_name = 'notes'
  ) THEN
    ALTER TABLE watchlist ADD COLUMN notes TEXT;
  END IF;

END $$;

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_player_id ON watchlist(player_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_status ON watchlist(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_watchlist_created_at ON watchlist(created_at DESC);