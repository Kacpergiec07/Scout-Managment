
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const name = 'Haaland';
  const url = `https://api.statorium.com/api/v1/search/players/?name=${name}&apikey=${process.env.STATORIUM_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Search results count:', data.players?.length || 0);
    if (data.players?.length > 0) {
      console.log('First result:', JSON.stringify(data.players[0], null, 2));
    }
  } catch (e) {
    console.error(e);
  }
}

main();
