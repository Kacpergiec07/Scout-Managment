const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function inspectPlayer(id) {
  const apiKey = process.env.STATORIUM_API_KEY;
  const url = `https://api.statorium.com/api/v1/players/${id}/?apikey=${apiKey}&showstat=true`;
  
  try {
    const resp = await axios.get(url);
    const p = resp.data.player;
    console.log("Player:", p.fullName);
    if (p.stat && p.stat.length > 0) {
      console.log("First stat:", JSON.stringify(p.stat[0], null, 2));
    } else {
      console.log("No stats found");
    }
  } catch (e) {
    console.error(e.message);
  }
}

inspectPlayer(203);
