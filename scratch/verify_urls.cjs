const https = require('https');

const urls = [
  'https://images.unsplash.com/photo-1508344928928-7137b29de216?auto=format&fit=crop&w=2000&q=80',
  'https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg',
  'https://upload.wikimedia.org/wikipedia/en/1/1f/Bundesliga_logo_%282017%29.svg',
  'https://upload.wikimedia.org/wikipedia/commons/0/0f/LaLiga_logo_2023.svg',
  'https://upload.wikimedia.org/wikipedia/commons/e/e1/Serie_A_logo_%282021%29.svg',
  'https://upload.wikimedia.org/wikipedia/en/b/ba/Ligue_1_Uber_Eats.svg',
  'https://cdn.futwiz.com/assets/img/fc24/faces/239085.png',
  'https://cdn.futwiz.com/assets/img/fc24/faces/202126.png',
  'https://cdn.futwiz.com/assets/img/fc24/faces/227813.png',
  'https://cdn.futwiz.com/assets/img/fc24/faces/231478.png',
  'https://cdn.futwiz.com/assets/img/fc24/faces/231443.png'
];

urls.forEach(u => {
  https.get(u, (res) => {
    console.log(`[${res.statusCode}] ${u}`);
  }).on('error', (e) => {
    console.error(`[ERR] ${u} -> ${e.message}`);
  });
});
