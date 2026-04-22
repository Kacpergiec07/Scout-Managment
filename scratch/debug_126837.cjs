const https = require('https');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.STATORIUM_API_KEY;
const MATCH_ID = '126837';

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
    const details = await get(`https://api.statorium.com/api/v1/matches/${MATCH_ID}/?apikey=${API_KEY}&details=1`);
    fs.writeFileSync('scratch/barca_rayo_details.json', JSON.stringify(details, null, 2));
    console.log('Saved');
    
    const p0 = details.match.homeParticipant;
    console.log(`Home: ${p0.participantName}`);
    console.log(`Squad Keys: ${Object.keys(p0.squad || {})}`);
    if (p0.squad && p0.squad.lineup) {
      console.log(`Lineup Length: ${p0.squad.lineup.length}`);
      if (p0.squad.lineup.length > 0) {
        console.log(`Sample Player: ${p0.squad.lineup[0].playerFullName}`);
        console.log(`Position Data:`, JSON.stringify(p0.squad.lineup[0].position));
        console.log(`Additional Info:`, JSON.stringify(p0.squad.lineup[0].additionalInfo));
      }
    }
  } catch (e) {
    console.error(e.message);
  }
}

test();
