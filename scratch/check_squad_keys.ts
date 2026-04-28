
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const teamId = '3'; // Liverpool
  const seasonId = '343'; 
  const url = `https://api.statorium.com/api/v1/teams/${teamId}/squad/${seasonId}/?apikey=${process.env.STATORIUM_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Top level keys:', Object.keys(data));
    if (data.team) {
      console.log('Team keys:', Object.keys(data.team));
      // Look for any key that looks like players/squad
      const squadKeys = Object.keys(data.team).filter(k => k.toLowerCase().includes('player') || k.toLowerCase().includes('squad'));
      console.log('Potential squad keys:', squadKeys);
    }
  } catch (e) {
    console.error(e);
  }
}

main();
