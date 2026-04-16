"use server";

import { StatoriumClient } from '@/lib/statorium/client';
import { StatoriumTeamDetail, StatoriumPlayerBasic, StatoriumMatch } from '@/lib/statorium/types';

let clientInstance: StatoriumClient | null = null;

function getStatoriumClient() {
  if (!clientInstance) {
    clientInstance = new StatoriumClient(process.env.STATORIUM_API_KEY || '');
  }
  return clientInstance;
}

const COACH_MAP: Record<string, string> = {
  "9": "Mikel Arteta", // Arsenal
  "12": "Pep Guardiola", // Man City
  "3": "Arne Slot", // Liverpool
  "7": "Ruben Amorim", // Man Utd
  "1": "Enzo Maresca", // Chelsea
  "5": "Ange Postecoglou", // Tottenham
  "53": "Carlo Ancelotti", // Real Madrid
  "64": "Hansi Flick", // Barcelona
  "147": "Vincent Kompany", // Bayern Munich
  "163": "Xabi Alonso", // Leverkusen
  "182": "Luis Enrique", // PSG
  "223": "Simone Inzaghi", // Inter Milan
  "221": "Antonio Conte", // Napoli
  "234": "Thiago Motta", // Juventus
  "241": "Paulo Fonseca", // AC Milan
};

export async function getStandingsAction(seasonId: string) {
  try {
    const client = getStatoriumClient();
    const standings = await client.getStandings(seasonId);
    
    if (standings && standings.length > 0) {
      return standings.slice(0, 10).map((s: any) => {
        let stats: any = {};
        try {
          stats = typeof s.options === 'string' ? JSON.parse(s.options) : (s.options || {});
        } catch(e) {}
        
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
    
    let apiTeam: any = null;
    try {
      apiTeam = await client.getTeamDetails(teamId);
    } catch (e) {}
    
    let players: StatoriumPlayerBasic[] = [];
    if (seasonId) {
      try { players = await client.getPlayersByTeam(teamId, seasonId); } catch (e) {}
    } 
    if (!players.length && apiTeam?.players?.length) {
      players = apiTeam.players;
    }

    // Filter out departed players
    players = (players || []).filter((p: any) => p.playerDeparted !== '1');

    // Robust Starting XI selection and formation calculation
    const gks = players.filter((p: any) => p.position?.startsWith('GK') || p.additionalInfo?.position?.startsWith('Goalkeep'));
    const dfs = players.filter((p: any) => p.position?.startsWith('DF') || p.additionalInfo?.position?.startsWith('Def'));
    const mfs = players.filter((p: any) => p.position?.startsWith('MF') || p.additionalInfo?.position?.startsWith('Mid'));
    const fws = players.filter((p: any) => p.position?.startsWith('FW') || p.additionalInfo?.position?.startsWith('Atac'));

    // Choose formation based on counts
    let d = 4, m = 3, f = 3;
    if (dfs.length >= 5 && mfs.length >= 3 && fws.length <= 2) { d = 5; m = 3; f = 2; }
    else if (mfs.length >= 5 && fws.length <= 1) { d = 4; m = 5; f = 1; }
    else if (dfs.length >= 3 && mfs.length >= 4 && fws.length >= 3) { d = 3; m = 4; f = 3; }
    else if (fws.length >= 2 && mfs.length >= 4) { d = 4; m = 4; f = 2; }
    
    // Select the actual starting XI players
    const startingXI: StatoriumPlayerBasic[] = [];
    if (gks[0]) startingXI.push(gks[0]);
    startingXI.push(...dfs.slice(0, d));
    startingXI.push(...mfs.slice(0, m));
    startingXI.push(...fws.slice(0, f));

    // Fill to 11 if still missing some positions
    if (startingXI.length < 11) {
        const usedIds = new Set(startingXI.map(p => p.playerID));
        const remaining = players.filter(p => !usedIds.has(p.playerID));
        startingXI.push(...remaining.slice(0, 11 - startingXI.length));
    }

    const formation = d > 0 ? `${d}-${m}-${f}` : "4-3-3";
    
    // Reorder players array to have starting XI first
    const startingIds = new Set(startingXI.map(p => p.playerID));
    const sortedPlayers = [
        ...startingXI,
        ...players.filter(p => !startingIds.has(p.playerID))
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
