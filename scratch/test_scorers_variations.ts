
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const seasonId = '515';
  // Try different variations of the URL
  const urls = [
    `https://api.statorium.com/api/v1/scorers/${seasonId}?apikey=${process.env.STATORIUM_API_KEY}`,
    `https://api.statorium.com/api/v1/scorers/?season_id=${seasonId}&apikey=${process.env.STATORIUM_API_KEY}`,
    `https://api.statorium.com/api/v1/seasons/${seasonId}/scorers/?apikey=${process.env.STATORIUM_API_KEY}`
  ];

  for (const url of urls) {
    try {
      console.log('Testing URL:', url);
      const response = await fetch(url);
      console.log('Status:', response.status);
      if (response.status === 200) {
        const data = await response.json();
        console.log('Keys:', Object.keys(data));
        break;
      }
    } catch (e) {
      console.error(e);
    }
  }
}

main();
