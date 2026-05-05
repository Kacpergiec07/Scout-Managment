-- Create transfers table for the Transfer War Room
CREATE TABLE IF NOT EXISTS public.transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    player_id TEXT NOT NULL,
    player_name TEXT NOT NULL,
    from_team_id TEXT,
    from_team_name TEXT,
    from_team_logo TEXT,
    to_team_id TEXT,
    to_team_name TEXT,
    to_team_logo TEXT,
    fee TEXT,
    market_value TEXT,
    photo_url TEXT,
    position TEXT,
    nationality TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Optional: unique constraint to prevent duplicate transfers for the same player to the same club by the same user
    CONSTRAINT unique_user_player_transfer UNIQUE (user_id, player_id, to_team_id)
);

-- Enable RLS
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own transfers"
ON public.transfers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transfers"
ON public.transfers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transfers"
ON public.transfers FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
