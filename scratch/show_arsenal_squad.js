import { StatoriumClient } from '../lib/statorium/client.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function showArsenalSquad() {
  console.log('='.repeat(100));
  console.log('ARSENAL FILTERED SQUAD (Age 18-35, Active Only)');
  console.log('='.repeat(100));
  console.log('');

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

  try {
    const players = await client.getPlayersByTeam('9', '515');
    console.log(`Total players from API: ${players.length}`);
    console.log('');

    // Filter players
    const filteredPlayers = players.filter((p) => {
      if (p.playerDeparted !== "0") return false;
      const age = calculateAge(p.additionalInfo?.birthdate);
      if (age < 18 || age > 35) return false;
      return true;
    });

    console.log(`Filtered players (18-35, active): ${filteredPlayers.length}`);
    console.log('');

    // Group by position
    const byPosition = { 'Goalkeeper': [], 'Defender': [], 'Midfielder': [], 'Atacker': [], 'Unknown': [] };

    filteredPlayers.forEach((player) => {
      const pos = player.additionalInfo?.position || 'Unknown';
      if (byPosition[pos]) {
        byPosition[pos].push(player);
      } else {
        byPosition.Unknown.push(player);
      }
    });

    // Show detailed squad list
    console.log('DETAILED SQUAD LIST:');
    console.log('Format: Name | Jersey | Age | Position');
    console.log('-'.repeat(100));

    filteredPlayers.forEach((player, i) => {
      const name = player.fullName;
      const jersey = player.playerNumber || '?';
      const birthdate = player.additionalInfo?.birthdate || 'Unknown';
      const age = calculateAge(birthdate);
      const position = player.additionalInfo?.position || 'Unknown';

      console.log(`${i + 1}. ${name.padEnd(25)} | #${String(jersey).padEnd(3)} | Age: ${String(age).padEnd(2)} | ${position}`);
    });

    console.log('');
    console.log('='.repeat(100));
    console.log('POSITION BREAKDOWN:');
    console.log('='.repeat(100));

    Object.entries(byPosition).forEach(([pos, players]) => {
      if (players.length > 0) {
        console.log(`\n${pos} (${players.length} players):`);
        players.forEach((player) => {
          const name = player.fullName;
          const jersey = player.playerNumber || '?';
          const age = calculateAge(player.additionalInfo?.birthdate);
          console.log(`  ${name} (Age: ${age}, #${jersey})`);
        });
      }
    });

    console.log('');
    console.log('='.repeat(100));
    console.log('FORMATION CALCULATION (CURRENT - API BASED):');
    console.log('='.repeat(100));

    const gkCount = byPosition.Goalkeeper.length;
    const dfCount = byPosition.Defender.length;
    const mfCount = byPosition.Midfielder.length;
    const fwCount = byPosition.Atacker.length;

    console.log(`GK: ${gkCount}`);
    console.log(`DF: ${dfCount}`);
    console.log(`MF: ${mfCount}`);
    console.log(`FW (Atacker): ${fwCount}`);

    const totalOutfield = dfCount + mfCount + fwCount;
    if (totalOutfield > 0) {
      const dfRatio = dfCount / totalOutfield;
      const mfRatio = mfCount / totalOutfield;
      const fwRatio = fwCount / totalOutfield;

      console.log(`\nRatios - DF: ${(dfRatio * 100).toFixed(0)}%, MF: ${(mfRatio * 100).toFixed(0)}%, FW: ${(fwRatio * 100).toFixed(0)}%`);

      if (fwRatio > 0.35) {
        console.log(`\n⚠️ ISSUE: FW ratio is ${(fwRatio * 100).toFixed(0)}% (>35%)`);
        console.log(`This suggests too many players classified as "Atacker"`);
        console.log(`In real football, wingers would count as midfielders in a 4-3-3`);
      }
    }

  } catch (error) {
    console.error(`Error:`, error.message);
  }
}

showArsenalSquad();
