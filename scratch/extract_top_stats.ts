
import { getStatoriumClient } from '../src/lib/statorium/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const CACHE_DIR = 'scratch/cache';
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

async function getCachedPlayerDetails(client: any, playerId: string) {
  const cacheFile = path.join(CACHE_DIR, `player_${playerId}.json`);
  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }
  const details = await client.getPlayerDetails(playerId);
  if (details) {
    fs.writeFileSync(cacheFile, JSON.stringify(details));
  }
  return details;
}

function extractStatValue(stat: any, key: string): number {
  if (!stat) return 0;
  // Try different naming conventions
  const val = stat[key] || stat[key.toLowerCase()] || stat[key + 's'] || stat[key.toLowerCase() + 's'] || 0;
  return parseInt(val as string) || 0;
}

async function main() {
  const client = getStatoriumClient();
  const leagues = [
    { name: 'Premier League', id: '515' },
    { name: 'La Liga', id: '558' },
    { name: 'Bundesliga', id: '511' },
    { name: 'Serie A', id: '521' },
    { name: 'Ligue 1', id: '519' }
  ];

  for (const league of leagues) {
    console.log(`\n=== ${league.name} ===`);
    try {
      const standings = await client.getStandings(league.id);
      if (!standings || standings.length === 0) {
        console.log(`No standings for ${league.name}`);
        continue;
      }

      for (const team of standings.slice(0, 5)) { // Limit to top 5 teams for testing
        const tid = team.teamID.toString();
        process.stdout.write(`Fetching ${team.teamName}... `);
        const players = await client.getPlayersByTeam(tid, league.id);
        
        const playerStats = [];
        for (const p of players) {
          const details = await getCachedPlayerDetails(client, p.playerID.toString());
          if (details && details.stat) {
            // Find current season stats
            const currentStat = details.stat.find((s: any) => s.seasonID === league.id || s.seasonName?.includes('2025'));
            if (currentStat) {
              const goals = extractStatValue(currentStat, 'Goals');
              const assists = extractStatValue(currentStat, 'Assist');
              playerStats.push({
                name: p.fullName,
                goals,
                assists,
                total: goals + assists
              });
            }
          }
        }

        // Sort by goals then assists
        playerStats.sort((a, b) => b.goals - a.goals || b.assists - a.assists);
        const top2Scorers = playerStats.slice(0, 2);

        // Sort by assists then goals
        playerStats.sort((a, b) => b.assists - a.assists || b.goals - a.goals);
        const top2Assists = playerStats.slice(0, 2);

        console.log(`Done.`);
        console.log(`  Top Scorers: ${top2Scorers.map(p => `${p.name} (${p.goals} G, ${p.assists} A)`).join(', ')}`);
        console.log(`  Top Assists: ${top2Assists.map(p => `${p.name} (${p.goals} G, ${p.assists} A)`).join(', ')}`);
      }
    } catch (e) {
      console.error(`Error processing ${league.name}:`, e);
    }
  }
}

main();
