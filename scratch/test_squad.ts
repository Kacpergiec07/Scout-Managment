import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function fetchSquad(teamId: string, seasonId: string) {
  const url = `${BASE_URL}/teams/${teamId}/squad/${seasonId}/?apikey=${API_KEY}`;
  console.log(`Fetching: ${url}`);
  const res = await axios.get(url);
  return res.data;
}

async function run() {
  try {
    const data = await fetchSquad("47", "521");
    const players = data.team?.players || data.players || [];
    console.log(`Found ${players.length} players for Bayern.`);
    if (players.length > 0) {
      console.log(`Example: ${players[0].fullName} (Departed: ${players[0].playerDeparted})`);
    }
  } catch (e: any) {
    console.error("Error:", e.response?.status || e.message);
  }
}

run();
