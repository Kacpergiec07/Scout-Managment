import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function testFetch() {
  const sid = "521";
  const url = `${BASE_URL}/scorers/${sid}/?apikey=${API_KEY}`;
  console.log(`Fetching with native fetch: ${url}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`Failed: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log(`Response: ${text.substring(0, 200)}`);
    } else {
      const data: any = await response.json();
      console.log(`Success! Found ${data.scorers?.length || 0} scorers.`);
    }
  } catch (e: any) {
    console.log(`Error: ${e.message}`);
  }
}

testFetch();
