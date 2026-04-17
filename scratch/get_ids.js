const { StatoriumClient } = require('./lib/statorium/client');
require('dotenv').config();

async function test() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');
  try {
    const team = await client.getTeamDetails('9'); // Arsenal
    console.log('Players in Arsenal:');
    team.players.slice(0, 10).forEach(p => {
      console.log(`${p.fullName}: ${p.playerID}`);
    });
  } catch (e) {
    console.error(e);
  }
}

test();
