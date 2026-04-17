const fs = require('fs');
let src = fs.readFileSync('app/actions/statorium.ts', 'utf8');

const newFunctions = `
// Normalize a name by converting all special characters to ASCII equivalents
function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u00f8\u00d8]/g, 'o')
    .replace(/\u00df/g, 'ss')
    .replace(/\u0131/g, 'i')
    .replace(/\u0219/g, 's').replace(/\u021b/g, 't')
    .replace(/[\u0107\u0106]/g, 'c')
    .replace(/[\u017e\u017d]/g, 'z')
    .replace(/[\u0161\u0160]/g, 's')
    .toLowerCase().trim();
}

let _photoIdx: Map<string, string> | null = null;
function getPhotoIdx(): Map<string, string> {
  if (_photoIdx) return _photoIdx;
  _photoIdx = new Map();
  for (const [name, url] of Object.entries(ELITE_PLAYER_PHOTOS)) {
    _photoIdx.set(normalizeName(name), url);
  }
  return _photoIdx;
}

function resolvePlayerPhoto(p: any): string {
  const name = (p.fullName || \`\${p.firstName} \${p.lastName}\`).trim();
  if (ELITE_PLAYER_PHOTOS[name]) return ELITE_PLAYER_PHOTOS[name];
  const idx = getPhotoIdx();
  const nl = normalizeName(name);
  if (idx.has(nl)) return idx.get(nl)!;
  let photo = p.playerPhoto || p.photo;
  if (photo && !photo.startsWith('http')) {
    const cleanPath = photo.startsWith('/') ? photo : \`/\${photo}\`;
    if (!cleanPath.startsWith('/media/bearleague/')) {
      photo = \`https://api.statorium.com/media/bearleague\${cleanPath}\`;
    } else {
      photo = \`https://api.statorium.com\${cleanPath}\`;
    }
  }
  return photo || \`https://api.statorium.com/media/bearleague/bl\${p.playerID}.webp\`;
}
`;

// Find and replace the old resolvePlayerPhoto function
const startMarker = '\nfunction resolvePlayerPhoto(p: any): string {';
const endMarker = '\nexport async function getStandingsAction';

const start = src.indexOf(startMarker);
const end = src.indexOf(endMarker);

if (start === -1 || end === -1) {
  console.error('Markers not found! start:', start, 'end:', end);
  process.exit(1);
}

src = src.substring(0, start) + newFunctions + '\n' + src.substring(end);
fs.writeFileSync('app/actions/statorium.ts', src, 'utf8');
console.log('Done! resolvePlayerPhoto updated with normalization support.');
