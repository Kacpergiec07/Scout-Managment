'use server'

import { getStatoriumClient } from '@/lib/statorium/client';
import { calculateCompatibility, ClubContext } from '@/lib/engine/scoring';
import { ScoutProPlayer } from '@/lib/types/player';
import { createClient } from '@/lib/supabase/server';

export async function getCompatibilityAnalysis(player: ScoutProPlayer) {
  try {
    const client = getStatoriumClient();
    
    // 1. Fetch Clubs/Standings for the target leagues (hardcoded IDs for MVP)
    const top5Leagues = ['1', '2', '3', '4', '5']; // Example IDs
    const allClubs: ClubContext[] = [];

    // This would be loop-based in production, but for MVP we mock some clubs
    // to verify the engine without hitting API limits during dev
    const mockClubs: ClubContext[] = [
      {
        id: '1',
        name: 'Arsenal',
        dna: { possession: 80, pressing: 85, tempo: 75 },
        needs: { ST: 90, RW: 40 },
        form: 85,
        historyMatch: 70,
      },
      {
        id: '2',
        name: 'Dortmund',
        dna: { possession: 60, pressing: 90, tempo: 95 },
        needs: { ST: 70, CB: 80 },
        form: 65,
        historyMatch: 85,
      }
    ];

    const results = mockClubs.map(club => ({
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

    return results;
  } catch (error) {
    console.error('Analysis Action Error:', error);
    return [];
  }
}
