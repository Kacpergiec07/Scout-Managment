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
    const url = `https://api.statorium.com/api/v1/matches/?apikey=${API_KEY}&season_id=558&participant_id=23`;
    const data = await get(url);
    
    // Check if matches are in calendar or matches array
    const matches = data.matches || (data.calendar?.matchdays?.flatMap(md => md.matches)) || [];
    
    console.log(`Found ${matches.length} matches for Barcelona`);
    matches.slice(0, 10).forEach(m => {
       console.log(`${m.matchDate}: ${m.homeName} ${m.homeScore}:${m.awayScore} ${m.awayName} (ID: ${m.matchID})`);
    });
  } catch (e) {
    console.error(e.message);
  }
}

test();
