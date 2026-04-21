import axios from 'axios';
import * as cheerio from 'cheerio';

const AXIOS_CONFIG = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.transfermarkt.com/',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
  timeout: 15000,
};

export interface MarketValueData {
  value: number | null;
  formatted: string;
}

/**
 * Helper to add delay between requests
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Parses Transfermarkt market value string to number
 * Examples: 
 * "€200.00m" -> 200000000
 * "€45.50m" -> 45500000
 * "€500 Th." -> 500000
 */
function parseMarketValue(valueStr: string | null): number | null {
  if (!valueStr) return null;
  
  const clean = valueStr.trim();
  if (clean === '-' || clean === '?' || clean === '') return null;

  const numericPart = clean.replace('€', '').trim();
  
  if (numericPart.toLowerCase().endsWith('m')) {
    const num = parseFloat(numericPart.slice(0, -1));
    return isNaN(num) ? null : Math.round(num * 1000000);
  }
  
  if (numericPart.toLowerCase().endsWith('th.')) {
    const num = parseFloat(numericPart.slice(0, -3).trim());
    return isNaN(num) ? null : Math.round(num * 1000);
  }

  const num = parseFloat(numericPart);
  return isNaN(num) ? null : num;
}

/**
 * Formats numeric value back to Transfermarkt style for UI
 */
function formatMarketValue(value: number | null): string {
  if (value === null) return 'N/A';
  
  if (value >= 1000000) {
    const m = value / 1000000;
    return `€${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  
  if (value >= 1000) {
    const k = value / 1000;
    return `€${k % 1 === 0 ? k : k.toFixed(0)}K`;
  }
  
  return `€${value}`;
}

export async function getMarketValue(playerName: string): Promise<MarketValueData> {
  try {
    // 1 second delay to avoid being blocked
    await delay(1000);

    const searchUrl = `https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(playerName)}&Spieler_page=0`;
    
    const response = await axios.get(searchUrl, AXIOS_CONFIG);
    const $ = cheerio.load(response.data);
    
    // Find the players results table (usually the first one, or identified by heading)
    // Results are often grouped in boxes. We look for the "Players" box.
    const playersBox = $('.box').filter((_, el) => {
      const heading = $(el).find('h2').text().toLowerCase();
      return heading.includes('players');
    });

    const targetBox = playersBox.length > 0 ? playersBox : $('.box').first();
    const rows = targetBox.find('table.items tbody tr.odd, table.items tbody tr.even');

    if (!rows.length) {
      return { value: null, formatted: 'N/A' };
    }

    let highestValue: number | null = null;
    let bestFormatted: string = 'N/A';

    rows.each((_, row) => {
      const $row = $(row);
      
      // Market value is usually in td.rechts.hauptlink or the last columns
      let valueStr = $row.find('td.rechts.hauptlink').text().trim();
      
      // Fallback: search for € in any cell in this row
      if (!valueStr) {
        $row.find('td').each((_, td) => {
          const text = $(td).text().trim();
          if (text.includes('€')) {
            valueStr = text;
            return false;
          }
        });
      }

      const numericValue = parseMarketValue(valueStr);
      
      // Logic: Pick the player with the HIGHEST market value to ensure we get the "star" player
      if (numericValue !== null) {
        if (highestValue === null || numericValue > highestValue) {
          highestValue = numericValue;
          bestFormatted = formatMarketValue(numericValue);
        }
      }
    });

    return {
      value: highestValue,
      formatted: highestValue !== null ? bestFormatted : 'N/A'
    };
  } catch (error) {
    console.error(`Scraper Error [${playerName}]:`, error);
    return { value: null, formatted: 'N/A' };
  }
}
