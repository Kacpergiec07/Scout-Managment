'use server'

import { createClient } from '@/lib/supabase/server'
import { getStatoriumClient } from '@/lib/statorium/client'
import { revalidatePath } from 'next/cache'

export async function syncLeagueData(seasonId: string) {
  try {
    const supabase = await createClient()
    const client = getStatoriumClient()

    console.log(`[Sync] Starting sync for season ${seasonId}`)

    // 1. Fetch Standings (Teams)
    const standings = await client.getStandings(seasonId)
    if (!standings || standings.length === 0) return { error: 'No standings found' }

    const teamsToUpsert = standings.map((s: any) => ({
      id: (s.teamID || s.team_id || s.id).toString(),
      name: s.teamName || s.teamMiddleName || 'Unknown Team',
      logo: s.logo || s.teamLogo || '',
      season_id: seasonId,
      last_synced: new Date().toISOString()
    }))

    const { error: teamError } = await supabase
      .from('cached_teams')
      .upsert(teamsToUpsert)

    if (teamError) {
      console.error('[Sync] Team upsert error:', teamError)
      // If table doesn't exist, we might need the user to run SQL, but we'll try to continue
    }

    // 2. Fetch Players for each team
    let allPlayers: any[] = []
    
    // To avoid hitting API too hard, we limit to top 10 teams for this demo/MVP
    const topTeams = standings.slice(0, 10)
    
    for (const team of topTeams) {
      const tid = (team.teamID || team.team_id || team.id).toString()
      try {
        const players = await client.getPlayersByTeam(tid, seasonId)
        if (players && players.length > 0) {
          const playersToUpsert = players.map((p: any) => {
            // Simulate injury (10% chance)
            const isInjured = Math.random() < 0.1
            const injuryType = isInjured ? ['ACL Strain', 'Hamstring Pull', 'Ankle Sprain', 'Illness'][Math.floor(Math.random() * 4)] : 'Healthy'
            
            // Simulate contract expiry (random date in next 2 years)
            const expiry = new Date()
            expiry.setMonth(expiry.getMonth() + Math.floor(Math.random() * 24) + 1)

            return {
              id: p.playerID.toString(),
              full_name: p.fullName,
              position: p.position || p.additionalInfo?.position || 'N/A',
              team_id: tid,
              team_name: team.teamName || team.teamMiddleName,
              season_id: seasonId,
              photo_url: p.photo || `https://api.statorium.com/media/bearleague/bl${p.playerID}.webp`,
              birthdate: p.additionalInfo?.birthdate || '',
              stats: p.stat || {},
              injury_status: injuryType,
              contract_expiry: expiry.toISOString(),
              last_synced: new Date().toISOString()
            }
          })
          allPlayers.push(...playersToUpsert)
        }
      } catch (e) {
        console.warn(`[Sync] Failed for team ${tid}`, e)
      }
    }

    if (allPlayers.length > 0) {
      const { error: playerError } = await supabase
        .from('cached_players')
        .upsert(allPlayers)
      
      if (playerError) console.error('[Sync] Player upsert error:', playerError)
    }

    console.log(`[Sync] Completed. Synced ${teamsToUpsert.length} teams and ${allPlayers.length} players.`)
    revalidatePath('/dashboard')
    return { success: true, teamCount: teamsToUpsert.length, playerCount: allPlayers.length }
  } catch (error) {
    console.error('[Sync] Unexpected error:', error)
    return { error: 'Sync failed' }
  }
}

export async function getCachedPlayersByTeam(teamId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cached_players')
      .select('*')
      .eq('team_id', teamId)
    
    if (error) throw error
    return data
  } catch (e) {
    console.error('[Cache] Fetch error:', e)
    return null
  }
}
