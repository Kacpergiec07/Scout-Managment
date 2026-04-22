
const { getStatoriumClient } = require('./lib/statorium/client');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function checkMatchDetails() {
  try {
    const client = getStatoriumClient();
    // La Liga season 558
    const standings = await client.getStandings('558');
    if (standings && standings.length > 0) {
      const teamId = standings[0].teamID;
      console.log(`Checking matches for team ${teamId}...`);
      // We need matches to get a match ID
      // Let's use a known match ID if possible, or fetch from season
      const data = await client.fetch(`/matches/?season_id=558`);
      const matches = data.calendar.matchdays.flatMap(md => md.matches || []);
      const playedMatches = matches.filter(m => m.status === 'Played');
      
      if (playedMatches.length > 0) {
        const matchId = playedMatches[0].matchID;
        console.log(`Fetching details for match ${matchId}...`);
        const details = await client.getMatchDetails(matchId);
        console.log('MATCH DETAILS:', JSON.stringify(details, null, 2));
      } else {
        console.log('No played matches found in season 558');
      }
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

checkMatchDetails();
