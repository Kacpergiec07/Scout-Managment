import { StatoriumClient } from '../lib/statorium/client.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');

  const teamsToCheck = [
    { name: 'Real Madrid', teamId: '37', seasonId: '558' },  // La Liga
    { name: 'Manchester City', teamId: '9', seasonId: '515' }, // Premier League
    { name: 'Bayern Munich', teamId: '157', seasonId: '521' }, // Bundesliga
  ];

  console.log('='.repeat(100));
  console.log('STEP 1: RAW API RESPONSE COMPARISON ACROSS TEAMS');
  console.log('='.repeat(100));
  console.log('');

  for (const { name, teamId, seasonId } of teamsToCheck) {
    console.log('='.repeat(100));
    console.log(`${name} (Team ID: ${teamId}, Season: ${seasonId})`);
    console.log('='.repeat(100));

    try {
      const players = await client.getPlayersByTeam(teamId, seasonId);
      console.log(`Total players: ${players.length}`);

      // Show position distribution
      const positionCounts = {};
      players.forEach(player => {
        const pos = player.additionalInfo?.position || 'Unknown';
        positionCounts[pos] = (positionCounts[pos] || 0) + 1;
      });

      console.log('Position distribution:');
      Object.entries(positionCounts).sort((a, b) => b[1] - a[1]).forEach(([pos, count]) => {
        console.log(`  ${pos}: ${count}`);
      });

      // Show sample player with all fields
      if (players.length > 0) {
        console.log('\nSample player (first in list):');
        console.log(JSON.stringify(players[0], null, 2));
      }

      // Check for stats/appearances data
      const hasStats = players.some(p => p.stats || p.season_stats || p.performance || p.matchesPlayed || p.minutesPlayed);
      console.log(`\nHas stats/appearances data: ${hasStats ? 'YES' : 'NO'}`);

      // Check playerNumber distribution
      const numbers = players.map(p => parseInt(p.playerNumber) || 0).filter(n => n > 0);
      if (numbers.length > 0) {
        console.log(`Jersey numbers: Min=${Math.min(...numbers)}, Max=${Math.max(...numbers)}, Avg=${(numbers.reduce((a,b) => a+b, 0) / numbers.length).toFixed(1)}`);
      }

    } catch (e) {
      console.error(`Error fetching ${name}:`, e.message);
    }

    console.log('');
  }

  console.log('='.repeat(100));
  console.log('ANALYSIS COMPLETE');
  console.log('='.repeat(100));
}

test();
