
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const seasonId = '343'; // 2024-25
  const url = `https://api.statorium.com/api/v1/standings/${seasonId}/?apikey=${process.env.STATORIUM_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Season name:', data.season?.seasonName);
    const standings = data.season?.groups?.[0]?.standings || data.season?.standings || [];
    console.log('Teams count:', standings.length);
    if (standings.length > 0) {
      const team = standings[0];
      console.log('First team:', team.teamName, 'ID:', team.teamID);
      const squadUrl = `https://api.statorium.com/api/v1/teams/${team.teamID}/squad/${seasonId}/?apikey=${process.env.STATORIUM_API_KEY}&showstat=1`;
      const squadResp = await fetch(squadUrl);
      const squadData = await squadResp.json();
      console.log('Squad length:', squadData.team?.players?.length || 0);
    }
  } catch (e) {
    console.error(e);
  }
}

main();
