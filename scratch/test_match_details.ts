// Test file to check Statorium API match details structure
import { StatoriumClient } from '@/lib/statorium/client';

async function testMatchDetails() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || 'd35d1fc1aabe0671e1e80ee5a6296bef');

  try {
    // Test with a known match ID from Premier League
    const matchId = '123456789'; // Replace with a real match ID
    const matchDetails = await client.getMatchDetails(matchId);

    console.log('Match Details Structure:');
    console.log(JSON.stringify(matchDetails, null, 2));

    // Check what fields are available
    console.log('\n=== Available Fields ===');
    console.log('Home Participant:', matchDetails.homeParticipant);
    console.log('Away Participant:', matchDetails.awayParticipant);
    console.log('Match Date:', matchDetails.matchDate);
    console.log('Match Time:', matchDetails.matchTime);
    console.log('Venue:', matchDetails.venueName);

    // Check stats structure
    if (matchDetails.homeParticipant?.stats) {
      console.log('\n=== Home Stats ===');
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
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// This function can be called from a test route or component
export async function runMatchDetailsTest() {
  return testMatchDetails();
}