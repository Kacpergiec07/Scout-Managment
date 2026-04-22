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
    const data = await get(`https://api.statorium.com/api/v1/teams/37/squad/558/?apikey=${API_KEY}`);
    const players = data.team?.players || data.players || [];
    console.log(`Found ${players.length} players`);
    if (players.length > 0) {
      console.log('Sample Player Stats:', JSON.stringify(players[0].stat));
    }
  } catch (e) {
    console.error(e.message);
  }
}

test();
