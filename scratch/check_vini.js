async function checkRealMadrid() {
  const apiKey = 'd35d1fc1aabe0671e1e80ee5a6296bef';
  const url = `https://api.statorium.com/api/v1/teams/37/?apikey=${apiKey}&season_id=558`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const players = data.team.players || [];
    const vini = players.find(p => p.fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes('vinicius'));
    if (vini) {
      console.log(JSON.stringify(vini, null, 2));
    }
  } catch (e) {
    console.error(e);
  }
}

checkRealMadrid();
