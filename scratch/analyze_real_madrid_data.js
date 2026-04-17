import { StatoriumClient } from '../lib/statorium/client.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');
  try {
    const teamId = '37';
    const seasonId = '558';

    console.log('='.repeat(100));
    console.log('STEP 1: RAW API RESPONSE FROM STATORIUM FOR REAL MADRID');
    console.log('='.repeat(100));
    console.log('Team ID:', teamId);
    console.log('Season ID:', seasonId);
    console.log('');

    const players = await client.getPlayersByTeam(teamId, seasonId);
    console.log(`Total players returned: ${players.length}`);
    console.log('');

    // Show full raw JSON of first 3 players
    console.log('='.repeat(100));
    console.log('FULL RAW JSON OF FIRST 3 PLAYERS');
    console.log('='.repeat(100));
    players.slice(0, 3).forEach((player, i) => {
      console.log(`\n--- PLAYER ${i + 1} ---`);
      console.log(JSON.stringify(player, null, 2));
    });

    // Show all available fields across all players
    console.log('\n' + '='.repeat(100));
    console.log('ALL AVAILABLE FIELDS ACROSS ALL PLAYERS');
    console.log('='.repeat(100));
    const allFields = new Set();
    const allSubFields = new Map();

    players.forEach(player => {
      Object.keys(player).forEach(key => {
        allFields.add(key);
        if (typeof player[key] === 'object' && player[key] !== null) {
          const subKeys = Object.keys(player[key]);
          allSubFields.set(key, subKeys);
        }
      });
    });

    console.log('Top-level fields:', Array.from(allFields).sort());
    console.log('\nSub-fields by object:');
    allSubFields.forEach((subKeys, parentKey) => {
      console.log(`  ${parentKey}: [${subKeys.join(', ')}]`);
    });

    // Analyze position data
    console.log('\n' + '='.repeat(100));
    console.log('POSITION ANALYSIS');
    console.log('='.repeat(100));
    const positionData = players.map(p => ({
      name: p.fullName,
      position: p.position,
      additionalInfoPosition: p.additionalInfo?.position,
      playerNumber: p.playerNumber,
      playerDeparted: p.playerDeparted
    }));

    console.log('Position data for all players:');
    positionData.forEach(p => {
      console.log(`  ${p.name.padEnd(30)} | position: ${String(p.position).padEnd(15)} | additionalInfo.position: ${String(p.additionalInfoPosition).padEnd(15)} | number: ${String(p.playerNumber).padEnd(5)} | departed: ${p.playerDeparted}`);
    });

    // Count by position
    console.log('\nPosition counts:');
    const positionCounts = {};
    players.forEach(player => {
      const pos = player.position || player.additionalInfo?.position || 'Unknown';
      positionCounts[pos] = (positionCounts[pos] || 0) + 1;
    });
    Object.entries(positionCounts).sort((a, b) => b[1] - a[1]).forEach(([pos, count]) => {
      console.log(`  ${pos}: ${count}`);
    });

    // Check for any status/active fields
    console.log('\n' + '='.repeat(100));
    console.log('FIELDS THAT COULD IDENTIFY FIRST-TEAM PLAYERS VS RESERVES');
    console.log('='.repeat(100));

    const potentialFilteringFields = [
      'playerDeparted',
      'playerNumber',
      'position',
      'additionalInfo',
      'currentTeam',
      'stats',
      'season_stats',
      'performance',
      'matchesPlayed',
      'minutesPlayed',
      'goals',
      'assists'
    ];

    potentialFilteringFields.forEach(field => {
      const hasField = players.some(p => p[field] !== undefined && p[field] !== null);
      const sampleValue = hasField ? players.find(p => p[field] !== undefined && p[field] !== null)?.[field] : 'N/A';
      console.log(`  ${field}: ${hasField ? 'YES' : 'NO'} | Sample: ${JSON.stringify(sampleValue).substring(0, 100)}`);
    });

    // Check playerDeparted values
    console.log('\n' + '='.repeat(100));
    console.log('PLAYER DEPARTED VALUES');
    console.log('='.repeat(100));
    const departedValues = {};
    players.forEach(player => {
      const departed = player.playerDeparted;
      departedValues[departed] = (departedValues[departed] || 0) + 1;
    });
    Object.entries(departedValues).forEach(([value, count]) => {
      console.log(`  playerDeparted="${value}": ${count} players`);
    });

    // Show players with playerDeparted != "0"
    console.log('\nPlayers with playerDeparted != "0":');
    const departedPlayers = players.filter(p => p.playerDeparted !== "0");
    if (departedPlayers.length > 0) {
      departedPlayers.forEach(p => {
        console.log(`  ${p.fullName} (departed: ${p.playerDeparted})`);
      });
    } else {
      console.log('  None found');
    }

    console.log('\n' + '='.repeat(100));
    console.log('ANALYSIS COMPLETE');
    console.log('='.repeat(100));

  } catch (e) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack);
  }
}

test();
