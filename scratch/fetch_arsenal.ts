
import { getStatoriumClient } from '../src/lib/statorium/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({ path: '.env.local' });

async function main() {
  const client = getStatoriumClient();
  const seasonId = '515'; // Premier League
  const teamId = '9'; // Arsenal
  try {
    const url = `https://api.statorium.com/api/v1/teams/${teamId}/squad/${seasonId}/?apikey=${process.env.STATORIUM_API_KEY}&showstat=1`;
    const response = await fetch(url);
    const data = await response.json();
    fs.writeFileSync('scratch/arsenal_squad.json', JSON.stringify(data, null, 2));
    console.log('Saved Arsenal squad JSON');
    if (data.team?.players) {
       console.log('Players count:', data.team.players.length);
       const p = data.team.players[0];
       console.log('First player sample:', p.fullName, 'Stats:', p.stat);
    }
  } catch (e) {
    console.error(e);
  }
}

main();
