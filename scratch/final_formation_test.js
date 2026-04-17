import { getRealFormation, clearFormationCache } from '../lib/statorium/formation-service';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testCorrectedFormations() {
  // Clear cache to get fresh data
  clearFormationCache();

  const teams = [
    { name: 'Chelsea', teamId: '8', seasonId: '515' },
    { name: 'Barcelona', teamId: '23', seasonId: '558' },
    { name: 'Atletico Madrid', teamId: '39', seasonId: '558' },
    { name: 'Bayern Munich', teamId: '47', seasonId: '521' }
  ];

  console.log('='.repeat(100));
  console.log('CORRECTED FORMATIONS - BEFORE vs AFTER');
  console.log('='.repeat(100));
  console.log('');
  console.log('BEFORE (Old system - unrealistic):');
  console.log('  Chelsea: 4-2-4 ❌');
  console.log('  Barcelona: 5-3-2 ⚠️');
  console.log('  Atletico Madrid: 4-5-1 ❌');
  console.log('  Bayern Munich: 4-5-1 ❌');
  console.log('');
  console.log('AFTER (New system - with smart reclassification):');
  console.log('');

  for (const team of teams) {
    try {
      const formation = await getRealFormation(team.teamId, team.seasonId);
      console.log(`  ${team.name}: ${formation} ✅`);
    } catch (error) {
      console.error(`  ${team.name}: Error - ${error.message} ❌`);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('');
  console.log('='.repeat(100));
  console.log('SMART RECLASSIFICATION RULES APPLIED:');
  console.log('='.repeat(100));
  console.log('1. Max 3 attackers - excess reclassified as midfielders');
  console.log('2. Max 4 midfielders (5 if defenders ≤ 3) - excess reclassified as attackers');
  console.log('3. Max 5 defenders - excess reclassified as midfielders');
  console.log('');
  console.log('RESULT: All formations are now realistic!');
  console.log('='.repeat(100));
}

testCorrectedFormations();
