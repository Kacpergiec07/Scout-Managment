
import * as fs from 'fs';
import * as path from 'path';

const CACHE_DIR = 'scratch/cache';
const leagues = [
    { name: 'Premier League', id: '515' },
    { name: 'La Liga', id: '558' },
    { name: 'Bundesliga', id: '511' },
    { name: 'Serie A', id: '521' },
    { name: 'Ligue 1', id: '519' }
];

function extractStatValue(stat: any, key: string): number {
  if (!stat) return 0;
  const val = stat[key] || stat[key.toLowerCase()] || stat[key + 's'] || stat[key.toLowerCase() + 's'] || 0;
  return parseInt(val as string) || 0;
}

async function main() {
    const results: any = {};

    for (const league of leagues) {
        console.log(`Aggregating ${league.name}...`);
        results[league.name] = [];
        
        // Use a simpler way to find squads - they are already in the root scratch dir if we are lucky
        // or we can just look at ALL cached players and group them by team if they have a stat for this league
    }

    // Alternative: Just iterate over ALL 3000+ players once and group them
    const allPlayers: any[] = [];
    const files = fs.readdirSync(CACHE_DIR);
    console.log(`Reading ${files.length} player files...`);

    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        try {
            const player = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, file), 'utf8'));
            allPlayers.push(player);
        } catch (e) {}
    }

    for (const league of leagues) {
        const leagueResults: any[] = [];
        const teamsMap: Map<string, any[]> = new Map();

        for (const player of allPlayers) {
            if (!player.stat) continue;
            const currentStat = player.stat.find((s: any) => String(s.season_id) === String(league.id));
            if (currentStat) {
                const teamName = currentStat.team_name;
                if (!teamsMap.has(teamName)) teamsMap.set(teamName, []);
                
                const goals = extractStatValue(currentStat, 'Goals');
                const assists = extractStatValue(currentStat, 'Assist');
                
                if (goals > 0 || assists > 0) {
                    teamsMap.get(teamName)?.push({
                        name: player.fullName || player.shortName,
                        goals,
                        assists,
                        total: goals + assists
                    });
                }
            }
        }

        for (const [teamName, playerStats] of teamsMap.entries()) {
            playerStats.sort((a, b) => b.goals - a.goals || b.assists - a.assists);
            const top2Scorers = playerStats.slice(0, 2);

            playerStats.sort((a, b) => b.assists - a.assists || b.goals - a.goals);
            const top2Assists = playerStats.slice(0, 2);

            leagueResults.push({ teamName, topScorers: top2Scorers, topAssists: top2Assists });
        }
        
        leagueResults.sort((a, b) => a.teamName.localeCompare(b.teamName));
        results[league.name] = leagueResults;
    }

    fs.writeFileSync('scratch/final_top_stats.json', JSON.stringify(results, null, 2));
    console.log('Done! Aggregated results saved to scratch/final_top_stats.json');
}

main();
