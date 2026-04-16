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

export async function getAllTop5PlayersAction() {
  try {
    const client = getStatoriumClient();

    // TOP 5 leagues with their correct Season IDs for 2025-26
    const top5Leagues = [
      { id: 'pl', leagueId: '1', seasonId: '515', fallbackSeasonId: '343' }, // Premier League
      { id: 'laliga', leagueId: '2', seasonId: '558', fallbackSeasonId: '344' }, // La Liga
      { id: 'seriea', leagueId: '3', seasonId: '511', fallbackSeasonId: '345' }, // Serie A
      { id: 'bundesliga', leagueId: '4', seasonId: '521', fallbackSeasonId: '346' }, // Bundesliga
      { id: 'ligue1', leagueId: '5', seasonId: '519', fallbackSeasonId: '347' }, // Ligue 1
    ];

    const allPlayers: StatoriumPlayerBasic[] = [];

    // Helper function to extract stats from various possible locations in API response
    const extractStats = (player: any, playerName: string = 'Unknown') => {
      // Try multiple paths for statistics - season_stats and statistics are the key locations
      const stats = player.season_stats || player.statistics || player.performance || player.stats ||
                    player.season || player.current_season || player.stats_data ||
                    player.additionalInfo?.season_stats || player.additionalInfo?.statistics ||
                    player.additionalInfo?.performance || player.additionalInfo?.season ||
                    player.additionalInfo?.current_season || player.additionalInfo?.stats_data || {};

      // Log the raw player data structure for debugging (first few players only)
      if (Math.random() < 0.05) { // Log ~5% of players to avoid spam
        console.log(`🔍 Player structure sample for ${playerName}:`, {
          playerKeys: Object.keys(player),
          hasSeasonStats: !!player.season_stats,
          hasStatistics: !!player.statistics,
          hasPerformance: !!player.performance,
          hasStats: !!player.stats,
          hasSeason: !!player.season,
          hasCurrentSeason: !!player.current_season,
          hasAdditionalInfo: !!player.additionalInfo,
          rawGoals: player.goals,
          rawAssists: player.assists,
          rawMatches: player.matchesPlayed,
          rawYellowCards: player.yellowCards,
          seasonStats: player.season_stats,
          statistics: player.statistics,
          statsData: stats,
          fullPlayer: player // For detailed inspection
        });
      }

      // Deep search function to find stat value in nested objects
      const findStatValue = (obj: any, possibleKeys: string[]): number => {
        if (!obj || typeof obj !== 'object') return 0;

        // Check direct keys first
        for (const key of possibleKeys) {
          if (obj[key] !== undefined && obj[key] !== null) {
            const value = Number(obj[key]);
            if (!isNaN(value) && value > 0) return value;
          }
        }

        // Search in nested arrays and objects
        for (const key of Object.keys(obj)) {
          const value = obj[key];
          if (Array.isArray(value)) {
            // Search in array of objects
            for (const item of value) {
              if (typeof item === 'object' && item !== null) {
                // First check direct keys in this item
                for (const statKey of possibleKeys) {
                  if (item[statKey] !== undefined && item[statKey] !== null) {
                    const numValue = Number(item[statKey]);
                    if (!isNaN(numValue) && numValue > 0) return numValue;
                  }
                }
                // Then recursively search in nested objects
                const found = findStatValue(item, possibleKeys);
                if (found > 0) return found;
              }
            }
          } else if (typeof value === 'object' && value !== null) {
            // Recursively search in nested objects
            const found = findStatValue(value, possibleKeys);
            if (found > 0) return found;
          }
        }

        return 0;
      };

      // Helper function to safely convert to number
      const safeNumber = (value: any): number => {
        if (value === undefined || value === null) return 0;
        const num = Number(value);
        return isNaN(num) ? 0 : num;
      };

      // Extract stats using deep search with multiple possible field names
      const goals = findStatValue(stats, ['goals', 'g', 'goal_scored', 'total_goals', 'totalgoals', 'goal', 'goals_scored']) ||
                    safeNumber(player.goals || player.additionalInfo?.goals);

      const assists = findStatValue(stats, ['assists', 'a', 'goal_assist', 'total_assists', 'totalassists', 'assist', 'assists_made']) ||
                      safeNumber(player.assists || player.additionalInfo?.assists);

      const matchesPlayed = findStatValue(stats, ['appearances', 'matches', 'games_played', 'played', 'matches_played', 'games', 'match', 'appearances_made']) ||
                            safeNumber(player.matchesPlayed || player.additionalInfo?.matchesPlayed);

      const minutesPlayed = findStatValue(stats, ['minutes', 'time', 'minutes_played', 'mins', 'minute', 'minutes_played_total']) ||
                           safeNumber(player.minutesPlayed || player.additionalInfo?.minutesPlayed);

      const yellowCards = findStatValue(stats, ['yellow_cards', 'yellow', 'cards_yellow', 'yellows', 'yellow_cards_total']) ||
                         safeNumber(player.yellowCards || player.additionalInfo?.yellowCards);

      const redCards = findStatValue(stats, ['red_cards', 'red', 'cards_red', 'reds', 'red_cards_total']) ||
                      safeNumber(player.redCards || player.additionalInfo?.redCards);

      // Calculate rating if not present in API
      let rating = findStatValue(stats, ['rating', 'average_rating', 'avg_rating']) ||
                   Number(player.rating || player.additionalInfo?.rating || 0);

      // If rating is 0 or missing, calculate based on performance or set default
      if (!rating || rating === 0) {
        if (goals > 0 || assists > 0) {
          // Simple calculation: base 6.0 + (goals * 0.3) + (assists * 0.2) + (matchesPlayed * 0.05)
          rating = Math.min(10, Math.max(6.0, 6.0 + (goals * 0.3) + (assists * 0.2) + (matchesPlayed * 0.05)));
        } else {
          // Default rating for players without stats
          rating = 7.5;
        }
      }

      // Round to 1 decimal place
      rating = Math.round(rating * 10) / 10;

      return {
        goals,
        assists,
        matchesPlayed,
        minutesPlayed,
        rating,
        yellowCards,
        redCards,
      };
    };

    // Helper function to get players from a team with fallback season
    const getTeamPlayersWithFallback = async (teamId: string, seasonId: string, fallbackSeasonId: string, teamName: string) => {
      try {
        console.log(`📊 Fetching players for team ${teamId} (${teamName}) with season ${seasonId}`);
        let players = await client.getPlayersByTeam(teamId, seasonId);

        // Log sample player structure for debugging
        if (players.length > 0) {
          const samplePlayer = players[0];
          console.log(`📋 Sample player structure from ${teamName}:`, {
            playerName: samplePlayer.fullName,
            playerID: samplePlayer.playerID,
            playerKeys: Object.keys(samplePlayer),
            hasSeasonStats: !!samplePlayer.season_stats,
            hasStatistics: !!samplePlayer.statistics,
            hasPerformance: !!samplePlayer.performance,
            hasStats: !!samplePlayer.stats,
            hasSeason: !!samplePlayer.season,
            hasCurrentSeason: !!samplePlayer.current_season,
            seasonStatsType: typeof samplePlayer.season_stats,
            statisticsType: typeof samplePlayer.statistics,
            seasonStatsKeys: samplePlayer.season_stats ? Object.keys(samplePlayer.season_stats) : [],
            statisticsKeys: samplePlayer.statistics ? Object.keys(samplePlayer.statistics) : [],
            sampleSeasonStats: samplePlayer.season_stats,
            sampleStatistics: samplePlayer.statistics,
            rawGoals: samplePlayer.goals,
            rawAssists: samplePlayer.assists,
            rawMatches: samplePlayer.matchesPlayed,
            rawYellowCards: samplePlayer.yellowCards,
          });
        }

        // Check if players have actual stats (not just zeros)
        const hasRealStats = players.some((p: any) => {
          const stats = extractStats(p, p.fullName || 'Unknown');
          return stats.goals > 0 || stats.assists > 0 || stats.matchesPlayed > 0 || stats.minutesPlayed > 0;
        });

        if (!hasRealStats && fallbackSeasonId) {
          console.log(`⚠️ No real stats found for ${teamName} in season ${seasonId}, trying fallback ${fallbackSeasonId}`);
          try {
            const fallbackPlayers = await client.getPlayersByTeam(teamId, fallbackSeasonId);
            if (fallbackPlayers.length > 0) {
              console.log(`📊 Got ${fallbackPlayers.length} players from fallback season ${fallbackSeasonId}`);

              // Log sample fallback player structure
              if (fallbackPlayers.length > 0) {
                const sampleFallback = fallbackPlayers[0];
                console.log(`📋 Sample fallback player structure:`, {
                  playerName: sampleFallback.fullName,
                  playerID: sampleFallback.playerID,
                  playerKeys: Object.keys(sampleFallback),
                  hasSeasonStats: !!sampleFallback.season_stats,
                  hasStatistics: !!sampleFallback.statistics,
                  seasonStatsKeys: sampleFallback.season_stats ? Object.keys(sampleFallback.season_stats) : [],
                  statisticsKeys: sampleFallback.statistics ? Object.keys(sampleFallback.statistics) : [],
                  sampleSeasonStats: sampleFallback.season_stats,
                  sampleStatistics: sampleFallback.statistics,
                  rawGoals: sampleFallback.goals,
                  rawAssists: sampleFallback.assists,
                  rawMatches: sampleFallback.matchesPlayed,
                });
              }

              // Extract stats from fallback players and map them to current players by playerID
              const fallbackStatsMap = new Map<string, any>();

              fallbackPlayers.forEach((fp: any) => {
                const fpStats = extractStats(fp, fp.fullName || 'Unknown (fallback)');
                console.log(`🔍 Fallback player ${fp.fullName} stats:`, fpStats);
                if (fpStats.goals > 0 || fpStats.assists > 0 || fpStats.matchesPlayed > 0) {
                  fallbackStatsMap.set(fp.playerID, fpStats);
                  console.log(`✅ Added fallback stats for ${fp.fullName}:`, fpStats);
                }
              });

              console.log(`📈 Found ${fallbackStatsMap.size} players with stats in fallback season for ${teamName}`);

              // Merge fallback stats with current players
              const mergedPlayers = players.map((p: any) => {
                const fallbackStats = fallbackStatsMap.get(p.playerID);
                if (fallbackStats) {
                  console.log(`✅ Using fallback stats for ${p.fullName}:`, fallbackStats);
                  return {
                    ...p,
                    ...fallbackStats,
                  };
                }
                return p;
              });

              // Also add any players from fallback that aren't in current season
              const currentPlayerIds = new Set(players.map((p: any) => p.playerID));
              const newPlayers = fallbackPlayers.filter((fp: any) => !currentPlayerIds.has(fp.playerID));

              players = [...mergedPlayers, ...newPlayers];
              console.log(`✅ Merged fallback stats for ${teamName}, total players: ${players.length}`);
            } else {
              console.log(`❌ No players found in fallback season for ${teamName}`);
            }
          } catch (e) {
            console.log(`❌ Fallback failed for ${teamName}, using original data:`, e);
          }
        } else if (hasRealStats) {
          console.log(`✅ Found real stats for ${teamName} in season ${seasonId}`);
        } else {
          console.log(`⚠️ Players found but no real stats for ${teamName} in season ${seasonId}`);
        }

        return players;
      } catch (e) {
        console.error(`❌ Error getting players for team ${teamId}:`, e);
        return [];
      }
    };

    // Get standings for each league to get team IDs
    for (const league of top5Leagues) {
      try {
        console.log(`Fetching ${league.id} standings with season ID: ${league.seasonId}`);
        const standings = await client.getStandings(league.seasonId);

        if (standings && standings.length > 0) {
          console.log(`Found ${standings.length} teams in ${league.id}`);
          // Get players from each team in the league
          for (const standing of standings) {
            try {
              const teamId = standing.teamID?.toString();
              if (teamId) {
                const players = await getTeamPlayersWithFallback(
                  teamId,
                  league.seasonId,
                  league.fallbackSeasonId || '',
                  standing.teamName
                );

                const playersWithPhoto = players.map((p: any) => {
                  const stats = extractStats(p, p.fullName || 'Unknown');

                  return {
                    ...p,
                    playerPhoto: p.playerPhoto || p.photo || `https://api.statorium.com/media/bearleague/bl${p.playerID}.webp`,
                    country: p.country || p.nationality || p.additionalInfo?.country || p.additionalInfo?.nationality || null,
                    teamName: p.teamName || standing.teamName,
                    position: p.position || p.additionalInfo?.position || p.playerType || null,
                    ...stats, // Spread the extracted stats
                    birthdate: p.birthdate || p.dateOfBirth || p.additionalInfo?.birthdate || p.additionalInfo?.dateOfBirth || null,
                  };
                });
                allPlayers.push(...playersWithPhoto);
              }
            } catch (e) {
              console.error(`Error processing team ${standing.teamID}:`, e);
            }
          }
        } else {
          console.log(`No standings found for ${league.id} with season ID: ${league.seasonId}`);
        }
      } catch (e) {
        console.error(`Error getting standings for league ${league.id}:`, e);
      }
    }

    console.log(`Total players fetched: ${allPlayers.length}`);

    // Remove duplicates based on playerID - prefer players from more recent leagues
    // We'll keep the first occurrence (which should be from the most recent season data)
    const playerMap = new Map<string, StatoriumPlayerBasic>();

    for (const player of allPlayers) {
      const playerId = player.playerID;
      // Only add if not already present (keeps first occurrence)
      if (!playerMap.has(playerId)) {
        playerMap.set(playerId, player);
      } else {
        // If player already exists, check if this is more recent data
        const existing = playerMap.get(playerId)!;
        // Prefer players with more recent stats (higher matches played usually means more current)
        if ((player.matchesPlayed || 0) > (existing.matchesPlayed || 0)) {
          playerMap.set(playerId, player);
        }
      }
    }

    const uniquePlayers = Array.from(playerMap.values());

    console.log(`Unique players after deduplication: ${uniquePlayers.length}`);

    // Log Lookman's data for debugging
    const lookman = uniquePlayers.find(p => p.fullName?.toLowerCase().includes('lookman'));
    if (lookman) {
      console.log('🔍🔍🔍 Lookman found with detailed stats:', {
        name: lookman.fullName,
        team: lookman.teamName,
        position: lookman.position,
        goals: lookman.goals,
        assists: lookman.assists,
        matches: lookman.matchesPlayed,
        minutes: lookman.minutesPlayed,
        rating: lookman.rating,
        yellowCards: lookman.yellowCards,
        redCards: lookman.redCards,
        playerID: lookman.playerID,
        dataSource: (lookman.goals || 0) > 0 || (lookman.assists || 0) > 0 ? 'Season 2025-26' : 'Fallback Season 2024-25'
      });
    } else {
      console.log('❌ Lookman NOT found in unique players');
      // Log some sample players to see what we have
      const samplePlayers = uniquePlayers.slice(0, 5);
      console.log('📋 Sample players found:', samplePlayers.map(p => ({
        name: p.fullName,
        team: p.teamName,
        goals: p.goals,
        assists: p.assists,
        matches: p.matchesPlayed,
        minutes: p.minutesPlayed,
        rating: p.rating,
        yellowCards: p.yellowCards,
        redCards: p.redCards
      })));
    }

    // Check for players with no stats
    const playersWithNoStats = uniquePlayers.filter(p =>
      (p.goals || 0) === 0 &&
      (p.assists || 0) === 0 &&
      (p.matchesPlayed || 0) === 0
    );

    console.log(`📊 Players with no stats: ${playersWithNoStats.length}/${uniquePlayers.length}`);

    if (playersWithNoStats.length > 0) {
      console.log('⚠️ Sample players with no stats:', playersWithNoStats.slice(0, 3).map(p => ({
        name: p.fullName,
        team: p.teamName,
        hasSeasonStats: !!(p as any).season_stats,
        hasStatistics: !!(p as any).statistics,
        seasonStatsData: (p as any).season_stats,
        statisticsData: (p as any).statistics,
      })));
    }

    return uniquePlayers;
  } catch (error) {
    console.error('Get All TOP 5 Players Action Error:', error);
    return [];
  }
}
