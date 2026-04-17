const fs = require('fs');
const photoOutput = fs.readFileSync('scratch/photo_output_clean.ts', 'utf8');
let statoriumTs = fs.readFileSync('app/actions/statorium.ts', 'utf8');

const startMarker = 'const ELITE_PLAYER_PHOTOS: Record<string, string> = {';
const endMarker = '};';

const startIdx = statoriumTs.indexOf(startMarker);
if (startIdx === -1) {
    console.error('Could not find ELITE_PLAYER_PHOTOS start marker');
    process.exit(1);
}

const endIdx = statoriumTs.indexOf(endMarker, startIdx) + 2;
if (endIdx === -1) {
    console.error('Could not find ELITE_PLAYER_PHOTOS end marker');
    process.exit(1);
}

const newStatoriumTs = statoriumTs.substring(0, startIdx) + photoOutput + statoriumTs.substring(endIdx);

fs.writeFileSync('app/actions/statorium.ts', newStatoriumTs, 'utf8');
console.log('Successfully updated ELITE_PLAYER_PHOTOS in app/actions/statorium.ts');
