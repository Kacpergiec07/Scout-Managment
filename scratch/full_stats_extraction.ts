
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

const CACHE_DIR = 'scratch/cache';
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const apiKey = process.env.STATORIUM_API_KEY;

async function apiFetch(endpoint: string, params: any = {}) {
    const url = new URL(`https://api.statorium.com/api/v1${endpoint}`);
    url.searchParams.append('apikey', apiKey || '');
    for (const k in params) url.searchParams.append(k, params[k]);
    const res = await fetch(url.toString());
    return res.json();
}

async function getCachedPlayerDetails(playerId: string) {
  const cacheFile = path.join(CACHE_DIR, `player_${playerId}.json`);
  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }
  try {
    const data = await apiFetch(`/players/${playerId}/`, { showstat: 'true' });
    const details = data.player;
    if (details) {
      fs.writeFileSync(cacheFile, JSON.stringify(details));
    }
    return details;
  } catch (e) {
    return null;
  }
}

function extractStatValue(stat: any, key: string): number {
  if (!stat) return 0;
  const val = stat[key] || stat[key.toLowerCase()] || stat[key + 's'] || stat[key.toLowerCase() + 's'] || 0;
  if (typeof val === 'string' && val.includes('(')) {
      const match = val.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
  }
  return parseInt(val as string) || 0;
}

async function main() {
  const leagues = [
    { name: 'Premier League', id: '515' },
    { name: 'La Liga', id: '558' },
    { name: 'Bundesliga', id: '521' },
    { name: 'Serie A', id: '511' },
    { name: 'Ligue 1', id: '519' }
  ];

  const results: any = {};

  for (const league of leagues) {
    console.log(`Processing ${league.name} (ID: ${league.id})...`);
    results[league.name] = [];
    try {
      const data = await apiFetch(`/scorers/${league.id}/`);
      const scorers = data.scorers || [];
      console.log(`  Found ${scorers.length} scorers in league.`);

      const teamGroups: Record<string, any[]> = {};
      
      // Process scorers to get full details and group by team
      for (const s of scorers) {
          const pid = s.playerID || s.id;
          const tname = s.teamName || s.team_name || "Unknown";
          if (!teamGroups[tname]) teamGroups[tname] = [];
          
          const details = await getCachedPlayerDetails(pid.toString());
          if (details && details.stat) {
              const currentStat = details.stat.find((st: any) => String(st.season_id) === String(league.id)) || details.stat[0];
              const goals = extractStatValue(currentStat, 'Goals');
              const assists = extractStatValue(currentStat, 'Assist');
              
              teamGroups[tname].push({
                  name: details.fullName || s.playerName,
                  goals,
                  assists,
                  total: goals + assists
              });
          }
      }

      for (const [tname, players] of Object.entries(teamGroups)) {
          players.sort((a, b) => b.goals - a.goals || b.assists - a.assists);
          const topScorers = players.slice(0, 2);
          
          players.sort((a, b) => b.assists - a.assists || b.goals - a.goals);
          const topAssists = players.slice(0, 2);
          
          results[league.name].push({
              teamName: tname,
              topScorers,
              topAssists
          });
      }
    } catch (e) {
      console.error(`Error processing ${league.name}:`, e);
    }
  }

  fs.writeFileSync('scratch/final_top_stats.json', JSON.stringify(results, null, 2));
  console.log('Saved to scratch/final_top_stats.json');
}

main();
