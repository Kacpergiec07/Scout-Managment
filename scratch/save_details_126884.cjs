const https = require('https');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.STATORIUM_API_KEY;
const MATCH_ID = '126884';

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
    const data = await get(`https://api.statorium.com/api/v1/matches/${MATCH_ID}/?apikey=${API_KEY}&details=1`);
    fs.writeFileSync('scratch/details_126884.json', JSON.stringify(data, null, 2));
    console.log('Saved');
  } catch (e) {
    console.error(e.message);
  }
}

test();
