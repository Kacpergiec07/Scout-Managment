import { StatoriumClient } from '../lib/statorium/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function getAllTeams() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');

  const leagues = [
    { id: "515", name: "Premier League" },
    { id: "558", name: "La Liga" },
    { id: "521", name: "Bundesliga" },
    { id: "519", name: "Ligue 1" },
    { id: "511", name: "Serie A" }
  ];

  console.log('='.repeat(100));
  console.log('STEP 1: FINDING ALL TEAM IDS IN THE PROJECT');
  console.log('='.repeat(100));
  console.log('');

  const allTeams = [];

  for (const league of leagues) {
    console.log(`Fetching ${league.name}...`);
    try {
      const standings = await client.getStandings(league.id);

      if (standings && standings.length > 0) {
        standings.forEach((team) => {
          allTeams.push({
            teamID: team.teamID?.toString(),
            teamName: team.teamName || team.teamMiddleName,
            seasonId: league.id,
            league: league.name
          });
        });
        console.log(`✅ Found ${standings.length} teams in ${league.name}`);
      }
    } catch (error) {
      console.error(`❌ Error fetching ${league.name}:`, error.message);
    }
  }

  console.log('');
  console.log('='.repeat(100));
  console.log(`TOTAL TEAMS FOUND: ${allTeams.length}`);
  console.log('='.repeat(100));
  console.log('');

  // Save teams to file for later use
  console.log('Team data collected - ready for investigation');

  return allTeams;
}

async function investigateLineupStructure(allTeams) {
  console.log('='.repeat(100));
  console.log('STEP 2: INVESTIGATING LINEUP STRUCTURE FROM ONE MATCH');
  console.log('='.repeat(100));
  console.log('');

  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');

  // Pick first team that has recent match data
  const testTeam = allTeams[0];
  console.log(`Testing with: ${testTeam.teamName} (ID: ${testTeam.teamID})`);

  try {
    // Get matches for this team
    const matches = await client.getMatches(testTeam.seasonId);

    // Find most recent match involving this team
    let mostRecentMatch = null;
    let mostRecentDate = null;

    for (const match of matches) {
      const isHomeTeam = match.homeParticipant?.participantID?.toString() === testTeam.teamID;
      const isAwayTeam = match.awayParticipant?.participantID?.toString() === testTeam.teamID;

      if (isHomeTeam || isAwayTeam) {
        const matchDate = new Date(match.matchDate);
        if (!mostRecentDate || matchDate > mostRecentDate) {
          mostRecentDate = matchDate;
          mostRecentMatch = match;
        }
      }
    }

    if (mostRecentMatch) {
      console.log(`Found most recent match: ${mostRecentMatch.matchID}`);
      console.log(`Date: ${mostRecentMatch.matchDate}`);
      console.log(`${mostRecentMatch.homeParticipant?.participantName} vs ${mostRecentMatch.awayParticipant?.participantName}`);
      console.log('');

      // Get detailed match data
      console.log('Fetching detailed match data...');
      const matchDetails = await client.getMatchDetails(mostRecentMatch.matchID.toString());

      console.log('✅ Match details retrieved');
      console.log('');
      console.log('='.repeat(100));
      console.log('RAW LINEUP JSON');
      console.log('='.repeat(100));
      console.log('');

      // Show relevant lineup data
      if (matchDetails.homeParticipant?.squad) {
        console.log('HOME TEAM SQUAD STRUCTURE:');
        console.log(JSON.stringify(matchDetails.homeParticipant.squad, null, 2));
      }

      if (matchDetails.awayParticipant?.squad) {
        console.log('');
        console.log('AWAY TEAM SQUAD STRUCTURE:');
        console.log(JSON.stringify(matchDetails.awayParticipant.squad, null, 2));
      }

    } else {
      console.log('❌ No recent match found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  const allTeams = await getAllTeams();
  await investigateLineupStructure(allTeams);
  console.log('');
  console.log('='.repeat(100));
  console.log('STEP 1 & 2 COMPLETE - READY FOR IMPLEMENTATION');
  console.log('='.repeat(100));
}

main();
