import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function testWithUA() {
  const url = `${BASE_URL}/players/?q=Olise&apikey=${API_KEY}`;
  console.log(`Testing with UA: ${url}`);
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log(`Success! Found ${res.data.players?.length || 0} players.`);
  } catch (e: any) {
    console.log(`Failed: ${e.response?.status || e.message}`);
  }
}

testWithUA();
