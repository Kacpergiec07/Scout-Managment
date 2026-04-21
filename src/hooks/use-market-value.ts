'use client';

import { useState, useEffect } from 'react';

interface MarketValueData {
  value: number | null;
  formatted: string;
}

const localCache: Record<string, MarketValueData> = {};

export function useMarketValue(playerName: string) {
  const [data, setData] = useState<MarketValueData | null>(() => {
    if (playerName && localCache[playerName]) {
      return localCache[playerName];
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!localCache[playerName]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!playerName) {
      setIsLoading(false);
      return;
    }

    if (localCache[playerName]) {
      setData(localCache[playerName]);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      // Add a small jittered delay to prevent overwhelming the server with simultaneous requests
      // from multiple components in a list
      const jitter = Math.floor(Math.random() * 500);
      await new Promise(r => setTimeout(r, jitter));
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/market-value/${encodeURIComponent(playerName)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch market value');
        }
        const result = await response.json();
        localCache[playerName] = result;
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
