import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function fetchMatchDetails(matchId: string) {
  const url = `${BASE_URL}/matches/${matchId}/?apikey=${API_KEY}`;
  console.log(`Fetching: ${url}`);
  const res = await axios.get(url);
  return res.data.match;
}

async function run() {
  try {
    const m = await fetchMatchDetails("123412");
    console.log(`Match: ${m.homeParticipant?.participantName} vs ${m.awayParticipant?.participantName}`);
    console.log(`Has Lineup: ${!!m.lineup}`);
    if (m.lineup) {
      console.log(`Home Players: ${m.lineup.home?.length || 0}`);
      if (m.lineup.home?.[0]) console.log(`Example Home Player: ${m.lineup.home[0].playerName} (ID: ${m.lineup.home[0].playerID})`);
    }
  } catch (e: any) {
    console.error("Error:", e.response?.status || e.message);
  }
}

run();
