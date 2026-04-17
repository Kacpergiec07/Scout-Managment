const API_KEY = 'd35d1fc1aabe0671e1e80ee5a6296bef';
const LEAGUES = [
  { id: '515', name: 'Premier League' },
  { id: '558', name: 'La Liga' },
  { id: '511', name: 'Serie A' },
  { id: '521', name: 'Bundesliga' },
  { id: '519', name: 'Ligue 1' },
];
const fs = await import('fs');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchAll() {
  const photoMap = {};

  for (const league of LEAGUES) {
    process.stderr.write(`Fetching ${league.name}...\n`);
    try {
      const res = await fetch(`https://api.statorium.com/api/v1/standings/${league.id}/?apikey=${API_KEY}`);
      const data = await res.json();
      const standings = data.standings || data.season?.standings || [];

      for (const team of standings) {
        const teamId = team.teamID?.toString();
        if (!teamId) continue;
        try {
          await sleep(300);
          const tr = await fetch(`https://api.statorium.com/api/v1/teams/${teamId}/?season_id=${league.id}&apikey=${API_KEY}`);
          const td = await tr.json();
          const players = td.team?.players || [];
          for (const p of players) {
            if (p.photo && p.fullName && p.playerDeparted !== '1') {
              photoMap[p.fullName] = p.photo;
            }
          }
          process.stderr.write(`  ${players.length} players from ${team.teamName || team.teamMiddleName}\n`);
        } catch (e) {
          process.stderr.write(`  Error for team ${teamId}: ${e.message}\n`);
        }
      }
    } catch (e) {
      process.stderr.write(`Error for ${league.name}: ${e.message}\n`);
    }
  }

  const entries = Object.entries(photoMap)
    .filter(([, url]) => url && url.startsWith('http'))
    .map(([name, url]) => `  "${name.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}": "${url}"`)
    .join(',\n');

  const output = `const ELITE_PLAYER_PHOTOS: Record<string, string> = {\n${entries}\n};`;
  fs.default.writeFileSync('scratch/photo_output_clean.ts', output, 'utf8');
  process.stderr.write(`Done! ${Object.keys(photoMap).length} players written.\n`);
}

fetchAll();
