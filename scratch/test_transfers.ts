import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function testTransfers() {
  const sid = "521";
  const url = `${BASE_URL}/transfers/?season_id=${sid}&apikey=${API_KEY}`;
  try {
    console.log(`Fetching transfers: ${url}`);
    const res = await axios.get(url);
    const transfers = res.data.transfers || [];
    console.log(`Found ${transfers.length} transfers.`);
    if (transfers.length > 0) {
      console.log(`Example: ${transfers[0].playerName} (ID: ${transfers[0].playerID})`);
    }
  } catch (e: any) {
    console.log(`Failed: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
  }
}

testTransfers();
