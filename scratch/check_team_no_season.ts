
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const teamId = '9'; // Arsenal
  const url = `https://api.statorium.com/api/v1/teams/${teamId}/?apikey=${process.env.STATORIUM_API_KEY}`;
  try {
    const response = await fetch(url);
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response teamName:', data.team?.teamName);
    console.log('Squad length:', data.team?.players?.length || 0);
    if (data.team?.players?.length > 0) {
      console.log('First player:', data.team.players[0].fullName);
    }
  } catch (e) {
    console.error(e);
  }
}

main();
