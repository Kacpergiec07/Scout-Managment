
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const teamId = '9'; // Arsenal
  const seasonId = '515';
  const urls = [
    `https://api.statorium.com/api/v1/teams/${teamId}/stats/${seasonId}/?apikey=${process.env.STATORIUM_API_KEY}`,
    `https://api.statorium.com/api/v1/teams/${teamId}/statistics/${seasonId}/?apikey=${process.env.STATORIUM_API_KEY}`,
    `https://api.statorium.com/api/v1/seasons/${seasonId}/teams/${teamId}/stats/?apikey=${process.env.STATORIUM_API_KEY}`,
    `https://api.statorium.com/api/v1/teams_stats/${teamId}/?season_id=${seasonId}&apikey=${process.env.STATORIUM_API_KEY}`
  ];

  for (const url of urls) {
    try {
      console.log('Testing URL:', url);
      const response = await fetch(url);
      console.log('Status:', response.status);
      if (response.status === 200) {
        const data = await response.json();
        console.log('Keys:', Object.keys(data));
        // If it has player stats, it's perfect
        break;
      }
    } catch (e) {
      console.error(e);
    }
  }
}

main();
