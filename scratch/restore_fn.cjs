const fs = require('fs');
let src = fs.readFileSync('app/actions/statorium.ts', 'utf8');

const newFunction = `export async function getPlayersByClubAction(teamId: string, seasonId?: string) {
  if (!teamId) return [];
  try {
    const client = getStatoriumClient();
    
    // First figure out the seasonId if not provided by testing the top 5 leagues
    let reliableSeasonId = seasonId;
    if (!reliableSeasonId) {
      const TOP_LEAGUES = [
        { id: "515", name: "Premier League" },
        { id: "558", name: "La Liga" },
        { id: "511", name: "Serie A" },
        { id: "521", name: "Bundesliga" },
        { id: "519", name: "Ligue 1" },
      ];
      for (const league of TOP_LEAGUES) {
        try {
           const standings = await client.getStandings(league.id);
           const found = standings.find((s: any) => s.teamID?.toString() === teamId);
           if (found) {
             reliableSeasonId = league.id;
             break;
           }
        } catch (e) {}
      }
    }

    const teamDetails = await getTeamDetailsAction(teamId, reliableSeasonId);
    if (!teamDetails || !teamDetails.players) return [];
    
    return teamDetails.players.map(p => {
      const fullName = p.fullName || \`\${p.firstName} \${p.lastName}\`;
      return {
        id: p.playerID,
        name: fullName,
        position: resolvePosition(p.position || p.additionalInfo?.position, p.playerID),
        marketValue: "€" + (Math.floor(Math.random() * 80) + 5) + "M",
        photoUrl: resolvePlayerPhoto(p)
      };
    });
  } catch (error) {
    console.error('Get Players By Club Action Error:', error);
    return [];
  }
}`;

const startMarker = 'export async function getPlayersByClubAction(teamId: string, seasonId?: string) {';
const startIdx = src.indexOf(startMarker);
const endIdx = src.indexOf('}', startIdx + 30) + 1; // Find first closing brace after start

if (startIdx !== -1) {
    // Find real end by counting braces
    let bracketCount = 0;
    let finalEndIdx = -1;
    for (let i = startIdx; i < src.length; i++) {
        if (src[i] === '{') bracketCount++;
        if (src[i] === '}') {
            bracketCount--;
            if (bracketCount === 0 && i > startIdx + 20) {
                finalEndIdx = i + 1;
                break;
            }
        }
    }
    
    if (finalEndIdx !== -1) {
        src = src.substring(0, startIdx) + newFunction + src.substring(finalEndIdx);
        fs.writeFileSync('app/actions/statorium.ts', src, 'utf8');
        console.log('Successfully restored and updated getPlayersByClubAction');
    }
} else {
    console.log('Function not found');
}
