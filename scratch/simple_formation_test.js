import { getTeamDetailsAction } from '../app/actions/statorium';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testSingleTeam() {
  console.log('Testing Real Madrid formation...');
  const team = await getTeamDetailsAction('37', '558');
  console.log('Team:', team?.teamName);
  console.log('Formation:', team?.formation);
  console.log('Players:', team?.players?.length);
}

testSingleTeam();
