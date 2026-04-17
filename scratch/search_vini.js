async function search() {
  const apiKey = 'd35d1fc1aabe0671e1e80ee5a6296bef';
  const url = `https://api.statorium.com/api/v1/players/?apikey=${apiKey}&q=Vinicius`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

search();
