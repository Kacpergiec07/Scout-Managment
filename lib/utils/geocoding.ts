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
