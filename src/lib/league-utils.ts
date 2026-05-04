/**
 * League Utilities
 * Extract league name from player statistics
 */

/**
 * Words that indicate cup competitions (case-insensitive)
 */
const CUP_KEYWORDS = [
  'cup',
  'champions',
  'europa',
  'conference',
  'nations league',
  'friendl',
  'world cup',
  'euro',
  'qualif',
  'super cup',
  'community shield',
  'copa del rey',
  'coupe de france',
  'dfb pokal',
  'coppa italia',
  'taca',
  'supercopa',
  'supercoppa',
  'shield',
  'trophy',
  'tournament',
  'playoff'
];

/**
 * Check if season name indicates a cup competition
 */
function isCupCompetition(seasonName: string): boolean {
  const lowerSeasonName = seasonName.toLowerCase();
  return CUP_KEYWORDS.some(keyword => lowerSeasonName.includes(keyword));
}

/**
 * Extract league name from season_name
 * season_name format: "KRAJ: Nazwa Ligi RRRR-RR"
 */
export function extractLeagueName(seasonName: string): string {
  if (!seasonName) {
    return '';
  }

  const parts = seasonName.split(':');

  if (parts.length < 2) {
    // If no country prefix, just return the name (removing year)
    return seasonName
      .replace(/\d{4}-\d{2,4}/, '')
      .replace(/\d{4}-\d{4}/, '')
      .trim();
  }

  // Get the league part (after the country)
  const leaguePart = parts[1]?.trim() || '';

  // Remove year patterns
  const leagueName = leaguePart
    .replace(/\d{4}-\d{2,4}/, '') // Remove year like 2024-25
    .replace(/\d{4}-\d{4}/, '') // Remove year like 2024-2025
    .trim();

  return leagueName;
}

/**
 * Fetch league for a player from Statorium API stats
 */
export async function fetchLeague(playerID: string, apiKey: string): Promise<string> {
  try {
    const url = `https://api.statorium.com/api/v1/players/${playerID}/?apikey=${apiKey}&showstat=true`;

    console.log(`[League] Fetching player data: ${url}`);

    const response = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`[League] API error: ${response.status}`);
      return 'Unknown League';
    }

    const data = await response.json();

    const playerObj = data.player || data;

    // Step 2: Determine current team
    const currentTeamName =
      playerObj.teams?.[0]?.teamName ||
      playerObj.currentTeam?.name ||
      playerObj.team?.fullName ||
      playerObj.teamName ||
      '';

    console.log(`[League] Current team: ${currentTeamName}`);

    // Step 3: Filter stats by current team name
    const stat = playerObj.stat || [];

    let relevantStats = stat.filter((s: any) => {
      const teamName = s.team_name || s.teamName || '';
      return teamName.toLowerCase() === currentTeamName.toLowerCase();
    });

    // Step 4: Filter out cup competitions
    const domesticLeagueStats = relevantStats.filter((s: any) => {
      const seasonName = s.season_name || '';
      return !isCupCompetition(seasonName);
    });

    console.log(`[League] Found ${domesticLeagueStats.length} domestic league stats for current team`);

    // Step 5: Select entry with highest season_id
    let latest = domesticLeagueStats.sort((a: any, b: any) => {
      const aId = Number(a.season_id || '0');
      const bId = Number(b.season_id || '0');
      return bId - aId;
    })[0];

    // Step 6: Fallback if no relevant stats found
    if (!latest) {
      console.log('[League] No domestic league stats for current team, trying all teams');

      // Try all stats with cup filter
      const allDomesticStats = stat.filter((s: any) => {
        const seasonName = s.season_name || '';
        return !isCupCompetition(seasonName);
      });

      latest = allDomesticStats.sort((a: any, b: any) => {
        const aId = Number(a.season_id || '0');
        const bId = Number(b.season_id || '0');
        return bId - aId;
      })[0];
    }

    // Step 7: Extract league name
    if (latest && latest.season_name) {
      const leagueName = extractLeagueName(latest.season_name);
      console.log(`[League] Extracted league: ${leagueName}`);
      return leagueName || 'Unknown League';
    }

    console.warn('[League] No league data found');
    return 'Unknown League';
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.warn('[League] Request timeout');
    } else {
      console.error('[League] Error:', error);
    }
    return 'Unknown League';
  }
}
