-- SCOUTPRO: DATABASE OPTIMIZATION SCRIPT
-- Run these commands in your Supabase SQL Editor to improve performance

-- 1. Index for Watchlist searching and filtering
CREATE INDEX IF NOT EXISTS idx_watchlist_user_status_created 
ON watchlist (user_id, status, created_at DESC);

-- 2. Index for player specific lookups (deduplication check)
CREATE INDEX IF NOT EXISTS idx_watchlist_player_lookup
ON watchlist (user_id, player_id);

-- 3. Index for History page (removed status)
CREATE INDEX IF NOT EXISTS idx_watchlist_history 
ON watchlist (user_id, status, removed_at DESC) 
WHERE status = 'removed';

-- 4. Enable BRIN index for created_at if the table grows very large (optional)
-- CREATE INDEX idx_watchlist_brin_created ON watchlist USING BRIN (created_at);

ANALYZE watchlist;
