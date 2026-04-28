
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const teamId = '9'; // Arsenal
  const seasonId = '515';
  const url = `https://api.statorium.com/api/v1/teams/${teamId}/stats/${seasonId}/?apikey=${process.env.STATORIUM_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.team) {
      console.log('Team name:', data.team.teamName);
      console.log('Team keys:', Object.keys(data.team));
      if (data.team.players) {
        console.log('Players count in stats:', data.team.players.length);
        if (data.team.players.length > 0) {
          console.log('First player stat:', JSON.stringify(data.team.players[0], null, 2));
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}

main();
