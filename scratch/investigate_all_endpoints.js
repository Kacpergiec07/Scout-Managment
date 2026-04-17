import { StatoriumClient } from '../lib/statorium/client.ts';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function investigateAllEndpoints() {
  console.log('='.repeat(100));
  console.log('STATORIUM API - COMPREHENSIVE ENDPOINT INVESTIGATION');
  console.log('='.repeat(100));
  console.log('');

  const client = new StatoriumClient(process.env.STATORIUM_API_KEY || '');

  // Test team and season IDs that we know work
  const testTeamId = '37'; // Real Madrid
  const testSeasonId = '558'; // La Liga
  const testPlayerId = '58'; // Trent Alexander-Arnold
  const testMatchId = '1'; // Generic match ID

  const endpoints = [
    {
      name: '1. PLAYERS SEARCH',
      url: `/players/`,
      params: { q: 'Ronaldo' },
      description: 'Search for players by name'
    },
    {
      name: '2. PLAYER DETAILS',
      url: `/players/${testPlayerId}/`,
      params: { showstat: 'true' },
      description: 'Get detailed player information with stats'
    },
    {
      name: '3. TEAM STATS',
      url: `/teams_stats/${testTeamId}/`,
      params: { season_id: testSeasonId },
      description: 'Get team statistics for a season'
    },
    {
      name: '4. STANDINGS',
      url: `/standings/${testSeasonId}/`,
      params: {},
      description: 'Get league standings/table'
    },
    {
      name: '5. TEAM SQUAD',
      url: `/teams/${testTeamId}/squad/${testSeasonId}/`,
      params: { season_id: testSeasonId },
      description: 'Get all players for a team in a season'
    },
    {
      name: '6. TRANSFERS',
      url: `/transfers/`,
      params: { team_id: testTeamId, season_id: testSeasonId },
      description: 'Get transfer information'
    },
    {
      name: '7. TEAM DETAILS',
      url: `/teams/${testTeamId}/`,
      params: {},
      description: 'Get detailed team information'
    },
    {
      name: '8. MATCHES',
      url: `/matches/`,
      params: { season_id: testSeasonId },
      description: 'Get all matches for a season'
    },
    {
      name: '9. MATCH DETAILS',
      url: `/matches/${testMatchId}/`,
      params: {},
      description: 'Get detailed match information'
    },
    {
      name: '10. LEAGUES',
      url: `/leagues/`,
      params: {},
      description: 'Get all available leagues'
    }
  ];

  // Additional endpoints to try (potential undiscovered ones)
  const additionalEndpoints = [
    {
      name: '11. TOP SCORERS',
      url: `/topscorers/${testSeasonId}/`,
      params: {},
      description: 'Get top scorers for a season (experimental)'
    },
    {
      name: '12. TEAM FIXTURES',
      url: `/teams/${testTeamId}/fixtures/`,
      params: { season_id: testSeasonId },
      description: 'Get team fixtures (experimental)'
    },
    {
      name: '13. PLAYER STATS',
      url: `/players/${testPlayerId}/stats/`,
      params: { season_id: testSeasonId },
      description: 'Get player statistics (experimental)'
    },
    {
      name: '14. LEAGUE STATS',
      url: `/leagues/${testSeasonId}/stats/`,
      params: {},
      description: 'Get league statistics (experimental)'
    },
    {
      name: '15. TEAM RESULTS',
      url: `/teams/${testTeamId}/results/`,
      params: { season_id: testSeasonId },
      description: 'Get team results (experimental)'
    }
  ];

  const allEndpoints = [...endpoints, ...additionalEndpoints];

  for (const endpoint of allEndpoints) {
    console.log('='.repeat(100));
    console.log(endpoint.name);
    console.log('='.repeat(100));
    console.log(`Endpoint: ${endpoint.url}`);
    console.log(`Description: ${endpoint.description}`);
    console.log(`Parameters: ${JSON.stringify(endpoint.params)}`);
    console.log('');

    try {
      // Make the API call
      const baseUrl = 'https://api.statorium.com/api/v1';
      const url = new URL(`${baseUrl}${endpoint.url}`);
      url.searchParams.append('apikey', process.env.STATORIUM_API_KEY || '');
      Object.entries(endpoint.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString(), {
        next: { revalidate: 3600 }
      });

      if (!response.ok) {
        console.log(`❌ Status: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`Error: ${errorText.substring(0, 200)}`);
        console.log('');
        continue;
      }

      const data = await response.json();
      console.log(`✅ Status: ${response.status} ${response.statusText}`);

      // Show raw JSON structure
      console.log('\n📋 RAW JSON STRUCTURE:');
      console.log(JSON.stringify(data, null, 2).substring(0, 1500));

      // Extract and show all available fields
      console.log('\n🔍 AVAILABLE FIELDS:');
      const fields = extractAllFields(data);
      Object.entries(fields).forEach(([category, fieldList]) => {
        console.log(`\n${category}:`);
        fieldList.forEach(field => {
          console.log(`  - ${field}`);
        });
      });

      // Show sample data for key objects
      console.log('\n📊 SAMPLE DATA:');
      showSampleData(data);

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    console.log('');
    console.log('---');
    console.log('');
  }

  console.log('='.repeat(100));
  console.log('INVESTIGATION COMPLETE');
  console.log('='.repeat(100));
}

function extractAllFields(data, prefix = '') {
  const fields = {};

  if (typeof data !== 'object' || data === null) {
    return fields;
  }

  if (Array.isArray(data)) {
    if (data.length > 0) {
      return extractAllFields(data[0], prefix);
    }
    return fields;
  }

  Object.keys(data).forEach(key => {
    const value = data[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const subFields = extractAllFields(value, fullKey);
      Object.entries(subFields).forEach(([category, fieldList]) => {
        if (!fields[category]) fields[category] = [];
        fields[category].push(...fieldList);
      });
    } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      const subFields = extractAllFields(value[0], `${fullKey}[0]`);
      Object.entries(subFields).forEach(([category, fieldList]) => {
        if (!fields[category]) fields[category] = [];
        fields[category].push(...fieldList);
      });
    } else {
      // Determine category based on key name
      let category = 'General';
      if (key.toLowerCase().includes('player')) category = 'Player';
      else if (key.toLowerCase().includes('team')) category = 'Team';
      else if (key.toLowerCase().includes('match')) category = 'Match';
      else if (key.toLowerCase().includes('season')) category = 'Season';
      else if (key.toLowerCase().includes('league')) category = 'League';
      else if (key.toLowerCase().includes('stat')) category = 'Statistics';
      else if (key.toLowerCase().includes('goal') || key.toLowerCase().includes('assist')) category = 'Performance';
      else if (key.toLowerCase().includes('position') || key.toLowerCase().includes('number')) category = 'Player Info';

      if (!fields[category]) fields[category] = [];
      if (!fields[category].includes(fullKey)) {
        fields[category].push(fullKey);
      }
    }
  });

  return fields;
}

function showSampleData(data, depth = 0, maxDepth = 2) {
  if (depth > maxDepth) return;

  const indent = '  '.repeat(depth);

  if (Array.isArray(data)) {
    console.log(`${indent}Array with ${data.length} items`);
    if (data.length > 0 && depth < maxDepth) {
      showSampleData(data[0], depth + 1, maxDepth);
    }
  } else if (typeof data === 'object' && data !== null) {
    Object.keys(data).slice(0, 5).forEach(key => {
      const value = data[key];
      if (typeof value === 'object' && value !== null) {
        console.log(`${indent}${key}:`);
        showSampleData(value, depth + 1, maxDepth);
      } else {
        const displayValue = String(value).length > 50 ? String(value).substring(0, 50) + '...' : String(value);
        console.log(`${indent}  ${key}: ${displayValue}`);
      }
    });
    if (Object.keys(data).length > 5) {
      console.log(`${indent}  ... and ${Object.keys(data).length - 5} more fields`);
    }
  }
}

investigateAllEndpoints();
