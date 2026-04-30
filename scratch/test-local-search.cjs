const fs = require('fs');
const path = require('path');

function normalizeName(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

const dbPath = path.join(process.cwd(), 'src', 'lib', 'all-players-db.json');
const content = fs.readFileSync(dbPath, 'utf-8');
const db = JSON.parse(content);

const query = "Scalvini";
const normalizedQuery = normalizeName(query);

const results = db.filter((p) => {
  const fullName = normalizeName(p.fullName || `${p.firstName} ${p.lastName}`);
  return fullName.includes(normalizedQuery);
});

console.log(`Found ${results.length} results for "${query}":`);
results.slice(0, 5).forEach(p => console.log(`- ${p.fullName} (ID: ${p.playerID}, Team: ${p.teamName})`));
