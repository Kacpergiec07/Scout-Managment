import { StatoriumClient } from '../lib/statorium/client.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');
  try {
    console.log('Searching for Real Madrid in La Liga...');

    // Get La Liga standings
    const seasonId = '558'; // La Liga
    const standings = await client.getStandings(seasonId);

    console.log('Teams in La Liga:');
    standings.slice(0, 10).forEach((team, i) => {
      console.log(`${i + 1}. ${team.teamName} (ID: ${team.teamID})`);
    });

    // Find Real Madrid
    const realMadrid = standings.find(t => t.teamName?.toLowerCase().includes('real madrid') || t.teamMiddleName?.toLowerCase().includes('real madrid'));
    if (realMadrid) {
      console.log('\nFound Real Madrid!');
      console.log('Team ID:', realMadrid.teamID);
      console.log('Team Name:', realMadrid.teamName);

      // Now get players
      console.log('\nFetching players...');
      const players = await client.getPlayersByTeam(realMadrid.teamID.toString(), seasonId);
      console.log('Total players:', players.length);

      if (players.length > 0) {
        console.log('\nFirst player full JSON:');
        console.log(JSON.stringify(players[0], null, 2));
      }
    } else {
      console.log('Real Madrid not found in standings');
    }

  } catch (e) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack);
  }
}

test();
