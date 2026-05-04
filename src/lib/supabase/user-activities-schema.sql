-- USER ACTIVITIES TABLE TO TRACK USER ACTIONS
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL, -- 'watchlist_add', 'watchlist_remove', 'scout_job_received', 'scout_job_completed', 'report_created', etc.
  activity_data JSONB DEFAULT '{}'::jsonb, -- Additional data like player name, job details, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_activity_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);

-- ROW LEVEL SECURITY FOR USER ACTIVITIES
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own activities"
ON user_activities FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own activities"
ON user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- FUNCTION TO LOG USER ACTIVITY
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_activity_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
BEGIN
  INSERT INTO user_activities (user_id, activity_type, activity_data)
  VALUES (p_user_id, p_activity_type, p_activity_data)
  RETURNING id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE INDEX FOR RECENT ACTIVITY QUERIES
CREATE INDEX IF NOT EXISTS idx_user_activities_user_created ON user_activities(user_id, created_at DESC);