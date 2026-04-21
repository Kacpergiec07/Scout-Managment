import React from 'react'
import { getStandingsAction } from '@/app/actions/statorium'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

const LEAGUE_CONFIGS = [
  {
    id: '515',
    name: 'PREMIER LEAGUE',
    logo: 'https://cdn.futwiz.com/assets/img/fc24/leagues/13.png',
    color: 'from-violet-600 to-indigo-950', 
    barColor: 'bg-indigo-700',
    stormTint: 'rgba(79, 70, 229, 0.4)',
  },
  {
    id: '521',
    name: 'BUNDESLIGA',
    logo: 'https://cdn.futwiz.com/assets/img/fc24/leagues/19.png',
    color: 'from-red-600 to-red-950',
    barColor: 'bg-red-700',
    stormTint: 'rgba(220, 38, 38, 0.4)',
  },
  {
    id: '558', 
    name: 'LA LIGA',
    logo: 'https://cdn.futwiz.com/assets/img/fc24/leagues/53.png',
    color: 'from-orange-500 to-red-900',
    barColor: 'bg-orange-600',
    stormTint: 'rgba(249, 115, 22, 0.4)',
  },
  {
    id: '511',
    name: 'SERIE A',
    logo: 'https://cdn.futwiz.com/assets/img/fc24/leagues/31.png',
    color: 'from-blue-600 to-black',
    barColor: 'bg-blue-700',
    stormTint: 'rgba(37, 99, 235, 0.4)',
  },
  {
    id: '519',
    name: 'LIGUE 1',
    logo: 'https://cdn.futwiz.com/assets/img/fc24/leagues/16.png',
    color: 'from-lime-500 to-green-950',
    barColor: 'bg-lime-700',
    stormTint: 'rgba(132, 204, 22, 0.4)',
  }
]

export default async function DashboardPage() {
  // Fetch standings for all leagues on the server in parallel
  // Server-side fetching is generally faster and eliminates client-side hydration "flashes"
  const leaguesData = await Promise.all(
    LEAGUE_CONFIGS.map(async (config) => {
      const standings = await getStandingsAction(config.id)
      let topClubs = standings || []

      // Custom sorting for Real Madrid in La Liga
      if (config.name === 'LA LIGA') {
        topClubs = [...topClubs].sort((a: any, b: any) => {
          const aIsRealContext = a.teamName?.toLowerCase().includes('real madrid');
          const bIsRealContext = b.teamName?.toLowerCase().includes('real madrid');
          if (aIsRealContext) return -1;
          if (bIsRealContext) return 1;
          return 0;
        });
      }

      return { ...config, clubs: topClubs }
    })
  )

  return <DashboardClient initialLeagues={leaguesData} />
}
