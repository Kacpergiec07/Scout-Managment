
import { StatoriumClient } from './lib/statorium/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');
  try {
    const leagues = await client.getLeagues();
    console.log('Leagues:', JSON.stringify(leagues, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
