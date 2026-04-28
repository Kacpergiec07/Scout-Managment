import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function findPreviousSeasons() {
  const leagues = [1, 2, 3, 4, 5]; // PL, La Liga, Bundesliga, Serie A, Ligue 1
  for (const lid of leagues) {
    try {
      const res = await axios.get(`${BASE_URL}/seasons/?league_id=${lid}&apikey=${API_KEY}`);
      const seasons = res.data.seasons || [];
      console.log(`League ${lid}:`);
      seasons.slice(0, 5).forEach((s: any) => {
        console.log(`  - ${s.seasonName} (ID: ${s.seasonID})`);
      });
    } catch (e: any) {
      console.log(`League ${lid}: Error ${e.response?.status || e.message}`);
    }
  }
}

findPreviousSeasons();
