import { getTeamDetailsAction } from '../app/actions/statorium.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  console.log('='.repeat(100));
  console.log('TESTING FINAL FORMATION LOGIC (Age 18-35 + Active Only - No Jersey Filter)');
  console.log('='.repeat(100));
  console.log('');

  const teamsToTest = [
    { name: 'Real Madrid', teamId: '37', seasonId: '558' },
    { name: 'Arsenal', teamId: '9', seasonId: '515' },
    { name: 'Barcelona', teamId: '23', seasonId: '558' },
    { name: 'Manchester City', teamId: '14', seasonId: '515' },
    { name: 'Liverpool', teamId: '11', seasonId: '515' },
    { name: 'Bayern Munich', teamId: '157', seasonId: '521' },
    { name: 'PSG', teamId: '85', seasonId: '519' },
    { name: 'Inter Milan', teamId: '505', seasonId: '511' },
  ];

  const results = [];

  for (const { name, teamId, seasonId } of teamsToTest) {
    console.log('='.repeat(100));
    console.log(`${name} (Team ID: ${teamId})`);
    console.log('='.repeat(100));

    try {
      const teamDetails = await getTeamDetailsAction(teamId, seasonId);

      if (!teamDetails) {
        console.log('❌ Failed to fetch team details');
        console.log('');
        continue;
      }

      console.log(`Team Name: ${teamDetails.teamName}`);
      console.log(`Formation: ${teamDetails.formation}`);
      console.log(`Total Players: ${teamDetails.players?.length || 0}`);

      // Analyze player composition
      if (teamDetails.players && teamDetails.players.length > 0) {
        console.log('\n📊 Player Analysis:');

        const positions = { 'Goalkeeper': 0, 'Defender': 0, 'Midfielder': 0, 'Atacker': 0, 'Unknown': 0 };
        const ages = [];

        teamDetails.players.forEach((player) => {
          const pos = player.additionalInfo?.position || 'Unknown';
          if (positions[pos] !== undefined) {
            positions[pos]++;
          } else {
            positions['Unknown']++;
          }

          // Extract age
          const birthdate = player.additionalInfo?.birthdate;
          if (birthdate) {
            const match = birthdate.match(/(\d{4})/);
            if (match) {
              const birthYear = parseInt(match[1]);
              const age = new Date().getFullYear() - birthYear;
              ages.push(age);
            }
          }
        });

        console.log('\nPosition Distribution:');
        Object.entries(positions).forEach(([pos, count]) => {
          if (count > 0) {
            console.log(`  ${pos}: ${count}`);
          }
        });

        if (ages.length > 0) {
          const avgAge = (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1);
          const minAge = Math.min(...ages);
          const maxAge = Math.max(...ages);
          console.log(`\nAge Stats: Min=${minAge}, Max=${maxAge}, Avg=${avgAge}`);
        }

        // Show starting XI
        console.log('\n⚽ Starting XI:');
        teamDetails.players.slice(0, 11).forEach((player, i) => {
          const pos = player.additionalInfo?.position || 'Unknown';
          const jersey = player.playerNumber || '?';
          console.log(`  ${i + 1}. ${player.fullName} (${pos}, #${jersey})`);
        });

        // Store results for summary
        results.push({
          name: teamDetails.teamName,
          formation: teamDetails.formation,
          totalPlayers: teamDetails.players?.length || 0,
          positions: positions
        });
      }

    } catch (e) {
      console.error(`❌ Error: ${e.message}`);
    }

    console.log('');
  }

  // Summary table
  console.log('='.repeat(100));
  console.log('SUMMARY TABLE');
  console.log('='.repeat(100));
  console.log('Team'.padEnd(25) + 'Players'.padEnd(10) + 'Formation'.padEnd(12) + 'GK  DF  MF  FW');
  console.log('-'.repeat(100));

  results.forEach(result => {
    const teamName = result.name.substring(0, 24);
    const players = String(result.totalPlayers).padEnd(10);
    const formation = result.formation.padEnd(12);
    const gk = String(result.positions.Goalkeeper || 0).padEnd(3);
    const df = String(result.positions.Defender || 0).padEnd(3);
    const mf = String(result.positions.Midfielder || 0).padEnd(3);
    const fw = String(result.positions.Atacker || 0).padEnd(3);

    console.log(`${teamName.padEnd(25)}${players}${formation}${gk} ${df} ${mf} ${fw}`);
  });

  console.log('='.repeat(100));
  console.log('TEST COMPLETE');
  console.log('='.repeat(100));
}

test();
