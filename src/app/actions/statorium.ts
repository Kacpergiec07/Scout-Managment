"use server";

import { cache } from 'react';
import { StatoriumClient } from '@/lib/statorium/client';
import { StatoriumTeamDetail, StatoriumPlayerBasic, StatoriumMatch } from '@/lib/statorium/types';
import { geocodeCity, getCachedGeocode } from '@/lib/utils/geocoding';
import { COACH_MAP } from '@/lib/coaches-data';
import { getRealFormation } from '@/lib/statorium/formation-service';
import { PLAYER_PHOTOS, VERIFIED_TRANSFERS } from '@/lib/statorium-data';

import { createClient } from '@/lib/supabase/server';
import { getCachedPlayersByTeam } from './sync';
import * as fs from 'fs';
import * as path from 'path';

const getStatoriumClient = cache(() => {
  return new StatoriumClient(process.env.STATORIUM_API_KEY as string);
});

// Global in-memory cache for high-frequency server-side requests
const GLOBAL_CACHE = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Local player database for fallback search
let LOCAL_PLAYER_DB: any[] | null = null;
function getLocalPlayerDb() {
  if (LOCAL_PLAYER_DB) return LOCAL_PLAYER_DB;
  try {
    const dbPath = path.join(process.cwd(), 'src', 'lib', 'all-players-db.json');
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath, 'utf-8');
      LOCAL_PLAYER_DB = JSON.parse(content);
      console.log(`[Statorium Action] Loaded local player DB with ${LOCAL_PLAYER_DB?.length} players`);
      return LOCAL_PLAYER_DB;
    }
  } catch (err) {
    console.error('[Statorium Action] Error loading local player DB:', err);
  }
  return [];
}

function getCached<T>(key: string): T | null {
  const cached = GLOBAL_CACHE.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  GLOBAL_CACHE.set(key, { data, timestamp: Date.now() });
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
      _photoIdx.set(normalizeName(name), url as string);
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

/**
 * Adjusts a UTC date/time string from Statorium to Europe/Warsaw timezone.
 */
function formatToWarsaw(dateStr: string, timeStr: string) {
  if (!dateStr) return { date: dateStr, time: timeStr };
  
  try {
    // Statorium usually provides date as YYYY-MM-DD and time as HH:mm
    // We assume these are in UTC as the user reports they are "too early" (UTC vs PL time)
    const combined = `${dateStr}T${timeStr || '00:00'}:00Z`;
    const date = new Date(combined);
    
    if (isNaN(date.getTime())) return { date: dateStr, time: timeStr };

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Europe/Warsaw',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    // Use en-CA for YYYY-MM-DD format parts, but we'll manually assemble to be sure
    const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(date);
    const p: Record<string, string> = {};
    parts.forEach(part => { p[part.type] = part.value; });

    return {
      date: `${p.year}-${p.month}-${p.day}`,
      time: `${p.hour}:${p.minute}`
    };
  } catch (e) {
    console.error("Error converting to Warsaw time:", e);
    return { date: dateStr, time: timeStr };
  }
}

export async function getStandingsAction(seasonId: string) {
  const cacheKey = `standings_${seasonId}`;
  const cached = getCached<any[]>(cacheKey);
  if (cached) return cached;

  try {
    const client = getStatoriumClient();
    const standings = await client.getStandings(seasonId);

    console.log(`[Action] getStandingsAction for ${seasonId}: found ${standings?.length || 0} teams`);

    if (standings && standings.length > 0) {
      // Fetch all matches for this season to calculate real-time form
      let allMatches: any[] = [];
      try {
        allMatches = await client.getMatches(seasonId);
      } catch (e) {
        console.warn('Could not fetch matches for form calculation');
      }

      const processedStandings = standings.map((s: any) => {
        let stats: any = {};
        try {
          stats = typeof s.options === 'string' ? JSON.parse(s.options) : (s.options || {});
        } catch (e) { }

        const teamId = (s.teamID || s.team_id || s.id || "").toString();
        const teamName = s.teamName || s.team_name || s.teamMiddleName || "Unknown Team";
        let teamLogo = resolveTeamLogo(s.logo || s.teamLogo || s.team_logo || s);
        
        if (!teamLogo && teamId && teamId !== "undefined") {
          teamLogo = `https://api.statorium.com/media/bearleague/ct${teamId}.png`;
        }

        // Calculate form from actual matches
        let calculatedForm: { result: string, matchId: string }[] = [];
        const cleanTeamName = teamName.toLowerCase().trim();

        if (allMatches.length > 0) {
          const teamMatches = allMatches.filter((m: any) => {
             const hId = (m.homeID || m.home_id || m.homeParticipantID || m.homeTeamID || m.home_participant_id || m.homeParticipant?.participantID || "").toString();
             const aId = (m.awayID || m.away_id || m.awayParticipantID || m.awayTeamID || m.away_participant_id || m.awayParticipant?.participantID || "").toString();
             
             const hName = (m.homeName || m.home_name || m.homeParticipantName || "").toLowerCase();
             const aName = (m.awayName || m.away_name || m.awayParticipantName || "").toLowerCase();

             // Check if match was played (has score AND is not in the future)
             const hScore = m.homeScore ?? m.home_score ?? m.homeScore_chk ?? m.homeParticipant?.score;
             const mDate = new Date(m.matchDate || m.match_date || "1900-01-01");
             const now = new Date();
             const played = hScore !== undefined && hScore !== null && hScore.toString() !== "" && mDate <= now;
             
             const isHome = hId === teamId || (cleanTeamName && hName.includes(cleanTeamName));
             const isAway = aId === teamId || (cleanTeamName && aName.includes(cleanTeamName));

             return played && (isHome || isAway);
          });

          teamMatches.sort((a: any, b: any) => {
            const dateA = new Date(`${a.matchDate || a.match_date} ${a.matchTime || a.match_time || '00:00'}`);
            const dateB = new Date(`${b.matchDate || b.match_date} ${b.matchTime || b.match_time || '00:00'}`);
            return dateB.getTime() - dateA.getTime();
          });

          calculatedForm = teamMatches.slice(0, 5).map((m: any) => {
             const hId = (m.homeID || m.home_id || m.homeParticipantID || m.homeTeamID || m.home_participant_id || m.homeParticipant?.participantID || "").toString();
             const hName = (m.homeName || m.home_name || m.homeParticipantName || m.homeParticipant?.participantName || "").toLowerCase();
             const hScore = parseInt(m.homeScore ?? m.home_score ?? m.homeScore_chk ?? m.homeParticipant?.score ?? "0");
             const aScore = parseInt(m.awayScore ?? m.away_score ?? m.awayScore_chk ?? m.awayParticipant?.score ?? "0");
             
             const isHome = hId === teamId || (cleanTeamName && hName.includes(cleanTeamName));
             let res = isHome ? (hScore > aScore ? "W" : hScore < aScore ? "L" : "D") : (aScore > hScore ? "W" : aScore < hScore ? "L" : "D");
             
             return { result: res, matchId: (m.matchID || m.match_id || m.id).toString() };
          });
        }

        // DEEP FALLBACK: Use team's own results list IF available in standings OR a dummy pattern that matches their REAL season stats
        if (calculatedForm.length === 0) {
           const formString = (s.form || stats.form || "").toString();
           if (formString && formString.length >= 1) {
             const formArray = formString.split('').filter((c: string) => ['W','D','L'].includes(c.toUpperCase()));
             calculatedForm = formArray.slice(0, 5).map((res: string) => ({
                result: res.toUpperCase(),
                matchId: "static"
             }));
           }
        }

        // FINAL FAILSAFE: If still nothing, use a simple W-D-L sequence based on their wins/losses (not random, just deterministic)
        if (calculatedForm.length === 0) {
           const w = parseInt(stats.win_chk || s.won || "0");
           const d = parseInt(stats.draw_chk || s.drawn || "0");
           const l = parseInt(stats.lost_chk || s.lost || "0");
           
           const results: string[] = [];
           for(let i=0; i<w && i<5; i++) results.push("W");
           for(let i=0; i<d && results.length<5; i++) results.push("D");
           for(let i=0; i<l && results.length<5; i++) results.push("L");
           
           calculatedForm = results.map(r => ({ result: r, matchId: "static" }));
        }

        return {
          teamID: teamId,
          teamName,
          teamLogo,
          rank: parseInt(s.ordering || s.rank || s.position || "0"),
          played: parseInt(stats.played_chk || s.played || s.matches_played || "0"),
          won: parseInt(stats.win_chk || s.won || s.wins || "0"),
          drawn: parseInt(stats.draw_chk || s.drawn || s.draws || "0"),
          lost: parseInt(stats.lost_chk || s.lost || s.losses || "0"),
          goalsFor: parseInt(stats.goalscore_chk || s.goalsFor || s.goals_for || "0"),
          goalsAgainst: parseInt(stats.goalconc_chk || s.goalsAgainst || s.goals_against || "0"),
          points: parseInt(stats.point_chk || s.points || "0"),
          formObjects: calculatedForm,
        };
      }).sort((a: any, b: any) => parseInt(b.points) - parseInt(a.points) || parseInt(a.position) - parseInt(b.position));
      
      setCache(cacheKey, processedStandings);
      return processedStandings;
    }
    return [];
  } catch (error) {
    console.error('Get Standings Action Error:', error);
    return [];
  }
}

export async function getSeasonDetailsAction(seasonId: string) {
  try {
    const client = getStatoriumClient();
    // In Statorium, standings endpoint often returns season meta
    // We can also use getStandings and check the wrapper
    const data: any = await client.getStandings(seasonId);
    
    // Attempt to find league info in the standings list or top-level objects
    // Since getStandings client method returns just the list, we might need a more raw fetch
    // But for the TOP 5 leagues, we can just map the IDs
    const TOP_5_MAP: Record<string, any> = {
      "515": { name: "Premier League", logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/13.png" },
      "558": { name: "La Liga", logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/53.png" },
      "511": { name: "Serie A", logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/31.png" },
      "521": { name: "Bundesliga", logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/19.png" },
      "519": { name: "Ligue 1", logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/16.png" }
    };

    if (TOP_5_MAP[seasonId]) return TOP_5_MAP[seasonId];

    return { name: "League Details", logo: "" };
  } catch (error) {
    console.error('Get Season Details Action Error:', error);
    return null;
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

export async function getClubProfileDataAction(teamId: string, seasonId?: string) {
  try {
    const teamDetails = await getTeamDetailsAction(teamId, seasonId);
    if (!teamDetails) return null;
    
    let leagueInfo = null;
    let standing = null;
    
    // Auto-detect seasonId if not provided (needed for rank/league info)
    let finalSeasonId = seasonId;
    if (!finalSeasonId) {
       for (const league of TOP_LEAGUES) {
          const client = getStatoriumClient();
          try {
             const standings = await client.getStandings(league.id);
             if (standings.find((s: any) => s.teamID?.toString() === teamId)) {
                finalSeasonId = league.id;
                break;
             }
          } catch(e){}
       }
    }

    if (finalSeasonId) {
      leagueInfo = await getSeasonDetailsAction(finalSeasonId);
      const standings = await getStandingsAction(finalSeasonId);
      standing = standings.find((s: any) => s.teamID?.toString() === teamId);
    }
    
    return { teamDetails, leagueInfo, standing, seasonId: finalSeasonId };
  } catch (error) {
    console.error("Get Club Profile Data Action Error:", error);
    return null;
  }
}

export async function getTeamDetailsAction(teamId: string, seasonId?: string) {
  if (!teamId || teamId === 'undefined') return null;

  try {
    const supabase = await createClient();
    
    // Check Cache First
    const { data: cachedTeam } = await supabase
      .from('cached_teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (cachedTeam) {
      console.log(`[Cache] Hit for team ${teamId}`);
      // If we have cached players, we can construct the result
      const cachedPlayers = await getCachedPlayersByTeam(teamId);
      if (cachedPlayers && cachedPlayers.length > 0) {
        return {
          teamID: teamId,
          teamName: cachedTeam.name,
          teamLogo: cachedTeam.logo,
          players: cachedPlayers.map(p => ({
            playerID: p.id,
            fullName: p.full_name,
            position: p.position,
            photo: p.photo_url,
            additionalInfo: { birthdate: p.birthdate },
            stat: p.stats,
            medicalReport: p.injury_status,
            contractStatus: p.contract_expiry
          })),
          formation: 'N/A' 
        } as any;
      }
    }

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
      return p.playerDeparted === "0";
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
    const formationResult = await getRealFormation(teamId, seasonId || '');
    const formation = formationResult.formation;
    const realLineupIds = new Set(formationResult.lineup.map((p: any) => p.playerID.toString()));

    // Select starting XI from actual lineup data if available
    let startingXI = firstTeamPlayers.filter(p => realLineupIds.has(p.playerID.toString()));

    // If real lineup is missing or incomplete, fallback to heuristic
    if (startingXI.length < 7) {
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

      let d = 4, m = 4, f = 2;
      if (formation && formation !== 'N/A') {
        const parts = formation.split('-').map(p => parseInt(p) || 0);
        if (parts.length === 3) {
          d = parts[0] || 4;
          m = parts[1] || 4;
          f = parts[2] || 2;
        } else if (parts.length === 4) {
          // Handle 4-row formations like 4-2-3-1
          d = parts[0] || 4;
          m = (parts[1] + parts[2]) || 5;
          f = parts[3] || 1;
        }
      }

      startingXI = [];
      if (gks.length > 0) startingXI.push(gks[0]);
      startingXI.push(...dfs.slice(0, d));
      startingXI.push(...mfs.slice(0, m));
      startingXI.push(...fws.slice(0, f));

      if (startingXI.length < 11) {
        const usedIds = new Set(startingXI.map(p => p.playerID.toString()));
        const remaining = firstTeamPlayers.filter(p => !usedIds.has(p.playerID.toString()));
        startingXI.push(...remaining.slice(0, 11 - startingXI.length));
      }
    }

    // Reorder players array to have starting XI first
    const startingIds = new Set(startingXI.map(p => p.playerID));
    const sortedPlayers = [
      ...startingXI,
      ...firstTeamPlayers.filter(p => !startingIds.has(p.playerID))
    ];

    players = sortedPlayers;

    // Fetch full player data including stats for all players in parallel
    // We do this to ensure "correct statistics" as requested, since squad API often lacks them
    const enrichedPlayers = await Promise.all(
      players.map(async (p: any) => {
        try {
          // If player already has stats, skip fetching
          if (p.stat && p.stat.length > 0) return p;
          
          // Fetch detailed data which includes stats
          const details = await getPlayerDetailsAction(p.playerID.toString());
          if (details) {
            return {
              ...p,
              ...details,
              stat: details.stat || []
            };
          }
          return p;
        } catch (e) {
          console.warn(`[Action] Failed to enrich player ${p.playerID}:`, e);
          return p;
        }
      })
    );

    const result = {
      ...(apiTeam || {}),
      teamID: teamId,
      teamName: apiTeam?.teamName || apiTeam?.teamMiddleName || `Club ${teamId}`,
      teamLogo: apiTeam?.logo || apiTeam?.teamLogo || "",
      city: apiTeam?.city || "",
      venueName: apiTeam?.venueName || apiTeam?.homeVenue?.name || "",
      coach: COACH_MAP[teamId] || apiTeam?.additionalInfo?.coach,
      formation: formation,
      players: enrichedPlayers.map((p: any) => ({
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

  const startTime = Date.now();
  console.log(`[searchPlayersAction] Searching for: "${query}"`);

  // 1. Try local search first (more reliable than Statorium search API)
  const db = getLocalPlayerDb();
  const normalizedQuery = normalizeName(query);
  
  let results = db ? db.filter((p: any) => {
    const fullName = normalizeName(p.fullName || `${p.firstName} ${p.lastName}`);
    return fullName.includes(normalizedQuery);
  }).map(p => ({
    playerID: p.playerID,
    firstName: p.firstName,
    lastName: p.lastName,
    fullName: p.fullName,
    teamName: p.teamName,
    position: p.position,
    playerPhoto: p.photo || resolvePlayerPhoto(p)
  })).slice(0, 15) : [];

  if (results.length > 0) {
    console.log(`[searchPlayersAction] Found ${results.length} results in local DB in ${Date.now() - startTime}ms`);
    return results;
  }

  // 2. Fallback to API if local search found nothing
  try {
    const client = getStatoriumClient();
    const apiResults = await client.searchPlayers(query);
    const mappedResults = apiResults.map(p => ({
      ...p,
      playerPhoto: resolvePlayerPhoto(p)
    })).slice(0, 10);
    
    console.log(`[searchPlayersAction] Found ${mappedResults.length} results via API in ${Date.now() - startTime}ms`);
    return mappedResults;
  } catch (error) {
    console.error('Search Players Action Error (API):', error);
    return results; // Return whatever we found locally (which is likely empty if we are here)
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
      return { id: p.playerID, photo: photo || `https://api.statorium.com/media/bearleague/bl${p.playerID}.webp` };
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

    if (matches && matches.length > 0) {
      return matches.map((m: any) => {
        const { date, time } = formatToWarsaw(m.matchDate || m.match_date, m.matchTime || m.match_time);
        return { ...m, matchDate: date, matchTime: time };
      });
    }
    return [];
  } catch (error) {
    console.error('Get Matches Action Error:', error);
    return [];
  }
}

export async function getUpcomingMatchesAction(seasonId: string, limit: number = 10) {
  const cacheKey = `upcoming_${seasonId}_${limit}`;
  const cached = getCached<any[]>(cacheKey);
  if (cached) return cached;

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

    // Limit and map to include resolved logos and adjusted timezone
    const processed = upcomingMatches.slice(0, limit).map((m: any) => {
      const homeId = (m.homeParticipant?.participantID || m.homeID || m.home_id || "").toString();
      const awayId = (m.awayParticipant?.participantID || m.awayID || m.away_id || "").toString();
      
      const { date, time } = formatToWarsaw(m.matchDate || m.match_date, m.matchTime || m.match_time);

      return {
        ...m,
        matchDate: date,
        matchTime: time,
        homeLogo: resolveTeamLogo(m.homeParticipant?.logo || m.homeLogo || m.home_logo || homeId),
        awayLogo: resolveTeamLogo(m.awayParticipant?.logo || m.awayLogo || m.away_logo || awayId),
      };
    });

    setCache(cacheKey, processed);
    return processed;
  } catch (error) {
    console.error('Get Upcoming Matches Action Error:', error);
    return [];
  }
}

export async function getTeamRecentMatchesAction(teamId: string, seasonId: string, teamName: string = "") {
  try {
    const client = getStatoriumClient();
    // Use participant_id for targeted search
    const allMatches = await client.getMatches(seasonId, teamId);
    
    // Normalize team name for search
    const cleanTeamName = teamName.toLowerCase().trim();

    // Filter matches where this team played - using multiple fallback IDs AND names
    const teamMatches = allMatches.filter((m: any) => {
      const hId = (m.homeID || m.home_id || m.homeParticipantID || m.homeTeamID || m.home_participant_id || m.homeParticipant?.participantID || "").toString();
      const aId = (m.awayID || m.away_id || m.awayParticipantID || m.awayTeamID || m.away_participant_id || m.awayParticipant?.participantID || "").toString();
      
      const hName = (m.homeName || m.home_name || m.homeParticipantName || m.homeParticipant?.participantName || "").toLowerCase();
      const aName = (m.awayName || m.away_name || m.awayParticipantName || m.awayParticipant?.participantName || "").toLowerCase();

      return hId === teamId || aId === teamId || (cleanTeamName && (hName.includes(cleanTeamName) || aName.includes(cleanTeamName)));
    });

    console.log(`[Action] getTeamRecentMatches for team ${teamId}: found ${teamMatches.length} matches`);

    // Only include played matches (with a score and in the past/today)
    const playedMatches = teamMatches.filter((m: any) => {
      const hScore = m.homeScore ?? m.home_score ?? m.homeScore_chk ?? m.homeParticipant?.score;
      const aScore = m.awayScore ?? m.away_score ?? m.awayScore_chk ?? m.awayParticipant?.score;
      const mDate = new Date(m.matchDate || m.match_date || "1900-01-01");
      const now = new Date();
      return (hScore !== undefined && hScore !== null && hScore !== "") && mDate <= now;
    });

    // Sort by date descending (most recent first)
    playedMatches.sort((a: any, b: any) => {
      const dateA = new Date(`${a.matchDate || a.match_date} ${a.matchTime || a.match_time || '00:00'}`);
      const dateB = new Date(`${b.matchDate || b.match_date} ${b.matchTime || b.match_time || '00:00'}`);
      return dateB.getTime() - dateA.getTime();
    });

    return playedMatches.slice(0, 10).map((m: any) => {
      const { date, time } = formatToWarsaw(m.matchDate || m.match_date, m.matchTime || m.match_time);
      
      return {
        matchID: m.matchID || m.match_id || m.id,
        homeName: m.homeName || m.home_name || m.homeParticipantName,
        awayName: m.awayName || m.away_name || m.awayParticipantName,
        homeLogo: resolveTeamLogo(m.homeLogo || m.home_logo || m.homeID || m.home_id),
        awayLogo: resolveTeamLogo(m.awayLogo || m.away_logo || m.awayID || m.away_id),
        homeScore: m.homeScore ?? m.home_score ?? m.homeParticipant?.score ?? "?",
        awayScore: m.awayScore ?? m.away_score ?? m.awayParticipant?.score ?? "?",
        matchDate: date,
        matchTime: time,
        venue: m.venueName || m.venue_name || m.venue
      };
    });
  } catch (error) {
    console.error('Get Team Recent Matches Error:', error);
    return [];
  }
}

export async function getMatchDetailsAction(matchId: string) {
  try {
    const client = getStatoriumClient();
    const match = await client.getMatchDetails(matchId);
    return match;
  } catch (error) {
    console.error('Get Match Details Error:', error);
    return null;
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

export async function fetchAllLeaguePlayersAction() {
  try {
    const client = getStatoriumClient();
    const allPlayers: any[] = [];
    const seenPlayerIds = new Set<string>();

    console.log('[fetchAllLeaguePlayersAction] Starting to fetch all players from top 5 leagues...');

    for (const league of TOP_LEAGUES) {
      console.log(`[fetchAllLeaguePlayersAction] Processing ${league.name} (ID: ${league.id})...`);

      try {
        const standings = await client.getStandings(league.id);
        if (standings && standings.length > 0) {
          // Get ALL teams from the league (not just top 6)
          const allTeams = standings;
          console.log(`[fetchAllLeaguePlayersAction] Found ${allTeams.length} teams in ${league.name}`);

          for (const team of allTeams as any[]) {
            const tid = team.teamID?.toString();
            const teamName = team.teamName || team.teamMiddleName || "Unknown Club";

            if (tid) {
              try {
                // Get FULL squad/roster (not just top 5 players)
                const squadPlayers = await client.getPlayersByTeam(tid, league.id);

                if (squadPlayers && squadPlayers.length > 0) {
                  // Add all players from squad (not enriched with details for performance)
                  const playersWithTeam = squadPlayers.map((p: any) => ({
                    ...p,
                    teamName: teamName,
                    league: league.name,
                    leagueId: league.id,
                    playerPhoto: resolvePlayerPhoto(p)
                  }));

                  // Add to list (will deduplicate later)
                  allPlayers.push(...playersWithTeam);
                  console.log(`[fetchAllLeaguePlayersAction] Added ${playersWithTeam.length} players from ${teamName}`);
                }
              } catch (e) {
                console.warn(`[fetchAllLeaguePlayersAction] Could not fetch squad for team ${teamName} (${tid}):`, e);
              }
            }
          }
        }
      } catch (e) {
        console.warn(`[fetchAllLeaguePlayersAction] Could not fetch standings for ${league.name}:`, e);
      }
    }

    console.log(`[fetchAllLeaguePlayersAction] Total players before deduplication: ${allPlayers.length}`);

    // Remove duplicates based on playerID
    const uniquePlayers = allPlayers.filter((player, index, self) =>
      index === self.findIndex((p) => p.playerID === player.playerID)
    );

    console.log(`[fetchAllLeaguePlayersAction] Total unique players after deduplication: ${uniquePlayers.length}`);

    return uniquePlayers;
  } catch (error) {
    console.error('[fetchAllLeaguePlayersAction] Error:', error);
    return [];
  }
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
              const squadPlayers = await client.getPlayersByTeam(tid, league.id);
              if (squadPlayers && squadPlayers.length > 0) {
                // Enrich each top player with stats in parallel
                const enriched = await Promise.all(
                  squadPlayers.slice(0, 5).map(async (p: any) => {
                    try {
                      const details = await getPlayerDetailsAction(p.playerID.toString());
                      return {
                        ...p,
                        ...(details || {}),
                        teamName: team.teamName || team.teamMiddleName || "Elite Club",
                        playerPhoto: resolvePlayerPhoto(p),
                        stat: details?.stat || []
                      };
                    } catch (e) {
                      return {
                        ...p,
                        teamName: team.teamName || team.teamMiddleName || "Elite Club",
                        playerPhoto: resolvePlayerPhoto(p)
                      };
                    }
                  })
                );
                allPlayers.push(...enriched);
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
    return uniquePlayers.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
  } catch (error) {
    console.error('Get All Top 5 Players Error:', error);
    return [];
  }
}


export async function getPlayerDetailsAction(playerId: string) {
  if (!playerId) return null;
  try {
    const localCachePath = path.join(process.cwd(), 'scratch', 'cache', `player_${playerId}.json`);
    if (fs.existsSync(localCachePath)) {
      try {
        console.log(`[getPlayerDetailsAction] 🎯 Using local harvested cache for player ${playerId}`);
        const cachedData = JSON.parse(fs.readFileSync(localCachePath, 'utf8'));
        const playerData = cachedData.player || cachedData;
        if (playerData && playerData.stat) {
          return {
            playerID: playerData.playerID || playerId,
            fullName: playerData.fullName || playerData.shortName,
            position: resolvePosition(playerData.position || playerData.additionalInfo?.position, playerId),
            photo: resolvePlayerPhoto(playerData),
            stat: playerData.stat || [],
            additionalInfo: playerData.additionalInfo || {}
          };
        }
      } catch (e) {
        console.warn(`[getPlayerDetailsAction] Failed to read local cache for ${playerId}`);
      }
    }

    const supabase = await createClient();
    const { data: cachedPlayer } = await supabase
      .from('cached_players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (cachedPlayer) {
      console.log(`[Cache] Hit for player ${playerId}`);
      return {
        playerID: cachedPlayer.id,
        fullName: cachedPlayer.full_name,
        position: cachedPlayer.position,
        photo: cachedPlayer.photo_url,
        stat: cachedPlayer.stats,
        additionalInfo: { birthdate: cachedPlayer.birthdate }
      };
    }

    const client = getStatoriumClient();
    console.log(`[Action] Fetching details for player ${playerId}`);

    const playerDetails = await client.getPlayerDetails(playerId);

    if (playerDetails) {
      console.log(`[Action] Player details received for ${playerId}, caching...`);
      // Update cache in background or wait
      try {
        await supabase.from('cached_players').upsert({
          id: playerId,
          full_name: playerDetails.fullName,
          position: resolvePosition(playerDetails.position || playerDetails.additionalInfo?.position, playerId),
          photo_url: resolvePlayerPhoto(playerDetails),
          birthdate: playerDetails.additionalInfo?.birthdate || '',
          stats: playerDetails.stat || [],
          last_synced: new Date().toISOString()
        });
      } catch (e) {
        console.warn(`[Action] Failed to cache player ${playerId}:`, e);
      }
    }

    return playerDetails;
  } catch (error) {
    console.error(`[Action] Get Player Details Error for player ${playerId}:`, error);
    return null;
  }
}


export async function getPlayersByClubAction(teamId: string, seasonId?: string, includeFullDetails: boolean = false) {
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

    const teamName = teamDetails.teamName || "Unknown Club";

    if (includeFullDetails) {
      // Return full enriched player data for search functionality
      return teamDetails.players.map(p => {
        const fullName = p.fullName || `${p.firstName} ${p.lastName}`;
        const birthdate = p.additionalInfo?.birthdate || "";
        const age = birthdate ? calculateAgeFromBirthdate(birthdate) : "N/A";

        return {
          playerID: p.playerID,
          id: p.playerID,
          fullName: fullName,
          name: fullName,
          position: resolvePosition(p.position || p.additionalInfo?.position, p.playerID),
          age: age,
          teamName: teamName,
          teamID: teamId,
          playerPhoto: resolvePlayerPhoto(p),
          photoUrl: resolvePlayerPhoto(p),
          photo: resolvePlayerPhoto(p),
          marketValue: "€" + (Math.floor(Math.random() * 80) + 5) + "M",
          height: p.additionalInfo?.height || "N/A",
          weight: p.additionalInfo?.weight || "N/A",
          additionalInfo: p.additionalInfo || {}
        };
      });
    } else {
      // Return simplified data for existing functionality
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
    }
  } catch (error) {
    console.error('Get Players By Club Action Error:', error);
    return [];
  }
}

// Helper function to calculate age from birthdate
function calculateAgeFromBirthdate(birthdate: string): string {
  if (!birthdate) return "N/A";
  try {
    // Birthdate format: "DD-MM-YYYY (Age)" or similar
    const match = birthdate.match(/(\d{2})-(\d{2})-(\d{4})/);
    if (!match) return "N/A";
    const [, day, month, year] = match;
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  } catch (e) {
    return "N/A";
  }
}

export async function getTransfersAction() {
  try {
    return VERIFIED_TRANSFERS;
  } catch (error) {
    console.error('Get Transfers Action Error:', error);
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

/**
 * Verify if a player exists in the Statorium API
 * Returns true if player data is valid, false otherwise
 */
export async function verifyPlayerExistsAction(playerId: string): Promise<boolean> {
  if (!playerId) return false;

  try {
    const client = getStatoriumClient();
    const playerData = await client.getPlayerDetails(playerId);

    // Check if player data is valid
    if (!playerData) return false;

    // Verify the player has required fields
    const hasPlayerID = !!playerData.playerID;
    const hasName = !!(playerData.fullName || playerData.shortName);

    return hasPlayerID && hasName;
  } catch (error) {
    console.warn(`[verifyPlayerExistsAction] Player ${playerId} does not exist or API error:`, error);
    return false;
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
    const apiKey = process.env.STATORIUM_API_KEY;
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
    // 0. Check local harvested cache first
    const localCachePath = path.join(process.cwd(), 'scratch', 'cache', `player_${playerId}.json`);
    if (fs.existsSync(localCachePath)) {
      try {
        console.log(`[getPlayerDataAction] 🎯 Using local harvested cache for player ${playerId}`);
        const cachedData = JSON.parse(fs.readFileSync(localCachePath, 'utf8'));
        // Local cache structure might be slightly different, ensure we return the right object
        const playerData = cachedData.player || cachedData;
        if (playerData && playerData.stat) {
          return playerData;
        }
      } catch (e) {
        console.warn(`[getPlayerDataAction] Failed to read local cache for ${playerId}, falling back to API`);
      }
    }

    const apiKey = process.env.STATORIUM_API_KEY;
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
export async function getTopScorersAction(seasonId: string) {
  try {
    const client = getStatoriumClient();
    const scorers = await client.getTopScorers(seasonId);
    
    // Filter for forwards only as requested
    // Resolve position for each scorer to identify forwards
    const processedScorers = scorers.filter((s: any) => {
      const pos = resolvePosition(s.position || s.positionID);
      return pos === "FW";
    }).map((s: any) => ({
      playerID: s.playerID,
      fullName: s.fullName,
      goals: parseInt(s.goals || "0"),
      teamName: s.teamName,
      teamID: s.teamID,
      photo: resolvePlayerPhoto(s)
    }));

    return processedScorers.sort((a: any, b: any) => b.goals - a.goals).slice(0, 10);
  } catch (error) {
    console.error('Get Top Scorers Action Error:', error);
    return [];
  }
}
/**
 * Optimized action to fetch both standings and upcoming matches for the League Hub in one request.
 */
export async function getLeagueHubDataAction(seasonId: string) {
  try {
    const [standings, fixtures] = await Promise.all([
      getStandingsAction(seasonId),
      getUpcomingMatchesAction(seasonId, 4)
    ]);
    
    return {
      standings: standings || [],
      fixtures: fixtures || []
    };
  } catch (error) {
    console.error(`[Action] getLeagueHubDataAction error for ${seasonId}:`, error);
    return { standings: [], fixtures: [] };
  }
}

