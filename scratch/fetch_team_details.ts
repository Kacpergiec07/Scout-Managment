import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function fetchTeam(id: string) {
  const url = `${BASE_URL}/teams/${id}/?apikey=${API_KEY}`;
  console.log(`Fetching: ${url}`);
  const res = await axios.get(url);
  return res.data.team;
}

async function run() {
  try {
    const t = await fetchTeam("47"); // Bayern
    console.log(`Team: ${t.teamName}`);
    console.log(`Players count: ${t.players?.length || 0}`);
    if (t.players && t.players.length > 0) {
      console.log(`Example: ${t.players[0].fullName}`);
    }
  } catch (e: any) {
    console.error("Error:", e.response?.status || e.message);
  }
}

run();
