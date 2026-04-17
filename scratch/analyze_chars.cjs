const fs = require('fs');
const src = fs.readFileSync('app/actions/statorium.ts', 'utf8');

// Extract all names from ELITE_PLAYER_PHOTOS
const match = src.match(/const ELITE_PLAYER_PHOTOS: Record<string, string> = \{([\s\S]*?)\};/);
const names = [];
const nameRegex = /"([^"]+)":\s*"https/g;
let m;
while ((m = nameRegex.exec(match[1])) !== null) {
  names.push(m[1]);
}

// Find all unique non-ASCII characters
const specialChars = new Set();
const charExamples = {};
names.forEach(name => {
  [...name].forEach(ch => {
    if (ch.charCodeAt(0) > 127) {
      specialChars.add(ch);
      if (!charExamples[ch]) charExamples[ch] = name;
    }
  });
});

console.log('Total players:', names.length);
console.log('Unique special chars found:', specialChars.size);
[...specialChars].sort().forEach(ch => {
  console.log(JSON.stringify(ch) + ' (U+' + ch.charCodeAt(0).toString(16).toUpperCase().padStart(4,'0') + ') in: ' + charExamples[ch]);
});
