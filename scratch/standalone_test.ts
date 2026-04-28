import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function fetchStandings(seasonId: string) {
  const url = `${BASE_URL}/standings/${seasonId}/?apikey=${API_KEY}`;
  console.log(`Fetching: ${url}`);
  const res = await axios.get(url);
  const data = res.data;
  
  let list: any[] = [];
  if (data.standings) list = data.standings;
  else if (data.season?.standings) list = data.season.standings;
  
  return list;
}

async function run() {
  try {
    const list = await fetchStandings("521");
    console.log(`Found ${list.length} teams.`);
    if (list.length > 0) {
      console.log(`Example: ${list[0].teamName}`);
    }
  } catch (e: any) {
    console.error("Error:", e.response?.status || e.message);
  }
}

run();
