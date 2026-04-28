import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function listSeasons() {
  try {
    const res = await axios.get(`${BASE_URL}/seasons/?apikey=${API_KEY}`);
    console.log(`Found ${res.data.seasons?.length || 0} seasons.`);
    if (res.data.seasons) {
      res.data.seasons.slice(0, 10).forEach((s: any) => {
        console.log(`- ${s.seasonName} (ID: ${s.seasonID}, League: ${s.leagueID})`);
      });
    }
  } catch (e: any) {
    console.log(`Error: ${e.response?.status || e.message}`);
  }
}

listSeasons();
