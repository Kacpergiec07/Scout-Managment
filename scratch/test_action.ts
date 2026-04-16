import { getTopLeaguesClubsAction } from '../app/actions/statorium';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  try {
    const clubs = await getTopLeaguesClubsAction();
    console.log(`Fetched ${clubs.length} clubs`);
    console.log(clubs.slice(0, 3));
  } catch(e) {
    console.error(e);
  }
}

test();
