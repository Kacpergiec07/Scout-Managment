
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const seasonId = '343'; // 2024-25 PL
  const url = `https://api.statorium.com/api/v1/scorers/${seasonId}/?apikey=${process.env.STATORIUM_API_KEY}`;
  try {
    const response = await fetch(url);
    console.log('Status 343:', response.status);
    const text = await response.text();
    console.log('Response 343:', text.substring(0, 500));
  } catch (e) {
    console.error(e);
  }
}

main();
