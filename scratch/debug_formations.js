import { getRealFormation } from '../lib/statorium/formation-service';
import { StatoriumClient } from '../lib/statorium/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function debugTeamFormation(teamName, teamId, seasonId) {
  console.log('='.repeat(120));
  console.log(`DEBUG: ${teamName} (Team ID: ${teamId}, Season ID: ${seasonId})`);
  console.log('='.repeat(120));
  console.log('');

  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');

  try {
    // Get all matches for the season
    console.log('Fetching all matches...');
    const matches = await client.getMatches(seasonId);
    console.log(`Total matches in season: ${matches.length}`);
    console.log('');

    // Find most recent played match for this team
    const teamMatches = matches.filter(match => {
      return match.homeParticipant?.participantID?.toString() === teamId ||
             match.awayParticipant?.participantID?.toString() === teamId;
    });

    // Filter for played matches (statusID "1")
    const playedMatches = teamMatches.filter(match => match.matchStatus?.statusID === "1");

    // Sort by date descending
    const recentMatches = playedMatches.sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));

    if (recentMatches.length === 0) {
      console.log('❌ No played matches found for this team');
      return;
    }

    const mostRecentMatch = recentMatches[0];
    console.log(`Most recent played match: ${mostRecentMatch.homeParticipant?.participantName} vs ${mostRecentMatch.awayParticipant?.participantName}`);
    console.log(`Match ID: ${mostRecentMatch.matchID}`);
    console.log(`Date: ${mostRecentMatch.matchDate}`);
    console.log('');

    // Get match details with lineup
    console.log('Fetching match details with lineup...');
    const matchDetails = await client.getMatchDetails(mostRecentMatch.matchID.toString());

    const isHomeTeam = matchDetails.homeParticipant?.participantID?.toString() === teamId;
    const ourLineup = isHomeTeam
      ? matchDetails.homeParticipant?.squad?.lineup || []
      : matchDetails.awayParticipant?.squad?.lineup || [];

    console.log(`Our team lineup size: ${ourLineup.length} players`);
    console.log(`Is home team: ${isHomeTeam}`);
    console.log('');

    // Print RAW JSON lineup data
    console.log('RAW JSON LINEUP DATA (First 11 players):');
    console.log('-'.repeat(120));
    console.log(JSON.stringify(ourLineup.slice(0, 11), null, 2));
    console.log('-'.repeat(120));
    console.log('');

    // Show starting XI player names and positions
    console.log('STARTING XI - Player Names and Positions:');
    console.log('-'.repeat(120));
    ourLineup.slice(0, 11).forEach((player, idx) => {
      console.log(`${idx + 1}. ${player.playerFullName || player.name || 'Unknown'}`);
      console.log(`   Position from API: "${player.additionalInfo?.position || player.position || 'N/A'}"`);
      console.log(`   Player ID: ${player.playerID}`);
      console.log('');
    });
    console.log('-'.repeat(120));
    console.log('');

    // Manual position counting to show calculation
    const positions = {
      goalkeeper: 0,
      defender: 0,
      midfielder: 0,
      attacker: 0
    };

    console.log('POSITION CALCULATION:');
    console.log('-'.repeat(120));

    ourLineup.slice(0, 11).forEach((player, idx) => {
      const position = (player.additionalInfo?.position || '').toLowerCase() || '';

      let classifiedAs = 'Unknown';
      if (position.includes('goalkeeper') || position.includes('gk')) {
        positions.goalkeeper++;
        classifiedAs = 'Goalkeeper';
      } else if (position.includes('defender') || position.includes('def')) {
        positions.defender++;
        classifiedAs = 'Defender';
      } else if (position.includes('midfielder') || position.includes('mid') || position.includes('mf')) {
        positions.midfielder++;
        classifiedAs = 'Midfielder';
      } else if (position.includes('attacker') || position.includes('ata') || position.includes('forward') || position.includes('fw') || position.includes('striker')) {
        positions.attacker++;
        classifiedAs = 'Attacker';
      }

      console.log(`${idx + 1}. ${player.playerFullName || player.name}`);
      console.log(`   API Position: "${player.additionalInfo?.position || player.position || 'N/A'}"`);
      console.log(`   Classified as: ${classifiedAs}`);
      console.log('');
    });

    console.log('-'.repeat(120));
    console.log('POSITION COUNTS:');
    console.log(`Goalkeepers: ${positions.goalkeeper}`);
    console.log(`Defenders: ${positions.defender}`);
    console.log(`Midfielders: ${positions.midfielder}`);
    console.log(`Attackers: ${positions.attacker}`);
    console.log('');

    // Calculate formation
    const outfield = positions.defender + positions.midfielder + positions.attacker;

    console.log('FORMATION CALCULATION:');
    console.log('-'.repeat(120));
    console.log(`Total outfield players: ${outfield}`);
    console.log('');

    if (outfield === 0) {
      console.log('❌ No outfield players found - formation: N/A');
    } else {
      // Formation detection logic from the service
      let formation = 'N/A';

      if (positions.defender === 3 && positions.midfielder === 5 && positions.attacker === 2) {
        formation = '3-5-2';
      } else if (positions.defender === 3 && positions.midfielder === 4 && positions.attacker === 3) {
        formation = '3-4-3';
      } else if (positions.defender === 4 && positions.midfielder === 3 && positions.attacker === 3) {
        formation = '4-3-3';
      } else if (positions.defender === 4 && positions.midfielder === 2 && positions.attacker === 4) {
        formation = '4-2-4';
      } else if (positions.defender === 4 && positions.midfielder === 4 && positions.attacker === 2) {
        formation = '4-4-2';
      } else if (positions.defender === 4 && positions.midfielder === 5 && positions.attacker === 1) {
        formation = '4-5-1';
      } else if (positions.defender === 5 && positions.midfielder === 3 && positions.attacker === 2) {
        formation = '5-3-2';
      } else if (positions.defender === 5 && positions.midfielder === 4 && positions.attacker === 1) {
        formation = '5-4-1';
      } else if (positions.defender === 5 && positions.midfielder === 2 && positions.attacker === 3) {
        formation = '5-2-3';
      } else {
        // Fallback based on ratios
        const dfRatio = positions.defender / outfield;
        const mfRatio = positions.midfielder / outfield;
        const fwRatio = positions.attacker / outfield;

        console.log('Ratios:');
        console.log(`  Defenders: ${dfRatio.toFixed(2)} (${(dfRatio * 100).toFixed(0)}%)`);
        console.log(`  Midfielders: ${mfRatio.toFixed(2)} (${(mfRatio * 100).toFixed(0)}%)`);
        console.log(`  Attackers: ${fwRatio.toFixed(2)} (${(fwRatio * 100).toFixed(0)}%)`);
        console.log('');

        if (mfRatio >= 0.45) {
          formation = '4-5-1';
        } else if (fwRatio >= 0.35) {
          formation = '4-3-3';
        } else if (dfRatio >= 0.45) {
          formation = '5-4-1';
        } else {
          formation = '4-4-2';
        }
      }

      console.log(`FINAL FORMATION: ${formation}`);
    }

    console.log('');
    console.log('='.repeat(120));
    console.log('');

  } catch (error) {
    console.error(`Error fetching data for ${teamName}:`, error.message);
    console.log('');
  }
}

async function debugAllTeams() {
  const teams = [
    { name: 'Chelsea', teamId: '8', seasonId: '515' },
    { name: 'Barcelona', teamId: '23', seasonId: '558' },
    { name: 'Atletico Madrid', teamId: '39', seasonId: '558' },
    { name: 'Bayern Munich', teamId: '47', seasonId: '521' }
  ];

  for (const team of teams) {
    await debugTeamFormation(team.name, team.teamId, team.seasonId);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

debugAllTeams();
