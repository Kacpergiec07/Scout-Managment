import { StatoriumClient } from '../lib/statorium/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function showReclassification(teamName, teamId, seasonId) {
  console.log('='.repeat(120));
  console.log(`RECLASSIFICATION PROCESS: ${teamName}`);
  console.log('='.repeat(120));
  console.log('');

  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');

  try {
    // Get all matches for the season
    const matches = await client.getMatches(seasonId);

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
    console.log('');

    // Get match details with lineup
    const matchDetails = await client.getMatchDetails(mostRecentMatch.matchID.toString());

    const isHomeTeam = matchDetails.homeParticipant?.participantID?.toString() === teamId;
    const ourLineup = isHomeTeam
      ? matchDetails.homeParticipant?.squad?.lineup || []
      : matchDetails.awayParticipant?.squad?.lineup || [];

    // Count original positions
    const originalPositions = {
      goalkeeper: 0,
      defender: 0,
      midfielder: 0,
      attacker: 0
    };

    ourLineup.slice(0, 11).forEach(player => {
      const position = (player.additionalInfo?.position || '').toLowerCase() || '';
      if (position.includes('goalkeeper') || position.includes('gk')) {
        originalPositions.goalkeeper++;
      } else if (position.includes('defender') || position.includes('def')) {
        originalPositions.defender++;
      } else if (position.includes('midfielder') || position.includes('mid') || position.includes('mf')) {
        originalPositions.midfielder++;
      } else if (position.includes('attacker') || position.includes('ata') || position.includes('forward') || position.includes('fw') || position.includes('striker')) {
        originalPositions.attacker++;
      }
    });

    console.log('ORIGINAL POSITION COUNTS:');
    console.log(`  Goalkeepers: ${originalPositions.goalkeeper}`);
    console.log(`  Defenders: ${originalPositions.defender}`);
    console.log(`  Midfielders: ${originalPositions.midfielder}`);
    console.log(`  Attackers: ${originalPositions.attacker}`);
    console.log('');

    // Apply reclassification rules
    let positions = { ...originalPositions };

    // RULE 2 - Too many Attackers (4+)
    const maxAttackers = 3;
    if (positions.attacker > maxAttackers) {
      const excessAttackers = positions.attacker - maxAttackers;
      console.log(`RULE 2: Too many attackers (${positions.attacker} > ${maxAttackers})`);
      console.log(`  → Reclassifying ${excessAttackers} attacker(s) as midfielder(s)`);
      positions.midfielder += excessAttackers;
      positions.attacker = maxAttackers;
      console.log(`  → New counts: MF=${positions.midfielder}, FW=${positions.attacker}`);
      console.log('');
    }

    // RULE 1 - Too many Midfielders (5+)
    const maxMidfielders = positions.defender <= 3 ? 5 : 4;
    if (positions.midfielder > maxMidfielders) {
      const excessMidfielders = positions.midfielder - maxMidfielders;
      console.log(`RULE 1: Too many midfielders (${positions.midfielder} > ${maxMidfielders})`);
      const availableAttackerSlots = maxAttackers - positions.attacker;
      const toConvert = Math.min(excessMidfielders, availableAttackerSlots);
      console.log(`  → Reclassifying ${toConvert} midfielder(s) as attacker(s)`);
      positions.attacker += toConvert;
      positions.midfielder -= toConvert;
      console.log(`  → New counts: MF=${positions.midfielder}, FW=${positions.attacker}`);
      console.log('');
    }

    // RULE 3 - Max 5 defenders
    const maxDefenders = 5;
    if (positions.defender > maxDefenders) {
      const excessDefenders = positions.defender - maxDefenders;
      console.log(`RULE 3: Too many defenders (${positions.defender} > ${maxDefenders})`);
      console.log(`  → Reclassifying ${excessDefenders} defender(s) as midfielder(s)`);
      positions.midfielder += excessDefenders;
      positions.defender = maxDefenders;
      console.log(`  → New counts: DF=${positions.defender}, MF=${positions.midfielder}`);
      console.log('');
    }

    console.log('FINAL POSITION COUNTS:');
    console.log(`  Goalkeepers: ${positions.goalkeeper}`);
    console.log(`  Defenders: ${positions.defender}`);
    console.log(`  Midfielders: ${positions.midfielder}`);
    console.log(`  Attackers: ${positions.attacker}`);
    console.log('');

    // Calculate formation
    const adjustedOutfield = positions.defender + positions.midfielder + positions.attacker;

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
      const dfRatio = positions.defender / adjustedOutfield;
      const mfRatio = positions.midfielder / adjustedOutfield;
      const fwRatio = positions.attacker / adjustedOutfield;

      console.log('FORMATION CALCULATION (Ratios):');
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

    console.log('='.repeat(120));
    console.log(`FINAL FORMATION: ${formation}`);
    console.log('='.repeat(120));
    console.log('');

  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('');
  }
}

async function showAllReclassifications() {
  const teams = [
    { name: 'Chelsea', teamId: '8', seasonId: '515' },
    { name: 'Barcelona', teamId: '23', seasonId: '558' },
    { name: 'Atletico Madrid', teamId: '39', seasonId: '558' },
    { name: 'Bayern Munich', teamId: '47', seasonId: '521' }
  ];

  for (const team of teams) {
    await showReclassification(team.name, team.teamId, team.seasonId);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

showAllReclassifications();
