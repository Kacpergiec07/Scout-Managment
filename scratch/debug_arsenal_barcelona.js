import { StatoriumClient } from '../lib/statorium/client.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function debugTeam(teamName, teamId, seasonId) {
  console.log('='.repeat(100));
  console.log(`DEBUGGING ${teamName.toUpperCase()} (Team ID: ${teamId})`);
  console.log('='.repeat(100));

  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');

  // Helper function to calculate age from birthdate
  const calculateAge = (birthdate) => {
    if (!birthdate) return 0;
    const match = birthdate.match(/(\d{2})-(\d{2})-(\d{4})/);
    if (!match) return 0;
    const birthYear = parseInt(match[3]);
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  // Helper function to categorize position
  const categorizePosition = (pos) => {
    const posLower = (pos || '').toLowerCase();
    if (posLower === 'goalkeeper' || posLower === 'gk' || posLower.startsWith('goal')) {
      return 'GK';
    } else if (posLower === 'defender' || posLower === 'df' || (posLower.startsWith('def') && !posLower.includes('mid'))) {
      return 'DF';
    } else if (posLower === 'midfielder' || posLower === 'mf' || posLower.includes('mid')) {
      return 'MF';
    } else if (posLower === 'atacker' || posLower === 'attacker' || posLower === 'forward' || posLower === 'fw' || posLower === 'striker' || posLower === 'st' || posLower.includes('ata')) {
      return 'FW';
    }
    return 'Unknown';
  };

  try {
    const players = await client.getPlayersByTeam(teamId, seasonId);
    console.log(`\n📊 TOTAL PLAYERS FROM API: ${players.length}`);
    console.log('');

    // Analyze each player
    console.log('📋 ALL PLAYERS WITH FILTERING STATUS:');
    console.log('Format: Name | Position | Jersey | Age | Active | Status');
    console.log('-'.repeat(100));

    const included = [];
    const excluded = [];

    players.forEach((player, i) => {
      const name = player.fullName || 'Unknown';
      const position = player.additionalInfo?.position || 'Unknown';
      const jersey = player.playerNumber || '?';
      const birthdate = player.additionalInfo?.birthdate || 'Unknown';
      const age = calculateAge(birthdate);
      const departed = player.playerDeparted || '0';
      const isActive = departed === "0";

      // Apply filters
      const jerseyNum = parseInt(jersey);
      const validJersey = !isNaN(jerseyNum) && jerseyNum >= 1 && jerseyNum <= 25;
      const validAge = age >= 18;
      const validActive = isActive;

      const includedInFirstTeam = validJersey && validAge && validActive;

      const status = includedInFirstTeam ? '✅ INCLUDED' : '❌ EXCLUDED';
      const reasons = [];
      if (!validJersey) reasons.push(`Jersey ${jersey} (not 1-25)`);
      if (!validAge) reasons.push(`Age ${age} (under 18)`);
      if (!validActive) reasons.push(`Inactive (departed: ${departed})`);

      const playerInfo = `${name.padEnd(25)} | ${position.padEnd(12)} | #${String(jersey).padEnd(3)} | Age: ${String(age).padEnd(2)} | Active: ${isActive ? 'Yes' : 'No'} | ${status}`;

      if (includedInFirstTeam) {
        included.push({ player, position, jersey, age, info: playerInfo });
      } else {
        excluded.push({ player, position, jersey, age, info: playerInfo, reasons });
      }

      console.log(playerInfo);
      if (reasons.length > 0) {
        console.log(`   Reasons: ${reasons.join(', ')}`);
      }
    });

    console.log('');
    console.log('='.repeat(100));
    console.log('SUMMARY');
    console.log('='.repeat(100));
    console.log(`Total players: ${players.length}`);
    console.log(`✅ Included (first-team): ${included.length}`);
    console.log(`❌ Excluded: ${excluded.length}`);
    console.log('');

    // Position breakdown of included players
    console.log('📊 INCLUDED PLAYERS BY POSITION:');
    const positionCounts = { GK: 0, DF: 0, MF: 0, FW: 0, Unknown: 0 };
    included.forEach(({ player }) => {
      const pos = player.additionalInfo?.position || 'Unknown';
      const category = categorizePosition(pos);
      if (positionCounts[category] !== undefined) {
        positionCounts[category]++;
      } else {
        positionCounts.Unknown++;
      }
    });

    Object.entries(positionCounts).forEach(([pos, count]) => {
      if (count > 0) {
        console.log(`  ${pos}: ${count} players`);
      }
    });

    console.log('');

    // Show detailed list of included players by position
    console.log('⚽ FIRST-TEAM SQUAD (INCLUDED):');
    ['GK', 'DF', 'MF', 'FW'].forEach(pos => {
      const posPlayers = included.filter(({ player }) => {
        const category = categorizePosition(player.additionalInfo?.position);
        return category === pos;
      });

      if (posPlayers.length > 0) {
        console.log(`\n${pos} (${posPlayers.length}):`);
        posPlayers.forEach(({ player, jersey }) => {
          const name = player.fullName;
          const position = player.additionalInfo?.position;
          console.log(`  ${name} (${position}, #${jersey})`);
        });
      }
    });

    console.log('');

    // Calculate formation
    const totalOutfield = positionCounts.DF + positionCounts.MF + positionCounts.FW;
    if (totalOutfield > 0) {
      const dfRatio = positionCounts.DF / totalOutfield;
      const mfRatio = positionCounts.MF / totalOutfield;
      const fwRatio = positionCounts.FW / totalOutfield;

      console.log('📐 FORMATION CALCULATION:');
      console.log(`Total outfield: ${totalOutfield}`);
      console.log(`Ratios - DF: ${(dfRatio * 100).toFixed(0)}%, MF: ${(mfRatio * 100).toFixed(0)}%, FW: ${(fwRatio * 100).toFixed(0)}%`);

      let d = 4, m = 4, f = 2;
      let formationReason = '';

      if (mfRatio >= 0.35 && fwRatio >= 0.30) {
        d = 4; m = 3; f = 3;
        formationReason = 'Strong midfield and attack';
      } else if (dfRatio > 0.45 && fwRatio < 0.20) {
        d = 5; m = 3; f = 2;
        formationReason = 'Defense-heavy, attack-light';
      } else if (dfRatio > 0.50 && mfRatio > 0.35) {
        d = 3; m = 5; f = 2;
        formationReason = 'Very defensive with midfield';
      } else if (mfRatio > 0.45) {
        d = 4; m = 5; f = 1;
        formationReason = 'Midfield-dominant';
      } else if (fwRatio > 0.40) {
        d = 4; m = 2; f = 4;
        formationReason = 'Attack-dominant';
      } else if (dfRatio > 0.40) {
        d = 5; m = 4; f = 1;
        formationReason = 'Defense-oriented';
      } else {
        formationReason = 'Balanced';
      }

      // Ensure we don't request more players than available
      d = Math.min(d, positionCounts.DF);
      m = Math.min(m, positionCounts.MF);
      f = Math.min(f, positionCounts.FW);

      console.log(`Formation logic: ${formationReason} -> ${d}-${m}-${f}`);
      console.log(`Final formation: ${d}-${m}-${f} (available: D=${positionCounts.DF}, M=${positionCounts.MF}, F=${positionCounts.FW})`);
    }

    console.log('');
    console.log('='.repeat(100));
    console.log('');

  } catch (error) {
    console.error(`Error fetching ${teamName}:`, error.message);
  }
}

async function main() {
  await debugTeam('Arsenal', '9', '515');
  await debugTeam('Barcelona', '23', '558');
}

main();
