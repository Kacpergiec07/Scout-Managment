const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function inspectPlayer(id) {
  const apiKey = process.env.STATORIUM_API_KEY;
  const url = `https://api.statorium.com/api/v1/players/${id}/?apikey=${apiKey}`;
  
  try {
    const resp = await axios.get(url);
    console.log("Keys:", Object.keys(resp.data));
    if (resp.data.player) {
       console.log("Player keys:", Object.keys(resp.data.player));
    }
    console.log(JSON.stringify(resp.data, null, 2).substring(0, 2000));
  } catch (e) {
    console.error(e.message);
  }
}

inspectPlayer(188545); // Lewandowski
