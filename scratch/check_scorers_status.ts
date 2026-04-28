
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const seasonId = '515'; // PL
  const url = `https://api.statorium.com/api/v1/scorers/${seasonId}/?apikey=${process.env.STATORIUM_API_KEY}`;
  try {
    const response = await fetch(url);
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text.substring(0, 500));
  } catch (e) {
    console.error(e);
  }
}

main();
