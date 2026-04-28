import * as fs from 'fs';
import * as path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'scratch', 'cache');
const SEASONS = ["515", "558", "511", "521", "519"];

async function scanCache() {
  const files = fs.readdirSync(CACHE_DIR).filter(f => f.startsWith('player_') && f.endsWith('.json'));
  console.log(`Scanning ${files.length} files...`);

  const results: any[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(CACHE_DIR, file), 'utf-8');
      const p = JSON.parse(content);
      if (!p.stat) continue;

      for (const s of p.stat) {
        if (SEASONS.includes(String(s.season_id))) {
          results.push({
            id: p.playerID || p.id,
            name: p.fullName || p.playerName,
            season: s.season_id,
            team: s.team_name,
            goals: parseInt(s.Goals || "0"),
            assists: parseInt(s.Assist || "0")
          });
        }
      }
    } catch (e) {}
  }

  // Group by team and sort by goals+assists
  const teams: Record<string, any[]> = {};
  results.forEach(r => {
    const key = `${r.team} (${r.season})`;
    if (!teams[key]) teams[key] = [];
    teams[key].push(r);
  });

  console.log("\nTop Performers by Team (from Cache):");
  for (const teamKey in teams) {
    const sorted = teams[teamKey].sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists));
    console.log(`\n${teamKey}:`);
    sorted.slice(0, 2).forEach(p => {
      console.log(`  - ${p.name} (ID: ${p.id}): ${p.goals} G, ${p.assists} A`);
    });
  }
}

scanCache();
