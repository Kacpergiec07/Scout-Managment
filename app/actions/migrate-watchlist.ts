'use server'

import { createClient } from '@/lib/supabase/server'

export async function migrateWatchlistSchema() {
  try {
    const supabase = await createClient()

    // Add missing columns one by one to avoid conflicts
    const columns = [
      'club TEXT',
      'club_logo TEXT',
      'position TEXT',
      'league TEXT',
      'player_photo TEXT',
      'market_value TEXT',
      'weight TEXT',
      'height TEXT',
      'age TEXT',
      'unfollowed_at TIMESTAMP WITH TIME ZONE'
    ]

    let successCount = 0
    for (const columnDef of columns) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS ${columnDef}`
      })

      if (!error) {
        successCount++
        console.log(`Added column: ${columnDef}`)
      } else {
        console.error(`Failed to add column ${columnDef}:`, error)
      }
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_watchlist_player_id ON watchlist(player_id)',
      'CREATE INDEX IF NOT EXISTS idx_watchlist_status ON watchlist(status)',
      'CREATE INDEX IF NOT EXISTS idx_watchlist_created_at ON watchlist(created_at DESC)'
    ]

    for (const indexSQL of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: indexSQL })
      if (!error) {
        console.log(`Created index: ${indexSQL.split('idx_')[1]?.split(' ')[0]}`)
      }
    }

    return { success: true, message: `Added ${successCount}/${columns.length} columns` }
  } catch (error) {
    console.error('Migration failed:', error)
    return { success: false, error: (error as Error).message }
  }
}