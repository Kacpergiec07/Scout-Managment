// Test file to check Statorium API match details structure
import { StatoriumClient } from '@/lib/statorium/client';

async function testMatchDataStructure() {
  const client = new StatoriumClient('d35d1fc1aabe0671e1e80ee5a6296bef');

  try {
    // Test with a real match ID from API
    // First let's get some matches to find a real match ID
    console.log('Testing Statorium API match data structure...\n');

    // Test getting matches first
    const matches = await client.getMatches('515'); // Premier League
    if (matches && matches.length > 0) {
      console.log('Found matches:', matches.length);
      console.log('Sample match structure:');
      console.log(JSON.stringify(matches[0], null, 2));

      // Try to get details of the first match
      const firstMatch = matches[0];
      const matchId = firstMatch.matchID;

      console.log('\n=== Getting details for match ID:', matchId, '===\n');

      const matchDetails = await client.getMatchDetails(matchId);
      console.log('Match Details Structure:');
      console.log(JSON.stringify(matchDetails, null, 2));

      // Check specific fields we need
      console.log('\n=== KEY FIELDS ===');
      console.log('Home Participant:', matchDetails.homeParticipant);
      console.log('Away Participant:', matchDetails.awayParticipant);
      console.log('Match Date:', matchDetails.matchDate);
      console.log('Match Time:', matchDetails.matchTime);
      console.log('Venue:', matchDetails.venueName);

      // Check stats structure
      if (matchDetails.homeParticipant?.stats) {
        console.log('\n=== HOME STATS ===');
        console.log('Stats object:', matchDetails.homeParticipant.stats);
        console.log('Shots:', matchDetails.homeParticipant.stats.shots);
        console.log('Shots on Target:', matchDetails.homeParticipant.stats.shotsOnTarget);
        console.log('Possession:', matchDetails.homeParticipant.stats.possession);
        console.log('Passes:', matchDetails.homeParticipant.stats.passes);
        console.log('Pass Accuracy:', matchDetails.homeParticipant.stats.passAccuracy);
        console.log('Fouls:', matchDetails.homeParticipant.stats.fouls);
        console.log('Yellow Cards:', matchDetails.homeParticipant.stats.yellowCards);
        console.log('Red Cards:', matchDetails.homeParticipant.stats.redCards);
        console.log('Offsides:', matchDetails.homeParticipant.stats.offsides);
        console.log('Corners:', matchDetails.homeParticipant.stats.corners);
      } else {
        console.log('\n=== NO STATS IN homeParticipant ===');
        console.log('Full homeParticipant object:', JSON.stringify(matchDetails.homeParticipant, null, 2));
      }

      if (matchDetails.awayParticipant?.stats) {
        console.log('\n=== AWAY STATS ===');
        console.log('Stats object:', matchDetails.awayParticipant.stats);
      } else {
        console.log('\n=== NO STATS IN awayParticipant ===');
        console.log('Full awayParticipant object:', JSON.stringify(matchDetails.awayParticipant, null, 2));
      }

      // Check for alternative field names
      console.log('\n=== CHECKING ALTERNATIVE FIELDS ===');
      console.log('Direct match fields:', Object.keys(matchDetails).filter(k => k.toLowerCase().includes('shot') || k.toLowerCase().includes('pass')));
    } else {
      console.log('No matches found');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testMatchDataStructure();