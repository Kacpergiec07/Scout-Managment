const API_KEY = 'd35d1fc1aabe0671e1e80ee5a6296bef';
const LEAGUES = [
  { id: '515', name: 'Premier League' },
  { id: '558', name: 'La Liga' },
  { id: '511', name: 'Serie A' },
  { id: '521', name: 'Bundesliga' },
  { id: '519', name: 'Ligue 1' },
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchAll() {
  const photoMap = {}; // name -> url
  const playerIdMap = {}; // name -> playerID

  for (const league of LEAGUES) {
    console.error(`Fetching standings for ${league.name}...`);
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
              playerIdMap[p.fullName] = p.playerID;
            }
          }
          console.error(`  Got ${players.length} players from ${team.teamName || team.teamMiddleName}`);
        } catch (e) {
          console.error(`  Error for team ${teamId}: ${e.message}`);
        }
      }
    } catch (e) {
      console.error(`Error for league ${league.name}: ${e.message}`);
    }
  }

  // Output as TypeScript constant
  const entries = Object.entries(photoMap)
    .filter(([, url]) => url && url.startsWith('http'))
    .map(([name, url]) => `  "${name.replace(/"/g, '\\"')}": "${url}"`)
    .join(',\n');

  console.log(`const ELITE_PLAYER_PHOTOS: Record<string, string> = {\n${entries}\n};`);
}

fetchAll();
