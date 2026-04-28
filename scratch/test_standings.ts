import { StatoriumClient } from '../src/lib/statorium/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testStandings() {
  const apiKey = process.env.STATORIUM_API_KEY;
  const client = new StatoriumClient(apiKey!);
  
  try {
    console.log("Fetching standings for 521...");
    const standings = await client.getStandings("521");
    console.log(`Found ${standings.length} teams.`);
    if (standings.length > 0) {
      console.log(`Example: ${standings[0].teamName}`);
    }
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

testStandings();
