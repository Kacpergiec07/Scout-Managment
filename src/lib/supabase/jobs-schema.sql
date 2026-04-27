-- SCOUTING JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  club_id TEXT NOT NULL,
  club_name TEXT NOT NULL,
  club_logo TEXT,
  league_id TEXT NOT NULL,
  league_name TEXT NOT NULL,
  position TEXT NOT NULL,
  requirements JSONB NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  deadline DATE NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own jobs"
ON jobs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own jobs"
ON jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own jobs"
ON jobs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own jobs"
ON jobs FOR DELETE USING (auth.uid() = user_id);

-- INDEX FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- FUNCTION TO UPDATE updated_at TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- TRIGGER TO AUTO UPDATE updated_at
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
