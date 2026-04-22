import { StatoriumClient } from './lib/statorium/client.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkLeagues() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY);
  try {
    const leagues = await client.getLeagues();
    console.log('Leagues:', JSON.stringify(leagues, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkLeagues();
