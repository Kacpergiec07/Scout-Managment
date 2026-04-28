
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const playerId = '1994'; // Mbappe
  const url = `https://api.statorium.com/api/v1/players/${playerId}/?apikey=${process.env.STATORIUM_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Player:', data.player?.fullName);
    console.log('Stats count:', data.player?.stat?.length || 0);
    if (data.player?.stat?.length > 0) {
      const s = data.player.stat[0];
      console.log('Sample stat:', s.seasonName, 'Goals:', s.Goals, 'Goal:', s.Goal, 'Assist:', s.Assist);
    }
  } catch (e) {
    console.error(e);
  }
}

main();
