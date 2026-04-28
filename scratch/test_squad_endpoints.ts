
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config({ path: '.env.local' });

async function main() {
  const apiKey = process.env.STATORIUM_API_KEY;
  const tid = '47'; // Bayern
  try {
    const url = `https://api.statorium.com/api/v1/teams/${tid}/?apikey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
