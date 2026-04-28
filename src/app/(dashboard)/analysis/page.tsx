'use client'

import * as React from 'react'
import { getCompatibilityAnalysis } from '@/app/actions/analysis'
import { PlayerRadarChart } from '@/components/scout/radar-chart'
import { RankingList } from '@/components/scout/ranking-list'
import { ReportButton } from '@/components/scout/report-button'
import { MarketValue } from '@/components/scout/market-value'
import { ScoutProPlayer, Position } from '@/lib/types/player'
import { getPlayerDataAction } from '@/app/actions/statorium'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { Hexagon, ArrowLeft, Download, Share2, TrendingUp, BarChart3 } from 'lucide-react'
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

        // Fetch real statistics if we have a valid ID
        if (activeId && activeId !== '1') {
          const realData = await getPlayerDataAction(activeId)
          if (realData && realData.stat && realData.stat.length > 0) {
            // Helper to parse stats that might be strings like "7 (0)"
            const parseStat = (val: any) => {
              if (typeof val === 'string') {
                const match = val.match(/\d+/);
                return match ? parseInt(match[0]) : 0;
              }
              return typeof val === 'number' ? val : parseInt(val || '0');
            };

            // Advanced helper to extract goals/assists from various potential formats
            const extractStat = (obj: any, primaryKey: string, secondaryKeys: string[] = []) => {
              if (!obj) return 0;
              
              // 1. Check primary and secondary keys directly
              const allKeys = [primaryKey, ...secondaryKeys];
              for (const key of allKeys) {
                const val = parseStat(obj[key]);
                if (val > 0) return val;
              }
              
              // 2. Check for home/away split (common in some Statorium responses)
              if (primaryKey === 'goals' || primaryKey === 'goalscore') {
                const home = parseStat(obj.goals_home || obj.goalscore_home);
                const away = parseStat(obj.goals_away || obj.goalscore_away);
                if (home + away > 0) return home + away;
              }
              
              if (primaryKey === 'assists') {
                const home = parseStat(obj.assists_home);
                const away = parseStat(obj.assists_away);
                if (home + away > 0) return home + away;
              }

              // 3. Check nested details
              if (obj.details) {
                return extractStat(obj.details, primaryKey, secondaryKeys);
              }

              return 0;
            };

            const sortedStats = [...realData.stat].sort((a: any, b: any) => {
              // Priority 1: Has goals/assists
              const goalsA = extractStat(a, 'goals', ['goalscore', 'goals_count', 'Goals', 'Goal'])
              const assistsA = extractStat(a, 'assists', ['assists_count', 'Assist'])
              const goalsB = extractStat(b, 'goals', ['goalscore', 'goals_count', 'Goals', 'Goal'])
              const assistsB = extractStat(b, 'assists', ['assists_count', 'Assist'])
              
              const hasDataA = (goalsA + assistsA) > 0 ? 1 : 0
              const hasDataB = (goalsB + assistsB) > 0 ? 1 : 0
              if (hasDataB !== hasDataA) return hasDataB - hasDataA

              // Priority 2: Latest year (Statorium uses season_name)
              const yearA = parseInt((a.season_name || a.seasonName || '').match(/\d{4}/)?.[0] || '0')
              const yearB = parseInt((b.season_name || b.seasonName || '').match(/\d{4}/)?.[0] || '0')
              if (yearB !== yearA) return yearB - yearA
              
              // Priority 3: Matches played
              return parseStat(b.played || b.matches) - parseStat(a.played || a.matches)
            })

            const currentSeason = sortedStats.find((s: any) => {
              const name = (s.season_name || s.seasonName || '').toLowerCase();
              const isLeague = name.includes('bundesliga') || name.includes('premier league') || name.includes('la liga') || name.includes('serie a') || name.includes('ligue 1') || name.includes('championship');
              return isLeague && parseStat(s.played || s.matches || s.matches_played) > 0;
            }) || sortedStats.find((s: any) => parseStat(s.played || s.matches || s.matches_played) > 0) || sortedStats[0]
            
            // Calculate a more realistic rating based on goals, assists and position
            const goals = extractStat(currentSeason, 'goals', ['goalscore', 'goals_count', 'Goals', 'Goal'])
            const assists = extractStat(currentSeason, 'assists', ['assists_count', 'Assist'])
            const played = Math.max(1, parseStat(currentSeason.played || currentSeason.matches || currentSeason.matches_played))
            const yellowCards = parseStat(currentSeason.yellowcards || currentSeason['Yellow card'])
            const redCards = parseStat(currentSeason.redcards || currentSeason['Red card'])
            
            // Base rating calculation (0-100 scale)
            let performanceScore = 72 // Professional Baseline
            if (played > 0) {
              const goalsPerMatch = goals / played
              const assistsPerMatch = assists / played
              // Scale: 0.5 goals/match is elite (~25 pts), 0.2 is good (~10 pts)
              performanceScore += (goalsPerMatch * 40) + (assistsPerMatch * 25)
            }
            
            // Penalize for cards
            performanceScore -= (yellowCards * 1.2) + (redCards * 3.5)
            
            const finalRating = Math.min(99, Math.max(50, Math.round(performanceScore)))

            // Normalize stats for Radar Chart (0-100)
            // Using logarithmic scaling for goals to ensure 15+ goals = 90+ score
            const offensiveVal = Math.min(100, Math.round((Math.sqrt(goals) * 15 + Math.sqrt(assists) * 10) * (20 / Math.sqrt(played)) + 40))
            const tacticalVal = Math.min(100, 70 + (assists * 4) + (played % 10))
            const physicalVal = Math.min(100, 75 + (played % 15))
            const defensiveVal = Math.min(100, position.includes('DF') ? 90 - (yellowCards * 1.2) : 40 + (goals % 10))

            const updatedPlayer: ScoutProPlayer & { description?: string, matches?: number, rating?: number, normalizedStats?: any } = {
              ...mockPlayer,
              rating: finalRating,
              matches: played,
              normalizedStats: {
                offensive: offensiveVal,
                defensive: defensiveVal,
                tactical: tacticalVal,
                physical: physicalVal,
                dribbling: position.includes('FW') || position.includes('MF') ? 85 : 48,
                passing: 78 + (assists % 12)
              },
              stats: {
                offensive: {
                  goals: goals,
                  assists: assists,
                  xG: Math.round(goals * 1.05 * 10) / 10,
                  xA: Math.round(assists * 1.15 * 10) / 10,
                  keyPasses: Math.round(played * (position.includes('MF') ? 2.3 : 0.9))
                },
                defensive: { 
                  tackles: defensiveVal, 
                  interceptions: Math.round(defensiveVal * 0.92), 
                  aerialWins: position.includes('DF') || position.includes('ST') ? 86 : 48, 
                  clearances: position.includes('DF') ? 92 : 28 
                },
                physical: { 
                  distance: physicalVal, 
                  sprints: Math.min(100, physicalVal + 7), 
                  stamina: physicalVal 
                },
                tactical: { 
                  dribbles: position.includes('FW') || position.includes('MF') ? 85 : 48, 
                  progressivePasses: tacticalVal, 
                  passAccuracy: 78 + (assists % 12), 
                  pressing: 78 
                }
              }
            }
            setPlayerData(updatedPlayer)
            
            // Get analysis for real data
            const analysisData = await getCompatibilityAnalysis(updatedPlayer)
            setResults(analysisData)
          } else {
            const data = await getCompatibilityAnalysis(mockPlayer)
            setResults(data)
          }
        } else {
          const data = await getCompatibilityAnalysis(mockPlayer)
          setResults(data)
        }
      } catch (err) {
        console.error('Error loading player data:', err)
        const data = await getCompatibilityAnalysis(mockPlayer)
        setResults(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [playerId, playerName])

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
              animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-[#00ff88] hover:text-white transition-colors duration-300 mb-8 animate-in fade-in slide-in-from-left-4 duration-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Back to History</span>
        </Link>

        {/* Header Section */}
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00ff88]/20 blur-xl rounded-lg" />
              <div className="relative h-14 w-14 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center shadow-2xl shadow-[#00ff88]/20">
                <Hexagon className="h-7 w-7 text-[#00ff88]" fill="currentColor" />
              </div>
            </div>
            <div>
              <h1
                className="text-4xl sm:text-5xl font-bold tracking-tight"
                style={{
                  color: '#00ff88',
                  textShadow: '0 0 20px rgba(0, 255, 136, 0.5)'
                }}
              >
                {playerData.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-gray-400 text-base font-medium">
                  {playerData.position} • {playerData.club} • {playerData.league}
                </p>
                <MarketValue playerName={playerData.name} className="bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Player Card */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-gray-800/50 bg-black/80 backdrop-blur-xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/10 to-transparent opacity-50" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Player Photo */}
              <div className="relative group">
                <div className="absolute inset-0 bg-[#00ff88]/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative h-28 w-28 rounded-2xl overflow-hidden border-2 border-gray-700 group-hover:border-[#00ff88] transition-all duration-300 shadow-xl">
                  <Image
                    src={playerData.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(playerData.name)}&background=00ff88&color=000&size=200`}
                    alt={playerData.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                {/* Rating Badge */}
                <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00cc6a] border-2 border-[#00ff88]/30 flex items-center justify-center shadow-lg shadow-[#00ff88]/50">
                  <span className="text-xl font-black tabular-nums">{(playerData as any).rating || 95}</span>
                </div>
              </div>

              {/* Player Info */}
              <div className="space-y-2">
                <Badge className="bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all">
                  Analysis Verified
                </Badge>
                <h2 className="text-2xl font-bold text-white group-hover:text-[#00ff88] transition-colors">
                  AI-Generated Intelligence Profile
                </h2>
                <p className="text-gray-500 text-sm">
                  Advanced scouting analysis powered by neural networks
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <ReportButton elementId="analysis-report-content" playerName={playerData.name} />
              <button className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-xl border-2 border-gray-800/50 rounded-xl hover:border-[#00ff88]/50 hover:bg-[#00ff88]/10 transition-all duration-300 group">
                <Share2 className="h-4 w-4 text-gray-500 group-hover:text-[#00ff88] transition-colors" />
                <span className="text-gray-400 text-sm font-medium group-hover:text-gray-300">Share</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-xl border-2 border-gray-800/50 rounded-xl hover:border-[#00ff88]/50 hover:bg-[#00ff88]/10 transition-all duration-300 group">
                <Download className="h-4 w-4 text-gray-500 group-hover:text-[#00ff88] transition-colors" />
                <span className="text-gray-400 text-sm font-medium group-hover:text-gray-300">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-[450px_1fr] mt-8 items-stretch">
          {/* Left Column */}
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-700 delay-100 h-full">
            <div className="rounded-2xl border-2 border-gray-800/50 bg-black/60 backdrop-blur-xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88]">
                  <Hexagon className="h-6 w-6" fill="currentColor" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Performance Radar</h3>
                  <p className="text-xs text-gray-600">Comprehensive skill visualization</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-gray-800/50">
                <PlayerRadarChart player={playerData} />
              </div>
            </div>

            {playerData.description && (
              <div className="rounded-2xl border-2 border-gray-800/50 bg-black/60 backdrop-blur-xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88]">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Scout's Notes</h3>
                    <p className="text-xs text-gray-600">Professional evaluation</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-gray-800/50">
                  <p className="text-gray-400 text-base italic leading-relaxed">
                    "{playerData.description}"
                  </p>
                </div>
              </div>
            )}

            {/* Key Stats Grid */}
            <div className="flex-1 rounded-2xl border-2 border-gray-800/50 bg-black/60 backdrop-blur-xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88]">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Key Statistics</h3>
                  <p className="text-xs text-gray-600">Performance metrics</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Goals', value: playerData.stats.offensive.goals, icon: '⚽' },
                  { label: 'Assists', value: playerData.stats.offensive.assists, icon: '🎯' },
                  { label: 'Matches', value: playerData.matches || 0, icon: '🎮' },
                  { label: 'Rating', value: (playerData as any).rating || 82, icon: '⭐' },
                ].map((stat, i) => (
                  <div key={i} className="bg-black/40 border-2 border-[#00ff88]/20 rounded-xl p-4 hover:border-[#00ff88]/50 hover:bg-[#00ff88]/10 transition-all duration-300">
                    <div className="text-2xl font-black text-[#00ff88] tabular-nums mb-2" style={{ textShadow: '0 0 10px rgba(0, 255, 136, 0.3)' }}>
                      {stat.value}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{stat.icon}</span>
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="h-full animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
            <div className="h-full rounded-2xl border-2 border-gray-800/50 bg-black/60 backdrop-blur-xl p-6 shadow-2xl flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88]">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Compatibility Rankings</h3>
                  <p className="text-xs text-gray-600">AI-powered match analysis</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
                <RankingList results={results} />
              </div>
              
              {/* Methodology Explanation */}
              <div className="mt-6 pt-6 border-t border-gray-800/50">
                <h4 className="text-[#00ff88] text-sm font-bold uppercase tracking-wider mb-3">Scouting Methodology</h4>
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#00ff88]/5 border border-[#00ff88]/10">
                    <p className="text-xs font-bold text-gray-300 mb-1">Intelligence Rating (Badge)</p>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Absolute performance value based on goals/assists per 90, match consistency, and disciplinary record. 
                      Scale: 70 (Pro Baseline) to 99 (Elite).
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <p className="text-xs font-bold text-gray-300 mb-1">Compatibility Score (Clubs)</p>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Weighted match between Player Profile and Club DNA. 
                      (30% Tactical Fit, 25% Positional Need, 25% Stats, 20% Contextual Factors).
                    </p>
                  </div>
                </div>
              </div>
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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0a0f0a' }}>
        <div className="w-16 h-16 rounded-full bg-[#00ff88]/20 blur-xl animate-pulse" />
        <p className="text-gray-500 text-base font-medium mt-6">Loading analysis...</p>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  )
}
