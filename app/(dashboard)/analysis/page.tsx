'use client'

import * as React from 'react'
import { getCompatibilityAnalysis } from '@/app/actions/analysis'
import { PlayerRadarChart } from '@/components/scout/radar-chart'
import { RankingList } from '@/components/scout/ranking-list'
import { ScoutProPlayer } from '@/lib/types/player'

export default function AnalysisPage() {
  // In a real app, we'd fetch the player from the DB based on ID
  // For MVP demonstration, we mock the player object
  const mockPlayer: ScoutProPlayer = {
    id: '1',
    name: 'Erling Haaland',
    age: 23,
    nationality: 'Norway',
    position: 'ST',
    club: 'Man City',
    league: 'Premier League',
    stats: {
      offensive: { goals: 95, assists: 40, xG: 98, xA: 45, keyPasses: 60 },
      defensive: { tackles: 20, interceptions: 15, aerialWins: 85, clearances: 30 },
      physical: { distance: 70, sprints: 95, stamina: 85 },
      tactical: { dribbles: 65, progressivePasses: 40, passAccuracy: 75, pressing: 80 }
    },
    updatedAt: new Date().toISOString()
  }

  const [results, setResults] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      const data = await getCompatibilityAnalysis(mockPlayer)
      setResults(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="text-zinc-500 p-8">Running compatibility engine...</div>

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50">{mockPlayer.name}</h1>
          <p className="text-zinc-400">{mockPlayer.position} • {mockPlayer.club}</p>
        </div>
        
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-500 text-center">
            Statistical DNA
          </h3>
          <PlayerRadarChart player={mockPlayer} />
        </div>
      </div>
      
      <div className="space-y-8">
        <RankingList results={results} />
      </div>
    </div>
  )
}
