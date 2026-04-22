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
    const data = await get(url);
    
    const matches = data.calendar.matchdays.flatMap(md => md.matches);
    const barcaMatches = matches.filter(m => 
      (m.homeName?.includes('Barcelona') || m.awayName?.includes('Barcelona'))
    );
    
    console.log(`Found ${barcaMatches.length} Barca matches`);
    barcaMatches.slice(0, 5).forEach(m => {
      console.log(`${m.matchDate}: ${m.homeName} vs ${m.awayName} (ID: ${m.matchID})`);
    });
    
    if (barcaMatches.length > 0) {
       const mid = barcaMatches[0].matchID;
       const details = await get(`https://api.statorium.com/api/v1/matches/${mid}/?apikey=${API_KEY}&details=1`);
       fs.writeFileSync('scratch/barca_details_test.json', JSON.stringify(details, null, 2));
       console.log(`Saved details for ${mid} to scratch/barca_details_test.json`);
    }
  } catch (e) {
    console.error(e.message);
  }
}

test();
