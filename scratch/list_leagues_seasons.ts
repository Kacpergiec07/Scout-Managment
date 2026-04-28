import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function listLeaguesAndSeasons() {
  try {
    console.log("Fetching leagues...");
    const res = await axios.get(`${BASE_URL}/leagues/?apikey=${API_KEY}`);
    console.log("Leagues response keys:", Object.keys(res.data));
    const leagues = res.data.leagues || [];
    console.log(`Found ${leagues.length} leagues.`);
    if (leagues.length > 0) console.log("Example league:", JSON.stringify(leagues[0]).substring(0, 200));

    // Filter for Top 5 leagues
    const top5Names = ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1'];
    const top5 = leagues.filter((l: any) => {
      const name = l.leagueName || l.name || "";
      return top5Names.some(t => name.includes(t));
    });

    for (const l of top5) {
      console.log(`\nLeague: ${l.leagueName} (ID: ${l.leagueID})`);
      const sRes = await axios.get(`${BASE_URL}/seasons/?league_id=${l.leagueID}&apikey=${API_KEY}`);
      const seasons = sRes.data.seasons || [];
      seasons.slice(0, 3).forEach((s: any) => {
        console.log(`  - ${s.seasonName} (ID: ${s.seasonID})`);
      });
    }
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

listLeaguesAndSeasons();
