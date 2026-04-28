const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function searchTeam(q) {
  const apiKey = process.env.STATORIUM_API_KEY;
  const url = `https://api.statorium.com/api/v1/teams/?q=${q}&apikey=${apiKey}`;
  
  try {
    const resp = await axios.get(url);
    console.log("Status:", resp.status);
    console.log("Data keys:", Object.keys(resp.data));
    if (resp.data.teams) {
       console.log("Teams found:", resp.data.teams.length);
       console.log("First team:", JSON.stringify(resp.data.teams[0], null, 2));
    }
  } catch (e) {
    console.error(e.message);
  }
}

searchTeam("Chelsea");
