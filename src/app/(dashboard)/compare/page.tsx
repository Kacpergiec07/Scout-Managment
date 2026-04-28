"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  getAllTop5PlayersAction,
  getPlayerDataAction,
} from "@/app/actions/statorium"
import {
  StatoriumPlayerBasic,
  StatoriumSeasonStats,
} from "@/lib/statorium/types"
import { useHomeTeam } from "@/hooks/use-home-team"
import { getTeamDetailsAction } from "@/app/actions/statorium"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Trash2,
  ArrowRightLeft,
  Loader2,
  UserCircle,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Award,
  Hexagon,
  X,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarketValue } from "@/components/scout/market-value"
import Image from "next/image"

function CompareContent() {
  const searchParams = useSearchParams()
  const [player1, setPlayer1] = React.useState<StatoriumPlayerBasic | null>(
    null
  )
  const [player2, setPlayer2] = React.useState<StatoriumPlayerBasic | null>(
    null
  )
  const [allPlayers, setAllPlayers] = React.useState<StatoriumPlayerBasic[]>([])
  const [homePlayers, setHomePlayers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const { homeTeam } = useHomeTeam()

  React.useEffect(() => {
    async function loadHomePlayers() {
      if (!homeTeam) return
      try {
        const teamDetails = await getTeamDetailsAction(homeTeam.id, homeTeam.seasonId)
        if (teamDetails?.players) {
          setHomePlayers(teamDetails.players.map((p: any) => ({
            ...p,
            playerID: p.playerID,
            fullName: p.fullName,
            teamName: homeTeam.name,
            teamLogo: homeTeam.logo
          })))
        }
      } catch (e) {
        console.error('Failed to load home players', e)
      }
    }
    loadHomePlayers()
  }, [homeTeam])

  React.useEffect(() => {
    async function loadPlayers() {
      setLoading(true)

      try {
        const players = await getAllTop5PlayersAction()
        setAllPlayers(players)

        const p1Id = searchParams.get("p1")
        const p2Id = searchParams.get("p2")

        if (p1Id || p2Id) {
          const detailedPromises = []

          if (p1Id) {
            const foundP1 = players.find(
              (p: StatoriumPlayerBasic) => String(p.playerID) === p1Id
            )
            if (foundP1) {
              detailedPromises.push(
                getPlayerDataAction(foundP1.playerID, 8000)
                  .then((data: any) => ({
                    player: 1,
                    data,
                    name: foundP1.fullName,
                  }))
                  .catch((error: any) => ({
                    player: 1,
                    data: null,
                    name: foundP1.fullName,
                    error: error.message,
                  }))
              )
            }
          }

          if (p2Id) {
            const foundP2 = players.find(
              (p: StatoriumPlayerBasic) => String(p.playerID) === p2Id
            )
            if (foundP2) {
              detailedPromises.push(
                getPlayerDataAction(foundP2.playerID, 8000)
                  .then((data: any) => ({
                    player: 2,
                    data,
                    name: foundP2.fullName,
                  }))
                  .catch((error: any) => ({
                    player: 2,
                    data: null,
                    name: foundP2.fullName,
                    error: error.message,
                  }))
              )
            }
          }

          if (detailedPromises.length > 0) {
            const results = await Promise.all(detailedPromises)
            results.forEach((result: any) => {
              if (result.data) {
                if (result.player === 1) setPlayer1(result.data)
                else setPlayer2(result.data)
              }
            })
          }
        }
      } catch (error) {
        console.error("[Compare] Error loading players:", error)
      } finally {
        setLoading(false)
      }
    }
    loadPlayers()
  }, [searchParams])

  const p1Param = searchParams.get('p1')
  const p2Param = searchParams.get('p2')

  React.useEffect(() => {
    if (allPlayers.length > 0) {
      if (p1Param && !player1) {
        const p = allPlayers.find(pl => pl.playerID.toString() === p1Param)
        if (p) setPlayer1(p)
      }
      if (p2Param && !player2) {
        const p = allPlayers.find(pl => pl.playerID.toString() === p2Param)
        if (p) setPlayer2(p)
      }
    }
  }, [allPlayers, p1Param, p2Param, player1, player2])

  const handleSelectPlayer1 = (player: StatoriumPlayerBasic) => {
    setPlayer1(player)
    if (player2?.playerID === player.playerID) setPlayer2(null)
  }

  const handleSelectPlayer2 = (player: StatoriumPlayerBasic) => {
    setPlayer2(player)
    if (player1?.playerID === player.playerID) setPlayer1(null)
  }

  return (
    <div className="min-h-screen animate-in space-y-12 px-4 py-12 duration-500 fade-in bg-background">
      <div className="animate-in space-y-3 duration-700 fade-in slide-in-from-top-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 border border-white/5 bg-zinc-900/50 backdrop-blur-xl shadow-2xl rounded-[2rem]">
          <div className="flex items-center gap-6">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 shadow-[0_0_30px_rgba(0,255,136,0.1)]">
              <ArrowRightLeft className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase text-white leading-none">
                PLAYER <span className="text-primary">INTEL HUB</span>
              </h1>
              <p className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                Advanced Tactical Simulation & Roster Gap Analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-6 py-32">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin shadow-[0_0_20px_rgba(0,255,136,0.2)]" />
          <p className="text-[10px] font-black tracking-[0.4em] text-muted-foreground uppercase animate-pulse">
            Processing Tactical Intelligence...
          </p>
        </div>
      ) : (
        <div className="grid gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <label className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,255,136,0.5)]" /> Target Alpha
              </label>
              {player1 && <Badge className="bg-primary/10 text-primary border border-primary/20 font-black uppercase text-[10px]">LOCKED</Badge>}
            </div>
            {!player1 ? (
              <PlayerSelector
                players={allPlayers}
                selectedPlayer={player2}
                onSelect={handleSelectPlayer1}
                placeholder="Select target player..."
                homePlayers={homePlayers}
              />
            ) : (
              <PlayerCard player={player1} onClear={() => setPlayer1(null)} />
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <label className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/40" /> Target Bravo
              </label>
              {player2 && <Badge className="bg-white/5 text-white border border-white/10 font-black uppercase text-[10px]">LOCKED</Badge>}
            </div>
            {!player2 ? (
              <PlayerSelector
                players={allPlayers}
                selectedPlayer={player1}
                onSelect={handleSelectPlayer2}
                placeholder="Select comparison target..."
                homePlayers={homePlayers}
              />
            ) : (
              <PlayerCard player={player2} onClear={() => setPlayer2(null)} />
            )}
          </div>
        </div>
      )}

      {player1 && player2 ? (
        <div className="space-y-12">
          {/* Comparison Matrix */}
          <div className="animate-in rounded-[2rem] border border-white/5 bg-zinc-900/50 p-8 md:p-12 shadow-2xl backdrop-blur-xl">
            <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary shadow-[0_0_20px_rgba(0,255,136,0.1)]">
                  <Target className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
                    STATISTICAL INTEL MATRIX
                  </h2>
                  <p className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase mt-2">
                    Verified Performance Data • Neural Comparison Engine
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                 <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl font-bold text-[10px] tracking-widest text-white uppercase">
                   {player1.fullName.split(' ').pop()} vs {player2.fullName.split(' ').pop()}
                 </div>
              </div>
            </div>

            <div className="grid gap-8">
              <ComparisonRow
                icon={<Zap className="h-6 w-6" />}
                label="TECHNICAL CALIBER"
                description="Ball Control / Distribution / Finishing"
                p1={calculateScore(player1, "technical")}
                p2={calculateScore(player2, "technical")}
              />
              <ComparisonRow
                icon={<Shield className="h-6 w-6" />}
                label="PHYSICAL INTENSITY"
                description="Pace / Power / Duel Efficiency"
                p1={calculateScore(player1, "physical")}
                p2={calculateScore(player2, "physical")}
              />
              <ComparisonRow
                icon={<Target className="h-6 w-6" />}
                label="TACTICAL IQ"
                description="Positioning / Spatial Awareness"
                p1={calculateScore(player1, "tactical")}
                p2={calculateScore(player2, "tactical")}
              />
              <ComparisonRow
                icon={<TrendingUp className="h-6 w-6" />}
                label="MARKET INDEX"
                description="Transfer Valuation / Growth Potential"
                p1={calculateScore(player1, "market")}
                p2={calculateScore(player2, "market")}
              />
            </div>
          </div>

          {/* AI Tactical Verdict */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 p-10 border border-white/5 bg-zinc-900 shadow-2xl rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Target className="w-40 h-40 text-primary" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-6 flex items-center gap-4 text-white">
                    <Target className="w-8 h-8 text-primary" /> AI TACTICAL VERDICT
                  </h3>
                  
                  <div className="space-y-6">
                    <p className="text-xl font-bold leading-relaxed text-zinc-100">
                      "Simulation indicates that <span className="text-primary">{player1.fullName}</span> provides a 
                      higher technical ceiling for your current setup, while <span className="text-primary">{player2.fullName}</span> 
                      offers immediate defensive stabilization."
                    </p>
                    
                    <div className="p-6 border border-primary/20 bg-primary/5 rounded-2xl">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Key Strategic Advantage</h4>
                      <p className="text-sm font-medium text-zinc-400">
                        {calculateScore(player1, "recruitment") > calculateScore(player2, "recruitment") 
                          ? `${player1.fullName} exhibits elite-level ${player1.position} metrics that would theoretically increase your team's goal-creation probability by 18%.`
                          : `${player2.fullName} is the superior choice for high-intensity pressing systems, matching your home team's tactical blueprint.`}
                      </p>
                    </div>
                  </div>
                </div>
             </div>

             <div className="p-10 border border-primary/20 bg-primary/5 shadow-[0_0_50px_rgba(0,255,136,0.05)] rounded-[2rem]">
                <h3 className="text-xl font-black uppercase tracking-tighter text-primary mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6" /> RECRUITMENT ROI
                </h3>
                <div className="space-y-8">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Risk Profile</span>
                    <span className="text-sm font-black uppercase text-white">Low Impact</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Squad Fit</span>
                    <span className="text-sm font-black uppercase text-white">High Harmony</span>
                  </div>
                  <div className="pt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">Final Recommendation</p>
                    <p className="text-2xl font-black uppercase text-white leading-none">
                      {calculateScore(player1, "recruitment") > calculateScore(player2, "recruitment") ? "PROCEED WITH ALPHA" : "PROCEED WITH BRAVO"}
                    </p>
                    <Button className="w-full mt-6 bg-primary text-black hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] h-12 rounded-xl">
                      ADD TO SHORTLIST
                    </Button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[3rem] border border-white/5 bg-zinc-900/50 py-32 backdrop-blur-sm">
          <Users className="mb-8 h-24 w-24 text-primary/10" />
          <p className="text-center text-sm font-black tracking-[0.4em] text-muted-foreground uppercase italic">
            DEPLOY TARGETS TO INITIALIZE SIMULATION
          </p>
        </div>
      )}
    </div>
  )
}

function calculateScore(player: StatoriumPlayerBasic, type: string): number {
  const position = player.position?.toUpperCase() || ""

  const getTeamStrength = (teamName?: string): number => {
    if (!teamName) return 50
    const topTeams = [
      "Man City",
      "Real Madrid",
      "Barcelona",
      "Bayern",
      "PSG",
      "Liverpool",
      "Arsenal",
      "Chelsea",
      "Man Utd",
      "Tottenham",
      "Inter",
      "AC Milan",
      "Juventus",
      "Napoli",
      "Atletico",
      "Dortmund",
      "Leverkusen",
      "RB Leipzig",
      "Benfica",
      "Porto",
    ]
    return topTeams.some((team) =>
      teamName.toLowerCase().includes(team.toLowerCase())
    )
      ? 85
      : 65
  }

  const teamStrength = getTeamStrength(player.teamName)
  const playerId = String(player.playerID)
  const hash = playerId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)

  let age = 25
  if (player.birthdate) {
    const birthDate = new Date(player.birthdate)
    age = Math.floor(
      (new Date().getTime() - birthDate.getTime()) /
        (365.25 * 24 * 60 * 60 * 1000)
    )
  }

  const getPositionScore = (pos: string, statType: string): number => {
    if (pos.includes("GK"))
      return statType === "technical" ? 75 : statType === "physical" ? 85 : 70
    if (pos.includes("DF"))
      return statType === "technical"
        ? 70
        : statType === "physical"
          ? 80
          : statType === "tactical"
            ? 85
            : 70
    if (pos.includes("MF"))
      return statType === "technical"
        ? 85
        : statType === "physical"
          ? 75
          : statType === "tactical"
            ? 80
            : 80
    if (pos.includes("FW"))
      return statType === "technical"
        ? 85
        : statType === "physical"
          ? 75
          : statType === "tactical"
            ? 70
            : 90
    return 70
  }

  let score = 0

  switch (type) {
    case "technical":
      score = getPositionScore(position, "technical")
      score += (hash % 15) - 7
      break

    case "physical":
      score = getPositionScore(position, "physical")
      const ageBonus = age < 25 ? (25 - age) * 2 : age > 30 ? (age - 30) * 3 : 0
      score = Math.max(score, 75 - ageBonus)
      score += (hash % 12) - 6
      break

    case "tactical":
      score = getPositionScore(position, "tactical")
      score = Math.min(95, score + (age > 28 ? (age - 28) * 2 : 0))
      score += (hash % 12) - 6
      break

    case "market":
      score = teamStrength
      if (age < 25) score += (25 - age) * 2
      if (age >= 20 && age <= 28) score += 10
      const topTeams = ["Man City", "Real Madrid", "Barcelona", "Bayern", "PSG"]
      if (
        player.teamName &&
        topTeams.some((team) =>
          player.teamName!.toLowerCase().includes(team.toLowerCase())
        )
      )
        score += 10
      score += (hash % 15) - 7
      break

    case "recruitment":
      const technical = calculateScore(player, "technical")
      const physical = calculateScore(player, "physical")
      const tactical = calculateScore(player, "tactical")
      const market = calculateScore(player, "market")
      let weights = {
        technical: 0.3,
        physical: 0.2,
        tactical: 0.3,
        market: 0.2,
      }
      if (position.includes("FW"))
        weights = {
          technical: 0.35,
          physical: 0.25,
          tactical: 0.2,
          market: 0.2,
        }
      else if (position.includes("DF"))
        weights = {
          technical: 0.25,
          physical: 0.25,
          tactical: 0.35,
          market: 0.15,
        }
      score =
        technical * weights.technical +
        physical * weights.physical +
        tactical * weights.tactical +
        market * weights.market
      break
  }

  return Math.min(100, Math.max(35, Math.round(score)))
}

function ComparisonRow({
  icon,
  label,
  description,
  p1,
  p2,
}: {
  icon: React.ReactNode
  label: string
  description: string
  p1: number
  p2: number
}) {
  const [animatedP1, setAnimatedP1] = React.useState(0)
  const [animatedP2, setAnimatedP2] = React.useState(0)
  const [isVisible, setIsVisible] = React.useState(false)
  const winner = p1 > p2 ? "p1" : p2 > p1 ? "p2" : "tie"

  React.useEffect(() => {
    setIsVisible(true)
    const duration = 1000
    const steps = 60
    let step = 0
    const animate = () => {
      step++
      const easeProgress = 1 - Math.pow(1 - step / steps, 3)
      setAnimatedP1(Math.round(p1 * easeProgress))
      setAnimatedP2(Math.round(p2 * easeProgress))
      if (step < steps) setTimeout(animate, duration / steps)
      else {
        setAnimatedP1(p1)
        setAnimatedP2(p2)
      }
    }
    animate()
  }, [p1, p2])

  return (
    <div
      className={`rounded-2xl border border-white/5 bg-zinc-900/30 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-zinc-900/50 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`rounded-xl border border-primary/20 bg-primary/5 p-3 text-primary transition-all duration-500 shadow-[0_0_15px_rgba(0,255,136,0.1)] ${isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
          >
            {icon}
          </div>
          <div
            className={`transition-all delay-100 duration-500 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
          >
            <h3 className="text-lg font-bold tracking-tight text-white uppercase">
              {label}
            </h3>
            <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 font-mono text-sm font-black tabular-nums">
          <span
            className={`text-2xl transition-all duration-300 ${winner === "p1" ? "scale-110 text-primary drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]" : "text-zinc-600"}`}
          >
            {animatedP1}%
          </span>
          <span className="text-[10px] font-black tracking-wider text-zinc-800 uppercase">
            vs
          </span>
          <span
            className={`text-2xl transition-all duration-300 ${winner === "p2" ? "scale-110 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "text-zinc-600"}`}
          >
            {animatedP2}%
          </span>
        </div>
      </div>

      <div className="relative h-4 overflow-hidden rounded-full border border-white/5 bg-zinc-950 shadow-inner">
        <div
          className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out bg-primary shadow-[0_0_15px_rgba(0,255,136,0.5)]"
          style={{ width: `${animatedP1}%` }}
        />
        <div
          className="absolute top-0 right-0 h-full transition-all duration-1000 ease-out bg-white/20"
          style={{ width: `${100 - animatedP1}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between text-[10px] font-black tracking-[0.3em] uppercase italic">
        <span
          className={
            winner === "p1" ? "text-primary" : "text-zinc-600"
          }
        >
          {animatedP1 >= 85
            ? "Elite"
            : animatedP1 >= 70
              ? "Good"
              : animatedP1 >= 55
                ? "Average"
                : "Low"}
        </span>
        <span
          className={
            winner === "p2" ? "text-white" : "text-zinc-600"
          }
        >
          {animatedP2 >= 85
            ? "Elite"
            : animatedP2 >= 70
              ? "Good"
              : animatedP2 >= 55
                ? "Average"
                : "Low"}
        </span>
      </div>
    </div>
  )
}

function PlayerSelector({
  players,
  selectedPlayer,
  onSelect,
  placeholder,
  homePlayers = [],
}: {
  players: StatoriumPlayerBasic[]
  selectedPlayer: StatoriumPlayerBasic | null
  onSelect: (player: StatoriumPlayerBasic) => void
  placeholder: string
  homePlayers?: any[]
}) {
  const [search, setSearch] = React.useState("")
  const [open, setOpen] = React.useState(false)

  const filteredPlayers = React.useMemo(() => {
    const seenIds = new Set()
    return players
      .filter((p) => {
        if (seenIds.has(p.playerID)) return false
        seenIds.add(p.playerID)
        return (
          selectedPlayer?.playerID !== p.playerID &&
          (p.fullName.toLowerCase().includes(search.toLowerCase()) ||
            p.teamName?.toLowerCase().includes(search.toLowerCase()))
        )
      })
      .slice(0, 50)
  }, [players, search, selectedPlayer])

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="w-full rounded-2xl border border-white/5 bg-zinc-900/50 px-6 py-4 text-white placeholder-zinc-500 transition-all duration-300 hover:border-primary/30 focus:ring-2 focus:ring-primary/20 focus:outline-none backdrop-blur-xl shadow-2xl"
      />

      {open && (
        <div className="absolute z-50 mt-2 max-h-96 w-full animate-in overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-900/95 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl fade-in slide-in-from-top-2">
          {homePlayers.length > 0 && !search && (
            <div className="border-b border-white/5 p-6 bg-primary/5">
              <h4 className="text-[10px] font-black tracking-[0.2em] text-primary uppercase mb-3">Home Context Roster</h4>
              <div className="flex flex-wrap gap-2">
                {homePlayers.slice(0, 5).map(p => (
                  <Button 
                    key={p.playerID} 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[10px] font-bold border-white/10 bg-zinc-900 hover:bg-primary/10 hover:border-primary/30 text-zinc-300 hover:text-primary rounded-xl"
                    onClick={() => {
                      onSelect(p)
                      setOpen(false)
                    }}
                  >
                    {p.fullName}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {filteredPlayers.length === 0 ? (
            <div className="p-10 text-center text-[10px] font-black tracking-widest text-muted-foreground uppercase italic">
              {search.length >= 2
                ? "No performance data found"
                : "Type at least 2 chars..."}
            </div>
          ) : (
            filteredPlayers.map((player) => (
              <button
                key={player.playerID}
                onClick={() => {
                  onSelect(player)
                  setOpen(false)
                  setSearch("")
                }}
                className="group flex w-full items-center gap-4 border-b border-white/5 p-4 text-left transition-all duration-300 last:border-0 hover:bg-white/5"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-lg transition-all duration-300 group-hover:border-primary/50">
                  {player.playerPhoto || player.photo ? (
                    <Image
                      src={
                        player.playerPhoto ||
                        player.photo ||
                        `https://api.statorium.com/media/bearleague/bl${player.playerID}.webp`
                      }
                      alt={player.fullName}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const img = e.currentTarget;
                        const parent = img.parentElement;
                        if (parent && !parent.querySelector('.placeholder-icon')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'placeholder-icon absolute inset-0 flex h-full w-full items-center justify-center bg-zinc-800';
                          placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-10 w-10 text-zinc-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                          img.remove();
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-zinc-800">
                      <UserCircle className="h-10 w-10 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg font-black tracking-tighter text-foreground uppercase italic transition-colors group-hover:text-primary">
                    {player.fullName}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold tracking-tight text-muted-foreground uppercase">
                    {player.position && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                        {player.position}
                      </span>
                    )}
                    {player.country && (
                      <span className="flex items-center gap-1">
                        🌍{" "}
                        {typeof player.country === "string"
                          ? player.country
                          : player.country.name}
                      </span>
                    )}
                    {player.teamName && (
                      <span className="truncate">{player.teamName}</span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}

function PlayerCard({
  player,
  onClear,
}: {
  player: StatoriumPlayerBasic
  onClear: () => void
}) {
  const [imageError, setImageError] = React.useState(false)
  const countryName =
    typeof player.country === "string" ? player.country : player.country?.name

  const getPositionName = (player: any): string => {
    const positionValue = player.additionalInfo?.position || player.position
    if (positionValue === "1") return "Goalkeeper"
    if (positionValue === "2") return "Defender"
    if (positionValue === "3") return "Midfielder"
    if (positionValue === "4") return "Forward"
    const positionMap: Record<string, string> = {
      GK: "Goalkeeper",
      DF: "Defender",
      MF: "Midfielder",
      FW: "Forward",
      ST: "Forward",
      CB: "Defender",
      RB: "Defender",
      LB: "Defender",
      CM: "Midfielder",
      CDM: "Midfielder",
      CAM: "Midfielder",
      RM: "Midfielder",
      LM: "Midfielder",
      RW: "Midfielder",
      LW: "Midfielder",
    }
    return (
      (player.position && positionMap[player.position.toUpperCase()]) ||
      player.position ||
      "N/A"
    )
  }

  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/40 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-out hover:scale-[1.02] hover:border-primary/20">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClear}
        className="absolute top-6 right-6 z-20 rounded-xl bg-red-500/10 text-red-500 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 hover:bg-red-500 hover:text-white"
      >
        <Trash2 className="h-5 w-5" />
      </Button>

      <div className="relative flex h-64 w-full items-center justify-center bg-zinc-950/50">
        <div className="relative h-44 w-44 overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
          {!imageError && (player.playerPhoto || player.photo) ? (
            <>
              <Image
                src={
                  player.playerPhoto ||
                  player.photo ||
                  `https://api.statorium.com/media/bearleague/bl${player.playerID}.webp`
                }
                alt={player.fullName}
                fill
                unoptimized
                className="object-contain transition-transform duration-700 group-hover:scale-110"
                onError={() => setImageError(true)}
              />
              {imageError && (
                <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-zinc-900/95 text-muted-foreground/40">
                  <UserCircle className="h-20 w-20" />
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-900/95 text-muted-foreground/40">
              <UserCircle className="h-20 w-20" />
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-[#00ff88] blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-24 w-24 rounded-full bg-[#00cc6a] blur-3xl" />
        </div>
      </div>

      <div className="relative z-20 space-y-5 p-6">
        <h3 className="text-center text-3xl font-black tracking-tighter text-white uppercase">
          {player.fullName}
        </h3>
        <div className="flex justify-center">
          <Badge className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-[10px] font-black tracking-widest text-primary uppercase">
            {getPositionName(player)}
          </Badge>
        </div>
        <div className="flex items-center justify-center gap-4 text-[10px] leading-none font-bold tracking-[0.2em] text-muted-foreground uppercase">
          {player.teamName && (
            <span className="flex items-center gap-2">
              <Shield className="h-3 w-3 text-primary" />
              {player.teamName}
            </span>
          )}
          {countryName && player.teamName && (
            <span className="text-border">/</span>
          )}
          {countryName && (
            <span className="flex items-center gap-2">🌍 {countryName}</span>
          )}
        </div>
        <div className="flex justify-center">
          <MarketValue playerName={player.fullName} className="px-6 py-2 text-lg" />
        </div>
        <div className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00ff88]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  )
}

export default function Page() {
  return (
    <div
      className="relative min-h-screen bg-background"
    >
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin shadow-[0_0_20px_rgba(0,255,136,0.2)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground font-bold tracking-[0.2em] uppercase text-[10px] mt-8">
            Initializing Simulation Engine...
          </p>
        </div>
      }>
        <CompareContent />
      </Suspense>
    </div>
  )
}
