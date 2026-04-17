import { getRealFormation, clearFormationCache } from '../lib/statorium/formation-service';
import { StatoriumClient } from '../lib/statorium/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testCorrectedFormation(teamName, teamId, seasonId) {
  console.log('='.repeat(120));
  console.log(`TESTING CORRECTED FORMATION: ${teamName}`);
  console.log('='.repeat(120));
  console.log('');

  // Clear cache to get fresh data
  clearFormationCache();

  try {
    const formation = await getRealFormation(teamId, seasonId);
    console.log(`✅ Corrected Formation: ${formation}`);
    console.log('');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.log('');
  }
}

async function testAllCorrectedFormations() {
  const teams = [
    { name: 'Chelsea', teamId: '8', seasonId: '515' },
    { name: 'Barcelona', teamId: '23', seasonId: '558' },
    { name: 'Atletico Madrid', teamId: '39', seasonId: '558' },
    { name: 'Bayern Munich', teamId: '47', seasonId: '521' }
  ];

  console.log('TESTING CORRECTED FORMATIONS WITH SMART RECLASSIFICATION RULES');
  console.log('');
  console.log('RULES APPLIED:');
  console.log('1. Max 3 attackers - excess reclassified as midfielders');
  console.log('2. Max 4 midfielders (5 if defenders <= 3) - excess reclassified as attackers');
  console.log('3. Max 5 defenders - excess reclassified as midfielders');
  console.log('');

  for (const team of teams) {
    await testCorrectedFormation(team.name, team.teamId, team.seasonId);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('='.repeat(120));
  console.log('TEST COMPLETE');
  console.log('='.repeat(120));
}

testAllCorrectedFormations();
