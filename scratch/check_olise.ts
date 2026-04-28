
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config({ path: '.env.local' });

async function main() {
  const apiKey = process.env.STATORIUM_API_KEY;
  const queries = ['Michael Olise', 'Olise', 'Michael Akpovie Olise'];
  
  for (const query of queries) {
    try {
      const searchUrl = `https://api.statorium.com/api/v1/players/?apikey=${apiKey}&q=${encodeURIComponent(query)}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      console.log(`Results for "${query}":`, searchData ? 'Found' : 'NULL');
      
      if (searchData && searchData.players) {
          console.log(JSON.stringify(searchData.players.slice(0, 3), null, 2));
      }
    } catch (e) {
      console.error(e);
    }
  }
}

main();
