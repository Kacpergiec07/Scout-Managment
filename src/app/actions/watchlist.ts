'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getWatchlist() {
  console.log('getWatchlist: Starting watchlist fetch...')

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('getWatchlist: User not authenticated')
      return []
    }

    console.log('getWatchlist: User authenticated, fetching watchlist...', user.id)

    const { data: watchlist, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'removed') // Exclude removed players from watchlist
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getWatchlist: Database error:', error)
      return []
    }

    console.log('getWatchlist: Watchlist fetched successfully:', watchlist?.length || 0)
    return watchlist || []
  } catch (error) {
    console.error('getWatchlist: Unexpected error:', error)
    return []
  }
}

export async function addToWatchlist(playerData: {
  player_id: string
  player_name: string
  club: string
  club_logo: string | null
  position: string
  league: string
  player_photo: string
  market_value: string
  weight: string
  height: string
  age: string
}) {
  console.log('addToWatchlist: Adding player to watchlist:', playerData.player_name)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('addToWatchlist: User not authenticated')
      return { error: 'User not authenticated' }
    }

    // Check if player already exists (in any state: watchlist OR history)
    const { data: existingPlayer } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .eq('player_id', playerData.player_id)
      .maybeSingle() // Use maybeSingle to handle null gracefully

    // If player exists, prevent addition
    if (existingPlayer) {
      if (existingPlayer.status === 'removed') {
        return {
          error: `${playerData.player_name} is in your watch history. Check the History page to restore this player.`
        }
      } else {
        return {
          error: `${playerData.player_name} is already in your watchlist.`
        }
      }
    }

    // Prepare insert data with all fields
    const insertData: any = {
      user_id: user.id,
      player_id: playerData.player_id,
      player_name: playerData.player_name,
      status: 'following',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Add optional fields if provided
    const optionalFields = [
      'club', 'club_logo', 'position', 'league', 'player_photo',
      'market_value', 'weight', 'height', 'age'
    ]

    for (const field of optionalFields) {
      if (playerData[field as keyof typeof playerData] !== undefined) {
        insertData[field] = playerData[field as keyof typeof playerData]
      }
    }

    // Insert the new player
    const { data, error } = await supabase
      .from('watchlist')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('addToWatchlist: Database error:', error)

      // Check for specific schema errors
      if (error.message.includes('column') || error.code === '42703') {
        return {
          error: 'Database schema needs update. Please visit /migrate-watchlist to fix the database schema.'
        }
      }

      return { error: error.message }
    }

    console.log('addToWatchlist: Player added successfully:', data)
    revalidatePath('/watchlist')
    revalidatePath('/history')
    revalidatePath('/profile')
    revalidatePath('/settings')
    return { success: true, data }
  } catch (error) {
    console.error('addToWatchlist: Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function removeFromWatchlist(playerId: string) {
  console.log('removeFromWatchlist: Removing player from watchlist:', playerId)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('removeFromWatchlist: User not authenticated')
      return { error: 'User not authenticated' }
    }

    // Simply UPDATE the existing player's status to 'removed'
    // Instead of deleting and recreating the entry
    const { error } = await supabase
      .from('watchlist')
      .update({
        status: 'removed',
        removed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('player_id', playerId)

    if (error) {
      console.error('removeFromWatchlist: Database error:', error)
      return { error: error.message }
    }

    console.log('removeFromWatchlist: Player marked as removed successfully:', playerId)
    revalidatePath('/watchlist')
    revalidatePath('/history')
    revalidatePath('/profile')
    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('removeFromWatchlist: Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function getWatchHistory() {
  console.log('getWatchHistory: Starting watch history fetch...')

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('getWatchHistory: User not authenticated')
      return []
    }

    console.log('getWatchHistory: User authenticated, fetching history...', user.id)

    const { data: history, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'removed')
      .order('removed_at', { ascending: false })

    if (error) {
      console.error('getWatchHistory: Database error:', error)
      return []
    }

    console.log('getWatchHistory: History fetched successfully:', history?.length || 0)
    return history || []
  } catch (error) {
    console.error('getWatchHistory: Unexpected error:', error)
    return []
  }
}

export async function updateWatchlistStatus(id: string, status: string) {
  console.log('updateWatchlistStatus: Updating player status:', id, status)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('updateWatchlistStatus: User not authenticated')
      return { error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('watchlist')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('updateWatchlistStatus: Database error:', error)
      return { error: error.message }
    }

    console.log('updateWatchlistStatus: Player status updated successfully:', id, status)
    revalidatePath('/watchlist')
    revalidatePath('/profile')
    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('updateWatchlistStatus: Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}
