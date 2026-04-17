'use client'

import * as React from 'react'
import { getCompatibilityAnalysis } from '@/app/actions/analysis'
import { PlayerRadarChart } from '@/components/scout/radar-chart'
import { RankingList } from '@/components/scout/ranking-list'
import { ReportButton } from '@/components/scout/report-button'
import { ScoutProPlayer } from '@/lib/types/player'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

function AnalysisContent() {
  const searchParams = useSearchParams()
  const playerName = searchParams.get('name') || 'Erling Haaland'
  const playerId = searchParams.get('id') || '1'
  const description = searchParams.get('desc') || ''
  const photo = searchParams.get('photo') || `https://api.statorium.com/media/bearleague/bl${playerId}.webp`
  const club = searchParams.get('club') || 'Man City'
  const position = searchParams.get('pos') || 'ST'
  const nationality = searchParams.get('nation') || 'Norway'
  const league = searchParams.get('league') || 'Premier League'
  
  // Create dynamic mock player
  const mockPlayer: ScoutProPlayer & { description?: string } = {
    id: playerId,
    name: playerName,
    age: 23,
    nationality: nationality,
    position: position,
    club: club,
    league: league,
    photo: photo,
    description: description,
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

  if (loading) return <div className="text-muted-foreground p-8 animate-pulse text-center">Inhaling player genetic statistical data...</div>

  return (
    <div id="analysis-report-content" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 p-8 rounded-3xl bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/20 to-transparent pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl">
             <Image 
               src={mockPlayer.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(mockPlayer.name)}&background=047857&color=fff&size=200`} 
               alt={mockPlayer.name}
               fill
               unoptimized
               className="object-cover"
             />
          </div>
          <div>
            <Badge className="mb-2 bg-emerald-500 hover:bg-emerald-600 text-white border-none">Analysis Verified</Badge>
            <h1 className="text-4xl font-extrabold tracking-tighter">{mockPlayer.name}</h1>
            <p className="text-zinc-400 text-lg">{mockPlayer.position} • {mockPlayer.club} • {mockPlayer.league}</p>
          </div>
        </div>
        <div className="relative z-10">
          <ReportButton elementId="analysis-report-content" playerName={mockPlayer.name} />
        </div>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-[450px_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 shadow-xl">
            <h3 className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 text-center">
              AIBot Intelligence Profile
            </h3>
            <PlayerRadarChart player={mockPlayer} />
          </div>

          {mockPlayer.description && (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 shadow-xl">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                Scout's Professional Notes
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 italic leading-relaxed">
                "{mockPlayer.description}"
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-8">
          <RankingList results={results} />
        </div>
      </div>
    </div>
  )
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500 p-8">Loading analysis...</div>}>
      <AnalysisContent />
    </Suspense>
  )
}
