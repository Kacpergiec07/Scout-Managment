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
    const data = await get(`https://api.statorium.com/api/v1/matches/?apikey=${API_KEY}&season_id=558`);
    const matches = data.calendar.matchdays.flatMap(md => md.matches);
    const dayMatches = matches.filter(m => m.matchDate === '2026-03-22');
    
    console.log(`Matches on 2026-03-22: ${dayMatches.length}`);
    dayMatches.forEach(m => {
       console.log(`${m.homeParticipant.participantName} vs ${m.awayParticipant.participantName} (ID: ${m.matchID})`);
    });
  } catch (e) {
    console.error(e.message);
  }
}

test();
