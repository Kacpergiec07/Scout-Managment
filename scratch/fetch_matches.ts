import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function fetchMatches(seasonId: string) {
  const url = `${BASE_URL}/matches/?season_id=${seasonId}&apikey=${API_KEY}`;
  console.log(`Fetching: ${url}`);
  const res = await axios.get(url);
  return res.data.calendar?.matchdays || [];
}

async function run() {
  try {
    const matchdays = await fetchMatches("521");
    console.log(`Found ${matchdays.length} matchdays.`);
    if (matchdays.length > 0) {
      const firstMatch = matchdays[0].matches?.[0];
      if (firstMatch) {
        console.log(`Match: ${firstMatch.homeParticipant?.participantName} vs ${firstMatch.awayParticipant?.participantName}`);
        console.log(`Match ID: ${firstMatch.matchID}`);
      }
    }
  } catch (e: any) {
    console.error("Error:", e.response?.status || e.message);
  }
}

run();
