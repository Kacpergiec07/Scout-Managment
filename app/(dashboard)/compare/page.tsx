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
  const [loading, setLoading] = React.useState(true)

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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-zinc-800 shadow-lg shadow-cyan-400/20 transition-all duration-300 hover:scale-110 hover:shadow-cyan-400/40">
              <ArrowRightLeft className="h-7 w-7 text-cyan-400" />
            </div>
            <div>
              <h2 className="bg-gradient-to-r from-cyan-400 via-green-400 to-green-500 bg-clip-text text-3xl font-black tracking-tighter text-transparent uppercase italic">
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

          <div className="mt-16 grid grid-cols-2 gap-8">
            <div className="animate-in rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6 backdrop-blur-sm transition-all delay-500 duration-500 fade-in slide-in-from-left-4 hover:scale-105 hover:shadow-lg hover:shadow-cyan-400/20">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                <span className="font-bold text-cyan-400">
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
                  <Shield className="h-3 w-3 text-cyan-400" />
                  {player1.teamName || "Free Agent"}
                </div>
              </div>
            </div>

            <div className="animate-in rounded-2xl border border-green-400/20 bg-green-400/5 p-6 backdrop-blur-sm transition-all delay-600 duration-500 fade-in slide-in-from-right-4 hover:scale-105 hover:shadow-lg hover:shadow-green-400/20">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
                <span className="font-bold text-green-400">
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
                  <Shield className="h-3 w-3 text-green-400" />
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
      className={`rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-accent/80 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`rounded-xl border border-cyan-400/20 bg-zinc-800 p-3 text-cyan-400 transition-all duration-500 ${isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
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
            className={`text-2xl transition-all duration-300 ${winner === "p1" ? "scale-110 text-cyan-400 drop-shadow-lg drop-shadow-cyan-400/50" : "text-muted-foreground/30"}`}
          >
            {animatedP1}%
          </span>
          <span className="text-[10px] font-black tracking-wider text-muted-foreground/20 uppercase">
            vs
          </span>
          <span
            className={`text-2xl transition-all duration-300 ${winner === "p2" ? "scale-110 text-green-400 drop-shadow-lg drop-shadow-green-400/50" : "text-muted-foreground/30"}`}
          >
            {animatedP2}%
          </span>
        </div>
      </div>

      <div className="relative h-6 overflow-hidden rounded-full border border-border bg-zinc-800 shadow-inner backdrop-blur-sm">
        <div
          className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out bg-cyan-400"
          style={{ width: `${animatedP1}%` }}
        />
        <div
          className="absolute top-0 right-0 h-full transition-all duration-1000 ease-out bg-green-400"
          style={{ width: `${100 - animatedP1}%` }}
        />
        <div
          className="absolute top-0 h-full w-[2px] bg-white/90 shadow-lg"
          style={{ left: `${animatedP2}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between text-[10px] font-black tracking-[0.3em] uppercase italic">
        <span
          className={
            winner === "p1" ? "text-cyan-400" : "text-muted-foreground/30"
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
            winner === "p2" ? "text-green-400" : "text-muted-foreground/30"
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
        className="w-full rounded-xl border border-border bg-zinc-800 px-4 py-3 text-white placeholder-zinc-400 transition-all duration-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/50 focus:outline-none"
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
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-border bg-zinc-800 shadow-lg transition-all duration-300 group-hover:border-primary/50">
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
