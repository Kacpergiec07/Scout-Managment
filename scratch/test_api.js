async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'test' }]
      })
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Raw Response:', text);
  } catch (e) {
    console.error('Fetch error:', e);
  }
}
test();
