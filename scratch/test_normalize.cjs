// Test the normalization logic
function normalizeName(name) {
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

const testCases = [
  ['Martin Ødegaard', 'martin odegaard'],
  ['Kylian Mbappé', 'kylian mbappe'],
  ['Rafael Leão', 'rafael leao'],
  ['Vinícius Júnior', 'vinicius junior'],
  ['Nicolò Barella', 'nicolo barella'],
  ['Rúben Dias', 'ruben dias'],
  ['Radu Drăgușin', 'radu dragosin'],  // ș=s, ă=a
  ['Kenan Yıldız', 'kenan yildiz'],
  ['Pascal Groß', 'pascal gross'],
  ['Benoît Badiashile', 'benoit badiashile'],
  ['Lazar Samardžić', 'lazar samardzic'],
  ['Adrian Šemper', 'adrian semper'],
];

let passed = 0;
testCases.forEach(([input, expected]) => {
  const result = normalizeName(input);
  const ok = result === expected;
  console.log(ok ? '✓' : '✗', `"${input}" → "${result}" ${ok ? '' : `(expected "${expected}")`}`);
  if (ok) passed++;
});
console.log(`\n${passed}/${testCases.length} tests passed`);
