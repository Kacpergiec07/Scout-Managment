import { StatoriumClient } from '../../lib/statorium/client.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');
  try {
    // Test with Arsenal (team ID 9)
    const teamId = '9';
    const seasonId = '515'; // Premier League

    console.log('Testing team details for team ID:', teamId);
    const teamDetails = await client.getTeamDetails(teamId);
    console.log('Team Details:', JSON.stringify(teamDetails, null, 2));

    // Also test with season ID
    const players = await client.getPlayersByTeam(teamId, seasonId);
    console.log('Players:', JSON.stringify(players.slice(0, 3), null, 2));

  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
