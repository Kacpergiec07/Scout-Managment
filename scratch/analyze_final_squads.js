import { StatoriumClient } from '../lib/statorium/client.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function analyzeSquad(teamName, teamId, seasonId) {
  console.log('='.repeat(100));
  console.log(`ANALYZING ${teamName.toUpperCase()} SQUAD (Age 18-35, Active Only)`);
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

    // Filter players
    const filteredPlayers = players.filter((p) => {
      // Must be active
      if (p.playerDeparted !== "0") return false;

      // Must be between 18 and 35 years old
      const age = calculateAge(p.additionalInfo?.birthdate);
      if (age < 18 || age > 35) return false;

      return true;
    });

    console.log(`✅ FILTERED PLAYERS (18-35, active): ${filteredPlayers.length}`);
    console.log('');

    // Group by position
    const byPosition = { GK: [], DF: [], MF: [], FW: [], Unknown: [] };
    filteredPlayers.forEach((player) => {
      const pos = player.additionalInfo?.position || 'Unknown';
      const category = categorizePosition(pos);
      if (byPosition[category]) {
        byPosition[category].push(player);
      } else {
        byPosition.Unknown.push(player);
      }
    });

    // Show players by position
    ['GK', 'DF', 'MF', 'FW'].forEach(pos => {
      const posPlayers = byPosition[pos];
      if (posPlayers.length > 0) {
        console.log(`\n${pos} (${posPlayers.length} players):`);
        posPlayers.forEach((player, i) => {
          const name = player.fullName;
          const jersey = player.playerNumber || '?';
          const birthdate = player.additionalInfo?.birthdate || 'Unknown';
          const age = calculateAge(birthdate);
          const position = player.additionalInfo?.position;

          console.log(`  ${i + 1}. ${name} (Age: ${age}, #${jersey}, ${position})`);
        });
      }
    });

    // Calculate formation
    const totalOutfield = byPosition.DF.length + byPosition.MF.length + byPosition.FW.length;
    console.log(`\n📐 FORMATION CALCULATION:`);
    console.log(`Total outfield: ${totalOutfield}`);
    console.log(`DF: ${byPosition.DF.length}, MF: ${byPosition.MF.length}, FW: ${byPosition.FW.length}`);

    if (totalOutfield > 0) {
      const dfRatio = byPosition.DF.length / totalOutfield;
      const mfRatio = byPosition.MF.length / totalOutfield;
      const fwRatio = byPosition.FW.length / totalOutfield;

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
      d = Math.min(d, byPosition.DF.length);
      m = Math.min(m, byPosition.MF.length);
      f = Math.min(f, byPosition.FW.length);

      console.log(`Formation logic: ${formationReason} -> ${d}-${m}-${f}`);
      console.log(`Final formation: ${d}-${m}-${f}`);
    }

    console.log('');
    console.log('='.repeat(100));
    console.log('');

  } catch (error) {
    console.error(`Error analyzing ${teamName}:`, error.message);
  }
}

async function main() {
  await analyzeSquad('Real Madrid', '37', '558');
  await analyzeSquad('Arsenal', '9', '515');
  await analyzeSquad('Barcelona', '23', '558');
}

main();
