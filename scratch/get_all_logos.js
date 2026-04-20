const apiKey = 'd35d1fc1aabe0671e1e80ee5a6296bef';
const teamIds = ['66', '4', '39', '93', '9', '105', '3'];

async function getLogos() {
  const logos = {};
  for (const id of teamIds) {
    try {
      const res = await fetch(`https://api.statorium.com/api/v1/teams/${id}/?apikey=${apiKey}`);
      const data = await res.json();
      const team = data.team || data;
      logos[id] = team.logo || team.teamLogo || team.logo_path;
    } catch (e) {
      console.log(`Error ${id}:`, e.message);
    }
  }
  console.log('LOGOS_MAP:', JSON.stringify(logos, null, 2));
}

getLogos();
