const fs = require('fs');
const path = 'app/(dashboard)/leagues/[id]/league-details-client.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('const gks = filterByPos(["1"], ["goalk"]);', 'const gks = filterByPos(["1"], ["gk", "goal"]);');
content = content.replace('const dfs = filterByPos(["2"], ["defen"]);', 'const dfs = filterByPos(["2"], ["def"]);');
content = content.replace('const mfs = filterByPos(["3"], ["midf"]);', 'const mfs = filterByPos(["3"], ["mid"]);');
content = content.replace('const fws = filterByPos(["4"], ["forw", "attac", "strik"]);', 'const fws = filterByPos(["4"], ["forw", "atac", "attac", "strik"]);');

fs.writeFileSync(path, content);
console.log('Update complete');
