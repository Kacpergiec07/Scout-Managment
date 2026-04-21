export interface GeoPoint {
  lat: number;
  lng: number;
}

export async function geocodeCity(query: string): Promise<GeoPoint | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
      headers: {
        'User-Agent': 'ScoutPro/1.0',
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
}

const clubCache: Record<string, GeoPoint> = {
  'Real Madrid': { lat: 40.4531, lng: -3.6883 },
  'FC Barcelona': { lat: 41.3809, lng: 2.1228 },
  'Barcelona': { lat: 41.3809, lng: 2.1228 },
  'Bayern Munich': { lat: 48.2188, lng: 11.6247 },
  'Man City': { lat: 53.4831, lng: -2.2004 },
  'Manchester City': { lat: 53.4831, lng: -2.2004 },
  'Manchester United': { lat: 53.4631, lng: -2.2913 },
  'Liverpool': { lat: 53.4308, lng: -2.9608 },
  'Arsenal': { lat: 51.5549, lng: -0.1084 },
  'Chelsea': { lat: 51.4817, lng: -0.191 },
  'PSG': { lat: 48.8414, lng: 2.253 },
  'Paris Saint-Germain': { lat: 48.8414, lng: 2.253 },
  'Dortmund': { lat: 51.4926, lng: 7.4519 },
  'Borussia Dortmund': { lat: 51.4926, lng: 7.4519 },
  'Juventus': { lat: 45.1096, lng: 7.6413 },
  'AC Milan': { lat: 45.4781, lng: 9.1239 },
  'Inter Milan': { lat: 45.4781, lng: 9.1239 },
  'Napoli': { lat: 40.8279, lng: 14.2496 },
  'Atletico Madrid': { lat: 40.4362, lng: -3.5995 },
  'Tottenham': { lat: 51.6042, lng: -0.0662 },
  'Bayer Leverkusen': { lat: 51.0381, lng: 7.0022 },
  'West Ham': { lat: 51.5387, lng: -0.0166 },
  'Sporting CP': { lat: 38.7526, lng: -9.1612 },
  'Aston Villa': { lat: 52.5091, lng: -1.8848 },
  'AS Roma': { lat: 41.9339, lng: 12.4547 },
  'Lazio': { lat: 41.9339, lng: 12.4547 },
  'Fiorentina': { lat: 43.7808, lng: 11.2823 },
  'Atalanta': { lat: 45.7092, lng: 9.6808 },
  'Sevilla': { lat: 37.384, lng: -5.9707 },
  'Villarreal': { lat: 39.9439, lng: -0.1039 },
  'Real Sociedad': { lat: 43.3014, lng: -1.9736 },
  'RB Leipzig': { lat: 51.3458, lng: 12.3483 },
  'Eintracht Frankfurt': { lat: 50.0686, lng: 8.6455 },
  'Lyon': { lat: 45.7656, lng: 4.9819 },
  'Marseille': { lat: 43.2698, lng: 5.3959 },
  'Monaco': { lat: 43.7276, lng: 7.4155 },
  'Benfica': { lat: 38.7527, lng: -9.1847 },
  'Porto': { lat: 41.1618, lng: -8.5836 },
  'Ajax': { lat: 52.3142, lng: 4.9427 },
  'PSV': { lat: 51.4417, lng: 5.4674 },
  'Newcastle': { lat: 54.9756, lng: -1.6217 },
  'Brighton': { lat: 50.8617, lng: -0.0833 },
  'Leverkusen': { lat: 51.0381, lng: 7.0022 },
  'Bayer 04 Leverkusen': { lat: 51.0381, lng: 7.0022 },
  'Girona': { lat: 41.9794, lng: 2.8214 },
  'Athletic Club': { lat: 43.2641, lng: -2.935 },
  'Real Betis': { lat: 37.3565, lng: -5.9817 },
  'Lille': { lat: 50.6292, lng: 3.0573 },
  'Nice': { lat: 43.7102, lng: 7.262 },
  'Lens': { lat: 50.4322, lng: 2.8333 },
  'Stuttgart': { lat: 48.7758, lng: 9.1822 },
  'VfB Stuttgart': { lat: 48.7758, lng: 9.1822 },
  'Hoffenheim': { lat: 49.2725, lng: 8.8875 },
  'Freiburg': { lat: 47.999, lng: 7.8421 },
  'Wolfsburg': { lat: 52.4226, lng: 10.7865 },
  'Bologna': { lat: 44.4949, lng: 11.3426 },
  'Monza': { lat: 45.5845, lng: 9.2744 },
  'Fulham': { lat: 51.4703, lng: -0.2117 },
  'Crystal Palace': { lat: 51.3983, lng: -0.0856 },
  'Brentford': { lat: 51.4862, lng: -0.3025 },
  'Everton': { lat: 53.4389, lng: -2.9664 },
  'Wolves': { lat: 52.5902, lng: -2.1297 },
  'Nottingham Forest': { lat: 52.9548, lng: -1.1581 },
  'Bournemouth': { lat: 50.7352, lng: -1.8687 },
  'Leicester': { lat: 52.6369, lng: -1.1398 },
  'Southampton': { lat: 50.9097, lng: -1.4044 },
  'Ipswich': { lat: 52.0567, lng: 1.1482 },
  'Leeds United': { lat: 53.7778, lng: -1.5719 },
  'Leeds United FC': { lat: 53.7778, lng: -1.5719 },
  'Tottenham Hotspur FC': { lat: 51.6042, lng: -0.0662 },
  'Olympique Lyonnais': { lat: 45.7656, lng: 4.9819 },
  'Villarreal CF': { lat: 39.9439, lng: -0.1039 },
};

export function getCachedGeocode(name: string): GeoPoint | null {
  // Try exact match
  if (clubCache[name]) return clubCache[name];
  
  // Try finding a substring match
  for (const key in clubCache) {
    if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
      return clubCache[key];
    }
  }
  
  return null;
}
