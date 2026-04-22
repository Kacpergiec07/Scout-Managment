const https = require('https');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.STATORIUM_API_KEY;

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function test() {
  try {
    const url = `https://api.statorium.com/api/v1/standings/558/?apikey=${API_KEY}`;
    const data = await get(url);
    const standings = data.standings || data.season?.standings || [];
    
    standings.forEach(s => {
      console.log(`${s.teamID}: ${s.teamName} / ${s.teamMiddleName}`);
    });
  } catch (e) {
    console.error(e.message);
  }
}

test();
