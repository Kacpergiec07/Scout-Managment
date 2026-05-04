/**
 * Transfermarkt utility functions
 * Helper functions for parsing and formatting Transfermarkt market values
 */

/**
 * Parse Transfermarkt market value string to number in millions
 * Examples: "€45.00m", "€50,000k", "€1.5bn" -> returns number in millions
 */
export function parseTransfermarktValue(value: string): number {
  if (!value) return 0;

  // Remove € symbol and spaces
  const cleanValue = value.replace(/€/g, '').replace(/,/g, '').trim().toLowerCase();

  // Match number and suffix
  const match = cleanValue.match(/([\d.]+)(m|k|bn|b)/);

  if (!match) return 0;

  const number = parseFloat(match[1]);
  const suffix = match[2];

  const multipliers: Record<string, number> = {
    'm': 1,
    'k': 0.001,
    'bn': 1000,
    'b': 1000
  };

  return number * (multipliers[suffix] || 1);
}

/**
 * Format market value as €XM or €XK
 */
export function formatMarketValue(valueInMillions: number): string {
  if (valueInMillions >= 1) {
    return `€${valueInMillions.toFixed(0)}M`;
  } else if (valueInMillions > 0) {
    const valueInThousands = valueInMillions * 1000;
    return `€${valueInThousands.toFixed(0)}K`;
  }
  return 'N/A';
}
