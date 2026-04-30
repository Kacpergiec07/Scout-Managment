const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
let apiKey = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/STATORIUM_API_KEY=(.*)/);
  if (match) apiKey = match[1].trim().replace(/["']/g, '');
}

if (!apiKey) {
  console.error('STATORIUM_API_KEY not found');
  process.exit(1);
}

const query = 'Scalvini';
// Test WITH v1/ and ?a=players parameter
const url = `https://api.statorium.com/v1/?a=players&q=${query}&apikey=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`Search Results for "${query}" (v1/ ?a=players):`);
    console.log('Status Code:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Results count:', json.players ? json.players.length : 0);
    } catch (e) {
      console.log('Raw data snippet:', data.substring(0, 200));
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
