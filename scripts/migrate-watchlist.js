// Run this script to fix the watchlist table schema
// Usage: node scripts/migrate-watchlist.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const migrationSQL = `
-- Add missing columns to watchlist table
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_player_id ON watchlist(player_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_status ON watchlist(status);
CREATE INDEX IF NOT EXISTS idx_watchlist_created_at ON watchlist(created_at DESC);
`;

async function runMigration() {
  try {
    console.log('Starting watchlist schema migration...');

    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('Error running migration:', error);
      return;
    }

    console.log('Migration completed successfully!');
    console.log('The watchlist table now includes all player detail columns.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();