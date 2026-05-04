'use client'

import * as React from 'react'
import { getCompatibilityAnalysis } from '@/app/actions/analysis'
import { PlayerRadarChart } from '@/components/scout/radar-chart'
import { RankingList } from '@/components/scout/ranking-list'
import { ReportButton } from '@/components/scout/report-button'
import { ScoutProPlayer, Position } from '@/lib/types/player'
import { getPlayerDataAction, getPlayerDetailsAction } from '@/app/actions/statorium'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { Hexagon, ArrowLeft, Share2, TrendingUp, BarChart3, Trophy, Target, Users, Star, Zap, ShieldCheck, Brain, X } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

function TransferAnalysisModal({ isOpen, onClose, player }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-[#0a0f0a] border-none rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Transfer Necessity Report</h2>
                <p className="text-white/40 text-xs font-bold tracking-widest uppercase">AI Strategic Analysis • v4.2</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <X className="w-6 h-6 text-white/40" />
            </button>
          </div>

          <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white/5 border-none space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Executive Summary</span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  Analysis of {player.club}'s current squad depth and tactical evolution indicates that the acquisition of {player.name} is <span className="text-emerald-400 font-bold italic underline">{(parseInt(player.id) % 3 === 0) ? 'TACTICALLY PIVOTAL' : (parseInt(player.id) % 2 === 0) ? 'STRATEGICALLY ESSENTIAL' : 'MARKET CRITICAL'}</span> for the upcoming season.
                </p>
              </div>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border-none space-y-3">
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Why is he needed?</div>
                  <ul className="space-y-2">
                    <li className="flex gap-2 text-xs text-white/60">
                      <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Provides critical redundancy in the {player.position} role.</span>
                    </li>
                    <li className="flex gap-2 text-xs text-white/60">
                      <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Direct upgrade over current rotational options.</span>
                    </li>
                    <li className="flex gap-2 text-xs text-white/60">
                      <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Genetic profile matches {player.club}'s pressing DNA ({85 + (parseInt(player.id) % 15)}%).</span>
                    </li>
                  </ul>
                </div>
              <div className="p-5 rounded-2xl bg-white/5 border-none space-y-3">
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Tactical impact</div>
                <p className="text-xs text-white/60 leading-relaxed italic">
                  Integrating {player.name} allows for a more aggressive high-line transition. His statistical outlier in key passes (DNA:02) provides the "missing link" for offensive fluidity that {player.club} lacked in the final third last season.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-emerald-500 text-black text-sm font-black tracking-widest hover:bg-emerald-400 transition-all uppercase italic shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            Acknowledge Intelligence
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function MarketValue({ player }: { player: any }) {
  const growth = React.useMemo(() => {
    const seed = parseInt(player.id) || 1;
    return (5 + (seed % 15) + (seed % 9) / 10).toFixed(1);
  }, [player.id]);

  return (
    <div className="space-y-1">
      <div className="text-6xl font-black text-white tracking-tighter">€{(player.value || 145.5).toFixed(1)}M</div>
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-emerald-500" />
        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">+{growth}% vs Last Quarter</span>
      </div>
    </div>
  )
}

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
  const from = searchParams.get('from') || 'hub'

  const [isAnalysisOpen, setIsAnalysisOpen] = React.useState(false)

  // Create dynamic mock player
  const mockPlayer: ScoutProPlayer & { 
    description?: string,
    matches?: number,
    rating?: number,
    value?: number,
    contractExp?: number,
    agentPriority?: string
  } = {
    id: playerId,
    name: playerName,
    age: 23,
    nationality: nationality,
    position: position as Position,
    club: club,
    league: league,
    photoUrl: photo,
    description: description,
    matches: 28,
    rating: 91,
    value: 145.5,
    contractExp: 2027,
    agentPriority: 'VERY HIGH',
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
  const [playerData, setPlayerData] = React.useState<ScoutProPlayer & { 
    description?: string, 
    matches?: number, 
    rating?: number, 
    value?: number,
    releaseClause?: number,
    contractExp?: number,
    agentPriority?: string
  }>(mockPlayer)


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

        // Fetch player details from Server
        const enrichedData = await getPlayerDetailsAction(activeId);

          // Map Statorium API data to ScoutProPlayer format
          if (enrichedData) {
            const data = enrichedData as any;
            
            // Correctly aggregate stats across ALL 2025/26 seasons (League, Cup, CL, etc.)
            const statsArray = data.stat || [];
            const relevantSeasons = statsArray.filter((s: any) => 
              s.season_name?.includes('2025-26') || s.season_name?.includes('2025')
            );
            
            const goals = relevantSeasons.reduce((acc: number, s: any) => acc + (parseInt(s.Goals || s.goals) || 0), 0);
            const assists = relevantSeasons.reduce((acc: number, s: any) => acc + (parseInt(s.Assist || s.assist || s.Assists) || 0), 0);
            const matches = relevantSeasons.reduce((acc: number, s: any) => acc + (parseInt(s.played) || 0), 0);
            
            // Derive DNA based on position and stats
            const pos = data.position || position || 'FW';
            const isFW = ['ST', 'FW', 'RW', 'LW'].includes(pos);
            const isMF = ['CM', 'CAM', 'CDM', 'MF'].includes(pos);
            const isDF = ['CB', 'LB', 'RB', 'DF'].includes(pos);

            const seed = parseInt(activeId) || 1;
            const rng = (offset: number) => {
              // High entropy pseudo-random for DNA stats
              const val = Math.abs(Math.sin(seed * (offset + 1.234) * 0.987) * 40) + 55;
              return Math.min(99, Math.floor(val));
            };

            // Enhanced rating calculation
            const perfRating = Math.min(99, 72 + (goals * 1.5) + (assists * 1.0) + (matches * 0.2));

            const playerAge = parseInt(data.age || data.additionalInfo?.birthdate?.split('(')[1] || '23') || 23;

            // Dynamic Financial Metrics
            // Market value based on rating and age (younger = multiplier)
            const ageMultiplier = Math.max(0.7, 1.5 - (Math.max(0, playerAge - 20) * 0.05));
            const baseVal = Math.pow(perfRating / 75, 5) * 60;
            const marketValue = Math.min(250, Math.max(5, baseVal * ageMultiplier));
            
            // Contract expiry between 2026 and 2030
            const contractExp = 2026 + (seed % 5);
            
            // Agent priority
            const priorities = ['VERY HIGH', 'HIGH', 'MEDIUM', 'STRATEGIC'];
            const agentPriority = priorities[seed % priorities.length];

          const mappedData: ScoutProPlayer & { 
            description?: string, 
            matches?: number, 
            rating?: number, 
            value?: number,
            contractExp?: number,
            agentPriority?: string
          } = {
            id: (data.playerID || activeId).toString(),
            name: data.fullName || playerName,
            age: playerAge,
            nationality: typeof data.country === 'string' ? data.country : data.country?.name || nationality,
            position: pos as Position,
            club: data.teamName || data.team?.fullName || club,
            league: league,
            photoUrl: data.playerPhoto || data.photo || photo,
            description: description,
            matches: matches,
            rating: perfRating,
            value: marketValue,
            contractExp: contractExp,
            agentPriority: agentPriority,
            stats: {
              offensive: { 
                goals: goals, 
                assists: assists, 
                xG: Math.min(99, goals * 1.1 + 45), 
                xA: Math.min(99, assists * 1.3 + 45), 
                keyPasses: isMF ? 88 : 72 
              },
              defensive: { 
                tackles: isDF ? 88 : (isMF ? 68 : 45), 
                interceptions: isDF ? 85 : 40, 
                aerialWins: isDF || (isFW && goals > 10) ? 82 : 55, 
                clearances: isDF ? 92 : 32 
              },
              physical: { 
                distance: rng(1), 
                sprints: isFW ? 94 : rng(2), 
                stamina: rng(3) 
              },
              tactical: { 
                dribbles: isFW || isMF ? 86 : 52, 
                progressivePasses: isMF ? 89 : 72, 
                passAccuracy: rng(4), 
                pressing: rng(5) 
              }
            },
            updatedAt: new Date().toISOString()
          };
          setPlayerData(mappedData);

          // Get compatibility analysis
          const analysisData = await getCompatibilityAnalysis(mappedData);
          setResults(analysisData);
        } else {
          setPlayerData(mockPlayer);
          const analysisData = await getCompatibilityAnalysis(mockPlayer);
          setResults(analysisData);
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
            href={from === 'history' ? "/history" : "/dashboard"}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border-none hover:bg-white/10 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-500 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium text-white/70">
              {from === 'history' ? 'Return to History' : 'Return to Hub'}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Action buttons removed as requested */}
          </div>
        </div>

        {/* Hero Section - Elite Player Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 items-start">
          <div className="lg:col-span-1 space-y-6">
            <div className="relative overflow-hidden rounded-[2.5rem] border-none bg-gradient-to-br from-emerald-500/10 via-emerald-950/20 to-black p-8 md:p-12 group">
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
                  <div className="relative w-48 h-48 rounded-[2rem] overflow-hidden border-none shadow-2xl shadow-emerald-500/20">
                    <Image
                      src={playerData.photoUrl || '/placeholder-player.png'}
                      alt={playerData.name || 'Player'}
                      fill
                      className="object-cover scale-110 group-hover:scale-125 transition-transform duration-700"
                    />
                  </div>
                  {playerData.rating && playerData.rating > 88 && (
                    <div className="absolute -bottom-3 -right-3 px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-black tracking-tighter uppercase shadow-lg">
                      Elite Tier
                    </div>
                  )}
                </div>

                <div className="text-center md:text-left space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-none px-3 py-1">
                        {playerData.league || 'N/A'}
                      </Badge>
                      <Badge variant="outline" className="bg-white/5 text-white/50 border-none px-3 py-1">
                        Season 24/25
                      </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
                      {(playerData.name || 'Unknown Player').toUpperCase()}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
                    <div className="flex items-center gap-2 text-white/60">
                      <Trophy className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold tracking-wide">{playerData.club || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold tracking-wide">{playerData.position || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold tracking-wide">{playerData.nationality || 'N/A'} • {playerData.age || 23} yrs</span>
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
              <div className="rounded-3xl border-none bg-white/5 p-6 space-y-4 hover:bg-white/10 transition-all group shadow-sm">
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

              <div className="rounded-3xl border-none bg-white/5 p-6 space-y-4 hover:bg-white/10 transition-all group shadow-sm">
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

              <div className="rounded-3xl border-none bg-white/5 p-6 space-y-4 hover:bg-white/10 transition-all group shadow-sm">
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
            <div className="rounded-[2.5rem] border-none bg-white/5 p-8 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                <h3 className="text-xl font-black text-white italic tracking-tight">MARKET VALUATION</h3>
              </div>

              <MarketValue player={playerData} />

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border-none flex items-center justify-between">
                  <span className="text-sm font-medium text-white/40">Contract Exp.</span>
                  <span className="text-sm font-black text-white tracking-widest">{playerData.contractExp || '2027'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border-none flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-400">Agent Priority</span>
                  <Badge className="bg-emerald-500 text-black hover:bg-emerald-400">{playerData.agentPriority || 'VERY HIGH'}</Badge>
                </div>
              </div>

              <div className="p-1 rounded-[2rem] bg-gradient-to-r from-emerald-500 to-blue-500">
                <button
                  onClick={() => setIsAnalysisOpen(true)}
                  className="w-full py-4 rounded-[1.8rem] bg-[#0a0f0a] text-white text-sm font-black tracking-widest hover:bg-transparent transition-all uppercase italic"
                >
                  Initiate Transfer Analysis
                </button>
              </div>

              <TransferAnalysisModal
                isOpen={isAnalysisOpen}
                onClose={() => setIsAnalysisOpen(false)}
                player={playerData}
              />
            </div>
          </div>
        </div>

        {/* Detailed Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="rounded-[2.5rem] border-none bg-white/5 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Statistical Radar</h2>
                  <p className="text-white/40 text-sm font-medium">Comparative analysis against position average (Global Database)</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border-none shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">{playerData.name || 'Player'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border-none shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">Pos. Average</span>
                  </div>
                </div>
              </div>

              <div className="h-[450px] w-full">
                <PlayerRadarChart player={playerData} />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[2.5rem] border-none bg-white/5 p-8 h-full shadow-inner">
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
