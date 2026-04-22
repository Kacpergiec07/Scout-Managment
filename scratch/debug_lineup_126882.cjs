const https = require('https');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.STATORIUM_API_KEY;
const MATCH_ID = '126882';

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
    const url = `https://api.statorium.com/api/v1/matches/${MATCH_ID}/?apikey=${API_KEY}&details=1`;
    console.log(`Fetching ${url}`);
    const data = await get(url);
    const match = data.match;
    
    fs.writeFileSync('scratch/match_126882_raw.json', JSON.stringify(data, null, 2));
    
    match.participants.forEach((p, idx) => {
      console.log(`\nParticipant ${idx}: ${p.participantName} (ID: ${p.participantID})`);
      console.log(`Squad Keys: ${Object.keys(p.squad || {})}`);
      if (p.squad) {
        console.log(`Lineup Length: ${p.squad.lineup?.length || 0}`);
        console.log(`Subs Length: ${p.squad.subs?.length || 0}`);
        if (p.squad.lineup && p.squad.lineup.length > 0) {
          const player = p.squad.lineup[0];
          console.log(`First Player: ${player.playerFullName}`);
          console.log(`Position ID: ${player.positionID}`);
          console.log(`Position:`, JSON.stringify(player.position));
          console.log(`Additional Info Position:`, JSON.stringify(player.additionalInfo?.position));
        }
      }
    });
  } catch (e) {
    console.error(e.message);
  }
}

test();
