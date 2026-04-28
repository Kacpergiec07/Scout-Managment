
import { getStatoriumClient } from '../src/lib/statorium/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const client = getStatoriumClient();
  const seasonId = '515'; // Premier League
  const teamId = '1'; // Example team (Arsenal is usually 1 or something)
  try {
    const players = await client.getPlayersByTeam(teamId, seasonId);
    console.log('Players sample (first 2):', JSON.stringify(players.slice(0, 2), null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
