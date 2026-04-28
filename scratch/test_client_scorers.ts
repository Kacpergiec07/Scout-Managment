import { StatoriumClient } from '../src/lib/statorium/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testClient() {
  const apiKey = process.env.STATORIUM_API_KEY;
  if (!apiKey) {
    console.error("No API key");
    return;
  }
  const client = new StatoriumClient(apiKey);
  
  const seasons = ["521", "515", "558", "511", "519"];
  for (const sid of seasons) {
    try {
      console.log(`Testing Season ${sid}...`);
      const scorers = await client.getTopScorers(sid);
      console.log(`  Found ${scorers.length} scorers.`);
      if (scorers.length > 0) {
        console.log(`  First: ${scorers[0].playerName} (${scorers[0].goals} goals)`);
      }
    } catch (e: any) {
      console.error(`  Error for ${sid}:`, e.message);
    }
  }
}

testClient();
