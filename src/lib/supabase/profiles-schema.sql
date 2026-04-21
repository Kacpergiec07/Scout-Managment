-- PROFILES TABLE FOR USER DATA
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'Scout', -- 'Scout', 'Senior Scout', 'Scouting Director', 'Manager'
  bio TEXT,
  region TEXT,
  join_date TIMESTAMPTZ DEFAULT NOW(),
  notification_preferences JSONB DEFAULT '{"email_alerts": true, "push_notifications": false, "player_updates": true, "transfer_alerts": true, "weekly_reports": false}'::jsonb,
  -- Statistics fields (can be calculated or manually set)
  years_experience INTEGER DEFAULT 0,
  players_watched_count INTEGER DEFAULT 0,
  active_scouting_count INTEGER DEFAULT 0,
  reports_created_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FUNCTION TO UPDATE UPDATED_AT TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- CREATE TRIGGER FOR PROFILES TABLE
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- CREATE POLICY FOR PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own profile"
ON profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own profile"
ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own profile"
ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- CREATE INDEX FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- FUNCTION TO AUTO-CREATE PROFILE ON USER SIGNUP
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, notification_preferences)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    '{"email_alerts": true, "push_notifications": false, "player_updates": true, "transfer_alerts": true, "weekly_reports": false}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER FOR AUTO-PROFILE CREATION
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();