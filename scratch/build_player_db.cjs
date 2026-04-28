const fs = require('fs');

async function build() {
  const apiKey = process.env.STATORIUM_API_KEY || 'd35d1fc1aabe0671e1e80ee5a6296bef';
  
  const leagues = [
    { name: "La Liga", seasonId: "558" },
    { name: "Premier League", seasonId: "515" },
    { name: "Serie A", seasonId: "511" },
    { name: "Bundesliga", seasonId: "521" },
    { name: "Ligue 1", seasonId: "519" }
  ];

  const allPlayers = [];
  const playerIds = new Set();

  for (const league of leagues) {
    console.log(`Fetching standings for ${league.name}...`);
    try {
      const res = await fetch(`https://api.statorium.com/api/v1/standings/${league.seasonId}/?apikey=${apiKey}`);
      const data = await res.json();
      
      let standings = [];
      if (data.season && data.season.standings) standings = data.season.standings;
      else if (data.standings) standings = data.standings;
      
      console.log(`Found ${standings.length} teams in ${league.name}`);

      // We will batch fetch 5 teams at a time
      for (let i = 0; i < standings.length; i += 5) {
        const batch = standings.slice(i, i + 5);
        const promises = batch.map(async (standing) => {
          const teamId = standing.teamID || standing.team_id || standing.id;
          const teamName = standing.teamName || standing.teamMiddleName || standing.name;
          
          if (!teamId) return [];

          try {
            console.log(`  Fetching squad for ${teamName} (${teamId})...`);
            const teamRes = await fetch(`https://api.statorium.com/api/v1/teams/${teamId}/?season_id=${league.seasonId}&showstat=1&apikey=${apiKey}`);
            const teamData = await teamRes.json();
            return (teamData.team?.players || []).map(p => ({ p, teamName }));
          } catch (e) {
            console.error(`  Failed for team ${teamName}: ${e.message}`);
            return [];
          }
        });

        const results = await Promise.all(promises);
        for (const teamPlayers of results) {
          for (const { p, teamName } of teamPlayers) {
            if (!playerIds.has(p.playerID)) {
              playerIds.add(p.playerID);
              
              let photo = p.photo || p.image || p.playerPhoto || '';
              if (photo && !photo.startsWith('http')) {
                photo = photo.startsWith('/') ? photo : `/${photo}`;
                photo = photo.startsWith('/media/bearleague/') ? `https://api.statorium.com${photo}` : `https://api.statorium.com/media/bearleague${photo}`;
              }

              allPlayers.push({
                playerID: String(p.playerID),
                firstName: p.firstName || '',
                lastName: p.lastName || '',
                fullName: p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
                position: p.position || p.additionalInfo?.position || 'N/A',
                teamName: teamName,
                photo: photo || `https://api.statorium.com/media/bearleague/bl${p.playerID}.webp`
              });
            }
          }
        }
      }
    } catch (e) {
      console.error(`Failed to fetch league ${league.name}: ${e.message}`);
    }
  }

  fs.writeFileSync('src/lib/all-players-db.json', JSON.stringify(allPlayers, null, 2));
  console.log(`Successfully saved ${allPlayers.length} players to src/lib/all-players-db.json`);
}

build();
