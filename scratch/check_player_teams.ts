
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const playerId = '1994'; // Mbappe
  const url = `https://api.statorium.com/api/v1/players/${playerId}/?apikey=${process.env.STATORIUM_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.player && data.player.teams) {
      console.log('Teams type:', typeof data.player.teams);
      if (Array.isArray(data.player.teams)) {
        console.log('Teams count:', data.player.teams.length);
        if (data.player.teams.length > 0) {
          console.log('First team sample:', JSON.stringify(data.player.teams[0], null, 2));
        }
      } else {
        console.log('Teams keys:', Object.keys(data.player.teams));
      }
    }
  } catch (e) {
    console.error(e);
  }
}

main();
