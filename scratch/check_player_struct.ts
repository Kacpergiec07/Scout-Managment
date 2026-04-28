
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const playerId = '1994'; // Mbappe
  const url = `https://api.statorium.com/api/v1/players/${playerId}/?apikey=${process.env.STATORIUM_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Full data keys:', Object.keys(data));
    if (data.player) {
      console.log('Player keys:', Object.keys(data.player));
      console.log('Player basic info:', data.player.fullName, data.player.teamName);
    }
    // Check if stats are outside the player object
    console.log('Other keys:', Object.keys(data).filter(k => k !== 'player'));
  } catch (e) {
    console.error(e);
  }
}

main();
