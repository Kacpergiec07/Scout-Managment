
import { getStatoriumClient } from '../src/lib/statorium/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const client = getStatoriumClient();
  const seasonId = '515'; // Premier League
  try {
    const scorers = await client.getTopScorers(seasonId);
    console.log('Scorers sample:', JSON.stringify(scorers.slice(0, 5), null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
