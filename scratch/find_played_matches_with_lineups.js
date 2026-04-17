import { StatoriumClient } from '../lib/statorium/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function findPlayedMatchesWithLineups() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');

  const leagues = [
    { id: "515", name: "Premier League" },
    { id: "558", name: "La Liga" },
    { id: "521", name: "Bundesliga" },
    { id: "519", name: "Ligue 1" },
    { id: "511", name: "Serie A" }
  ];

  console.log('='.repeat(100));
  console.log('FINDING PLAYED MATCHES WITH LINEUP DATA');
  console.log('='.repeat(100));
  console.log('');

  for (const league of leagues) {
    console.log(`Searching ${league.name}...`);
    try {
      const matches = await client.getMatches(league.id);

      // Find played matches (statusID "1") and check for lineups
      for (const match of matches) {
        if (match.matchStatus?.statusID === "1") {
          console.log(`Found played match: ${match.matchID} - ${match.homeParticipant?.participantName} vs ${match.awayParticipant?.participantName} (${match.matchDate})`);

          // Get match details to check for lineup
          try {
            const matchDetails = await client.getMatchDetails(match.matchID.toString());

            const hasLineup = (matchDetails.homeParticipant?.squad?.lineup?.length > 0) ||
                           (matchDetails.awayParticipant?.squad?.lineup?.length > 0);

            if (hasLineup) {
              console.log(`✅ MATCH WITH LINEUP DATA FOUND!`);
              console.log(`Match ID: ${match.matchID}`);
              console.log(`Date: ${match.matchDate}`);
              console.log(`${match.homeParticipant?.participantName} vs ${match.awayParticipant?.participantName}`);
              console.log('');

              // Show lineup structure
              if (matchDetails.homeParticipant?.squad?.lineup?.length > 0) {
                console.log('HOME TEAM LINEUP:');
                matchDetails.homeParticipant.squad.lineup.forEach((player, i) => {
                  console.log(`  ${i + 1}. ${player.playerFullName} (#${player.playerNumber}) - ${player.additionalInfo?.position}`);
                });
              }

              if (matchDetails.awayParticipant?.squad?.lineup?.length > 0) {
                console.log('');
                console.log('AWAY TEAM LINEUP:');
                matchDetails.awayParticipant.squad.lineup.forEach((player, i) => {
                  console.log(`  ${i + 1}. ${player.playerFullName} (#${player.playerNumber}) - ${player.additionalInfo?.position}`);
                });
              }

              // Show raw JSON of one squad
              console.log('');
              console.log('RAW SQUAD JSON (Home Team):');
              console.log(JSON.stringify(matchDetails.homeParticipant?.squad, null, 2));

              return; // Found one, stop searching
            }
          } catch (error) {
            console.log(`Error getting match details: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error in ${league.name}:`, error.message);
    }
  }

  console.log('');
  console.log('='.repeat(100));
  console.log('SEARCH COMPLETE');
  console.log('='.repeat(100));
}

findPlayedMatchesWithLineups();
