const fs = require('fs');
let src = fs.readFileSync('app/actions/statorium.ts', 'utf8');

const newCode = `export async function getPlayerDetailsAction(playerId: string) {
  if (!playerId) return null;
  try {
    const client = getStatoriumClient();
    const result = await client.getPlayerDetails(playerId);
    if (!result) return null;

    // Flatten additionalInfo for easier UI consumption
    const p = (result as any).player || result;
    const info = p.additionalInfo || {};
    
    // Extract age from birthdate string like "20-12-1998 (27)"
    let ageValue = info.age || "";
    if (!ageValue && info.birthdate) {
      const match = String(info.birthdate).match(/\\((\\d+)\\)/);
      if (match) ageValue = match[1];
    }

    return {
      ...p,
      weight: info.weight || "",
      height: info.height || "",
      age: ageValue,
      position: p.position || info.position || "N/A"
    };
  } catch (error) {
    console.error(\`getPlayerDetailsAction error for id=\${playerId}:\`, error);
    return null;
  }
}`;

const startMarker = 'export async function getPlayerDetailsAction(playerId: string)';
const startIdx = src.indexOf(startMarker);

if (startIdx !== -1) {
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
        src = src.substring(0, startIdx) + newCode + src.substring(finalEndIdx);
        fs.writeFileSync('app/actions/statorium.ts', src, 'utf8');
        console.log('Successfully replaced getPlayerDetailsAction');
    } else {
        console.log('Could not find closing bracket');
    }
} else {
    console.log('Could not find function start');
}
