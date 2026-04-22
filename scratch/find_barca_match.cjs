const https = require('https');
const fs = require('fs');
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
    const url = `https://api.statorium.com/api/v1/matches/?apikey=${API_KEY}&season_id=558`;
    console.log(`Fetching ${url}`);
    const data = await get(url);
    
    const matches = data.calendar.matchdays.flatMap(md => md.matches);
    const barcaMatch = matches.find(m => 
      (m.homeName?.includes('Barcelona') || m.awayName?.includes('Barcelona')) &&
      m.matchDate === '2026-03-22'
    );
    
    if (barcaMatch) {
      console.log(`Found Barca Match: ID ${barcaMatch.matchID}`);
      const detailsUrl = `https://api.statorium.com/api/v1/matches/${barcaMatch.matchID}/?apikey=${API_KEY}&details=1`;
      const details = await get(detailsUrl);
      fs.writeFileSync('scratch/barca_match_details.json', JSON.stringify(details, null, 2));
      console.log('Saved to scratch/barca_match_details.json');
    } else {
      console.log('Barca match not found for 2026-03-22');
    }
  } catch (e) {
    console.error(e.message);
  }
}

test();
