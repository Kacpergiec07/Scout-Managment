const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function searchPlayer(q) {
  const apiKey = process.env.STATORIUM_API_KEY;
  const url = `https://api.statorium.com/api/v1/players/?q=${q}&apikey=${apiKey}`;
  
  try {
    const resp = await axios.get(url);
    console.log("Found players:", resp.data.players?.length || 0);
    if (resp.data.players && resp.data.players.length > 0) {
      console.log("First player:", JSON.stringify(resp.data.players[0], null, 2));
    }
  } catch (e) {
    console.error(e.message);
  }
}

searchPlayer("Lewandowski");
