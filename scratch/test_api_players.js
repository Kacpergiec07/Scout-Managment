const API_KEY = 'd35d1fc1aabe0671e1e80ee5a6296bef';
const LEAGUES = ['515', '558', '521'];

async function getLogos() {
    for (const lid of LEAGUES) {
        try {
            const url = `https://api.statorium.com/api/v1/standings/${lid}/?apikey=${API_KEY}`;
            const resp = await fetch(url);
            const data = await resp.json();
            const standings = data.standings || data.season?.standings || [];
            console.log(`\nLeague ${lid}:`);
            standings.forEach(s => {
                const name = s.teamName || s.teamMiddleName || '';
                if (name.includes('Liverpool') || name.includes('Barcelona') || name.includes('Leverkusen') || name.includes('Napoli')) {
                    console.log(`${name}: ${s.logo || s.teamLogo}`);
                }
            });
        } catch (e) {}
    }
}

getLogos();
