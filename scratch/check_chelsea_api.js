const apiKey = 'd35d1fc1aabe0671e1e80ee5a6296bef';
const seasonId = '515';
const url = `https://api.statorium.com/api/v1/standings/${seasonId}/?apikey=${apiKey}`;

async function checkChelsea() {
    try {
        console.log(`Fetching: ${url}`);
        const response = await fetch(url);
        const data = await response.json();
        
        const standings = data.standings || data.season?.standings || [];
        const chelsea = standings.find(s => s.teamName?.toLowerCase().includes('chelsea'));
        
        if (chelsea) {
            console.log('CHELSEA FOUND:');
            console.log(JSON.stringify(chelsea, null, 2));
        } else {
            console.log('Chelsea not found in standings.');
            console.log('Available teams:', standings.map(s => s.teamName).join(', '));
        }
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
}

checkChelsea();
