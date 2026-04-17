import { StatoriumClient } from '../lib/statorium/client.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');

  const teamId = '37';
  const seasonId = '558';

  console.log('='.repeat(100));
  console.log('TESTING FIXED POSITION FILTERING FOR REAL MADRID');
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

  // Categorize using FIXED logic
  const gks = firstTeamPlayers.filter((p) => {
    const pos = (p.position || p.additionalInfo?.position || '').toLowerCase();
    return pos === 'goalkeeper' || pos === 'gk' || pos.startsWith('goal');
  });
  const dfs = firstTeamPlayers.filter((p) => {
    const pos = (p.position || p.additionalInfo?.position || '').toLowerCase();
    return pos === 'defender' || pos === 'df' || (pos.startsWith('def') && !pos.includes('mid'));
  });
  const mfs = firstTeamPlayers.filter((p) => {
    const pos = (p.position || p.additionalInfo?.position || '').toLowerCase();
    return pos === 'midfielder' || pos === 'mf' || pos.includes('mid');
  });
  const fws = firstTeamPlayers.filter((p) => {
    const pos = (p.position || p.additionalInfo?.position || '').toLowerCase();
    return pos === 'atacker' || pos === 'attacker' || pos === 'forward' || pos === 'fw' || pos === 'striker' || pos === 'st' || pos.includes('ata');
  });

  // Show each filtered player with their position data
  console.log('First-team players with corrected positions:');
  firstTeamPlayers.forEach((player, i) => {
    const pos = player.additionalInfo?.position || 'Unknown';
    const posLower = pos.toLowerCase();
    const jersey = player.playerNumber;
    const birthdate = player.additionalInfo?.birthdate || 'Unknown';
    const age = calculateAge(birthdate);

    // Categorize position using FIXED logic
    let category = 'Unknown';
    if (posLower === 'goalkeeper' || posLower === 'gk' || posLower.startsWith('goal')) {
      category = 'GK';
    } else if (posLower === 'defender' || posLower === 'df' || (posLower.startsWith('def') && !posLower.includes('mid'))) {
      category = 'DF';
    } else if (posLower === 'midfielder' || posLower === 'mf' || posLower.includes('mid')) {
      category = 'MF';
    } else if (posLower === 'atacker' || posLower === 'attacker' || posLower === 'forward' || posLower === 'fw' || posLower === 'striker' || posLower === 'st' || posLower.includes('ata')) {
      category = 'FW';
    }

    console.log(`${i + 1}. ${player.fullName} | Position: ${pos} (${category}) | Jersey: ${jersey} | Age: ${age}`);
  });

  console.log('');
  console.log('Position counts:');
  console.log(`GK: ${gks.length}`);
  console.log(`DF: ${dfs.length}`);
  console.log(`MF: ${mfs.length}`);
  console.log(`FW: ${fws.length}`);
  console.log(`Total: ${gks.length + dfs.length + mfs.length + fws.length}`);

  // Calculate formation
  const totalOutfield = dfs.length + mfs.length + fws.length;
  console.log('');
  console.log(`Total outfield: ${totalOutfield}`);

  if (totalOutfield > 0) {
    const dfRatio = dfs.length / totalOutfield;
    const mfRatio = mfs.length / totalOutfield;
    const fwRatio = fws.length / totalOutfield;

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
    d = Math.min(d, dfs.length);
    m = Math.min(m, mfs.length);
    f = Math.min(f, fws.length);

    console.log(`Final formation: ${d}-${m}-${f} (available: D=${dfs.length}, M=${mfs.length}, F=${fws.length})`);
  }
}

test();
