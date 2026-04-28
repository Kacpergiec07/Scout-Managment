import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function testPrevScorers() {
  const sid = "385"; // Bundesliga 2024/25
  const url = `${BASE_URL}/scorers/${sid}/?apikey=${API_KEY}`;
  try {
    console.log(`Fetching scorers for ${sid}: ${url}`);
    const res = await axios.get(url);
    const scorers = res.data.scorers || [];
    console.log(`Found ${scorers.length} scorers.`);
    if (scorers.length > 0) {
      console.log(`Example: ${scorers[0].playerName} (${scorers[0].goals} goals)`);
    }
  } catch (e: any) {
    console.log(`Failed: ${e.response?.status || e.message}`);
  }
}

testPrevScorers();
