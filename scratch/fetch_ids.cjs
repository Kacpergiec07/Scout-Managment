require('dotenv').config({path: '.env.local'});
const names = [
  "Jude Bellingham", "Harry Kane", "Declan Rice", "Josko Gvardiol", "Moises Caicedo", 
  "Rasmus Hojlund", "Sandro Tonali", "Randal Kolo Muani", "Granit Xhaka", "Ousmane Dembele", 
  "Lucas Hernandez", "Benjamin Pavard", "Dejan Kulusevski", "Manuel Ugarte", "Mason Mount"
];

async function getIds() {
  const apiKey = process.env.STATORIUM_API_KEY;
  const results = {};
  
  for (const name of names) {
    const q = name;
    try {
      const res = await fetch(`https://api.statorium.com/api/v1/players/?apikey=${apiKey}&q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.players && data.players.length > 0) {
        const p = data.players.find(x => x.fullName.includes(name) || name.includes(x.lastName)) || data.players[0];
        results[name] = p.playerID;
      } else {
        results[name] = "NOT_FOUND";
      }
    } catch (e) {
      results[name] = "ERROR: " + e.message;
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

getIds();
