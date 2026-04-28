
import { getStatoriumClient } from '../src/lib/statorium/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const client = getStatoriumClient();
  const seasonId = '515'; // PL
  const teamId = '9'; // Arsenal
  try {
    const players = await client.getPlayersByTeam(teamId, seasonId);
    console.log('Players count:', players.length);
    if (players.length > 0) {
      console.log('First player:', players[0].fullName);
    }
  } catch (e) {
    console.error(e);
  }
}

main();
