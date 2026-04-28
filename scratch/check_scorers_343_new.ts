
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const seasonId = '343'; // 2024-25
  const url = `https://api.statorium.com/api/v1/seasons/${seasonId}/scorers/?apikey=${process.env.STATORIUM_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Season name:', data.season?.seasonName);
    const scorers = data.season?.groups?.[0]?.scorers || data.season?.scorers || [];
    console.log('Scorers count:', scorers.length);
    if (scorers.length > 0) {
      console.log('First scorer:', JSON.stringify(scorers[0], null, 2));
    }
  } catch (e) {
    console.error(e);
  }
}

main();
