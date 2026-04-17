import { getTeamDetailsAction } from '../app/actions/statorium.ts';
import { StatoriumClient } from '../lib/statorium/client.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function analyzeTeam(teamName, teamId, seasonId) {
  console.log('='.repeat(100));
  console.log(`${teamName.toUpperCase()} (Team ID: ${teamId}, Season: ${seasonId})`);
  console.log('='.repeat(100));

  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');

  // Helper function to calculate age from birthdate
  const calculateAge = (birthdate) => {
    if (!birthdate) return 0;
    const match = birthdate.match(/(\d{2})-(\d{2})-(\d{4})/);
    if (!match) return 0;
    const birthYear = parseInt(match[3]);
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  try {
    // Get raw data first for detailed analysis
    const rawPlayers = await client.getPlayersByTeam(teamId, seasonId);
    console.log(`\n📊 Total players from API: ${rawPlayers.length}`);

    if (rawPlayers.length === 0) {
      console.log('❌ No player data available');
      console.log('');
      return null;
    }

    // Get filtered team details
    const teamDetails = await getTeamDetailsAction(teamId, seasonId);

    if (!teamDetails) {
      console.log('❌ Failed to get team details');
      console.log('');
      return null;
    }

    console.log(`✅ Filtered players (18-35, active): ${teamDetails.players?.length || 0}`);
    console.log(`🎯 Formation: ${teamDetails.formation}`);

    if (teamDetails.players && teamDetails.players.length > 0) {
      // Count positions
      const positions = { 'Goalkeeper': 0, 'Defender': 0, 'Midfielder': 0, 'Atacker': 0, 'Unknown': 0 };
      const ages = [];
      const youthPlayers = [];

      teamDetails.players.forEach((player) => {
        const pos = player.additionalInfo?.position || 'Unknown';
        if (positions[pos] !== undefined) {
          positions[pos]++;
        } else {
          positions['Unknown']++;
        }

        // Extract age
        const birthdate = player.additionalInfo?.birthdate;
        const age = calculateAge(birthdate);
        if (age > 0) {
          ages.push(age);
        }

        // Identify youth/reserve players (age under 21, high jersey numbers)
        const jersey = parseInt(player.playerNumber) || 0;
        if (age > 0 && age < 21 && jersey > 25) {
          youthPlayers.push({
            name: player.fullName,
            age: age,
            jersey: jersey,
            position: pos
          });
        }
      });

      console.log('\n📋 Position Counts:');
      console.log(`  GK: ${positions.Goalkeeper}`);
      console.log(`  DF: ${positions.Defender}`);
      console.log(`  MF: ${positions.Midfielder}`);
      console.log(`  FW: ${positions.Atacker}`);

      if (ages.length > 0) {
        const avgAge = (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1);
        const minAge = Math.min(...ages);
        const maxAge = Math.max(...ages);
        console.log(`\n👤 Age Stats: Min=${minAge}, Max=${maxAge}, Avg=${avgAge}`);
      }

      // Show youth/reserve players
      if (youthPlayers.length > 0) {
        console.log(`\n⚠️ Youth/Reserve Players (Age < 21, Jersey > 25):`);
        youthPlayers.forEach((player) => {
          console.log(`  ${player.name} (Age: ${player.age}, #${player.jersey}, ${player.position})`);
        });
      } else {
        console.log(`\n✅ No youth/reserve players detected`);
      }

      // Show starting XI
      console.log(`\n⚽ Starting XI (${teamDetails.formation}):`);
      teamDetails.players.slice(0, 11).forEach((player, i) => {
        const pos = player.additionalInfo?.position || 'Unknown';
        const jersey = player.playerNumber || '?';
        const birthdate = player.additionalInfo?.birthdate;
        const age = calculateAge(birthdate);

        console.log(`  ${i + 1}. ${player.fullName} (${pos}, Age: ${age}, #${jersey})`);
      });

      return {
        name: teamDetails.teamName,
        totalPlayers: teamDetails.players?.length || 0,
        formation: teamDetails.formation,
        positions: positions,
        youthCount: youthPlayers.length
      };
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return null;
  }

  console.log('');
  return null;
}

async function main() {
  console.log('='.repeat(100));
  console.log('COMPREHENSIVE TEAM ANALYSIS (All Top Teams)');
  console.log('='.repeat(100));
  console.log('');

  const teamsToTest = [
    { name: 'Real Madrid', teamId: '37', seasonId: '558' },
    { name: 'Barcelona', teamId: '23', seasonId: '558' },
    { name: 'Manchester City', teamId: '14', seasonId: '515' },
    { name: 'Arsenal', teamId: '9', seasonId: '515' },
    { name: 'Liverpool', teamId: '11', seasonId: '515' },
    { name: 'Bayern Munich', teamId: '157', seasonId: '521' },
    { name: 'PSG', teamId: '85', seasonId: '519' },
    { name: 'Inter Milan', teamId: '505', seasonId: '511' },
    { name: 'Juventus', teamId: '496', seasonId: '511' },
    { name: 'AC Milan', teamId: '503', seasonId: '511' },
  ];

  const results = [];

  for (const { name, teamId, seasonId } of teamsToTest) {
    const result = await analyzeTeam(name, teamId, seasonId);
    if (result) {
      results.push(result);
    }
  }

  // Summary table
  console.log('='.repeat(100));
  console.log('SUMMARY TABLE');
  console.log('='.repeat(100));
  console.log('Team'.padEnd(20) + 'Players'.padEnd(10) + 'Formation'.padEnd(12) + 'GK  DF  MF  FW  Youth');
  console.log('-'.repeat(100));

  results.forEach(result => {
    const teamName = result.name.substring(0, 19);
    const players = String(result.totalPlayers).padEnd(10);
    const formation = result.formation.padEnd(12);
    const gk = String(result.positions.Goalkeeper || 0).padEnd(3);
    const df = String(result.positions.Defender || 0).padEnd(3);
    const mf = String(result.positions.Midfielder || 0).padEnd(3);
    const fw = String(result.positions.Atacker || 0).padEnd(3);
    const youth = String(result.youthCount).padEnd(5);

    console.log(`${teamName.padEnd(20)}${players}${formation}${gk} ${df} ${mf} ${fw} ${youth}`);
  });

  console.log('='.repeat(100));
  console.log('ANALYSIS COMPLETE');
  console.log('='.repeat(100));
}

main();
