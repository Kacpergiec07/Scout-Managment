-- USER ACTIVITIES TABLE MIGRATION
-- Run this in your Supabase SQL Editor to create the user_activities table

-- Create the user_activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_activity_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_created ON user_activities(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can only view their own activities" ON user_activities;
DROP POLICY IF EXISTS "Users can only insert their own activities" ON user_activities;

-- Create RLS policies
CREATE POLICY "Users can only view their own activities"
ON user_activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own activities"
ON user_activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Verify the table was created successfully
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_activities'
ORDER BY column_name;

-- Verify the indexes were created
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'user_activities'
AND schemaname = 'public'
ORDER BY indexname;

-- Verify the policies were created successfully
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_activities'
ORDER BY policyname;
