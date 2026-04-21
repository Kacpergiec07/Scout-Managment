'use client';

import { useState, useEffect } from 'react';

interface MarketValueData {
  value: number | null;
  formatted: string;
}

export function useMarketValue(playerName: string) {
  const [data, setData] = useState<MarketValueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!playerName) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/market-value/${encodeURIComponent(playerName)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch market value');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error in useMarketValue:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData({ value: null, formatted: 'N/A' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [playerName]);

  return { data, isLoading, error };
}
