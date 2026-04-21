-- WATCHLIST TABLE
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL, -- Statorium ID or Internal UUID
  player_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'following', -- 'following', 'priority', 'analyzing', 'complete'
  score INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANALYSIS HISTORY TABLE
CREATE TABLE IF NOT EXISTS analysis_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own watchlist"
ON watchlist FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own watchlist"
ON watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own watchlist"
ON watchlist FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own analysis history"
ON analysis_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis history"
ON analysis_history FOR INSERT WITH CHECK (auth.uid() = user_id);
