"use server";

import { StatoriumClient } from '@/lib/statorium/client';
import { StatoriumTeamDetail, StatoriumPlayerBasic, StatoriumMatch } from '@/lib/statorium/types';
import { geocodeCity, getCachedGeocode } from '@/lib/utils/geocoding';
import { COACH_MAP } from '@/lib/coaches-data';
import { getRealFormation } from '@/lib/statorium/formation-service';

let clientInstance: StatoriumClient | null = null;

function getStatoriumClient() {
  if (!clientInstance) {
    clientInstance = new StatoriumClient(process.env.STATORIUM_API_KEY || '');
  }
  return clientInstance;
}
export async function getStandingsAction(seasonId: string) {
  try {
    const client = getStatoriumClient();
    const standings = await client.getStandings(seasonId);

    if (standings && standings.length > 0) {
      return standings.slice(0, 10).map((s: any) => {
        let stats: any = {};
        try {
          stats = typeof s.options === 'string' ? JSON.parse(s.options) : (s.options || {});
        } catch (e) { }

        return {
          teamID: s.teamID?.toString() || "",
          teamName: s.teamName || s.teamMiddleName || "Unknown Team",
          teamLogo: s.logo || s.teamLogo || "",
          rank: Number(s.ordering || s.rank || 0),
          played: Number(stats.played_chk || s.played || 0),
          won: Number(stats.win_chk || s.won || 0),
          drawn: Number(stats.draw_chk || s.drawn || 0),
          lost: Number(stats.lost_chk || s.lost || 0),
          goalsFor: Number(stats.goalscore_chk || s.goalsFor || 0),
          goalsAgainst: Number(stats.goalconc_chk || s.goalsAgainst || 0),
          points: Number(stats.point_chk || s.points || 0),
        };
      }).sort((a: any, b: any) => b.points - a.points || a.rank - b.rank);
    }
    return [];
  } catch (error) {
    console.error('Get Standings Action Error:', error);
    return [];
  }
}

export async function getTeamDetailsAction(teamId: string, seasonId?: string) {
  if (!teamId || teamId === 'undefined') return null;

  try {
    const client = getStatoriumClient();

    // Auto-detect seasonId if not provided by checking top 5 leagues
    if (!seasonId) {
      for (const league of TOP_LEAGUES) {
        try {
          const standings = await client.getStandings(league.id);
          const found = standings.find((s: any) => s.teamID?.toString() === teamId);
          if (found) {
            seasonId = league.id;
            break;
          }
        } catch (e) {}
      }
    }

    let apiTeam: any = null;
    try {
      apiTeam = await client.getTeamDetails(teamId);
    } catch (e) { }

    let players: StatoriumPlayerBasic[] = [];
    if (seasonId) {
      try { players = await client.getPlayersByTeam(teamId, seasonId); } catch (e) { }
    }
    if (!players.length && apiTeam?.players?.length) {
      players = apiTeam.players;
    }

    // Filter for first-team players using real API data
    // Criteria (ALL must pass):
    // 1. playerDeparted = "0" (active players only)
    // 2. Age between 18 and 35 (excludes youth academy AND retired/very old players)

    // Helper function to calculate age from birthdate
    const calculateAge = (birthdate: string | undefined): number => {
      if (!birthdate) return 0;
      // Birthdate format: "DD-MM-YYYY (Age)" or similar
      const match = birthdate.match(/(\d{2})-(\d{2})-(\d{4})/);
      if (!match) return 0;
      const [, , , year] = match;
      const birthYear = parseInt(year);
      const currentYear = new Date().getFullYear();
      return currentYear - birthYear;
    };

    // Filter first-team players
    const firstTeamPlayers = players.filter((p: any) => {
      // Must be active
      if (p.playerDeparted !== "0") return false;

      // Must be between 18 and 35 years old
      const age = calculateAge(p.additionalInfo?.birthdate);
      if (age < 18 || age > 35) return false;

      return true;
    });

    // Log filtering results
    console.log(`[Formation Filter] Team: ${teamId}`);
    console.log(`[Formation Filter] Total players: ${players.length}`);
    console.log(`[Formation Filter] First-team players (18-35, active): ${firstTeamPlayers.length}`);

    // Categorize first-team players by position
    // Handle API typo: "Atacker" not "Attacker"
    // Use exact position matching from API to avoid false positives
    const gks = firstTeamPlayers.filter((p: any) => {
      const pos = (p.position || p.additionalInfo?.position || '').toLowerCase();
      return pos === 'goalkeeper' || pos === 'gk' || pos.startsWith('goal');
    });
    const dfs = firstTeamPlayers.filter((p: any) => {
      const pos = (p.position || p.additionalInfo?.position || '').toLowerCase();
      return pos === 'defender' || pos === 'df' || pos.startsWith('def') && !pos.includes('mid');
    });
    const mfs = firstTeamPlayers.filter((p: any) => {
      const pos = (p.position || p.additionalInfo?.position || '').toLowerCase();
      return pos === 'midfielder' || pos === 'mf' || pos.includes('mid');
    });
    const fws = firstTeamPlayers.filter((p: any) => {
      const pos = (p.position || p.additionalInfo?.position || '').toLowerCase();
      return pos === 'atacker' || pos === 'attacker' || pos === 'forward' || pos === 'fw' || pos === 'striker' || pos === 'st' || pos.includes('ata');
    });

    // Log filtered squad composition
    console.log(`[Formation Filter] Team: ${teamId}`);
    console.log(`[Formation Filter] Total players: ${players.length}`);
    console.log(`[Formation Filter] First-team players (18-35, active): ${firstTeamPlayers.length}`);

    // Log position distribution for information
    console.log(`[Formation Filter] First-team squad composition: GK=${gks.length} DF=${dfs.length} MF=${mfs.length} FW=${fws.length} (Total: ${gks.length + dfs.length + mfs.length + fws.length})`);

    // Get real formation from most recent match with lineup data
    console.log(`[Formation Filter] Fetching real formation from API...`);
    const formation = await getRealFormation(teamId, seasonId);
    console.log(`[Formation Filter] Real formation: ${formation}`);

    // Parse formation for player selection (default to 4-4-2 if N/A)
    let d = 4, m = 4, f = 2;
    if (formation !== 'N/A') {
      const parts = formation.split('-');
      if (parts.length === 3) {
        d = parseInt(parts[0]) || 4;
        m = parseInt(parts[1]) || 4;
        f = parseInt(parts[2]) || 2;
      }
    }

    console.log(`[Formation Filter] Using formation: ${formation} (D=${d}, M=${m}, F=${f})`);

    // Select the actual starting XI players based on real formation
    const startingXI: StatoriumPlayerBasic[] = [];

    // Always include a goalkeeper
    if (gks.length > 0) {
      startingXI.push(gks[0]);
    }

    // Add defenders
    startingXI.push(...dfs.slice(0, d));

    // Add midfielders
    startingXI.push(...mfs.slice(0, m));

    // Add forwards
    startingXI.push(...fws.slice(0, f));

    // Fill to 11 if still missing some positions - use remaining first-team players
    if (startingXI.length < 11) {
      const usedIds = new Set(startingXI.map(p => p.playerID));

      // Get remaining players from filtered position groups
      const remainingGks = gks.filter(p => !usedIds.has(p.playerID));
      const remainingDfs = dfs.filter(p => !usedIds.has(p.playerID));
      const remainingMfs = mfs.filter(p => !usedIds.has(p.playerID));
      const remainingFws = fws.filter(p => !usedIds.has(p.playerID));

      const remainingFirstTeam = [...remainingGks, ...remainingDfs, ...remainingMfs, ...remainingFws];
      startingXI.push(...remainingFirstTeam.slice(0, 11 - startingXI.length));
    }

    // Reorder players array to have starting XI first, then remaining first-team players
    const startingIds = new Set(startingXI.map(p => p.playerID));
    const remainingFirstTeam = firstTeamPlayers.filter(p => !startingIds.has(p.playerID));

    const sortedPlayers = [
      ...startingXI,
      ...remainingFirstTeam
    ];

    // Use sorted players for display
    players = sortedPlayers;

    const result = {
      ...(apiTeam || {}),
      teamID: teamId,
      teamName: apiTeam?.teamName || apiTeam?.teamMiddleName || `Club ${teamId}`,
      teamLogo: apiTeam?.logo || apiTeam?.teamLogo || "",
      city: apiTeam?.city || "",
      venueName: apiTeam?.venueName || apiTeam?.homeVenue?.name || "",
      coach: COACH_MAP[teamId] || apiTeam?.additionalInfo?.coach,
      formation: formation,
      players: players.map((p: any) => ({
        ...p,
        playerPhoto: p.photo || `https://api.statorium.com/media/bearleague/bl${p.playerID}.webp`
      }))
    } as StatoriumTeamDetail;

    return result;
  } catch (error) {
    console.error('Get Team Details Error:', error);
    return null;
  }
}

export async function searchPlayersAction(query: string) {
  if (!query || query.length < 2) return [];

  try {
    const client = getStatoriumClient();
    const apiResults = await client.searchPlayers(query);
    return apiResults.slice(0, 10);
  } catch (error) {
    console.error('Search Players Action Error:', error);
    return [];
  }
}

/**
 * Fetches a player's photo URL directly from the player details endpoint.
 * The /players/{id}/ endpoint reliably returns the `photo` field unlike search results.
 */
export async function getPlayerPhotoAction(playerId: string): Promise<string | null> {
  if (!playerId || playerId.length < 1) return null;
  try {
    const client = getStatoriumClient();
    const player = await client.getPlayerDetails(playerId);
    
    // Check if the API returns a specific photo URL
    let photoUrl = (player as any)?.photo || (player as any)?.playerPhoto || null;
    
    // If no photo URL is found, use the standard fallback format used in leagues
    if (!photoUrl || photoUrl === "") {
        photoUrl = `https://api.statorium.com/media/bearleague/bl${playerId}.webp`;
    }

    if (photoUrl && (photoUrl.startsWith('http') || photoUrl.startsWith('/'))) {
      return photoUrl;
    }
    return null;
  } catch (error) {
    console.error(`getPlayerPhotoAction error for id=${playerId}:`, error);
    // Even on error, we can try the fallback if we have an ID
    return `https://api.statorium.com/media/bearleague/bl${playerId}.webp`;
  }
}

/**
 * Fetches player photos for multiple players in parallel.
 * Returns a map of playerID -> photoUrl (or null if not found).
 */
export async function getPlayerPhotosAction(
  players: { playerID: string; playerName: string }[]
): Promise<Record<string, string | null>> {
  const results = await Promise.allSettled(
    players.map(async (p) => {
      const photo = await getPlayerPhotoAction(p.playerID);
      return { id: p.playerID, photo };
    })
  );

  const photoMap: Record<string, string | null> = {};
  for (const result of results) {
    if (result.status === 'fulfilled') {
      photoMap[result.value.id] = result.value.photo;
    }
  }
  return photoMap;
}

export async function getMatchesAction(seasonId: string) {
  try {
    const client = getStatoriumClient();
    const matches = await client.getMatches(seasonId);

    if (matches && matches.length > 0) return matches;
    return [];
  } catch (error) {
    console.error('Get Matches Action Error:', error);
    return [];
  }
}

export async function getTransfersAction(teamId?: string, seasonId?: string) {
  try {
    const client = getStatoriumClient();
    const transfers = await client.getTransfers(teamId, seasonId);
    return transfers || [];
  } catch (error) {
    console.error('Get Transfers Action Error:', error);
    return [];
  }
}

const TOP_LEAGUES = [
  { id: "515", name: "Premier League" },
  { id: "558", name: "La Liga" },
  { id: "511", name: "Serie A" },
  { id: "521", name: "Bundesliga" },
  { id: "519", name: "Ligue 1" },
];

export async function getTopLeaguesClubsAction() {
  try {
    const client = getStatoriumClient();
    const allClubs: any[] = [];
    
    const results = await Promise.allSettled(
      TOP_LEAGUES.map(league => client.getStandings(league.id).then(data => ({ leagueId: league.id, data })))
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const standings = result.value.data;
        const leagueId = result.value.leagueId;
        for (const s of standings as any[]) {
          const clubName = s.teamName || s.teamMiddleName;
          const clubId = s.teamID?.toString();

          allClubs.push({
            id: clubId,
            name: clubName,
            city: s.city || "",
            logo: s.logo || s.teamLogo || "",
            seasonId: leagueId
          });
        }
      }
    }
    
    const uniqueClubs = Array.from(new Map(allClubs.map(item => [item.id, item])).values());
    return uniqueClubs;
  } catch (error) {
    console.error('Get Top Leagues Clubs Action Error:', error);
    return [];
  }
}

export async function getAllTop5ClubsAction() {
  return getTopLeaguesClubsAction();
}

export async function getAllTop5PlayersAction() {
  try {
    const client = getStatoriumClient();
    const allPlayers: any[] = [];

    for (const league of TOP_LEAGUES) {
      const standings = await client.getStandings(league.id);
      if (standings && standings.length > 0) {
        const topTeams = standings.slice(0, 6);
        for (const team of topTeams) {
          const tid = team.teamID?.toString();
          if (tid) {
            try {
              const players = await client.getPlayersByTeam(tid, league.id);
              if (players && players.length > 0) {
                players.forEach((p: any) => {
                  allPlayers.push({
                    ...p,
                    teamName: team.teamName || team.teamMiddleName || "Elite Club",
                    playerPhoto: p.photo || `https://api.statorium.com/media/bearleague/bl${p.playerID}.webp`
                  });
                });
              }
            } catch (e) {
              console.warn(`Could not fetch players for team ${tid} in season ${league.id}`);
            }
          }
        }
      }
    }

    // Remove duplicates based on playerID
    const uniquePlayers = Array.from(new Map(allPlayers.map(p => [p.playerID, p])).values());
    console.log(`[Action] Fetched ${uniquePlayers.length} unique top players`);
    return uniquePlayers.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
  } catch (error) {
    console.error('Get All Top 5 Players Error:', error);
    return [];
  }
}


export async function getPlayersByClubAction(teamId: string, seasonId?: string) {
  if (!teamId) return [];
  try {
    const client = getStatoriumClient();
    
    // First figure out the seasonId if not provided by testing the top 5 leagues
    let reliableSeasonId = seasonId;
    if (!reliableSeasonId) {
      for (const league of TOP_LEAGUES) {
        try {
           const standings = await client.getStandings(league.id);
           const found = standings.find((s: any) => s.teamID?.toString() === teamId);
           if (found) {
             reliableSeasonId = league.id;
             break;
           }
        } catch (e) {}
      }
    }

    const teamDetails = await getTeamDetailsAction(teamId, reliableSeasonId);
    if (!teamDetails || !teamDetails.players) return [];
    
    return teamDetails.players.map(p => ({
      id: p.playerID,
      name: p.fullName || `${p.firstName} ${p.lastName}`,
      position: p.position || p.additionalInfo?.position || "Unknown",
      marketValue: "€" + (Math.floor(Math.random() * 80) + 5) + "M",
      photoUrl: p.playerPhoto || p.photo
    }));
  } catch (error) {
    console.error('Get Players By Club Action Error:', error);
    return [];
  }
}

export async function getPlayersAction(teamId: string, seasonId: string) {
  try {
    const client = getStatoriumClient();
    const players = await client.getPlayersByTeam(teamId, seasonId);
    return players || [];
  } catch (error) {
    console.error('Get Players Action Error:', error);
    return [];
  }
}

