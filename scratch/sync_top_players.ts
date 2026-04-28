import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';
const CACHE_DIR = path.join(process.cwd(), 'scratch', 'cache');
const SEASONS = ["515", "558", "511", "521", "519"];

async function syncPlayers() {
  const files = fs.readdirSync(CACHE_DIR).filter(f => f.startsWith('player_') && f.endsWith('.json'));
  const playerIds: Set<string> = new Set();

  console.log("Identifying top players to sync...");
  const results: any[] = [];
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(CACHE_DIR, file), 'utf-8');
      const p = JSON.parse(content);
      if (!p.stat) continue;
      for (const s of p.stat) {
        if (SEASONS.includes(String(s.season_id))) {
          results.push({
            id: String(p.playerID || p.id),
            team: s.team_name,
            season: s.season_id,
            score: parseInt(s.Goals || "0") + parseInt(s.Assist || "0")
          });
        }
      }
    } catch (e) {}
  }

  // Pick top 2 per team
  const teams: Record<string, any[]> = {};
  results.forEach(r => {
    const key = `${r.team}_${r.season}`;
    if (!teams[key]) teams[key] = [];
    teams[key].push(r);
  });

  const idsToSync: string[] = [];
  for (const key in teams) {
    const sorted = teams[key].sort((a, b) => b.score - a.score);
    sorted.slice(0, 2).forEach(p => idsToSync.push(p.id));
  }

  const uniqueIds = Array.from(new Set(idsToSync));
  console.log(`Found ${uniqueIds.length} unique players to refresh.`);

  for (let i = 0; i < uniqueIds.length; i++) {
    const id = uniqueIds[i];
    console.log(`[${i+1}/${uniqueIds.length}] Refreshing player ${id}...`);
    try {
      const url = `${BASE_URL}/players/${id}/?apikey=${API_KEY}&showstat=true`;
      const res = await axios.get(url);
      if (res.data.player) {
        const filePath = path.join(CACHE_DIR, `player_${id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(res.data.player, null, 2));
        console.log(`  Updated ${res.data.player.fullName}`);
      }
    } catch (e: any) {
      console.error(`  Failed for ${id}: ${e.message}`);
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log("\nSync complete!");
}

syncPlayers();
