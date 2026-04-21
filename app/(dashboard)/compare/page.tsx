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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Activity,
  Goal,
  Clock,
  AlertTriangle,
  Hexagon,
  X,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

function extractSeasonStats(player: any): {
  goals: number
  assists: number
  matches: number
  minutes: number
  yellowCards: number
  redCards: number
  secondYellowCards: number
  ownGoals: number
  penaltyGoals: number
  missedPenalties: number
} {
  const defaultStats = {
    goals: 0,
    assists: 0,
    matches: 0,
    minutes: 0,
    yellowCards: 0,
    redCards: 0,
    secondYellowCards: 0,
    ownGoals: 0,
    penaltyGoals: 0,
    missedPenalties: 0,
  }

  if (!player) return defaultStats

  const statsArray = player.stat

  if (statsArray && Array.isArray(statsArray) && statsArray.length > 0) {
    const topTierSeason = statsArray.find((season: any) => {
      const seasonName = season.season_name || ""
      const isTopTier =
        seasonName.includes("Premier League") ||
        seasonName.includes("La Liga") ||
        seasonName.includes("Bundesliga") ||
        seasonName.includes("Serie A") ||
        seasonName.includes("Ligue 1")
      const is2024_25 = seasonName.includes("2024-25")
      return isTopTier && is2024_25
    })

    const currentStat = topTierSeason || statsArray[0]

    return {
      goals: parseInt(String(currentStat["Goals"] || currentStat["Goal"] || 0)),
      assists: parseInt(String(currentStat["Assist"] || 0)),
      matches: parseInt(String(currentStat["played"] || 0)),
      minutes: parseInt(String(currentStat["career_minutes"] || 0)),
      yellowCards: parseInt(String(currentStat["Yellow card"] || 0)),
      redCards: parseInt(String(currentStat["Red card"] || 0)),
      secondYellowCards: parseInt(String(currentStat["Second yellow"] || 0)),
      ownGoals: parseInt(String(currentStat["Own goal"] || 0)),
      penaltyGoals: parseInt(String(currentStat["Penalty goal"] || 0)),
      missedPenalties: parseInt(String(currentStat["Missed penalty"] || 0)),
    }
  }

  return {
    goals: player.goals || 0,
    assists: player.assists || 0,
    matches: player.matchesPlayed || 0,
    minutes: player.minutesPlayed || 0,
    yellowCards: player.yellowCards || 0,
    redCards: player.redCards || 0,
    secondYellowCards: 0,
    ownGoals: 0,
    penaltyGoals: 0,
    missedPenalties: 0,
  }
}

function CompareContent() {
  const searchParams = useSearchParams()
  const [player1, setPlayer1] = React.useState<StatoriumPlayerBasic | null>(
    null
  )
  const [player2, setPlayer2] = React.useState<StatoriumPlayerBasic | null>(
    null
  )
  const [allPlayers, setAllPlayers] = React.useState<StatoriumPlayerBasic[]>([])
  const [loading, setLoading] = React.useState(true)
  const [player1Error, setPlayer1Error] = React.useState<string | null>(null)
  const [player2Error, setPlayer2Error] = React.useState<string | null>(null)
  const [loadingDetailed, setLoadingDetailed] = React.useState(false)

  React.useEffect(() => {
    async function loadPlayers() {
      setLoading(true)
      setLoadingDetailed(true)
      setPlayer1Error(null)
      setPlayer2Error(null)

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
                  .catch((error: any) => {
                    setPlayer1Error("Failed to load player data")
                    return {
                      player: 1,
                      data: null,
                      name: foundP1.fullName,
                      error: error.message,
                    }
                  })
              )
            } else {
              setPlayer1Error("Player not found")
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
                  .catch((error: any) => {
                    setPlayer2Error("Failed to load player data")
                    return {
                      player: 2,
                      data: null,
                      name: foundP2.fullName,
                      error: error.message,
                    }
                  })
              )
            } else {
              setPlayer2Error("Player not found")
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
        setLoadingDetailed(false)
      }
    }
    loadPlayers()
  }, [searchParams])

  const handleSelectPlayer1 = (player: StatoriumPlayerBasic) => {
    setPlayer1(player)
    if (player2?.playerID === player.playerID) setPlayer2(null)
  }

  const handleSelectPlayer2 = (player: StatoriumPlayerBasic) => {
    setPlayer2(player)
    if (player1?.playerID === player.playerID) setPlayer1(null)
  }

  return (
    <div className="min-h-screen animate-in space-y-12 px-4 py-12 duration-500 fade-in">
      <div className="animate-in space-y-3 duration-700 fade-in slide-in-from-top-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-[#00ff88]/20 blur-xl" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-[#00ff88]/30 bg-[#00ff88]/10 shadow-2xl shadow-[#00ff88]/20">
              <ArrowRightLeft className="h-7 w-7 text-[#00ff88]" />
            </div>
          </div>
          <div>
            <h1
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{
                color: "#00ff88",
                textShadow: "0 0 20px rgba(0, 255, 136, 0.5)",
              }}
            >
              Player Comparison
            </h1>
            <p className="mt-2 text-base font-medium text-gray-400">
              Compare performance metrics between two top-tier athletes from
              Europe's TOP 5 leagues.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="h-10 w-10 animate-spin text-green-500" />
          <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
            Loading players from Statorium API...
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <label className="text-sm font-black tracking-widest text-green-500 uppercase">
              Player 1
            </label>
            {!player1 ? (
              <PlayerSelector
                players={allPlayers}
                selectedPlayer={player2}
                onSelect={handleSelectPlayer1}
                placeholder="Select first player from TOP 5 leagues..."
              />
            ) : (
              <PlayerCard player={player1} onClear={() => setPlayer1(null)} />
            )}
          </div>

          <div className="space-y-4">
            <label className="text-sm font-black tracking-widest text-emerald-500 uppercase">
              Player 2
            </label>
            {!player2 ? (
              <PlayerSelector
                players={allPlayers}
                selectedPlayer={player1}
                onSelect={handleSelectPlayer2}
                placeholder="Select second player from TOP 5 leagues..."
              />
            ) : (
              <PlayerCard player={player2} onClear={() => setPlayer2(null)} />
            )}
          </div>
        </div>
      )}

      {player1 && player2 ? (
        <div className="animate-in rounded-3xl border border-border bg-card p-8 shadow-2xl backdrop-blur-xl transition-all duration-700 ease-out fade-in slide-in-from-bottom-4 md:p-10">
          <div className="mb-10 flex animate-in items-center gap-4 transition-all delay-100 duration-500 fade-in slide-in-from-left-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#00ff88]/20 bg-gradient-to-br from-[#00ff88]/20 to-[#00cc6a]/10 shadow-lg shadow-[#00ff88]/20 transition-all duration-300 hover:scale-110 hover:shadow-[#00ff88]/40">
              <ArrowRightLeft className="h-7 w-7 text-[#00ff88]" />
            </div>
            <div>
              <h2 className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-3xl font-black tracking-tighter text-transparent uppercase italic">
                Player Comparison Matrix
              </h2>
              <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                Advanced analytics & performance metrics from Statorium API
              </p>
            </div>
          </div>

          <div className="grid gap-8">
            <ComparisonRow
              icon={<Zap className="h-5 w-5" />}
              label="Technical Ability"
              description="Ball control, passing, dribbling, shooting"
              p1={calculateScore(player1, "technical")}
              p2={calculateScore(player2, "technical")}
            />
            <ComparisonRow
              icon={<Shield className="h-5 w-5" />}
              label="Physical Presence"
              description="Strength, speed, stamina, agility"
              p1={calculateScore(player1, "physical")}
              p2={calculateScore(player2, "physical")}
            />
            <ComparisonRow
              icon={<Target className="h-5 w-5" />}
              label="Tactical Intelligence"
              description="Positioning, vision, decision making"
              p1={calculateScore(player1, "tactical")}
              p2={calculateScore(player2, "tactical")}
            />
            <ComparisonRow
              icon={<TrendingUp className="h-5 w-5" />}
              label="Market Value Index"
              description="Transfer value, contract status, demand"
              p1={calculateScore(player1, "market")}
              p2={calculateScore(player2, "market")}
            />
            <ComparisonRow
              icon={<Award className="h-5 w-5" />}
              label="Recruitment Score"
              description="Overall scouting recommendation"
              p1={calculateScore(player1, "recruitment")}
              p2={calculateScore(player2, "recruitment")}
            />
          </div>

          <div className="mt-10 animate-in rounded-2xl border border-border bg-accent/40 p-6 backdrop-blur-sm transition-all delay-200 duration-500 fade-in slide-in-from-bottom-4">
            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[#00ff88]/20 bg-gradient-to-br from-[#00ff88]/10 to-[#00cc6a]/5 p-3 text-[#00ff88]">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground uppercase italic">
                    Season Statistics
                  </h3>
                  <p className="text-xs font-black tracking-widest text-muted-foreground uppercase">
                    Real-time performance data from Statorium API
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-[#00ff88]/30 bg-[#00ff88]/10 text-[10px] font-semibold text-[#00ff88]"
              >
                📊 Live Data
              </Badge>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <AnimatedStatsCard
                player={player1}
                color="green"
                loading={loadingDetailed}
                error={player1Error}
              />
              <AnimatedStatsCard
                player={player2}
                color="emerald"
                loading={loadingDetailed}
                error={player2Error}
              />
            </div>

            {player1?.stat && player2?.stat ? (
              <AdvancedStatsComparison player1={player1} player2={player2} />
            ) : (
              <div className="py-8 text-center text-[10px] font-black tracking-widest text-muted-foreground uppercase italic">
                Loading advanced comparison data...
              </div>
            )}
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8">
            <div className="animate-in rounded-2xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-sm transition-all delay-500 duration-500 fade-in slide-in-from-left-4 hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-[#00ff88] shadow-lg shadow-[#00ff88]/50" />
                <span className="font-bold text-[#00ff88]">
                  {player1.fullName}
                </span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {player1.position && (
                    <span className="font-black text-foreground uppercase italic">
                      {player1.position}
                    </span>
                  )}
                  {player1.position && player1.country && (
                    <span className="text-border">•</span>
                  )}
                  {player1.country && (
                    <span className="flex items-center gap-1 font-bold tracking-tight uppercase">
                      🌍{" "}
                      {typeof player1.country === "string"
                        ? player1.country
                        : player1.country.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black tracking-tight text-muted-foreground uppercase">
                  <Shield className="h-3 w-3 text-green-500" />
                  {player1.teamName || "Free Agent"}
                </div>
              </div>
            </div>

            <div className="animate-in rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-sm transition-all delay-600 duration-500 fade-in slide-in-from-right-4 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-[#00ff88] shadow-lg shadow-[#00ff88]/50" />
                <span className="font-bold text-[#00ff88]">
                  {player2.fullName}
                </span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {player2.position && (
                    <span className="font-black text-foreground uppercase italic">
                      {player2.position}
                    </span>
                  )}
                  {player2.position && player2.country && (
                    <span className="text-border">•</span>
                  )}
                  {player2.country && (
                    <span className="flex items-center gap-1 font-bold tracking-tight uppercase">
                      🌍{" "}
                      {typeof player2.country === "string"
                        ? player2.country
                        : player2.country.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black tracking-tight text-muted-foreground uppercase">
                  <Shield className="h-3 w-3 text-emerald-500" />
                  {player2.teamName || "Free Agent"}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-accent/40 py-20 backdrop-blur-sm">
          <Users className="mb-6 h-16 w-16 text-muted-foreground/20" />
          <p className="text-center text-sm font-black tracking-widest text-muted-foreground uppercase italic">
            Select two players to generate a side-by-side comparison report.
          </p>
        </div>
      )}
    </div>
  )
}

function calculateScore(player: StatoriumPlayerBasic, type: string): number {
  const position = player.position?.toUpperCase() || ""
  const stats = extractSeasonStats(player)

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
      if (stats.matches > 0) {
        const contributionsPerMatch =
          (stats.goals + stats.assists) / stats.matches
        score += Math.min(20, contributionsPerMatch * 30)
        if (stats.penaltyGoals > 0) score += Math.min(5, stats.penaltyGoals * 2)
      }
      score += (hash % 10) - 5
      break

    case "physical":
      score = getPositionScore(position, "physical")
      if (stats.minutes > 500) score += Math.min(10, stats.minutes / 1000)
      if (stats.matches >= 20) score += 5
      else if (stats.matches >= 10) score += 2
      const ageBonus = age < 25 ? (25 - age) * 2 : age > 30 ? (age - 30) * 3 : 0
      score = Math.max(score, 75 - ageBonus)
      score += (hash % 8) - 4
      break

    case "tactical":
      score = getPositionScore(position, "tactical")
      if (stats.matches > 0) {
        const cardsPerMatch =
          (stats.yellowCards + stats.redCards * 3) / stats.matches
        score += Math.max(0, 10 - cardsPerMatch * 20)
        if (stats.secondYellowCards === 0 && stats.matches > 10) score += 3
      }
      score = Math.min(95, score + (age > 28 ? (age - 28) * 2 : 0))
      score += (hash % 8) - 4
      break

    case "market":
      score = teamStrength
      if (age < 25) score += (25 - age) * 2
      if (stats.goals > 0) score += Math.min(10, stats.goals)
      if (stats.assists > 0) score += Math.min(5, stats.assists)
      if (stats.penaltyGoals > 0) score += Math.min(3, stats.penaltyGoals)
      if (stats.matches >= 25) score += 5
      const topTeams = ["Man City", "Real Madrid", "Barcelona", "Bayern", "PSG"]
      if (
        player.teamName &&
        topTeams.some((team) =>
          player.teamName!.toLowerCase().includes(team.toLowerCase())
        )
      )
        score += 10
      score += (hash % 10) - 5
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
      className={`rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-accent/80 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`rounded-xl border border-[#00ff88]/20 bg-gradient-to-br from-[#00ff88]/10 to-[#00cc6a]/5 p-3 text-[#00ff88] transition-all duration-500 ${isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
          >
            {icon}
          </div>
          <div
            className={`transition-all delay-100 duration-500 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
          >
            <h3 className="text-lg font-bold tracking-tight text-foreground uppercase italic">
              {label}
            </h3>
            <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 font-mono text-sm font-black tabular-nums">
          <span
            className={`text-2xl transition-all duration-300 ${winner === "p1" ? "scale-110 text-green-500 drop-shadow-lg drop-shadow-green-500/50" : "text-muted-foreground/30"}`}
          >
            {animatedP1}%
          </span>
          <span className="text-[10px] font-black tracking-wider text-muted-foreground/20 uppercase">
            vs
          </span>
          <span
            className={`text-2xl transition-all duration-300 ${winner === "p2" ? "scale-110 text-emerald-500 drop-shadow-lg drop-shadow-emerald-500/50" : "text-muted-foreground/30"}`}
          >
            {animatedP2}%
          </span>
        </div>
      </div>

      <div className="relative h-6 overflow-hidden rounded-full border border-border bg-accent/50 shadow-inner backdrop-blur-sm">
        <div
          className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${winner === "p1" ? "rounded-l-full rounded-r-none shadow-lg shadow-[#00ff88]/30" : ""} bg-gradient-to-r from-[#00ff88] via-[#00cc6a] to-[#00aa55]`}
          style={{ width: `${animatedP1}%` }}
        />
        <div
          className={`absolute top-0 right-0 h-full transition-all duration-1000 ease-out ${winner === "p2" ? "rounded-l-none rounded-r-full shadow-lg shadow-[#00ff88]/30" : ""} bg-gradient-to-l from-[#00aa55] via-[#00cc6a] to-[#00ff88]`}
          style={{ width: `${animatedP2}%` }}
        />
        {winner !== "tie" && (
          <div
            className="absolute top-1/2 z-10 h-7 w-1.5 -translate-y-1/2 rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-1000 ease-out"
            style={{ left: `calc(${animatedP1}% - 3px)` }}
          />
        )}
      </div>

      <div className="mt-3 flex justify-between text-[10px] font-black tracking-[0.3em] uppercase italic">
        <span
          className={
            winner === "p1" ? "text-green-500" : "text-muted-foreground/30"
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
            winner === "p2" ? "text-emerald-500" : "text-muted-foreground/30"
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
}: {
  players: StatoriumPlayerBasic[]
  selectedPlayer: StatoriumPlayerBasic | null
  onSelect: (player: StatoriumPlayerBasic) => void
  placeholder: string
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
        className="w-full rounded-xl border border-border bg-accent/40 px-4 py-3 text-foreground placeholder-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/50 focus:outline-none"
      />

      {open && (
        <div className="absolute z-50 mt-1 max-h-96 w-full animate-in overflow-y-auto rounded-2xl border border-border bg-card/95 shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-2xl fade-in slide-in-from-top-2">
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
                className="group flex w-full items-center gap-4 border-b border-border/50 p-4 text-left transition-all duration-300 last:border-0 hover:bg-accent/80"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-border bg-accent shadow-lg transition-all duration-300 group-hover:border-primary/50">
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
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-accent text-xl font-black text-muted-foreground/30 uppercase italic">
                      {player.fullName.split(" ").slice(-1)[0][0]}
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
    <div className="group relative overflow-hidden rounded-3xl border-2 border-border bg-card/60 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-2xl transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-primary/20 dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClear}
        className="absolute top-4 right-4 z-20 rounded-xl bg-red-500/10 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 hover:bg-red-500 hover:text-white"
      >
        <Trash2 className="h-5 w-5" />
      </Button>

      <div className="relative flex h-60 w-full items-center justify-center bg-gradient-to-b from-accent/50 to-card">
        <div className="relative h-40 w-40 overflow-hidden rounded-2xl border-2 border-border shadow-2xl">
          {!imageError && (player.playerPhoto || player.photo) ? (
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
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent">
              <UserCircle className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-[#00ff88] blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-24 w-24 rounded-full bg-[#00cc6a] blur-3xl" />
        </div>
      </div>

      <div className="relative z-20 space-y-5 p-6">
        <h3 className="text-center text-2xl font-black tracking-tighter text-foreground uppercase italic">
          {player.fullName}
        </h3>
        <div className="flex justify-center">
          <Badge className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-[10px] font-black tracking-widest text-primary uppercase">
            {getPositionName(player)}
          </Badge>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs leading-none font-black tracking-widest text-muted-foreground/60 uppercase">
          {player.teamName && (
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
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
        <div className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00ff88]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  )
}

function AnimatedStatsCard({
  player,
  color,
  loading,
  error,
}: {
  player: StatoriumPlayerBasic | null
  color: "green" | "emerald"
  loading?: boolean
  error?: string | null
}) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [animatedValues, setAnimatedValues] = React.useState({
    goals: 0,
    assists: 0,
    matches: 0,
    minutes: 0,
    yellowCards: 0,
    redCards: 0,
    secondYellowCards: 0,
    ownGoals: 0,
    penaltyGoals: 0,
    missedPenalties: 0,
  })

  React.useEffect(() => {
    if (player) {
      const stats = extractSeasonStats(player)
      setIsVisible(true)
      const duration = 1500
      const steps = 60
      let step = 0
      const animate = () => {
        step++
        const easeProgress = 1 - Math.pow(1 - step / steps, 3)
        setAnimatedValues({
          goals: Math.round(stats.goals * easeProgress),
          assists: Math.round(stats.assists * easeProgress),
          matches: Math.round(stats.matches * easeProgress),
          minutes: Math.round(stats.minutes * easeProgress),
          yellowCards: Math.round(stats.yellowCards * easeProgress),
          redCards: Math.round(stats.redCards * easeProgress),
          secondYellowCards: Math.round(stats.secondYellowCards * easeProgress),
          ownGoals: Math.round(stats.ownGoals * easeProgress),
          penaltyGoals: Math.round(stats.penaltyGoals * easeProgress),
          missedPenalties: Math.round(stats.missedPenalties * easeProgress),
        })
        if (step < steps) setTimeout(animate, duration / steps)
        else setAnimatedValues(stats)
      }
      animate()
    }
  }, [player])

  const c = {
    primary: "text-[#00ff88]",
    bg: "bg-[#00ff88]/10",
    border: "border-[#00ff88]/20",
    accent: "bg-[#00ff88]",
    glow: "shadow-[#00ff88]/20",
  }

  if (loading) {
    return (
      <Card
        className={`${c.bg} border ${c.border} bg-accent/40 backdrop-blur-sm`}
      >
        <CardContent className="flex h-40 items-center justify-center p-5">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm font-black tracking-widest text-muted-foreground uppercase">
              Loading statistics...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card
        className={`${c.bg} border ${c.border} bg-accent/40 backdrop-blur-sm`}
      >
        <CardContent className="flex h-40 items-center justify-center p-5">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-500" />
            <span className="text-sm font-bold text-red-500 uppercase">
              {error}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!player?.stat || player.stat.length === 0) {
    return (
      <Card
        className={`${c.bg} border ${c.border} bg-accent/40 backdrop-blur-sm`}
      >
        <CardContent className="flex h-40 items-center justify-center p-5">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm font-black tracking-widest text-muted-foreground uppercase italic">
              Loading data for {player?.fullName || "player"}...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statItems = [
    {
      icon: <Goal className="h-5 w-5" />,
      value: animatedValues.goals,
      label: "Goals",
      colorClass: c.primary,
      bgClass: c.accent,
    },
    {
      icon: <Target className="h-5 w-5" />,
      value: animatedValues.assists,
      label: "Assists",
      colorClass: c.primary,
      bgClass: c.accent,
    },
    {
      icon: <Activity className="h-5 w-5" />,
      value: animatedValues.matches,
      label: "Matches",
      colorClass: c.primary,
      bgClass: "bg-secondary",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      value: animatedValues.minutes,
      label: "Minutes",
      colorClass: c.primary,
      bgClass: "bg-secondary",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      value: animatedValues.yellowCards,
      label: "Yellow Cards",
      colorClass: "text-yellow-600 dark:text-yellow-500",
      bgClass: "bg-yellow-500/10",
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      value: animatedValues.redCards,
      label: "Red Cards",
      colorClass: "text-red-600 dark:text-red-500",
      bgClass: "bg-red-500/10",
    },
  ]

  return (
    <Card
      className={`${c.bg} border ${c.border} bg-accent/40 backdrop-blur-sm hover:${c.bg} shadow-xl transition-all duration-300`}
    >
      <CardContent className="p-5">
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`${item.bgClass} rounded-xl border border-primary/20 p-2.5 text-primary shadow-lg`}
              >
                {item.icon}
              </div>
              <div>
                <div
                  className={`text-2xl font-black italic ${item.colorClass} font-mono tracking-tighter tabular-nums`}
                >
                  {item.value}
                </div>
                <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function AdvancedStatsComparison({
  player1,
  player2,
}: {
  player1: StatoriumPlayerBasic
  player2: StatoriumPlayerBasic
}) {
  const stats1 = extractSeasonStats(player1)
  const stats2 = extractSeasonStats(player2)

  const comparisonMetrics = [
    {
      label: "Goals per Match",
      value1:
        stats1.matches > 0
          ? (stats1.goals / stats1.matches).toFixed(2)
          : "0.00",
      value2:
        stats2.matches > 0
          ? (stats2.goals / stats2.matches).toFixed(2)
          : "0.00",
      winner:
        stats1.matches > 0 && stats2.matches > 0
          ? stats1.goals / stats1.matches > stats2.goals / stats2.matches
            ? "p1"
            : "p2"
          : "tie",
    },
    {
      label: "Assists per Match",
      value1:
        stats1.matches > 0
          ? (stats1.assists / stats1.matches).toFixed(2)
          : "0.00",
      value2:
        stats2.matches > 0
          ? (stats2.assists / stats2.matches).toFixed(2)
          : "0.00",
      winner:
        stats1.matches > 0 && stats2.matches > 0
          ? stats1.assists / stats1.matches > stats2.assists / stats2.matches
            ? "p1"
            : "p2"
          : "tie",
    },
    {
      label: "Minutes per Match",
      value1:
        stats1.matches > 0 ? Math.round(stats1.minutes / stats1.matches) : 0,
      value2:
        stats2.matches > 0 ? Math.round(stats2.minutes / stats2.matches) : 0,
      winner:
        stats1.matches > 0 && stats2.matches > 0
          ? stats1.minutes / stats1.matches > stats2.minutes / stats2.matches
            ? "p1"
            : "p2"
          : "tie",
    },
    {
      label: "Discipline Rate",
      value1:
        stats1.matches > 0
          ? (
              (stats1.yellowCards + stats1.redCards * 3) /
              stats1.matches
            ).toFixed(2)
          : "0.00",
      value2:
        stats2.matches > 0
          ? (
              (stats2.yellowCards + stats2.redCards * 3) /
              stats2.matches
            ).toFixed(2)
          : "0.00",
      winner:
        stats1.matches > 0 && stats2.matches > 0
          ? (stats1.yellowCards + stats1.redCards * 3) / stats1.matches <
            (stats2.yellowCards + stats2.redCards * 3) / stats2.matches
            ? "p1"
            : "p2"
          : "tie",
    },
    {
      label: "Penalty Success",
      value1:
        stats1.penaltyGoals > 0
          ? `${stats1.penaltyGoals}/${stats1.penaltyGoals + stats1.missedPenalties}`
          : "N/A",
      value2:
        stats2.penaltyGoals > 0
          ? `${stats2.penaltyGoals}/${stats2.penaltyGoals + stats2.missedPenalties}`
          : "N/A",
      winner: "tie",
    },
  ]

  return (
    <div className="space-y-3">
      {comparisonMetrics.map((metric, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/20"
        >
          <span className="text-sm font-black tracking-tight text-foreground uppercase">
            {metric.label}
          </span>
          <div className="flex items-center gap-6 font-mono">
            <span
              className={`text-lg font-black ${metric.winner === "p1" ? "text-green-600 dark:text-green-500" : "text-muted-foreground"}`}
            >
              {metric.value1}
            </span>
            <span className="text-[10px] font-black tracking-wider text-muted-foreground/30 uppercase">
              vs
            </span>
            <span
              className={`text-lg font-black ${metric.winner === "p2" ? "text-emerald-600 dark:text-emerald-500" : "text-muted-foreground"}`}
            >
              {metric.value2}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Page() {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "#0a0f0a" }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <CompareContent />
      </Suspense>
    </div>
  )
}
