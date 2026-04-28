
import { getStatoriumClient } from '../src/lib/statorium/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const client = getStatoriumClient();
  const seasonId = '515'; // PL
  const teamId = '9'; // Arsenal
  try {
    const players = await client.getPlayersByTeam(teamId, seasonId);
    if (players.length > 0) {
      const p = players[0];
      console.log('Player:', p.fullName);
      console.log('Stat field exists:', !!p.stat);
      if (p.stat && p.stat.length > 0) {
        console.log('Sample stat:', JSON.stringify(p.stat[0], null, 2));
      }
    }
  } catch (e) {
    console.error(e);
  }
}

main();
