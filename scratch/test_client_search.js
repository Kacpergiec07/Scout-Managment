import { StatoriumClient } from '../lib/statorium/client.ts';

const API_KEY = 'd35d1fc1aabe0671e1e80ee5a6296bef';

async function test() {
    const client = new StatoriumClient(API_KEY);
    const results = await client.searchPlayers('Kevin De Bruyne');
    console.log(JSON.stringify(results, null, 2));
}

test();
