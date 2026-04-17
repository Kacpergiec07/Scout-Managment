import { StatoriumClient } from '../lib/statorium/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function debugFormation() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');

  const teamId = '37'; // Real Madrid
  const seasonId = '558'; // La Liga 2024/25

  console.log('='.repeat(100));
  console.log(`DEBUG: Finding matches with lineup data for team ${teamId}, season ${seasonId}`);
  console.log('='.repeat(100));
  console.log('');

  try {
    // Get all matches for the season
    const matches = await client.getMatches(seasonId);
    console.log(`Total matches in season: ${matches.length}`);
    console.log('');

    // Filter matches for this team and categorize by status
    const teamMatches = matches.filter(match => {
      return match.homeParticipant?.participantID?.toString() === teamId ||
             match.awayParticipant?.participantID?.toString() === teamId;
    });

    console.log(`Matches for this team: ${teamMatches.length}`);
    console.log('');

    // Categorize by status
    const statusGroups = {};
    teamMatches.forEach(match => {
      const status = match.matchStatus?.statusID || 'unknown';
      if (!statusGroups[status]) {
        statusGroups[status] = [];
      }
      statusGroups[status].push(match);
    });

    console.log('Matches by status:');
    console.log('-'.repeat(80));
    Object.keys(statusGroups).sort().forEach(status => {
      console.log(`Status ${status}: ${statusGroups[status].length} matches`);
      // Show first match as example
      if (statusGroups[status].length > 0) {
        const example = statusGroups[status][0];
        console.log(`  Example: ${example.homeParticipant?.participantName} vs ${example.awayParticipant?.participantName} (${example.matchDate})`);
      }
    });
    console.log('');

    // Find played matches (status "1")
    const playedMatches = statusGroups['1'] || [];
    console.log(`Played matches (status "1"): ${playedMatches.length}`);

    if (playedMatches.length > 0) {
      console.log('');
      console.log('Checking 5 most recent played matches for lineup data...');
      console.log('-'.repeat(80));

      const recentPlayed = playedMatches
        .sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate))
        .slice(0, 5);

      for (let i = 0; i < recentPlayed.length; i++) {
        const match = recentPlayed[i];
        console.log(`\n${i + 1}. ${match.homeParticipant?.participantName} vs ${match.awayParticipant?.participantName}`);
        console.log(`   Date: ${match.matchDate}`);
        console.log(`   Match ID: ${match.matchID}`);

        try {
          const matchDetails = await client.getMatchDetails(match.matchID.toString());

          const homeLineup = matchDetails.homeParticipant?.squad?.lineup || [];
          const awayLineup = matchDetails.awayParticipant?.squad?.lineup || [];

          const isHomeTeam = matchDetails.homeParticipant?.participantID?.toString() === teamId;
          const ourLineup = isHomeTeam ? homeLineup : awayLineup;

          console.log(`   Home lineup: ${homeLineup.length} players`);
          console.log(`   Away lineup: ${awayLineup.length} players`);
          console.log(`   Our team's lineup: ${ourLineup.length} players`);

          if (ourLineup.length > 0) {
            console.log('   ✅ Has lineup data!');
            console.log('');
            console.log('   First player from lineup (full structure):');
            const firstPlayer = ourLineup[0];
            console.log(JSON.stringify(firstPlayer, null, 2));
            console.log('');
            console.log('   First 3 players from lineup:');
            ourLineup.slice(0, 3).forEach((player, idx) => {
              console.log(`     ${idx + 1}. Name: ${player.playerName || player.name || player.firstName || 'undefined'}`);
              console.log(`        Position: ${player.position || player.additionalInfo?.Position || 'undefined'}`);
              console.log(`        Position (lower): ${player.position?.toLowerCase() || 'undefined'}`);
              console.log('');
            });
          } else {
            console.log('   ❌ No lineup data');
          }
        } catch (error) {
          console.log(`   ❌ Error fetching match details: ${error.message}`);
        }

        // Small delay to avoid rate limiting
        if (i < recentPlayed.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } else {
      console.log('');
      console.log('❌ No played matches found with status "1"');
      console.log('');
      console.log('Available statuses:');
      Object.keys(statusGroups).forEach(status => {
        console.log(`  Status ${status}: ${statusGroups[status].length} matches`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }

  console.log('');
  console.log('='.repeat(100));
  console.log('DEBUG COMPLETE');
  console.log('='.repeat(100));
}

debugFormation();
