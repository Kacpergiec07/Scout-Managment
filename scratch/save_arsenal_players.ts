
import { getStatoriumClient } from '../src/lib/statorium/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({ path: '.env.local' });

async function main() {
  const client = getStatoriumClient();
  const seasonId = '515'; // PL
  const teamId = '9'; // Arsenal
  try {
    const players = await client.getPlayersByTeam(teamId, seasonId);
    fs.writeFileSync('scratch/arsenal_players.json', JSON.stringify(players, null, 2));
    console.log('Saved Arsenal players to scratch/arsenal_players.json');
  } catch (e) {
    console.error(e);
  }
}

main();
