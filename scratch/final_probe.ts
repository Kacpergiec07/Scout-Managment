import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;

async function probe() {
  const sid = "521"; // Bundesliga 2025/26
  const urls = [
    `https://api.statorium.com/api/v1/scorers/${sid}/?apikey=${API_KEY}`,
    `https://api.statorium.com/api/v1/scorers/?season_id=${sid}&apikey=${API_KEY}`,
    `https://api.statorium.com/v1/scorers/${sid}/?apikey=${API_KEY}`,
    `https://api.statorium.com/v1/scorers/?season_id=${sid}&apikey=${API_KEY}`,
  ];

  for (const url of urls) {
    try {
      console.log(`Probing: ${url}`);
      const res = await axios.get(url);
      console.log(`  Success! Found ${res.data.scorers?.length || 0} scorers.`);
      if (res.data.scorers?.length > 0) return;
    } catch (e: any) {
      console.log(`  Failed: ${e.response?.status || e.message}`);
    }
  }
}

probe();
