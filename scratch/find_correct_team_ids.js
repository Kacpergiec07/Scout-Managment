import { StatoriumClient } from '../lib/statorium/client.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function findTeamIds() {
  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');

  const leagues = [
    { id: "515", name: "Premier League" },
    { id: "558", name: "La Liga" },
    { id: "521", name: "Bundesliga" },
    { id: "519", name: "Ligue 1" },
    { id: "511", name: "Serie A" }
  ];

  const targetTeams = [
    'Manchester City', 'Liverpool', 'Chelsea', 'Manchester United',
    'Bayern Munich', 'Dortmund', 'PSG', 'Marseille',
    'Inter Milan', 'AC Milan', 'Juventus', 'Naples', 'Roma'
  ];

  console.log('='.repeat(100));
  console.log('FINDING CORRECT TEAM IDs FOR MAJOR CLUBS');
  console.log('='.repeat(100));
  console.log('');

  const foundTeams = [];

  for (const league of leagues) {
    console.log(`Checking ${league.name}...`);
    try {
      const standings = await client.getStandings(league.id);

      if (standings && standings.length > 0) {
        standings.forEach((team) => {
          const teamName = team.teamName || team.teamMiddleName || '';
          const targetFound = targetTeams.some(target =>
            teamName.toLowerCase().includes(target.toLowerCase())
          );

          if (targetFound || ['Real Madrid', 'Barcelona', 'Arsenal'].some(target =>
            teamName.toLowerCase().includes(target.toLowerCase())
          )) {
            foundTeams.push({
              name: teamName,
              teamId: team.teamID,
              league: league.name,
              seasonId: league.id
            });
          }
        });
      }
    } catch (error) {
      console.error(`Error fetching ${league.name}:`, error.message);
    }
  }

  console.log('');
  console.log('='.repeat(100));
  console.log('FOUND TEAM IDs');
  console.log('='.repeat(100));
  console.log('Team'.padEnd(25) + 'Team ID'.padEnd(12) + 'League');
  console.log('-'.repeat(100));

  // Sort and display found teams
  foundTeams.sort((a, b) => a.name.localeCompare(b.name));
  foundTeams.forEach(team => {
    console.log(`${team.name.padEnd(25)}${String(team.teamId).padEnd(12)}${team.league}`);
  });

  console.log('');
  console.log(`Total teams found: ${foundTeams.length}`);

  return foundTeams;
}

findTeamIds();
