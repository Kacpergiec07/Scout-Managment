async function test() {
  const apiKey = 'd35d1fc1aabe0671e1e80ee5a6296bef';
  
  // Search for a player
  const searchRes = await fetch(`https://api.statorium.com/api/v1/players/?apikey=${apiKey}&q=mudryk`);
  const searchData = await searchRes.json();
  console.log("Search Result:", JSON.stringify(searchData, null, 2).substring(0, 500));
  
  if (searchData.players && searchData.players.length > 0) {
    const id = searchData.players[0].playerID || searchData.players[0].id;
    const detailRes = await fetch(`https://api.statorium.com/api/v1/players/${id}/?apikey=${apiKey}&showstat=true`);
    const detailData = await detailRes.json();
    console.log("Details Trans:", JSON.stringify(detailData.player.transfers, null, 2));
  }
}
test();
