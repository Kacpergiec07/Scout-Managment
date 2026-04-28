import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function probeScorers() {
  const seasons = [521, 385, 515, 343, 558, 511, 519];
  for (const sid of seasons) {
    try {
      const res = await axios.get(`${BASE_URL}/scorers/${sid}/?apikey=${API_KEY}`);
      const count = res.data.scorers ? res.data.scorers.length : 0;
      console.log(`Season ${sid}: ${count} scorers found.`);
      if (count > 0) {
        console.log(`  Example: ${res.data.scorers[0].playerName} - ${res.data.scorers[0].goals} goals`);
      }
    } catch (e) {
      console.log(`Season ${sid}: Error`);
    }
  }
}

probeScorers();
