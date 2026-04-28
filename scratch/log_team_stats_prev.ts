
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const teamId = '3'; // Liverpool
  const seasonId = '343'; 
  const url = `https://api.statorium.com/api/v1/teams/${teamId}/stats/${seasonId}/?apikey=${process.env.STATORIUM_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Full data:', JSON.stringify(data, (key, value) => {
      if (Array.isArray(value) && value.length > 5) return `Array(${value.length})`;
      return value;
    }, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
