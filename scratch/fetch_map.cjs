const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const geojson = JSON.parse(data);
    
    // ISO A3 codes for our countries
    const targetCountries = {
      'PRT': 'PT', 'ESP': 'ES', 'FRA': 'FR', 'GBR': 'GB', 'BEL': 'BE',
      'NLD': 'NL', 'DEU': 'DE', 'CHE': 'CH', 'AUT': 'AT', 'ITA': 'IT',
      'POL': 'PL', 'CZE': 'CZ', 'SVK': 'SK', 'HUN': 'HU', 'ROU': 'RO',
      'BGR': 'BG', 'SRB': 'RS', 'HRV': 'HR', 'TUR': 'TR', 'GRC': 'GR',
      'UKR': 'UA', 'RUS': 'RU', 'NOR': 'NO', 'SWE': 'SE', 'DNK': 'DK',
      'IRL': 'IE', 'BIH': 'BA', 'MNE': 'ME', 'ALB': 'AL', 'MKD': 'MK',
      'SVN': 'SI', 'LUX': 'LU', 'AND': 'AD', 'MCO': 'MC', 'SMR': 'SM',
      'VAT': 'VA', 'LIE': 'LI', 'BLR': 'BY', 'EST': 'EE', 'LVA': 'LV',
      'LTU': 'LT', 'MDA': 'MD'
    };

    const countryData = {};

    geojson.features.forEach(feature => {
      const a3 = feature.id;
      const code = targetCountries[a3];
      if (code) {
        let coords = feature.geometry.coordinates;
        // Handle MultiPolygon vs Polygon
        let polygons = feature.geometry.type === 'MultiPolygon' ? coords : [coords];
        
        let pathStr = '';
        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
        let sumLat = 0, sumLng = 0, count = 0;

        polygons.forEach(polygon => {
          // Polygon has outer ring and potentially inner rings (holes). We just take outer ring for simplicity
          const ring = polygon[0];
          ring.forEach((pt, i) => {
            const lng = pt[0];
            const lat = pt[1];
            
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
            
            sumLat += lat;
            sumLng += lng;
            count++;
          });
        });

        countryData[code] = {
          label: feature.properties.name.toUpperCase(),
          center: [sumLat/count, sumLng/count],
          bounds: { minLat, maxLat, minLng, maxLng },
          geometry: feature.geometry // Save the full geometry to process in the component
        };
      }
    });

    const fileContent = `// Auto-generated detailed map data
export const COUNTRY_DATA: Record<string, any> = ${JSON.stringify(countryData, null, 2)};
`;

    fs.writeFileSync('src/lib/europe-map-data.ts', fileContent);
    console.log('Map data generated successfully.');
  });
}).on('error', (e) => {
  console.error(e);
});
