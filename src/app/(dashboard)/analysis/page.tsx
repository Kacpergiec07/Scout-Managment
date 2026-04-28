'use client'

import * as React from 'react'
import { getCompatibilityAnalysis } from '@/app/actions/analysis'
import { PlayerRadarChart } from '@/components/scout/radar-chart'
import { RankingList } from '@/components/scout/ranking-list'
import { ReportButton } from '@/components/scout/report-button'
import { MarketValue } from '@/components/scout/market-value'
import { ScoutProPlayer, Position } from '@/lib/types/player'
import { getPlayerDataAction, getEnrichedPlayerDataAction } from '@/app/actions/statorium'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { Hexagon, ArrowLeft, Download, Share2, TrendingUp, BarChart3, Trophy, Target, Users, Star } from 'lucide-react'
import Link from 'next/link'

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
    position: position as Position,
    club: club,
    league: league,
    photoUrl: photo,
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
  const [playerData, setPlayerData] = React.useState<ScoutProPlayer & { description?: string, matches?: number }>(mockPlayer)

  React.useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        let activeId = playerId
        
        // If we don't have a real ID but have a name, try to resolve it
        if ((!activeId || activeId === '1') && playerName && playerName !== 'Erling Haaland') {
          const { searchPlayersAction } = await import('@/app/actions/statorium')
          const searchResults = await searchPlayersAction(playerName)
          if (searchResults && searchResults.length > 0) {
            activeId = searchResults[0].playerID
          }
        }

        // Fetch HIGH-PERFORMANCE Enriched Statistics from Server
        const enrichedData = await getEnrichedPlayerDataAction(activeId, mockPlayer);
        setPlayerData(enrichedData);
        
        // Get compatibility analysis
        const analysisData = await getCompatibilityAnalysis(enrichedData);
        setResults(analysisData);
        
      } catch (err) {
        console.error('Error loading player data:', err)
        const data = await getCompatibilityAnalysis(mockPlayer)
        setResults(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [playerId, playerName, position])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
      <div className="w-16 h-16 rounded-full bg-[#00ff88]/20 blur-xl animate-pulse" />
      <p className="text-gray-500 text-base font-medium mt-6">Inhaling player genetic statistical data...</p>
    </div>
  )

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0a0f0a' }}>
      {/* Particle background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-emerald-500/10"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse ${Math.random() * 3 + 2}s infinite ${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 space-y-8 max-w-[1600px] mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-500 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium text-white/70">Return to Hub</span>
          </Link>

          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-emerald-500 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
            <ReportButton player={playerData} />
          </div>
        </div>

        {/* Hero Section - Elite Player Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-emerald-500/10 via-emerald-950/20 to-black p-8 md:p-12 group">
              <div className="absolute top-0 right-0 p-8">
                <div className="relative">
                  <Hexagon className="w-24 h-24 text-emerald-500/20 fill-emerald-500/5 rotate-90" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-emerald-400 italic">{playerData.rating || 91}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
                  <div className="relative w-48 h-48 rounded-[2rem] overflow-hidden border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/20">
                    <Image
                      src={playerData.photoUrl}
                      alt={playerData.name}
                      fill
                      className="object-cover scale-110 group-hover:scale-125 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute -bottom-3 -right-3 px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-black tracking-tighter uppercase shadow-lg">
                    Elite Tier
                  </div>
                </div>

                <div className="text-center md:text-left space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1">
                        {playerData.league}
                      </Badge>
                      <Badge variant="outline" className="bg-white/5 text-white/50 border-white/10 px-3 py-1">
                        Season 24/25
                      </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
                      {playerData.name.toUpperCase()}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
                    <div className="flex items-center gap-2 text-white/60">
                      <Trophy className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold tracking-wide">{playerData.club}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold tracking-wide">{playerData.position}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold tracking-wide">{playerData.nationality} • {playerData.age} yrs</span>
                    </div>
                  </div>

                  <p className="text-white/40 text-sm max-w-xl leading-relaxed italic">
                    {playerData.description || "Analyzing genetic markers and statistical anomalies in professional performance datasets to determine absolute market compatibility and value projection."}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance DNA Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4 hover:border-emerald-500/30 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-white/20 font-black italic">DNA:01</span>
                </div>
                <div>
                  <div className="text-3xl font-black text-white tracking-tighter">{playerData.stats.offensive.goals}</div>
                  <div className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest">Season Goals</div>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[85%] group-hover:w-full transition-all duration-1000" />
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4 hover:border-emerald-500/30 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-white/20 font-black italic">DNA:02</span>
                </div>
                <div>
                  <div className="text-3xl font-black text-white tracking-tighter">{playerData.stats.offensive.assists}</div>
                  <div className="text-xs font-bold text-blue-500/70 uppercase tracking-widest">Seasonal Assists</div>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[65%] group-hover:w-full transition-all duration-1000" />
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4 hover:border-emerald-500/30 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <Star className="w-5 h-5" />
                  </div>
                  <span className="text-white/20 font-black italic">DNA:03</span>
                </div>
                <div>
                  <div className="text-3xl font-black text-white tracking-tighter">{playerData.matches || 28}</div>
                  <div className="text-xs font-bold text-amber-500/70 uppercase tracking-widest">Total Appearances</div>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[92%] group-hover:w-full transition-all duration-1000" />
                </div>
              </div>
            </div>
          </div>

          {/* Value Projection Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                <h3 className="text-xl font-black text-white italic tracking-tight">MARKET VALUATION</h3>
              </div>
              
              <MarketValue player={playerData} />

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="text-sm font-medium text-white/40">Release Clause</span>
                  <span className="text-sm font-black text-white">€180.0M</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <span className="text-sm font-medium text-white/40">Contract Exp.</span>
                  <span className="text-sm font-black text-white tracking-widest">2027</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-400">Agent Priority</span>
                  <Badge className="bg-emerald-500 text-black hover:bg-emerald-400">VERY HIGH</Badge>
                </div>
              </div>

              <div className="p-1 rounded-[2rem] bg-gradient-to-r from-emerald-500 to-blue-500">
                <button className="w-full py-4 rounded-[1.8rem] bg-[#0a0f0a] text-white text-sm font-black tracking-widest hover:bg-transparent transition-all uppercase italic">
                  Initiate Transfer Analysis
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Statistical Radar</h2>
                  <p className="text-white/40 text-sm font-medium">Comparative analysis against position average (Global Database)</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">{playerData.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">Pos. Average</span>
                  </div>
                </div>
              </div>

              <div className="h-[450px] w-full">
                <PlayerRadarChart stats={playerData.normalizedStats || playerData.stats} />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 h-full">
              <div className="space-y-1 mb-8">
                <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Club Compatibility</h2>
                <p className="text-white/40 text-sm font-medium">AI-predicted performance variance across potential clubs</p>
              </div>
              <RankingList results={results} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
        <div className="w-16 h-16 rounded-full bg-[#00ff88]/20 blur-xl animate-pulse" />
        <p className="text-gray-500 text-base font-medium mt-6">Inhaling player genetic statistical data...</p>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  )
}
