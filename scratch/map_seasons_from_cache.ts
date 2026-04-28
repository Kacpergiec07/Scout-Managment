
import * as fs from 'fs';
import * as path from 'path';

const CACHE_DIR = 'scratch/cache';

async function main() {
  const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.json'));
  const seasonMap: Record<string, Set<string>> = {};

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, file), 'utf8'));
      const player = data.player || data;
      if (player.stat) {
        player.stat.forEach((s: any) => {
          const sid = String(s.season_id);
          const sname = s.season_name;
          if (!seasonMap[sid]) seasonMap[sid] = new Set();
          seasonMap[sid].add(sname);
        });
      }
    } catch (e) {}
  }

  console.log('--- Season IDs in Cache ---');
  Object.keys(seasonMap).sort().forEach(sid => {
    console.log(`${sid}: ${Array.from(seasonMap[sid]).join(', ')}`);
  });
}

main();
