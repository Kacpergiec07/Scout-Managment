
import { getStatoriumClient } from '../src/lib/statorium/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({ path: '.env.local' });

async function main() {
  const client = getStatoriumClient();
  const seasonId = '515'; // Premier League
  try {
    const standings = await client.getStandings(seasonId);
    fs.writeFileSync('scratch/standings_515.json', JSON.stringify(standings, null, 2));
    console.log(`Standings for ${seasonId} saved. Total teams: ${standings.length}`);
    if (standings.length > 0) {
      console.log('First team:', standings[0].teamName, 'ID:', standings[0].teamID);
    }
  } catch (e) {
    console.error(e);
  }
}

main();
