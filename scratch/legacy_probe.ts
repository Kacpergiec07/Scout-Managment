import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;

async function probeLegacy() {
  const actions = ['scorers', 'topscorers', 'standing', 'standings', 'team', 'teams', 'squad'];
  const sid = "521";
  
  for (const a of actions) {
    const url = `https://api.statorium.com/v1/?a=${a}&seasonID=${sid}&apikey=${API_KEY}`;
    try {
      console.log(`Probing Legacy: ${url}`);
      const res = await axios.get(url);
      console.log(`  Success! Keys: ${Object.keys(res.data)}`);
      if (res.data.scorers || res.data.top_scorers || res.data.topscorers) {
        console.log(`  Found scorers!`);
      }
    } catch (e: any) {
      console.log(`  Failed: ${e.response?.status || e.message}`);
    }
  }
}

probeLegacy();
