import { StatoriumClient } from '../lib/statorium/client.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');
  try {
    // Real Madrid team ID is typically 541 in Statorium
    const teamId = '541';
    const seasonId = '558'; // La Liga

    console.log('='.repeat(80));
    console.log('TESTING REAL MADRID RAW API DATA');
    console.log('='.repeat(80));
    console.log('Team ID:', teamId);
    console.log('Season ID:', seasonId);
    console.log('');

    // Get raw players data
    console.log('Fetching raw players data from /teams/541/squad/558/...');
    const players = await client.getPlayersByTeam(teamId, seasonId);
    console.log('Total players returned:', players.length);
    console.log('');

    // Show full JSON of the first player
    if (players.length > 0) {
      console.log('='.repeat(80));
      console.log('FULL RAW JSON OF FIRST PLAYER');
      console.log('='.repeat(80));
      console.log(JSON.stringify(players[0], null, 2));
      console.log('');
    }

    // Show all available field names from all players
    console.log('='.repeat(80));
    console.log('ALL AVAILABLE FIELDS ACROSS ALL PLAYERS');
    console.log('='.repeat(80));
    const allFields = new Set();
    players.forEach(player => {
      Object.keys(player).forEach(key => allFields.add(key));
    });
    console.log(Array.from(allFields).sort());
    console.log('');

    // Show position distribution
    console.log('='.repeat(80));
    console.log('POSITION DISTRIBUTION');
    console.log('='.repeat(80));
    const positionCounts = {};
    players.forEach(player => {
      const pos = player.position || player.additionalInfo?.position || 'Unknown';
      positionCounts[pos] = (positionCounts[pos] || 0) + 1;
    });
    Object.entries(positionCounts).sort((a, b) => b[1] - a[1]).forEach(([pos, count]) => {
      console.log(`${pos}: ${count}`);
    });
    console.log('');

    // Show sample of 5 players with key fields
    console.log('='.repeat(80));
    console.log('SAMPLE OF 5 PLAYERS WITH KEY FIELDS');
    console.log('='.repeat(80));
    players.slice(0, 5).forEach((player, i) => {
      console.log(`\n--- Player ${i + 1} ---`);
      console.log('playerID:', player.playerID);
      console.log('fullName:', player.fullName);
      console.log('position:', player.position);
      console.log('additionalInfo.position:', player.additionalInfo?.position);
      console.log('matchesPlayed:', player.matchesPlayed);
      console.log('minutesPlayed:', player.minutesPlayed);
      console.log('goals:', player.goals);
      console.log('assists:', player.assists);
      console.log('stats:', player.stats ? 'Yes' : 'No');
      console.log('season_stats:', player.season_stats ? 'Yes' : 'No');
      console.log('performance:', player.performance ? 'Yes' : 'No');
      if (player.stats) {
        console.log('stats content:', JSON.stringify(player.stats, null, 2));
      }
    });

  } catch (e) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack);
  }
}

test();
