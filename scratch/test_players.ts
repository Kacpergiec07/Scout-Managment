import { getPlayersByClubAction } from '../app/actions/statorium';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  try {
    // 9 is Arsenal
    const players = await getPlayersByClubAction("9");
    console.log(`Fetched ${players.length} players for Arsenal`);
    console.log(players.slice(0, 3));
  } catch(e) {
    console.error(e);
  }
}

test();
