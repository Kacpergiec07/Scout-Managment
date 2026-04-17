import { getTeamDetailsAction } from '../app/actions/statorium.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  console.log('='.repeat(100));
  console.log('TESTING NEW FORMATION LOGIC (Jersey 1-25 + Age 18+ + Active)');
  console.log('='.repeat(100));
  console.log('');

  const teamsToTest = [
    { name: 'Real Madrid', teamId: '37', seasonId: '558' },
    { name: 'Manchester City/Arsenal', teamId: '9', seasonId: '515' },
    { name: 'Barcelona', teamId: '23', seasonId: '558' },
    { name: 'Liverpool', teamId: '11', seasonId: '515' },
    { name: 'Bayern Munich', teamId: '157', seasonId: '521' },
  ];

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
        const jerseyNumbers = [];

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

          // Extract jersey number
          const jerseyNum = parseInt(player.playerNumber);
          if (!isNaN(jerseyNum)) {
            jerseyNumbers.push(jerseyNum);
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

        if (jerseyNumbers.length > 0) {
          const minJersey = Math.min(...jerseyNumbers);
          const maxJersey = Math.max(...jerseyNumbers);
          const avgJersey = (jerseyNumbers.reduce((a, b) => a + b, 0) / jerseyNumbers.length).toFixed(1);
          console.log(`Jersey Number Stats: Min=${minJersey}, Max=${maxJersey}, Avg=${avgJersey}`);
        }

        // Show starting XI
        console.log('\n⚽ Starting XI:');
        teamDetails.players.slice(0, 11).forEach((player, i) => {
          const pos = player.additionalInfo?.position || 'Unknown';
          const jersey = player.playerNumber || '?';
          console.log(`  ${i + 1}. ${player.fullName} (${pos}, #${jersey})`);
        });
      }

    } catch (e) {
      console.error(`❌ Error: ${e.message}`);
    }

    console.log('');
  }

  console.log('='.repeat(100));
  console.log('TEST COMPLETE');
  console.log('='.repeat(100));
}

test();
