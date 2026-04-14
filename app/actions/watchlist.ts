'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getWatchlist() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    console.error('Fetch Watchlist Error:', error)
    return {}
  }

  // Transform into columns structure
  const initial = { following: [], priority: [], analyzing: [], complete: [] }
  return data.reduce((acc: any, item: any) => {
    acc[item.status] = acc[item.status] || []
    acc[item.status].push({
      id: item.id,
      name: item.player_name,
      club: 'Statorium Match', // In real app, join or fetch metadata
      position: 'ST',
      score: item.score
    })
    return acc
  }, initial)
}

export async function updateWatchlistStatus(id: string, status: string) {
  const supabase = await createClient()
  await supabase
    .from('watchlist')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  revalidatePath('/watchlist')
}

export async function addToWatchlist(playerData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('watchlist').insert({
    user_id: user.id,
    player_id: playerData.id,
    player_name: playerData.name,
    score: playerData.score,
    status: 'following'
  })

  revalidatePath('/watchlist')
}
