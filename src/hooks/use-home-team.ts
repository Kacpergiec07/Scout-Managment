import { useState, useEffect } from 'react';

export interface HomeTeam {
  id: string;
  name: string;
  logo: string;
  seasonId: string;
}

export function useHomeTeam() {
  const [homeTeam, setHomeTeam] = useState<HomeTeam | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('scoutpro_home_team');
    if (stored) {
      try {
        setHomeTeam(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse home team from localStorage', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const selectHomeTeam = (team: HomeTeam | null) => {
    setHomeTeam(team);
    if (team) {
      localStorage.setItem('scoutpro_home_team', JSON.stringify(team));
    } else {
      localStorage.removeItem('scoutpro_home_team');
    }
  };

  return { homeTeam, selectHomeTeam, isLoaded };
}
