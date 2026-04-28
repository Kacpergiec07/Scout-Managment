
import { getStatoriumClient } from '../src/lib/statorium/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({ path: '.env.local' });

async function main() {
  const client = getStatoriumClient();
  const seasonId = '515'; // Premier League
  const teamId = '1'; // West Ham
  try {
    const url = `https://api.statorium.com/api/v1/teams/${teamId}/squad/${seasonId}/?apikey=${process.env.STATORIUM_API_KEY}&showstat=1`;
    const response = await fetch(url);
    const data = await response.json();
    fs.writeFileSync('scratch/squad_full.json', JSON.stringify(data, null, 2));
    console.log('Saved full squad JSON to scratch/squad_full.json');
  } catch (e) {
    console.error(e);
  }
}

main();
