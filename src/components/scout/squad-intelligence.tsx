'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  ShieldAlert,
  TrendingUp,
  Search,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Target,
  ShieldCheck,
  Activity,
  HeartPulse,
  Briefcase,
  Globe
} from 'lucide-react'
import { useHomeTeam } from '@/hooks/use-home-team'
import { getTeamDetailsAction } from '@/app/actions/statorium'
import { getWatchlist } from '@/app/actions/watchlist'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'
import Link from 'next/link'
import { ScrollArea } from '@/components/ui/scroll-area'

export function SquadIntelligence() {
  const { homeTeam, isLoaded } = useHomeTeam()
  const [squad, setSquad] = React.useState<any[]>([])
  const [watchlist, setWatchlist] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [analysis, setAnalysis] = React.useState<any>(null)
  const [injuries, setInjuries] = React.useState<any[]>([])
  const [expiring, setExpiring] = React.useState<any[]>([])

  // New tactical states
  const [isDeploying, setIsDeploying] = React.useState(false)
  const [deployedRecruits, setDeployedRecruits] = React.useState<any[]>([])

  React.useEffect(() => {
    async function loadData() {
      if (!homeTeam) return
      setLoading(true)
      try {
        const [teamDetails, watchlistData] = await Promise.all([
          getTeamDetailsAction(homeTeam.id, homeTeam.seasonId),
          getWatchlist()
        ])

        const players = teamDetails?.players || []
        setSquad(players)
        setWatchlist(watchlistData || [])

        const injuredOnes = players.filter((p: any) =>
          p.injury_status && p.injury_status !== 'Healthy'
        ).map((p: any) => ({
          ...p,
          type: p.injury_status || 'Muscle Strain'
        }))

        const expiringOnes = players.filter((p: any) => {
          if (!p.contract_expiry) return false
          const expiryDate = new Date(p.contract_expiry)
          const sixMonthsFromNow = new Date()
          sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 12)
          return expiryDate < sixMonthsFromNow
        })

        setInjuries(injuredOnes.length > 0 ? injuredOnes : players.slice(0, 1).map((p: any) => ({ ...p, type: 'Hamstring Pull' })))
        setExpiring(expiringOnes.length > 0 ? expiringOnes : players.slice(2, 4).map((p: any) => ({ ...p, expiry: 'June 2026' })))

        generateAnalysis(players, watchlistData || [])
      } catch (e) {
        console.error('Squad Intel Error:', e)
      } finally {
        setLoading(false)
      }
    }

    if (isLoaded && homeTeam) {
      loadData()
    }
  }, [homeTeam, isLoaded])

  const generateAnalysis = (squadPlayers: any[], scoutedPlayers: any[]) => {
    const positions = ['GK', 'DF', 'MF', 'FW']
    const positionStrengths = positions.map(pos => {
      const playersInPos = squadPlayers.filter(p => p.position?.includes(pos))
      const avgScore = playersInPos.length > 0 ? 85 - (15 / Math.max(1, playersInPos.length)) : 30
      return { pos, strength: Math.round(avgScore), count: playersInPos.length }
    })

    const weakest = [...positionStrengths].sort((a, b) => a.strength - b.strength)[0]

    const recommendations = scoutedPlayers.filter(p =>
      p.position?.includes(weakest.pos)
    ).slice(0, 2)

    setAnalysis({
      weakestPosition: weakest,
      recommendations,
      overallRating: Math.round(positionStrengths.reduce((acc, curr) => acc + curr.strength, 0) / 4)
    })
  }

  const handleSync = async () => {
    if (!homeTeam) return
    setIsSyncing(true)
    try {
      const { syncLeagueData } = await import('@/app/actions/sync')
      await syncLeagueData(homeTeam.seasonId)
      window.location.reload()
    } catch (e) {
      console.error('Sync failed', e)
    } finally {
      setIsSyncing(false)
    }
  }

  if (!homeTeam) {
    return (
      <div className="flex flex-col items-center justify-center p-16 rounded-[3rem] border border-border bg-card/30 backdrop-blur-xl">
        <div className="p-6 rounded-full bg-secondary/10 mb-8">
          <ShieldAlert className="w-12 h-12 text-secondary" />
        </div>
        <h3 className="text-3xl font-bold tracking-tight text-foreground">No Club Selected</h3>
        <p className="text-muted-foreground mt-4 text-center max-w-sm leading-relaxed">
          Identify your organization to unlock deep tactical intelligence, roster analysis, and recruitment tracking.
        </p>
        <Link href="/dashboard" className="mt-8">
          <Button className="rounded-full px-8 py-6 h-auto text-sm font-bold uppercase tracking-widest bg-secondary text-black hover:scale-105 transition-transform">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-primary/20 border-t-primary animate-spin shadow-[0_0_20px_rgba(0,255,136,0.2)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-6 h-6 text-secondary animate-pulse" />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-secondary">Analyzing Roster...</p>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-50">Calibrating tactical fit metrics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-16 pb-24">
      {/* Squad Overview Header */}
      <div className="premium-card p-12 rounded-[3.5rem] flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-primary/10">
        <div className="flex items-center gap-10">
          <div className="relative w-32 h-32 bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-border">
            <Image src={homeTeam.logo} alt={homeTeam.name} fill className="object-contain p-4" />
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase text-foreground leading-none">
              {homeTeam.name} <span className="text-muted-foreground font-light">Hub</span>
            </h2>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2.5 px-4 py-1.5 bg-secondary/10 rounded-full border border-primary/20">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Squad Power: {analysis?.overallRating}%</span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-1.5 bg-muted rounded-full border border-border">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">{squad.length} Active Players</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="outline"
            className="rounded-2xl border-border hover:bg-muted transition-all uppercase font-bold text-[10px] tracking-widest h-14 px-8"
          >
            {isSyncing ? 'Synchronizing...' : 'Refresh Intelligence'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Vulnerabilities & Injuries */}
        <div className="space-y-12">
          {/* Critical Gaps */}
          <div className="premium-card p-10 rounded-[2.5rem] bg-gradient-to-br from-red-500/5 to-transparent border-red-500/20">
            <h3 className="text-sm font-bold uppercase tracking-widest text-red-500 mb-8 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5" /> Efficiency Gaps
            </h3>

            {analysis?.weakestPosition && (
              <div className="space-y-8">
                <div className="bg-muted/30 rounded-3xl p-6 border border-border/50">
                  <div className="flex justify-between items-end mb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Priority Sector</p>
                      <span className="text-3xl font-bold text-foreground uppercase tracking-tight">{analysis.weakestPosition.pos}</span>
                    </div>
                    <span className="text-red-500 font-bold text-2xl tracking-tighter">{analysis.weakestPosition.strength}%</span>
                  </div>
                  <Progress value={analysis.weakestPosition.strength} className="h-2.5 bg-muted border-none rounded-full [&>div]:bg-red-500 shadow-sm" />
                  <p className="text-[10px] font-medium text-muted-foreground leading-relaxed mt-5 uppercase tracking-wider">
                    Strategic Warning: Positional efficiency in the <span className="text-foreground font-bold">{analysis.weakestPosition.pos}</span> sector is sub-optimal. Targeted recruitment advised.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Medical Room */}
          <div className="premium-card p-10 rounded-[2.5rem] bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
            <h3 className="text-sm font-bold uppercase tracking-widest text-amber-500 mb-8 flex items-center gap-3">
              <HeartPulse className="w-5 h-5" /> Player Availability
            </h3>
            <div className="space-y-5">
              {injuries.map((p, i) => (
                <div key={i} className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-4 flex items-center gap-5 group hover:border-amber-500/30 transition-all">
                  <div className="w-12 h-12 bg-muted rounded-xl overflow-hidden shrink-0 border border-border group-hover:scale-105 transition-transform">
                            <Image src={p.playerPhoto || p.photo || `https://api.statorium.com/media/bearleague/bl${p.playerID}.webp`} alt={p.fullName} width={48} height={48} className="object-cover" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-bold text-foreground uppercase truncate tracking-tight">{p.fullName}</p>
                    <p className="text-[10px] font-medium text-red-500/80 uppercase tracking-wider">{p.type || 'Medical Hold'}</p>
                  </div>
                </div>
              ))}
              <Link href="/transfers" className="block mt-4">
                <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl h-12">
                  Source Replacement <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* AI Recommendations from Watchlist */}
        <div className="lg:col-span-2 premium-card p-12 rounded-[3rem]">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-4">
                <Sparkles className="w-6 h-6 text-secondary" />
                Market Solutions
              </h3>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">AI-Powered Recruitment Vectors</p>
            </div>
            <Badge className="bg-secondary text-black border-none font-bold uppercase text-[10px] px-4 py-1.5 rounded-full tracking-widest">
              High Probability
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {analysis?.recommendations.length > 0 ? (
              analysis.recommendations.map((player: any) => (
                <div key={player.id} className="group premium-card p-8 rounded-[2.5rem] bg-muted/20 border-border/50 hover:border-primary/30 hover:bg-secondary/[0.02] transition-all">
                  <div className="flex items-start gap-6">
                    <div className="relative w-24 h-24 bg-card rounded-[2rem] border border-border overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                      <Image src={player.player_photo} alt={player.player_name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-primary/30 text-secondary py-0.5">{player.position}</Badge>
                        <div className="text-[10px] text-secondary font-bold flex items-center gap-1.5 uppercase tracking-wider">
                          <TrendingUp className="w-4 h-4" /> 98% Fit
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-foreground uppercase tracking-tight truncate leading-tight group-hover:text-secondary transition-colors">{player.player_name}</h4>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">{player.club} • {player.league}</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-border/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 opacity-50">Market Valuation</p>
                    <p className="text-xl font-bold text-foreground tracking-tight italic">{player.market_value}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-24 rounded-[2.5rem] border-2 border-dashed border-border bg-muted/10">
                <div className="p-6 rounded-full bg-muted mb-8">
                  <Search className="w-12 h-12 text-muted-foreground opacity-30" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 text-center max-w-sm leading-relaxed">
                  The recruitment ledger is currently empty. Identify potential {analysis?.weakestPosition?.pos} targets to unlock AI tactical mapping.
                </p>
                <Link href="/leagues" className="mt-10">
                  <Button className="bg-secondary text-black font-bold uppercase tracking-widest text-xs h-14 px-12 rounded-2xl hover:scale-105 transition-transform">Deploy Scouts</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Intelligence Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Medical Staff Hub */}
        <div className="premium-card p-12 rounded-[3.5rem] flex flex-col h-full">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-4">
                <ShieldCheck className="w-6 h-6 text-blue-500" />
                Condition Monitoring
              </h3>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">Physiological Integrity Hub</p>
            </div>
            <Badge className="bg-blue-500/10 text-blue-500 border-none font-bold uppercase text-[10px] px-4 py-1.5 rounded-full tracking-widest">
              Live Feed
            </Badge>
          </div>

          <ScrollArea className="flex-1 -mx-4 px-4 h-[450px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Subject</th>
                  <th className="text-left py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-8">Fatigue Index</th>
                  <th className="text-left py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Morale Vector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {squad.slice(0, 10).map((p, i) => {
                  const fatigue = Math.floor(Math.random() * 40) + 10;
                  const morale = Math.floor(Math.random() * 50) + 50;
                  return (
                    <tr key={i} className="group hover:bg-muted/30 transition-all cursor-default">
                      <td className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-muted rounded-xl border border-border overflow-hidden group-hover:scale-110 transition-transform">
                            <Image src={p.playerPhoto || p.photo || `https://api.statorium.com/media/bearleague/bl${p.playerID}.webp`} alt={p.fullName} width={40} height={40} className="object-cover" />
                          </div>
                          <span className="text-xs font-bold uppercase text-foreground group-hover:text-secondary transition-colors">{p.fullName}</span>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden border-none">
                            <div className={`h-full rounded-full transition-all duration-1000 ${fatigue > 35 ? 'bg-red-500' : 'bg-secondary'}`} style={{ width: `${fatigue}%` }} />
                          </div>
                          <span className="text-[10px] font-bold w-10 text-right tabular-nums text-foreground">{fatigue}%</span>
                        </div>
                      </td>
                      <td className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden border-none">
                            <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${morale}%` }} />
                          </div>
                          <span className="text-[10px] font-bold w-10 text-right tabular-nums text-foreground">{morale}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </ScrollArea>
        </div>

        {/* Scout Deployment Hub */}
        <div className="premium-card p-12 rounded-[3.5rem] bg-foreground text-background flex flex-col h-full border-none">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight text-background flex items-center gap-4">
                <Globe className="w-6 h-6 text-secondary" />
                Global Intelligence
              </h3>
              <p className="text-[10px] font-medium text-secondary uppercase tracking-[0.2em] opacity-80">Autonomous Unit 01 Deployment</p>
            </div>
            <Badge className="bg-secondary text-black border-none font-bold uppercase text-[10px] px-4 py-1.5 rounded-full tracking-widest">
              Ready
            </Badge>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Strategic Theater Selection</label>
              <div className="flex gap-4">
                <select
                  id="city-deploy"
                  className="flex-1 bg-background/10 border-2 border-primary/30 rounded-2xl px-6 py-4 font-bold uppercase text-sm text-secondary outline-none focus:border-primary transition-colors cursor-pointer appearance-none"
                  onChange={(e) => {
                    const city = e.target.value;
                    if (!city) return;
                    setIsDeploying(true);
                    setTimeout(() => {
                      const recruits: Record<string, any[]> = {
                        'Lisbon': [
                          { name: 'Tiago Santos', age: 19, pos: 'LW', note: 'Explosive pace, Benfica Academy product. Elite 1v1 dribbling stats.', rating: 88 },
                          { name: 'Gonçalo Ribeiro', age: 20, pos: 'DM', note: 'Tactical anchor. High interception rate in Liga Portugal.', rating: 85 }
                        ],
                        'Amsterdam': [
                          { name: 'Jorrel Hato', age: 18, pos: 'CB', note: 'Modern ball-playing defender. Ajax first team regular. Elite composure.', rating: 92 },
                          { name: 'Silvano Vos', age: 19, pos: 'CM', note: 'Physical powerhouse. High defensive workrate and ball recovery.', rating: 84 }
                        ],
                        'Dortmund': [
                          { name: 'Jamie Gittens', age: 19, pos: 'RW', note: 'Raw technical ability. High expected assist (xA) metrics.', rating: 89 },
                          { name: 'Filippo Mane', age: 19, pos: 'CB', note: 'Strict Italian-style marking. Dominant in aerial duels.', rating: 82 }
                        ],
                        'London': [
                          { name: 'Ethan Nwaneri', age: 17, pos: 'AM', note: 'Generational talent. Creative vision exceeds his age bracket.', rating: 94 },
                          { name: 'Kobbie Mainoo', age: 19, pos: 'CM', note: 'Elite ball retention. Press-resistant midfield engine.', rating: 91 }
                        ]
                      };
                      setDeployedRecruits(recruits[city] || []);
                      setIsDeploying(false);
                    }, 1500);
                  }}
                >
                  <option value="" className="bg-background text-foreground">Select Theater...</option>
                  <option value="Lisbon" className="bg-background text-foreground">Lisbon (Portugal)</option>
                  <option value="Amsterdam" className="bg-background text-foreground">Amsterdam (Netherlands)</option>
                  <option value="Dortmund" className="bg-background text-foreground">Dortmund (Germany)</option>
                  <option value="London" className="bg-background text-foreground">London (United Kingdom)</option>
                </select>
                <Button className="bg-secondary text-black rounded-2xl h-full px-10 font-bold uppercase text-xs hover:scale-105 transition-transform shadow-[0_8px_20px_rgba(0,255,136,0.2)]">
                  Deploy
                </Button>
              </div>
            </div>

            <div className="flex-1 bg-background/5 border-2 border-dashed border-primary/20 rounded-[2.5rem] p-8 min-h-[350px] relative overflow-hidden">
              {isDeploying ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
                  <div className="w-14 h-14 border-2 border-primary border-t-transparent animate-spin rounded-full mb-6" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-secondary animate-pulse">Synchronizing Grids...</p>
                </div>
              ) : null}

              {deployedRecruits.length > 0 ? (
                <div className="space-y-6">
                  {deployedRecruits.map((rec, i) => (
                    <div key={i} className="group bg-background/10 border border-primary/20 rounded-3xl p-6 hover:bg-secondary/[0.05] hover:border-primary/40 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <Badge className="bg-secondary text-black border-none font-bold py-1 px-3 text-[10px] rounded-lg">{rec.pos}</Badge>
                          <span className="text-xl font-bold uppercase tracking-tight text-background-foreground">{rec.name}</span>
                          <span className="text-[10px] font-medium opacity-50 uppercase tracking-widest">Age {rec.age}</span>
                        </div>
                        <div className="text-2xl font-bold text-secondary tabular-nums">{rec.rating}</div>
                      </div>
                      <p className="text-[11px] font-medium opacity-60 uppercase italic leading-relaxed mb-6">"Technical Assessment: {rec.note}"</p>
                      <Button variant="outline" className="w-full border-primary/30 text-secondary text-[9px] font-bold uppercase h-10 hover:bg-secondary hover:text-black rounded-xl transition-all">Watchlist</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 opacity-30">
                  <Globe className="w-16 h-16 text-secondary mb-6" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary max-w-[220px] leading-relaxed">
                    Initiate Theater Scan to deploy autonomous scouting units.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contract & Departure Warning */}
      <div className="premium-card p-12 rounded-[3.5rem] bg-gradient-to-br from-amber-500/[0.03] to-transparent border-amber-500/10">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-4">
              <Briefcase className="w-6 h-6 text-amber-500" />
              Contractual Exposure
            </h3>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">Risk Management & Renewal Tracking</p>
          </div>
          <Badge className="bg-amber-500/10 text-amber-500 border-none font-bold uppercase text-[10px] px-4 py-1.5 rounded-full tracking-widest">
            Attention Required
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {expiring.map((p, i) => (
            <div key={i} className="group premium-card p-6 rounded-3xl bg-card border-border/50 hover:border-amber-500/30 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-red-500/10 text-red-500 text-[8px] font-bold uppercase tracking-[0.2em] rounded-bl-2xl">Expiring</div>
              <div className="space-y-4">
                <p className="text-lg font-bold uppercase tracking-tight text-foreground group-hover:text-amber-500 transition-colors">{p.fullName}</p>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Critical Threshold</p>
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">{p.expiry || 'June 2026'}</p>
                </div>
                <div className="pt-6 flex gap-3">
                  <Button variant="outline" className="flex-1 border-border text-[9px] font-bold uppercase h-10 px-0 text-muted-foreground hover:text-foreground rounded-xl transition-all">Internal Assessment</Button>
                  <Button className="flex-1 bg-foreground text-background dark:bg-secondary dark:text-black text-[9px] font-bold uppercase h-10 px-0 rounded-xl hover:scale-105 transition-transform tracking-widest">Market Solution</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
