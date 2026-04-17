import { StatoriumClient } from '../lib/statorium/client.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');

  const teamId = '37';
  const seasonId = '558';

  console.log('='.repeat(100));
  console.log('DEBUGGING POSITION FILTERING FOR REAL MADRID');
  console.log('='.repeat(100));

  const players = await client.getPlayersByTeam(teamId, seasonId);
  console.log(`Total players from API: ${players.length}`);
  console.log('');

  // Helper function to calculate age from birthdate
  const calculateAge = (birthdate) => {
    if (!birthdate) return 0;
    const match = birthdate.match(/(\d{2})-(\d{2})-(\d{4})/);
    if (!match) return 0;
    const birthYear = parseInt(match[3]);
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  // Filter first-team players
  const firstTeamPlayers = players.filter((p) => {
    // Must be active
    if (p.playerDeparted !== "0") return false;

    // Must have valid jersey number 1-25
    const jerseyNum = parseInt(p.playerNumber);
    if (isNaN(jerseyNum) || jerseyNum < 1 || jerseyNum > 25) return false;

    // Must be 18 or older
    const age = calculateAge(p.additionalInfo?.birthdate);
    if (age < 18) return false;

    return true;
  });

  console.log(`First-team players (18+, jersey 1-25, active): ${firstTeamPlayers.length}`);
  console.log('');

  // Show each filtered player with their position data
  console.log('First-team players:');
  firstTeamPlayers.forEach((player, i) => {
    const pos = player.additionalInfo?.position || 'Unknown';
    const posLower = pos.toLowerCase();
    const jersey = player.playerNumber;
    const birthdate = player.additionalInfo?.birthdate || 'Unknown';
    const age = calculateAge(birthdate);

    // Categorize position
    let category = 'Unknown';
    if (posLower.includes('gk') || posLower.includes('goal') || posLower.includes('goalkeeper')) {
      category = 'GK';
    } else if (posLower.includes('df') || posLower.includes('def') || posLower.includes('defender')) {
      category = 'DF';
    } else if (posLower.includes('mf') || posLower.includes('mid') || posLower.includes('midfielder')) {
      category = 'MF';
    } else if (posLower.includes('fw') || posLower.includes('ata') || posLower.includes('for') || posLower.includes('attacker') || posLower.includes('forward')) {
      category = 'FW';
    }

    console.log(`${i + 1}. ${player.fullName} | Position: ${pos} (${category}) | Jersey: ${jersey} | Age: ${age}`);
  });

  // Count by category
  const categories = { GK: 0, DF: 0, MF: 0, FW: 0, Unknown: 0 };
  firstTeamPlayers.forEach((player) => {
    const pos = (player.additionalInfo?.position || '').toLowerCase();
    if (pos.includes('gk') || pos.includes('goal') || pos.includes('goalkeeper')) {
      categories.GK++;
    } else if (pos.includes('df') || pos.includes('def') || pos.includes('defender')) {
      categories.DF++;
    } else if (pos.includes('mf') || pos.includes('mid') || pos.includes('midfielder')) {
      categories.MF++;
    } else if (pos.includes('fw') || pos.includes('ata') || pos.includes('for') || pos.includes('attacker') || pos.includes('forward')) {
      categories.FW++;
    } else {
      categories.Unknown++;
    }
  });

  console.log('');
  console.log('Position counts:');
  console.log(`GK: ${categories.GK}`);
  console.log(`DF: ${categories.DF}`);
  console.log(`MF: ${categories.MF}`);
  console.log(`FW: ${categories.FW}`);
  console.log(`Unknown: ${categories.Unknown}`);
  console.log(`Total: ${Object.values(categories).reduce((a, b) => a + b, 0)}`);

  // Calculate formation
  const totalOutfield = categories.DF + categories.MF + categories.FW;
  console.log('');
  console.log(`Total outfield: ${totalOutfield}`);

  if (totalOutfield > 0) {
    const dfRatio = categories.DF / totalOutfield;
    const mfRatio = categories.MF / totalOutfield;
    const fwRatio = categories.FW / totalOutfield;

    console.log(`Ratios - DF: ${dfRatio.toFixed(2)}, MF: ${mfRatio.toFixed(2)}, FW: ${fwRatio.toFixed(2)}`);

    let d = 4, m = 4, f = 2;

    if (mfRatio >= 0.35 && fwRatio >= 0.30) {
      d = 4; m = 3; f = 3;
      console.log('Formation logic: Strong midfield and attack -> 4-3-3');
    } else if (dfRatio > 0.45 && fwRatio < 0.20) {
      d = 5; m = 3; f = 2;
      console.log('Formation logic: Defense-heavy, attack-light -> 5-3-2');
    } else if (dfRatio > 0.50 && mfRatio > 0.35) {
      d = 3; m = 5; f = 2;
      console.log('Formation logic: Very defensive with midfield -> 3-5-2');
    } else if (mfRatio > 0.45) {
      d = 4; m = 5; f = 1;
      console.log('Formation logic: Midfield-dominant -> 4-5-1');
    } else if (fwRatio > 0.40) {
      d = 4; m = 2; f = 4;
      console.log('Formation logic: Attack-dominant -> 4-2-4');
    } else if (dfRatio > 0.40) {
      d = 5; m = 4; f = 1;
      console.log('Formation logic: Defense-oriented -> 5-4-1');
    } else {
      d = 4; m = 4; f = 2;
      console.log('Formation logic: Balanced -> 4-4-2');
    }

    // Ensure we don't request more players than available
    d = Math.min(d, categories.DF);
    m = Math.min(m, categories.MF);
    f = Math.min(f, categories.FW);

    console.log(`Final formation: ${d}-${m}-${f} (available: D=${categories.DF}, M=${categories.MF}, F=${categories.FW})`);
  }
}

test();
