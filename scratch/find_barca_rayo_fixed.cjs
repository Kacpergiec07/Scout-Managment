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
    const barcaRayo = matches.find(m => 
      (m.homeParticipant.participantID === '23' && m.awayParticipant.participantID === '29') ||
      (m.homeParticipant.participantID === '29' && m.awayParticipant.participantID === '23')
    );
    
    if (barcaRayo) {
      console.log(`Found Barca-Rayo: ${barcaRayo.matchDate} (ID: ${barcaRayo.matchID})`);
      const details = await get(`https://api.statorium.com/api/v1/matches/${barcaRayo.matchID}/?apikey=${API_KEY}&details=1`);
      fs.writeFileSync('scratch/barca_rayo_details.json', JSON.stringify(details, null, 2));
    }
  } catch (e) {
    console.error(e.message);
  }
}

test();
