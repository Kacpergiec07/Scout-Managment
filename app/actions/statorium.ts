"use server";

import { StatoriumClient } from '@/lib/statorium/client';
import { StatoriumTeamDetail, StatoriumPlayerBasic, StatoriumMatch } from '@/lib/statorium/types';
import { geocodeCity, getCachedGeocode } from '@/lib/utils/geocoding';
import { COACH_MAP } from '@/lib/coaches-data';
import { getRealFormation } from '@/lib/statorium/formation-service';
import { PLAYER_PHOTOS } from '@/lib/statorium-data';

let clientInstance: StatoriumClient | null = null;

function getStatoriumClient() {
  if (!clientInstance) {
    clientInstance = new StatoriumClient(process.env.STATORIUM_API_KEY || '');
  }
  return clientInstance;
}

function normalizeName(name: string): string {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u00f8\u00d8]/g, 'o').replace(/\u00df/g, 'ss').replace(/\u0131/g, 'i').replace(/\u0219/g, 's').replace(/\u021b/g, 't').replace(/[\u0107\u0106]/g, 'c').replace(/[\u017e\u017d]/g, 'z').replace(/[\u0161\u0160]/g, 's').toLowerCase().trim();
}

let _photoIdx: Map<string, string> | null = null;
function getPhotoIdx(): Map<string, string> {
  if (_photoIdx) return _photoIdx;
  _photoIdx = new Map();
  if (typeof PLAYER_PHOTOS !== 'undefined') {
    for (const [name, url] of Object.entries(PLAYER_PHOTOS)) {
      _photoIdx.set(normalizeName(name), url);
    }
  }
  return _photoIdx;
}

const POSITION_MAP: Record<string, string> = { "1": "GK", "2": "DF", "3": "MF", "4": "FW", "Goalkeeper": "GK", "Defender": "DF", "Midfielder": "MF", "Forward": "FW", "Attacker": "FW", "Atacker": "FW", "Atacante": "FW", "Defensa": "DF", "Centrocampista": "MF" };
const POSITION_OVERRIDE: Record<string, string> = { "14633": "CAM", "12101": "CAM", "6466": "CM", "93": "CM", "2773": "CDM", "26718": "CDM", "53041": "RW", "5597": "CAM", "1352": "CAM", "1812": "ST", "1994": "FW", "4812": "ST" };

function resolvePosition(raw: any, playerId?: string): string {
  if (playerId && POSITION_OVERRIDE[playerId]) return POSITION_OVERRIDE[playerId];
  if (!raw) return "N/A";
  const str = String(raw).trim();
  if (POSITION_MAP[str]) return POSITION_MAP[str];
  if (str.length <= 3 && /[A-Z]{2,3}/.test(str)) return str;
  return str;
}

function resolvePlayerPhoto(p: any): string {
  if (!p) return "";
  const name = (p.fullName || `${p.firstName} ${p.lastName}` || '').trim();
  if (typeof PLAYER_PHOTOS !== 'undefined' && name && PLAYER_PHOTOS[name]) return PLAYER_PHOTOS[name];
  const idx = getPhotoIdx();
  const nl = normalizeName(name);
  if (idx.has(nl)) return idx.get(nl)!;
  let photo = p.playerPhoto || p.photo;
  if (photo && !photo.startsWith('http')) {
    const cleanPath = photo.startsWith('/') ? photo : `/` + photo;
    if (!cleanPath.startsWith('/media/bearleague/')) {
        photo = `https://api.statorium.com/media/bearleague` + cleanPath;
    } else {
        photo = `https://api.statorium.com` + cleanPath;
    }
  }
  return photo || `https://api.statorium.com/media/bearleague/bl` + (p.playerID || p.id) + `.webp`;
}



// Normalize a name by converting all special characters to ASCII equivalents



export async function getStandingsAction(seasonId: string) {
  try {
    const client = getStatoriumClient();
    const standings = await client.getStandings(seasonId);

    if (standings && standings.length > 0) {
      return standings.map((s: any) => {
        let stats: any = {};
        try {
          stats = typeof s.options === 'string' ? JSON.parse(s.options) : (s.options || {});
        } catch (e) { }

        const teamID = s.teamID?.toString() || "";
        let teamLogo = resolveTeamLogo(s.logo || s.teamLogo || s);
        
        // Fallback for missing logos using ID convention
        if (!teamLogo && teamID && teamID !== "undefined") {
          teamLogo = `https://api.statorium.com/media/bearleague/ct${teamID}.png`;
        }

        return {
          teamID,
          teamName: s.teamName || s.teamMiddleName || "Unknown Team",
          teamLogo,
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

function resolveTeamLogo(logo: any): string {
  if (!logo) return "";
  let path = typeof logo === 'string' ? logo : (logo.logo || logo.teamLogo || "");
  if (!path) return "";
  
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!cleanPath.startsWith('/media/bearleague/')) {
    return `https://api.statorium.com/media/bearleague${cleanPath}`;
  }
  return `https://api.statorium.com${cleanPath}`;
}

export async function getTeamLogosAction(teamIds: string[]): Promise<Record<string, string>> {
  const logoMap: Record<string, string> = {};
  if (!teamIds.length) return logoMap;
  
  try {
    const client = getStatoriumClient();
    const results = await Promise.allSettled(
      teamIds.map(id => client.getTeamDetails(id))
    );

    results.forEach((result, idx) => {
      const id = teamIds[idx];
      let logo = "";
      
      if (result.status === 'fulfilled' && result.value) {
        logo = resolveTeamLogo(result.value);
      }
      
      // Fallback for major Statorium club IDs if details failed 
      // ct[ID].png is the standard naming convention for team logos
      if (!logo && id && id !== "hub" && id !== "undefined") {
        logo = `https://api.statorium.com/media/bearleague/ct${id}.png`;
      }
      
      logoMap[id] = logo;
    });
    return logoMap;
  } catch (error) {
    console.error('Get Team Logos Action Error:', error);
    return logoMap;
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

    // Categorize first-team players by position
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

    // Get real formation from most recent match with lineup data
    const formation = await getRealFormation(teamId, seasonId || '');

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

    // Select the actual starting XI players based on real formation
    const startingXI: StatoriumPlayerBasic[] = [];

    // Always include a goalkeeper
    if (gks.length > 0) startingXI.push(gks[0]);

    // Add defenders, midfielders, forwards
    startingXI.push(...dfs.slice(0, d));
    startingXI.push(...mfs.slice(0, m));
    startingXI.push(...fws.slice(0, f));

    // Fill to 11 if still missing some positions
    if (startingXI.length < 11) {
      const usedIds = new Set(startingXI.map(p => p.playerID));
      const remainingFirstTeam = firstTeamPlayers.filter(p => !usedIds.has(p.playerID));
      startingXI.push(...remainingFirstTeam.slice(0, 11 - startingXI.length));
    }

    // Reorder players array to have starting XI first
    const startingIds = new Set(startingXI.map(p => p.playerID));
    const sortedPlayers = [
      ...startingXI,
      ...firstTeamPlayers.filter(p => !startingIds.has(p.playerID))
    ];

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
        playerPhoto: resolvePlayerPhoto(p),
        position: resolvePosition(p.position || p.additionalInfo?.position, p.playerID)
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
    return apiResults.map(p => ({
      ...p,
      playerPhoto: resolvePlayerPhoto(p)
    })).slice(0, 10);
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
    return photoUrl;
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
      // Priority 1: Name-based lookup in static data
      if (typeof PLAYER_PHOTOS !== 'undefined' && p.playerName && PLAYER_PHOTOS[p.playerName]) {
        return { id: p.playerID, photo: PLAYER_PHOTOS[p.playerName] };
      }
      
      // Priority 2: Normalized name-based lookup
      const idx = getPhotoIdx();
      const nl = normalizeName(p.playerName);
      if (idx.has(nl)) {
        return { id: p.playerID, photo: idx.get(nl)! };
      }

      // Priority 3: API-based lookup
      const photo = await getPlayerPhotoAction(p.playerID);
      return { id: p.id || p.playerID, photo: photo || `https://api.statorium.com/media/bearleague/bl${p.playerID}.webp` };
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

export async function getUpcomingMatchesAction(seasonId: string, limit: number = 10) {
  try {
    const client = getStatoriumClient();
    const allMatches = await client.getMatches(seasonId);

    if (!allMatches || allMatches.length === 0) return [];

    // Get current date as reference point
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    // Filter only upcoming matches (matchDate >= today)
    const upcomingMatches = allMatches.filter((match: any) => {
      if (!match.matchDate) return false;

      const matchDate = new Date(match.matchDate);
      // Set match date to start of day for accurate comparison
      matchDate.setHours(0, 0, 0, 0);

      return matchDate >= today;
    });

    // Sort chronologically (from nearest to furthest)
    upcomingMatches.sort((a: any, b: any) => {
      const dateA = new Date(a.matchDate);
      const dateB = new Date(b.matchDate);

      // First compare by date
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }

      // If dates are equal, compare by time
      const timeA = a.matchTime || '00:00';
      const timeB = b.matchTime || '00:00';
      return timeA.localeCompare(timeB);
    });

    // Limit to specified number of results (default 10)
    return upcomingMatches.slice(0, limit);
  } catch (error) {
    console.error('Get Upcoming Matches Action Error:', error);
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
        for (const team of topTeams as any[]) {
          const tid = team.teamID?.toString();
          if (tid) {
            try {
              const players = await client.getPlayersByTeam(tid, league.id);
              if (players && players.length > 0) {
                players.forEach((p: any) => {
                  console.log(`[Action] Player data for ${p.fullName}:`, JSON.stringify(p));
                  console.log(`[Action] Player stat array:`, p.stat);
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


export async function getPlayerDetailsAction(playerId: string) {
  if (!playerId) return null;
  try {
    const client = getStatoriumClient();
    console.log(`[Action] Fetching details for player ${playerId}`);

    const playerDetails = await client.getPlayerDetails(playerId);

    console.log(`[Action] Player details received:`, JSON.stringify(playerDetails, null, 2));
    console.log(`[Action] Player stat array:`, playerDetails.stat);

    return playerDetails;
  } catch (error) {
    console.error(`[Action] Get Player Details Error for player ${playerId}:`, error);
    return null;
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
    
    return teamDetails.players.map(p => {
      const fullName = p.fullName || `${p.firstName} ${p.lastName}`;
      return {
        id: p.playerID,
        name: fullName,
        position: resolvePosition(p.position || p.additionalInfo?.position, p.playerID),
        marketValue: "€" + (Math.floor(Math.random() * 80) + 5) + "M",
        photoUrl: resolvePlayerPhoto(p)
      };
    });
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

export async function getTeamLogoAction(teamName: string, leagueId?: string, teamId?: string) {
  try {
    const client = getStatoriumClient();
    const targetLeagues = leagueId ? [leagueId] : ["558", "515", "521", "511", "519"];
    
    for (const id of targetLeagues) {
      const standings = await client.getStandings(id) as any[];
      const team = standings.find((s: any) => 
        (teamId && String(s.teamID) === String(teamId)) ||
        s.teamName?.toLowerCase().includes(teamName.toLowerCase()) || 
        s.teamMiddleName?.toLowerCase().includes(teamName.toLowerCase()) ||
        teamName.toLowerCase().includes(s.teamName?.toLowerCase())
      );
      if (team?.logo || team?.teamLogo) return team.logo || team.teamLogo;
    }
    return null;
  } catch (error) {
    return null;
  }
}


export async function getPlayerFullDataAction(playerId: string) {
  if (!playerId) return null;
  try {
    const apiKey = process.env.STATORIUM_API_KEY || 'd35d1fc1aabe0671e1e80ee5a6296bef';
    const url = `https://api.statorium.com/v1/?a=player&playerID=${playerId}&apikey=${apiKey}`;

    console.log(`[getPlayerFullDataAction] Fetching full data for player ${playerId}`);
    console.log(`[getPlayerFullDataAction] URL: ${url}`);

    const response = await fetch(url, {
      next: { revalidate: 3600 },
    } as any);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getPlayerFullDataAction] API Error ${response.status}:`, errorText);
      throw new Error(`Statorium API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[getPlayerFullDataAction] Full data received:`, JSON.stringify(data, null, 2));

    // Extract player data from the response
    const playerData = data.player || data;

    if (!playerData) {
      console.warn(`[getPlayerFullDataAction] No player data found in response`);
      return null;
    }

    console.log(`[getPlayerDataAction] Player stat array:`, playerData.stat);
    return playerData;
  } catch (error) {
    console.error(`[getPlayerDataAction] Error for player ${playerId}:`, error);
    return null;
  }
}

export async function getPlayerDataAction(playerId: string, timeoutMs: number = 10000) {
  if (!playerId) return null;

  const startTime = Date.now();
  const timestamp = Date.now(); // Force cache busting

  try {
    const apiKey = process.env.STATORIUM_API_KEY || 'd35d1fc1aabe0671e1e80ee5a6296bef';
    const url = `https://api.statorium.com/api/v1/players/${playerId}/?apikey=${apiKey}&showstat=true&_t=${timestamp}`;

    console.log(`[getPlayerDataAction] Fetching detailed data for player ${playerId}`);
    console.log(`[getPlayerDataAction] URL: ${url}`);
    console.log(`[getPlayerDataAction] Timeout: ${timeoutMs}ms`);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      const elapsed = Date.now() - startTime;
      console.error(`[getPlayerDataAction] Timeout after ${elapsed}ms for player ${playerId}`);
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        next: { revalidate: 3600 },
        signal: controller.signal,
      } as any);

      // Clear timeout on successful response
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[getPlayerDataAction] API Error ${response.status}:`, errorText);
        throw new Error(`Statorium API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const elapsed = Date.now() - startTime;
      console.log(`[getPlayerDataAction] Request completed in ${elapsed}ms`);

      console.log(`[getPlayerDataAction] Full data structure keys:`, Object.keys(data));
      console.log(`[getPlayerDataAction] Has player property:`, !!data.player);
      console.log(`[getPlayerDataAction] Has stat property on data:`, !!data.stat);

      // Extract player data from the response
      const playerData = data.player || data;

      if (!playerData) {
        console.warn(`[getPlayerDataAction] No player data found in response`);
        return null;
      }

      console.log(`[getPlayerDataAction] Player data keys:`, Object.keys(playerData));
      console.log(`[getPlayerDataAction] Has stat property on playerData:`, !!playerData.stat);
      console.log(`[getPlayerDataAction] Player stat array:`, playerData.stat);
      console.log(`[getPlayerDataAction] Stat array length:`, playerData.stat?.length || 0);
      console.log(`[getPlayerDataAction] Stat array type:`, typeof playerData.stat);
      console.log(`[getPlayerDataAction] Stat array is array:`, Array.isArray(playerData.stat));

      // Log first season for debugging
      if (playerData.stat && playerData.stat.length > 0) {
        console.log(`[getPlayerDataAction] First season:`, JSON.stringify(playerData.stat[0], null, 2));
        console.log(`[getPlayerDataAction] First season keys:`, Object.keys(playerData.stat[0]));
      }

      console.log(`[getPlayerDataAction] ✅ Returning playerData with stat array`);
      console.log(`[getPlayerDataAction] ✅ Return value has stat:`, !!playerData.stat);

      // Test serialization to ensure data can be transmitted
      try {
        const serialized = JSON.stringify(playerData);
        console.log(`[getPlayerDataAction] ✅ Serialization test successful, length:`, serialized.length);
        const deserialized = JSON.parse(serialized);
        console.log(`[getPlayerDataAction] ✅ Deserialization test successful, has stat:`, !!deserialized.stat);
      } catch (error) {
        console.error(`[getPlayerDataAction] ❌ Serialization test failed:`, error);
      }

      return playerData;
    } catch (error) {
      // Clear timeout on error
      clearTimeout(timeoutId);

      const elapsed = Date.now() - startTime;

      // Check if it's an abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`[getPlayerDataAction] Request timeout for player ${playerId} after ${elapsed}ms`);
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }

      throw error;
    }
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[getPlayerDataAction] Error for player ${playerId} after ${elapsed}ms:`, error);
    if (error instanceof Error) {
      console.error(`[getPlayerDataAction] Error type:`, error.constructor.name);
      console.error(`[getPlayerDataAction] Error message:`, error.message);
    }
    return null;
  }
}
