const axios = require('axios');

const API_KEY = 'd35d1fc1aabe0671e1e80ee5a6296bef';
const QUERY = 'De Bruyne';

async function search() {
    try {
        const response = await axios.get(`https://api.statorium.com/v1/players/search/?query=${QUERY}&apikey=${API_KEY}`);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error(error.message);
    }
}

search();
