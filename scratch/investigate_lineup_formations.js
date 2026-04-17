import { StatoriumClient } from '../lib/statorium/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function investigateLineupFormations() {
  console.log('='.repeat(100));
  console.log('STEP 1: INVESTIGATING MATCH LINEUP ENDPOINT FOR REAL FORMATIONS');
  console.log('='.repeat(100));
  console.log('');

  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');

  const teams = [
    { name: 'Real Madrid', teamId: '37', seasonId: '558' },
    { name: 'Arsenal', teamId: '9', seasonId: '515' },
    { name: 'Barcelona', teamId: '23', seasonId: '558' }
  ];

  for (const { name, teamId, seasonId } of teams) {
    console.log('='.repeat(100));
    console.log(`${name.toUpperCase()} - FINDING MOST RECENT MATCH`);
    console.log('='.repeat(100));
    console.log('');

    try {
      // Step 1: Get all matches for the season
      console.log(`Fetching matches for season ${seasonId}...`);
      const matchesData = await client.getMatches(seasonId);

      if (!matchesData || matchesData.length === 0) {
        console.log('❌ No matches found');
        console.log('');
        continue;
      }

      console.log(`✅ Found ${matchesData.length} matches`);

      // Find the most recent match involving this team
      let mostRecentMatch = null;
      let mostRecentDate = null;

      for (const match of matchesData) {
        const isHomeTeam = match.homeParticipant?.participantID?.toString() === teamId;
        const isAwayTeam = match.awayParticipant?.participantID?.toString() === teamId;

        if (isHomeTeam || isAwayTeam) {
          const matchDate = new Date(match.matchDate);
          if (!mostRecentDate || matchDate > mostRecentDate) {
            mostRecentDate = matchDate;
            mostRecentMatch = match;
          }
        }
      }

      if (!mostRecentMatch) {
        console.log('❌ No matches found for this team');
        console.log('');
        continue;
      }

      console.log(`✅ Most recent match found:`);
      console.log(`   Match ID: ${mostRecentMatch.matchID}`);
      console.log(`   Date: ${mostRecentMatch.matchDate}`);
      console.log(`   Time: ${mostRecentMatch.matchTime}`);
      console.log(`   ${mostRecentMatch.homeParticipant?.participantName} ${mostRecentMatch.homeParticipant?.score || '-'} - ${mostRecentMatch.awayParticipant?.score || '-'} ${mostRecentMatch.awayParticipant?.participantName}`);
      console.log(`   Venue: ${mostRecentMatch.matchVenue?.venueName}`);
      console.log('');

      // Step 2: Get detailed match data including lineups
      console.log('Fetching detailed match data with lineups...');
      const matchDetails = await client.getMatchDetails(mostRecentMatch.matchID.toString());

      if (!matchDetails) {
        console.log('❌ Failed to get match details');
        console.log('');
        continue;
      }

      console.log('✅ Match details retrieved');
      console.log('');
      console.log('='.repeat(100));
      console.log(`RAW LINEUP JSON FOR ${name.toUpperCase()}`);
      console.log('='.repeat(100));
      console.log('');

      // Show the complete raw JSON
      console.log(JSON.stringify(matchDetails, null, 2));

      // Also extract and analyze the lineup structure
      console.log('');
      console.log('='.repeat(100));
      console.log('LINEUP STRUCTURE ANALYSIS');
      console.log('='.repeat(100));
      console.log('');

      // Check home team lineup
      if (matchDetails.homeParticipant?.squad) {
        console.log('HOME TEAM LINEUP:');
        console.log(`  Team: ${matchDetails.homeParticipant.participantName}`);
        console.log(`  Lineup players: ${matchDetails.homeParticipant.squad.lineup?.length || 0}`);
        console.log(`  Bench players: ${matchDetails.homeParticipant.squad.bench?.length || 0}`);
        console.log(`  Substitutions: ${matchDetails.homeParticipant.squad.subs?.length || 0}`);

        if (matchDetails.homeParticipant.squad.lineup?.length > 0) {
          console.log('\n  Starting XI (with positions):');
          matchDetails.homeParticipant.squad.lineup.forEach((player, i) => {
            const position = player.additionalInfo?.position || 'Unknown';
            const number = player.playerNumber || '?';
            console.log(`    ${i + 1}. ${player.playerFullName} (#${number}, ${position})`);
          });
        }
      }

      console.log('');

      // Check away team lineup
      if (matchDetails.awayParticipant?.squad) {
        console.log('AWAY TEAM LINEUP:');
        console.log(`  Team: ${matchDetails.awayParticipant.participantName}`);
        console.log(`  Lineup players: ${matchDetails.awayParticipant.squad.lineup?.length || 0}`);
        console.log(`  Bench players: ${matchDetails.awayParticipant.squad.bench?.length || 0}`);
        console.log(`  Substitutions: ${matchDetails.awayParticipant.squad.subs?.length || 0}`);

        if (matchDetails.awayParticipant.squad.lineup?.length > 0) {
          console.log('\n  Starting XI (with positions):');
          matchDetails.awayParticipant.squad.lineup.forEach((player, i) => {
            const position = player.additionalInfo?.position || 'Unknown';
            const number = player.playerNumber || '?';
            console.log(`    ${i + 1}. ${player.playerFullName} (#${number}, ${position})`);
          });
        }
      }

      // Look for any formation-specific fields
      console.log('');
      console.log('SEARCHING FOR FORMATION DATA IN RESPONSE...');

      const searchForFormation = (obj, path = '') => {
        const results = [];

        if (typeof obj !== 'object' || obj === null) {
          return results;
        }

        Object.keys(obj).forEach(key => {
          const value = obj[key];
          const currentPath = path ? `${path}.${key}` : key;

          // Check for formation-related keys
          if (key.toLowerCase().includes('formation') ||
              key.toLowerCase().includes('lineup') ||
              key.toLowerCase().includes('starting') ||
              key.toLowerCase().includes('tactic')) {
            results.push({ path: currentPath, value: value });
          }

          if (typeof value === 'object' && value !== null) {
            results.push(...searchForFormation(value, currentPath));
          }
        });

        return results;
      };

      const formationFields = searchForFormation(matchDetails);

      if (formationFields.length > 0) {
        console.log('✅ Found formation-related fields:');
        formationFields.forEach(({ path, value }) => {
          console.log(`  ${path}: ${JSON.stringify(value).substring(0, 100)}`);
        });
      } else {
        console.log('❌ No explicit formation fields found');
        console.log('   Formation may need to be calculated from player positions');
      }

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }

    console.log('');
    console.log('---');
    console.log('');
  }

  console.log('='.repeat(100));
  console.log('STEP 1 COMPLETE - RAW LINEUP DATA SHOWN ABOVE');
  console.log('='.repeat(100));
}

investigateLineupFormations();
