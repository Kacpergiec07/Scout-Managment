'use server'

import { getStatoriumClient } from '@/lib/statorium/client';
import { calculateCompatibility, ClubContext } from '@/lib/engine/scoring';
import { ScoutProPlayer } from '@/lib/types/player';
import { createClient } from '@/lib/supabase/server';

export async function getCompatibilityAnalysis(player: ScoutProPlayer) {
  try {
    const client = getStatoriumClient();
    
    // 1. Map league names to Statorium Season IDs (2024/25)
    const LEAGUE_TO_SEASON: Record<string, string> = {
      'Premier League': '515',
      'La Liga': '558',
      'Bundesliga': '521',
      'Serie A': '511',
      'Ligue 1': '519'
    };

    const targetSeasonId = LEAGUE_TO_SEASON[player.league || ''] || '515';
    
    // 2. Fetch real standings for the league
    const standings = await client.getStandings(targetSeasonId);
    
    // 3. Convert standings to ClubContext
    const realClubs: ClubContext[] = standings.map((s: any, index: number) => {
      const gf = parseInt(s.goalsFor || s.goals_for || "0");
      const ga = parseInt(s.goalsAgainst || s.goals_against || "0");
      const played = parseInt(s.played || "1");
      const pts = parseInt(s.points || "0");
      
      // Derive DNA from performance
      const possession = Math.min(95, 45 + (gf / played) * 15);
      const pressing = Math.min(95, 50 + (pts / (played * 3)) * 40);
      const tempo = Math.min(95, 55 + (ga / played) * 10);

      return {
        id: (s.teamID || s.id).toString(),
        name: s.teamName || s.name,
        league: player.league || 'Premier League',
        dna: { 
          possession, 
          pressing, 
          tempo 
        },
        needs: { 
          [player.position]: Math.min(100, 40 + (index * 2) + (Math.random() * 20))
        },
        form: Math.min(100, (pts / (played * 3)) * 100),
        historyMatch: 70 + (Math.random() * 20),
        rank: index + 1
      };
    });

    // If player is high-performing (rating > 85), prioritize top 5 clubs in the league
    let candidateClubs = realClubs;
    if (player.rating && player.rating > 85) {
      // For superstars, suggest the best clubs
      candidateClubs = realClubs.sort((a, b) => (a.rank || 20) - (b.rank || 20)).slice(0, 8);
    } else {
      candidateClubs = realClubs.slice(0, 15);
    }

    const results = candidateClubs.map(club => ({
      club,
      analysis: calculateCompatibility(player, club)
    })).sort((a, b) => b.analysis.totalScore - a.analysis.totalScore);

    // Persist to History
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('analysis_history').insert({
        user_id: user.id,
        player_id: player.id,
        player_name: player.name,
        results: results
      });
    }

    return results.slice(0, 5); // Return top 5 matches
  } catch (error) {
    console.error('Analysis Action Error:', error);
    return [];
  }
}
