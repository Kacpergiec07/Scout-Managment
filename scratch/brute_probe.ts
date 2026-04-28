import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_KEY = process.env.STATORIUM_API_KEY;
const BASE_URL = 'https://api.statorium.com/api/v1';

async function bruteProbe() {
  const sid = "521";
  const lid = "3";
  const urls = [
    `${BASE_URL}/scorers/${sid}`,
    `${BASE_URL}/scorers/${sid}/`,
    `${BASE_URL}/scorers/${lid}/${sid}`,
    `${BASE_URL}/scorers/${lid}/${sid}/`,
    `${BASE_URL}/league/${lid}/scorers/${sid}`,
    `${BASE_URL}/league/${lid}/scorers/${sid}/`,
    `${BASE_URL}/scorers/?season_id=${sid}`,
    `${BASE_URL}/scorers/?league_id=${lid}&season_id=${sid}`,
    `${BASE_URL}/scorers/?seasonID=${sid}`,
  ];

  for (const u of urls) {
    const finalUrl = u.includes('?') ? `${u}&apikey=${API_KEY}` : `${u}/?apikey=${API_KEY}`;
    try {
      console.log(`Probing: ${finalUrl}`);
      const res = await axios.get(finalUrl);
      console.log(`  SUCCESS!`);
      return;
    } catch (e: any) {
      console.log(`  Failed: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
    }
  }
}

bruteProbe();
