import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/v1';

async function listSeasons() {
  const leagues = [
    { name: 'Premier League', id: 1 },
    { name: 'La Liga', id: 3 },
    { name: 'Bundesliga', id: 4 },
    { name: 'Serie A', id: 2 },
    { name: 'Ligue 1', id: 5 }
  ];

  for (const league of leagues) {
    console.log(`\nLeague: ${league.name} (ID: ${league.id})`);
    try {
      const response = await axios.get(`${BASE_URL}/seasons/?league_id=${league.id}&apikey=${API_KEY}`);
      const seasons = response.data.seasons || [];
      seasons.slice(0, 5).forEach((s: any) => {
        console.log(`  - Season: ${s.seasonName} (ID: ${s.seasonID})`);
      });
    } catch (error) {
      console.error(`  Error fetching seasons for league ${league.id}`);
    }
  }
}

listSeasons();
