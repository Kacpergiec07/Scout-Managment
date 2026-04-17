import { getRealFormation } from '../lib/statorium/formation-service';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testFormations() {
  const teams = [
    { name: 'Real Madrid', teamId: '37', seasonId: '558' },
    { name: 'Arsenal', teamId: '9', seasonId: '515' },
    { name: 'Barcelona', teamId: '23', seasonId: '558' },
    { name: 'Liverpool', teamId: '3', seasonId: '515' },
    { name: 'Manchester City', teamId: '4', seasonId: '515' },
    { name: 'PSG', teamId: '66', seasonId: '519' },
    { name: 'Bayern Munich', teamId: '47', seasonId: '521' },
    { name: 'Inter Milan', teamId: '108', seasonId: '511' },
    { name: 'AC Milan', teamId: '96', seasonId: '511' },
    { name: 'Juventus', teamId: '105', seasonId: '511' }
  ];

  console.log('='.repeat(100));
  console.log('TESTING REAL FORMATIONS WITH FIXED POSITION PATH');
  console.log('='.repeat(100));
  console.log('');

  for (const team of teams) {
    console.log(`Testing ${team.name}...`);
    try {
      const formation = await getRealFormation(team.teamId, team.seasonId);
      console.log(`✅ Formation: ${formation}`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('');
  console.log('='.repeat(100));
  console.log('TEST COMPLETE');
  console.log('='.repeat(100));
}

testFormations();
