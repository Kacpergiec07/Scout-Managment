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
    const data = await get(`https://api.statorium.com/api/v1/players/1407/?apikey=${API_KEY}&showstat=true`);
    console.log('Player:', data.player.fullName);
    console.log('Stats:', JSON.stringify(data.player.stat));
  } catch (e) {
    console.error(e.message);
  }
}

test();
