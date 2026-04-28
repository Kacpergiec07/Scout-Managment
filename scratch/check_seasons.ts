
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const leagueId = '1'; // PL
  const url = `https://api.statorium.com/api/v1/leagues/${leagueId}/?apikey=${process.env.STATORIUM_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('League:', data.league?.leagueName);
    console.log('Seasons:', JSON.stringify(data.league?.seasons, null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
