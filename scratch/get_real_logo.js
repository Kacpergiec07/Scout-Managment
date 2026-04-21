const apiKey = 'd35d1fc1aabe0671e1e80ee5a6296bef'; // From your code
const teamId = '37'; // Real Madrid
const url = `https://api.statorium.com/api/v1/teams/${teamId}/?apikey=${apiKey}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log('Team Data:', JSON.stringify(data.team || data, null, 2));
    const logo = data.team?.logo || data.team?.teamLogo || data.logo || data.teamLogo;
    console.log('Logo URL:', logo);
  })
  .catch(err => console.log('Error:', err.message));
