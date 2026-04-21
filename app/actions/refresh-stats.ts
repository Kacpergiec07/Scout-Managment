'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Refresh user statistics from database
 * Call this function after adding/removing players from watchlist or completing analysis
 */
export async function refreshUserStats() {
  console.log('refreshUserStats: Starting statistics refresh...')

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('refreshUserStats: User not authenticated')
      return { error: 'User not authenticated' }
    }

    console.log('refreshUserStats: User authenticated, refreshing stats for:', user.id)

    // Count players on watchlist
    const { count: playersWatched, error: watchlistError } = await supabase
      .from('watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (watchlistError) {
      console.error('refreshUserStats: Watchlist count error:', watchlistError)
      return { error: 'Failed to count watchlist entries' }
    }

    // Count active scouting
    const { count: activeScouting, error: activeScoutingError } = await supabase
      .from('watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['following', 'priority', 'analyzing'])

    if (activeScoutingError) {
      console.error('refreshUserStats: Active scouting count error:', activeScoutingError)
      return { error: 'Failed to count active scouting' }
    }

    // Count analysis history
    const { count: reportsCreated, error: reportsError } = await supabase
      .from('analysis_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (reportsError) {
      console.error('refreshUserStats: Reports count error:', reportsError)
      return { error: 'Failed to count analysis history' }
    }

    console.log('refreshUserStats: Counts fetched:', {
      playersWatched,
      activeScouting,
      reportsCreated
    })

    // Update profile with new counts
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        players_watched_count: playersWatched || 0,
        active_scouting_count: activeScouting || 0,
        reports_created_count: reportsCreated || 0
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('refreshUserStats: Profile update error:', updateError)
      return { error: 'Failed to update profile statistics' }
    }

    console.log('refreshUserStats: Statistics refreshed successfully')

    // Revalidate paths to update UI
    revalidatePath('/profile', 'layout')
    revalidatePath('/settings', 'layout')

    return {
      success: true,
      data: {
        players_watched_count: playersWatched || 0,
        active_scouting_count: activeScouting || 0,
        reports_created_count: reportsCreated || 0
      }
    }
  } catch (error) {
    console.error('refreshUserStats: Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}