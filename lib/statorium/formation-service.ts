import { StatoriumClient } from './client';

// Simple in-memory cache (in production, use Redis or database)
const formationCache = new Map<string, { formation: string; timestamp: number }>();
const CACHE_DURATION = 3600 * 1000; // 1 hour in milliseconds

interface TeamFormation {
  teamId: string;
  formation: string;
  timestamp: number;
}

/**
 * Calculate formation from lineup positions
 */
function calculateFormationFromLineup(lineup: any[]): string {
  if (!lineup || lineup.length === 0) {
    return 'N/A';
  }

  // Count positions in the starting XI
  const positions = {
    goalkeeper: 0,
    defender: 0,
    midfielder: 0,
    attacker: 0
  };

  lineup.forEach(player => {
    const position = (player.additionalInfo?.position || '').toLowerCase() || '';
    if (position.includes('goalkeeper') || position.includes('gk')) {
      positions.goalkeeper++;
    } else if (position.includes('defender') || position.includes('def')) {
      positions.defender++;
    } else if (position.includes('midfielder') || position.includes('mid') || position.includes('mf')) {
      positions.midfielder++;
    } else if (position.includes('attacker') || position.includes('ata') || position.includes('forward') || position.includes('fw') || position.includes('striker')) {
      positions.attacker++;
    }
  });

  // Should be 11 players (1 GK + 10 outfield)
  const outfield = positions.defender + positions.midfielder + positions.attacker;

  if (outfield === 0) {
    return 'N/A';
  }

  // ============================================
  // SMART RECLASSIFICATION RULES
  // ============================================

  // RULE 2 - Too many Attackers (4+):
  // Max 3 attackers in any formation
  // If attackers >= 4, reclassify excess as midfielders
  // Example: 4 DF, 2 MF, 4 FW → reclassify 1 FW as MF → 4-3-3
  const maxAttackers = 3;
  if (positions.attacker > maxAttackers) {
    const excessAttackers = positions.attacker - maxAttackers;
    positions.midfielder += excessAttackers;
    positions.attacker = maxAttackers;
  }

  // RULE 1 - Too many Midfielders (5+):
  // Max 4 midfielders unless defenders are 3 or less
  // If midfielders >= 5, reclassify excess as attackers
  const maxMidfielders = positions.defender <= 3 ? 5 : 4;
  if (positions.midfielder > maxMidfielders) {
    const excessMidfielders = positions.midfielder - maxMidfielders;
    // Convert excess midfielders to attackers, but don't exceed max attackers
    const availableAttackerSlots = maxAttackers - positions.attacker;
    const toConvert = Math.min(excessMidfielders, availableAttackerSlots);
    positions.attacker += toConvert;
    positions.midfielder -= toConvert;
  }

  // RULE 3 - Max 5 defenders
  const maxDefenders = 5;
  if (positions.defender > maxDefenders) {
    const excessDefenders = positions.defender - maxDefenders;
    positions.midfielder += excessDefenders;
    positions.defender = maxDefenders;
  }

  // Recalculate outfield after reclassification
  const adjustedOutfield = positions.defender + positions.midfielder + positions.attacker;

  // Calculate formation based on actual starting XI
  // Use ratios for more accurate formation detection
  const dfRatio = positions.defender / adjustedOutfield;
  const mfRatio = positions.midfielder / adjustedOutfield;
  const fwRatio = positions.attacker / adjustedOutfield;

  // Formation detection based on starting XI ratios
  if (positions.defender === 3 && positions.midfielder === 5 && positions.attacker === 2) {
    return '3-5-2';
  } else if (positions.defender === 3 && positions.midfielder === 4 && positions.attacker === 3) {
    return '3-4-3';
  } else if (positions.defender === 4 && positions.midfielder === 3 && positions.attacker === 3) {
    return '4-3-3';
  } else if (positions.defender === 4 && positions.midfielder === 2 && positions.attacker === 4) {
    return '4-2-4';
  } else if (positions.defender === 4 && positions.midfielder === 4 && positions.attacker === 2) {
    return '4-4-2';
  } else if (positions.defender === 4 && positions.midfielder === 5 && positions.attacker === 1) {
    return '4-5-1';
  } else if (positions.defender === 5 && positions.midfielder === 3 && positions.attacker === 2) {
    return '5-3-2';
  } else if (positions.defender === 5 && positions.midfielder === 4 && positions.attacker === 1) {
    return '5-4-1';
  } else if (positions.defender === 5 && positions.midfielder === 2 && positions.attacker === 3) {
    return '5-2-3';
  } else {
    // Fallback: calculate based on ratios
    if (mfRatio >= 0.45) {
      return '4-5-1';
    } else if (fwRatio >= 0.35) {
      return '4-3-3';
    } else if (dfRatio >= 0.45) {
      return '5-4-1';
    } else {
      return '4-4-2';
    }
  }
}

/**
 * Get real formation from most recent match with lineup data
 */
export async function getRealFormation(teamId: string, seasonId: string): Promise<string> {
  // Check cache first
  const cacheKey = `${teamId}_${seasonId}`;
  const cached = formationCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.formation;
  }

  try {
    const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');

    // Get all matches for the season
    const matches = await client.getMatches(seasonId);

    // Find most recent played match with lineup data for this team
    let mostRecentMatchWithLineup = null;
    let mostRecentDate = null;

    for (const match of matches) {
      // Only consider played matches
      if (match.matchStatus?.statusID === "1") {
        const isHomeTeam = match.homeParticipant?.participantID?.toString() === teamId;
        const isAwayTeam = match.awayParticipant?.participantID?.toString() === teamId;

        if (isHomeTeam || isAwayTeam) {
          const matchDate = new Date(match.matchDate);

          // Check if this match has lineup data by fetching details
          try {
            const matchDetails = await client.getMatchDetails(match.matchID.toString());

            const homeLineup = matchDetails.homeParticipant?.squad?.lineup || [];
            const awayLineup = matchDetails.awayParticipant?.squad?.lineup || [];

            const hasLineup = homeLineup.length > 0 || awayLineup.length > 0;

            if (hasLineup) {
              if (!mostRecentDate || matchDate > mostRecentDate) {
                mostRecentDate = matchDate;
                mostRecentMatchWithLineup = matchDetails;
              }
            }
          } catch (error) {
            // Skip matches that error out
            continue;
          }
        }
      }
    }

    if (!mostRecentMatchWithLineup) {
      // No recent match with lineup data found
      return 'N/A';
    }

    // Extract the lineup for this team
    const isHomeTeam = mostRecentMatchWithLineup.homeParticipant?.participantID?.toString() === teamId;
    const lineup = isHomeTeam
      ? mostRecentMatchWithLineup.homeParticipant?.squad?.lineup || []
      : mostRecentMatchWithLineup.awayParticipant?.squad?.lineup || [];

    if (lineup.length === 0) {
      return 'N/A';
    }

    // Calculate formation from the lineup
    const formation = calculateFormationFromLineup(lineup);

    // Cache the result
    formationCache.set(cacheKey, {
      formation,
      timestamp: Date.now()
    });

    return formation;

  } catch (error) {
    console.error(`Error getting real formation for team ${teamId}:`, error);
    return 'N/A';
  }
}

/**
 * Clear the formation cache (useful for testing)
 */
export function clearFormationCache(): void {
  formationCache.clear();
}
