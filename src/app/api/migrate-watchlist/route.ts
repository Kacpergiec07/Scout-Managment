import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // First, let's check if we can execute SQL directly
    // If not, we'll provide the SQL for manual execution

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_player_id ON watchlist(player_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_status ON watchlist(status);
CREATE INDEX IF NOT EXISTS idx_watchlist_created_at ON watchlist(created_at DESC);
`

    // Try to execute the SQL using Supabase's SQL execution
    // Note: This requires the service role key and proper permissions
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    })

    if (error) {
      console.error('Direct SQL execution failed:', error)

      // Return the SQL for manual execution
      return NextResponse.json({
        success: false,
        error: 'Could not execute SQL automatically. Please run the migration manually.',
        manualSQL: migrationSQL,
        instructions: 'Go to your Supabase dashboard -> SQL Editor and run the provided SQL.'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully! All columns have been added to the watchlist table.'
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}