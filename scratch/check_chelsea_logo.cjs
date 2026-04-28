const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function checkChelsea() {
  const apiKey = process.env.STATORIUM_API_KEY;
  const url = `https://api.statorium.com/api/v1/teams/8/?apikey=${apiKey}`;
  
  try {
    const resp = await axios.get(url);
    console.log(JSON.stringify(resp.data, null, 2));
  } catch (e) {
    console.error(e.message);
  }
}

checkChelsea();
