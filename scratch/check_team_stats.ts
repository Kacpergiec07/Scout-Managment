
import { getStatoriumClient } from '../src/lib/statorium/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const client = getStatoriumClient();
  const seasonId = '515'; // Premier League
  const teamId = '1'; // West Ham
  try {
    const stats = await client.getTeamStats(teamId, seasonId);
    console.log('Team Stats sample:', JSON.stringify(stats, null, 2).substring(0, 1000));
  } catch (e) {
    console.error(e);
  }
}

main();
