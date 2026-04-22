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
    const data = await get(`https://api.statorium.com/api/v1/matches/?apikey=${API_KEY}&season_id=558`);
    const matches = data.calendar.matchdays.flatMap(md => md.matches);
    console.log(`Total matches: ${matches.length}`);
    
    // Check one match structure
    if (matches.length > 0) {
      console.log('Sample Match Keys:', Object.keys(matches[0]));
      console.log('Sample Match Home:', matches[0].homeID, matches[0].homeName);
    }
  } catch (e) {
    console.error(e.message);
  }
}

test();
