'use server'

import { createClient } from '@/lib/supabase/server'

export async function getHistory() {
  console.log('getHistory: Starting history fetch...')

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('getHistory: User not authenticated')
      return []
    }

    console.log('getHistory: User authenticated, fetching history...', user.id)

    const { data: history, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'unfollowed')
      .order('unfollowed_at', { ascending: false })

    if (error) {
      console.error('getHistory: Database error:', error)
      return []
    }

    console.log('getHistory: History fetched successfully:', history?.length || 0)

    // Transform data to match expected format
    return (history || []).map((item: any) => ({
      id: item.player_id,
      date: item.unfollowed_at || item.updated_at,
      player: item.player_name,
      club: item.club,
      league: item.league,
      highScore: Math.floor(Math.random() * (98 - 85) + 85), // Random score between 85-98 for demo
      nation: 'Unknown', // This would need to be stored in database
      pos: item.position,
      photo: item.player_photo
    }))
  } catch (error) {
    console.error('getHistory: Unexpected error:', error)
    return []
  }
}
