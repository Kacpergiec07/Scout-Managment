import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function fetchPlayer(id: string) {
  const url = `${BASE_URL}/players/${id}/?apikey=${API_KEY}&showstat=true`;
  console.log(`Fetching: ${url}`);
  const res = await axios.get(url);
  return res.data.player;
}

async function run() {
  try {
    const p = await fetchPlayer("6123"); // Olise
    console.log(`Player: ${p.fullName}`);
    console.log(`Stats count: ${p.stat?.length || 0}`);
    if (p.stat && p.stat.length > 0) {
      p.stat.forEach((s: any) => {
        console.log(`  Season: ${s.season_id}, Team: ${s.team_name} (ID: ${s.team_id}), Goals: ${s.Goals}, Assists: ${s.Assist}`);
      });
    }
  } catch (e: any) {
    console.error("Error:", e.response?.status || e.message);
  }
}

run();
