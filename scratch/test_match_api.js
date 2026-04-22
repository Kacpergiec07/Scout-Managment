// Test file to check Statorium API match details structure
async function testMatchDataStructure() {
  try {
    console.log('Testing Statorium API match data structure...\n');

    // Test getting matches first
    const apiKey = 'd35d1fc1aabe0671e1e80ee5a6296bef';
    const matchesUrl = `https://api.statorium.com/api/v1/matches/?season_id=515&apikey=${apiKey}`;

    const response = await fetch(matchesUrl);
    const data = await response.json();

    console.log('Matches response keys:', Object.keys(data));
    console.log('Has calendar:', !!data.calendar);
    console.log('Has matches:', !!data.matches);

    if (data.calendar && data.calendar.matchdays && data.calendar.matchdays.length > 0) {
      const matches = data.calendar.matchdays[0].matches;
      if (matches && matches.length > 0) {
        console.log('\n=== FOUND MATCHES ===');
        console.log('Total matches:', matches.length);

        const firstMatch = matches[0];
        const matchId = firstMatch.matchID || firstMatch.id;

        console.log('\n=== SAMPLE MATCH STRUCTURE ===');
        console.log('Match ID:', matchId);
        console.log('Match fields:', Object.keys(firstMatch));
        console.log('Full match:', JSON.stringify(firstMatch, null, 2));

        // Try to get details
        const detailsUrl = `https://api.statorium.com/api/v1/matches/${matchId}/?details=1&apikey=${apiKey}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        console.log('\n=== MATCH DETAILS STRUCTURE ===');
        console.log('Details keys:', Object.keys(detailsData));
        console.log('Has match:', !!detailsData.match);

        if (detailsData.match) {
          console.log('Match details fields:', Object.keys(detailsData.match));
          console.log('Full match details:', JSON.stringify(detailsData.match, null, 2));

          // Check for stats
          console.log('\n=== CHECKING STATS ===');
          console.log('Has homeParticipant:', !!detailsData.match.homeParticipant);
          console.log('Has awayParticipant:', !!detailsData.match.awayParticipant);

          if (detailsData.match.homeParticipant) {
            console.log('Home participant keys:', Object.keys(detailsData.match.homeParticipant));
            console.log('Has stats:', !!detailsData.match.homeParticipant.stats);
            if (detailsData.match.homeParticipant.stats) {
              console.log('Stats keys:', Object.keys(detailsData.match.homeParticipant.stats));
            }
          }

          if (detailsData.match.awayParticipant) {
            console.log('Away participant keys:', Object.keys(detailsData.match.awayParticipant));
            console.log('Has stats:', !!detailsData.match.awayParticipant.stats);
            if (detailsData.match.awayParticipant.stats) {
              console.log('Stats keys:', Object.keys(detailsData.match.awayParticipant.stats));
            }
          }
        }
      }
    } else if (data.matches && data.matches.length > 0) {
      console.log('Using direct matches array');
      const firstMatch = data.matches[0];
      console.log('Sample match:', JSON.stringify(firstMatch, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testMatchDataStructure();