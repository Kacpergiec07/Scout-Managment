import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function searchPlayers(q: string) {
  const url = `${BASE_URL}/players/?q=${encodeURIComponent(q)}&apikey=${API_KEY}`;
  console.log(`Searching: ${url}`);
  const res = await axios.get(url);
  return res.data.players || [];
}

async function run() {
  try {
    const players = await searchPlayers("Bayern");
    console.log(`Found ${players.length} players for "Bayern".`);
    if (players.length > 0) {
      console.log(`Example: ${players[0].fullName} (ID: ${players[0].playerID})`);
    }
  } catch (e: any) {
    console.error("Error:", e.response?.status || e.message);
  }
}

run();
