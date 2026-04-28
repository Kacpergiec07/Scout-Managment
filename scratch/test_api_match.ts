
import { StatoriumClient } from '../src/lib/statorium/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');
  try {
     const standings = await client.getStandings('558');
     console.log('Standing rows:', standings.length);
     if (standings.length > 0) {
        const s = standings[0];
        console.log('Standing row 1 sample keys:', Object.keys(s));
        console.log('Team ID:', s.teamID, 'Team ID (lower):', (s as any).team_id);
        console.log('Team Name:', s.teamName);
     }
  } catch (e) {
    console.error('Test failed:', e);
  }
}

test();
