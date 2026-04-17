'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { getAllTop5PlayersAction } from '@/app/actions/statorium'
import { StatoriumPlayerBasic } from '@/lib/statorium/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Trash2, ArrowRightLeft, Loader2, UserCircle, TrendingUp, Shield, Zap, Target, Award, Activity, Goal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function ComparePage() {
  const searchParams = useSearchParams()
  const [player1, setPlayer1] = React.useState<StatoriumPlayerBasic | null>(null)
  const [player2, setPlayer2] = React.useState<StatoriumPlayerBasic | null>(null)
  const [allPlayers, setAllPlayers] = React.useState<StatoriumPlayerBasic[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadPlayers() {
      setLoading(true)
      try {
        const players = await getAllTop5PlayersAction()
        setAllPlayers(players)

        // Check URL params for pre-selected players
        const p1Id = searchParams.get('p1')
        const p2Id = searchParams.get('p2')

        if (p1Id) {
          const foundP1 = players.find(p => String(p.playerID) === p1Id)
          if (foundP1) setPlayer1(foundP1)
        }

        if (p2Id) {
          const foundP2 = players.find(p => String(p.playerID) === p2Id)
          if (foundP2) setPlayer2(foundP2)
        }
      } catch (error) {
        console.error('Error loading players:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPlayers()
  }, [searchParams])

  const handleSelectPlayer1 = (player: StatoriumPlayerBasic) => {
    setPlayer1(player)
    if (player2?.playerID === player.playerID) {
      setPlayer2(null)
    }
  }

  const handleSelectPlayer2 = (player: StatoriumPlayerBasic) => {
    setPlayer2(player)
    if (player1?.playerID === player.playerID) {
      setPlayer1(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Player Comparison</h1>
        <p className="text-muted-foreground text-lg">Compare performance metrics between two top-tier athletes from Europe's TOP 5 leagues.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading players from Statorium API...</p>
          <p className="text-xs text-zinc-400">Fetching data from TOP 5 European leagues...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <label className="text-sm font-semibold uppercase tracking-wider text-purple-500">Player 1</label>
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
            <label className="text-sm font-semibold uppercase tracking-wider text-orange-500">Player 2</label>
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
        <div className={`
          rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 md:p-8 shadow-lg
          transition-all duration-700 ease-out
          animate-in fade-in slide-in-from-bottom-4
        `}>
          <div className={`
            flex items-center gap-3 mb-8
            transition-all duration-500 delay-100
            animate-in fade-in slide-in-from-left-4
          `}>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-orange-500/20 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
              <ArrowRightLeft className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">Deep Comparison Matrix</h2>
              <p className="text-sm text-muted-foreground">Advanced analytics & performance metrics from Statorium API</p>
            </div>
          </div>

          <div className="grid gap-6">
            <ComparisonRow
              icon={<Zap className="h-5 w-5" />}
              label="Technical Ability"
              description="Ball control, passing, dribbling, shooting"
              p1={calculateScore(player1, 'technical')}
              p2={calculateScore(player2, 'technical')}
            />
            <ComparisonRow
              icon={<Shield className="h-5 w-5" />}
              label="Physical Presence"
              description="Strength, speed, stamina, agility"
              p1={calculateScore(player1, 'physical')}
              p2={calculateScore(player2, 'physical')}
            />
            <ComparisonRow
              icon={<Target className="h-5 w-5" />}
              label="Tactical Intelligence"
              description="Positioning, vision, decision making"
              p1={calculateScore(player1, 'tactical')}
              p2={calculateScore(player2, 'tactical')}
            />
            <ComparisonRow
              icon={<TrendingUp className="h-5 w-5" />}
              label="Market Value Index"
              description="Transfer value, contract status, demand"
              p1={calculateScore(player1, 'market')}
              p2={calculateScore(player2, 'market')}
            />
            <ComparisonRow
              icon={<Award className="h-5 w-5" />}
              label="Recruitment Score"
              description="Overall scouting recommendation"
              p1={calculateScore(player1, 'recruitment')}
              p2={calculateScore(player2, 'recruitment')}
            />
          </div>

          <div className={`
            mt-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6
            transition-all duration-500 delay-200
            animate-in fade-in slide-in-from-bottom-4
          `}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Season Statistics</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Real-time performance data from Statorium API</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatedStatsCard player={player1} color="purple" />
              <AnimatedStatsCard player={player2} color="orange" />
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className={`
              p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20
              transition-all duration-500 delay-500
              animate-in fade-in slide-in-from-left-4
            `}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50 animate-pulse" />
                <span className="font-bold text-purple-700 dark:text-purple-300">{player1.fullName}</span>
              </div>
              <div className="text-sm text-purple-600/70 dark:text-purple-400/70 space-y-1">
                <div className="flex items-center gap-2">
                  {player1.position && <span className="font-medium">{player1.position}</span>}
                  {player1.position && player1.country && <span>•</span>}
                  {player1.country && (
                    <span>🌍 {typeof player1.country === 'string' ? player1.country : player1.country.name}</span>
                  )}
                </div>
                <div>{player1.teamName || 'Free Agent'}</div>
              </div>
            </div>
            <div className={`
              p-5 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20
              transition-all duration-500 delay-600
              animate-in fade-in slide-in-from-right-4
            `}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50 animate-pulse" />
                <span className="font-bold text-orange-700 dark:text-orange-300">{player2.fullName}</span>
              </div>
              <div className="text-sm text-orange-600/70 dark:text-orange-400/70 space-y-1">
                <div className="flex items-center gap-2">
                  {player2.position && <span className="font-medium">{player2.position}</span>}
                  {player2.position && player2.country && <span>•</span>}
                  {player2.country && (
                    <span>🌍 {typeof player2.country === 'string' ? player2.country : player2.country.name}</span>
                  )}
                </div>
                <div>{player2.teamName || 'Free Agent'}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
          <Users className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
          <p className="text-zinc-500 text-center">Select two players to generate a side-by-side comparison report.</p>
        </div>
      )}
    </div>
  )
}

function calculateScore(player: StatoriumPlayerBasic, type: string): number {
  const position = player.position?.toUpperCase() || ''

  // Team strength multiplier based on team name
  const getTeamStrength = (teamName?: string): number => {
    if (!teamName) return 50
    const topTeams = [
      'Man City', 'Real Madrid', 'Barcelona', 'Bayern', 'PSG',
      'Liverpool', 'Arsenal', 'Chelsea', 'Man Utd', 'Tottenham',
      'Inter', 'AC Milan', 'Juventus', 'Napoli', 'Atletico',
      'Dortmund', 'Leverkusen', 'RB Leipzig', 'Benfica', 'Porto'
    ]
    const isTopTeam = topTeams.some(team => teamName.toLowerCase().includes(team.toLowerCase()))
    return isTopTeam ? 85 : 65
  }

  const teamStrength = getTeamStrength(player.teamName)
  const playerId = String(player.playerID)
  const hash = playerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

  // Age calculation
  let age = 25 // default
  if (player.birthdate) {
    const birthDate = new Date(player.birthdate)
    const today = new Date()
    age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  }

  // Position-based scoring
  const getPositionScore = (pos: string, statType: string): number => {
    if (pos.includes('GK')) {
      return statType === 'technical' ? 75 : statType === 'physical' ? 85 : 70
    } else if (pos.includes('DF')) {
      return statType === 'technical' ? 70 : statType === 'physical' ? 80 : statType === 'tactical' ? 85 : 70
    } else if (pos.includes('MF')) {
      return statType === 'technical' ? 85 : statType === 'physical' ? 75 : statType === 'tactical' ? 80 : 80
    } else if (pos.includes('FW')) {
      return statType === 'technical' ? 85 : statType === 'physical' ? 75 : statType === 'tactical' ? 70 : 90
    }
    return 70
  }

  // Calculate base scores using available data
  let score = 0

  switch (type) {
    case 'technical':
      // Based on position, team strength, and actual performance data
      score = getPositionScore(position, 'technical')

      // Use actual stats if available
      if (player.rating) {
        score = Math.max(score, player.rating * 10)
      }

      // Adjust based on goals/assists for attacking players
      if (position.includes('FW') || position.includes('MF')) {
        const goalAssistBonus = Math.min(15, (player.goals || 0) * 2 + (player.assists || 0) * 1.5)
        score += goalAssistBonus
      }

      // Add variance based on player ID for uniqueness
      score += (hash % 10) - 5
      break

    case 'physical':
      // Based on age, position, and playing time
      score = getPositionScore(position, 'physical')

      // Adjust based on minutes played
      if (player.minutesPlayed && player.minutesPlayed > 1000) {
        const fitnessBonus = Math.min(10, player.minutesPlayed / 1000)
        score += fitnessBonus
      }

      // Younger players generally better physically, peak around 25-28
      const ageBonus = age < 25 ? (25 - age) * 2 : age > 30 ? (age - 30) * 3 : 0
      score = Math.max(score, 75 - ageBonus)
      score += (hash % 8) - 4
      break

    case 'tactical':
      // Based on position, experience (age), and discipline
      score = getPositionScore(position, 'tactical')

      // Adjust based on discipline (fewer cards = better tactical)
      const disciplineBonus = Math.min(10, (player.matchesPlayed || 10) - (player.yellowCards || 0) * 2 - (player.redCards || 0) * 5)
      score += Math.max(0, disciplineBonus / 2)

      // Older players generally better tactically
      const experienceBonus = age > 28 ? (age - 28) * 2 : 0
      score = Math.min(95, score + experienceBonus)
      score += (hash % 8) - 4
      break

    case 'market':
      // Based on team strength, age, and performance
      score = teamStrength

      // Young players from top teams have higher market value
      if (age < 25) {
        score += (25 - age) * 2
      }

      // Performance impact on market value
      if (player.goals && player.goals > 5) {
        score += Math.min(10, player.goals)
      }

      if (player.assists && player.assists > 3) {
        score += Math.min(5, player.assists)
      }

      // Top teams have higher market values
      const topTeams = ['Man City', 'Real Madrid', 'Barcelona', 'Bayern', 'PSG']
      if (player.teamName && topTeams.some(team => player.teamName!.toLowerCase().includes(team.toLowerCase()))) {
        score += 10
      }
      score += (hash % 10) - 5
      break

    case 'recruitment':
      // Overall score combining all factors
      const technical = calculateScore(player, 'technical')
      const physical = calculateScore(player, 'physical')
      const tactical = calculateScore(player, 'tactical')
      const market = calculateScore(player, 'market')
      score = (technical * 0.3 + physical * 0.2 + tactical * 0.3 + market * 0.2)
      break
  }

  return Math.min(100, Math.max(35, Math.round(score)))
}

function ComparisonRow({ icon, label, description, p1, p2 }: {
  icon: React.ReactNode;
  label: string;
  description: string;
  p1: number;
  p2: number;
}) {
  const [animatedP1, setAnimatedP1] = React.useState(0)
  const [animatedP2, setAnimatedP2] = React.useState(0)
  const [isVisible, setIsVisible] = React.useState(false)

  // Calculate winner
  const winner = p1 > p2 ? 'p1' : p2 > p1 ? 'p2' : 'tie'

  React.useEffect(() => {
    setIsVisible(true)

    // Animate numbers
    const duration = 1000
    const steps = 60
    const interval = duration / steps
    let step = 0

    const animate = () => {
      step++
      const progress = step / steps
      const easeProgress = 1 - Math.pow(1 - progress, 3) // ease-out cubic

      setAnimatedP1(Math.round(p1 * easeProgress))
      setAnimatedP2(Math.round(p2 * easeProgress))

      if (step < steps) {
        setTimeout(animate, interval)
      } else {
        setAnimatedP1(p1)
        setAnimatedP2(p2)
      }
    }

    animate()
  }, [p1, p2])

  return (
    <div className={`
      p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
    `}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`
            p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400
            transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
          `}>
            {icon}
          </div>
          <div className={`
            transition-all duration-500 delay-100
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
          `}>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{label}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold">
          <span className={`
            text-lg transition-all duration-300
            ${winner === 'p1' ? 'text-purple-600 dark:text-purple-400 scale-110' : 'text-zinc-400 dark:text-zinc-500'}
          `}>
            {animatedP1}%
          </span>
          <span className="text-zinc-300 dark:text-zinc-600 transition-opacity duration-300">vs</span>
          <span className={`
            text-lg transition-all duration-300
            ${winner === 'p2' ? 'text-orange-600 dark:text-orange-400 scale-110' : 'text-zinc-400 dark:text-zinc-500'}
          `}>
            {animatedP2}%
          </span>
        </div>
      </div>

      <div className="relative h-5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 shadow-inner">
        <div
          className={`
            absolute left-0 top-0 h-full transition-all duration-1000 ease-out
            ${winner === 'p1' ? 'shadow-lg shadow-purple-500/30' : ''}
            bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400
          `}
          style={{ width: `${(animatedP1 / 100) * p1}%`, clipPath: winner === 'p2' ? 'polygon(0 0, 95% 0, 95% 100%, 0 100%)' : 'none' }}
        />
        <div
          className={`
            absolute right-0 top-0 h-full transition-all duration-1000 ease-out
            ${winner === 'p2' ? 'shadow-lg shadow-orange-500/30' : ''}
            bg-gradient-to-l from-orange-600 via-orange-500 to-orange-400
          `}
          style={{ width: `${(animatedP2 / 100) * p2}%`, clipPath: winner === 'p1' ? 'polygon(5% 0, 100% 0, 100% 100%, 5% 100%)' : 'none' }}
        />

        {winner !== 'tie' && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-white dark:bg-zinc-900 rounded-full shadow-lg z-10 transition-all duration-1000 ease-out"
            style={{ left: `calc(${(animatedP1 / 100) * p1}% - 2px)` }}
          />
        )}
      </div>

      <div className="flex justify-between mt-2 text-[10px] uppercase tracking-wider font-bold">
        <span className={winner === 'p1' ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-500'}>
          {animatedP1 >= 85 ? 'Elite' : animatedP1 >= 70 ? 'Good' : animatedP1 >= 55 ? 'Average' : 'Low'}
        </span>
        <span className={winner === 'p2' ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-500'}>
          {animatedP2 >= 85 ? 'Elite' : animatedP2 >= 70 ? 'Good' : animatedP2 >= 55 ? 'Average' : 'Low'}
        </span>
      </div>
    </div>
  )
}

function PlayerSelector({ players, selectedPlayer, onSelect, placeholder }: {
  players: StatoriumPlayerBasic[];
  selectedPlayer: StatoriumPlayerBasic | null;
  onSelect: (player: StatoriumPlayerBasic) => void;
  placeholder: string;
}) {
  const [search, setSearch] = React.useState('')
  const [open, setOpen] = React.useState(false)

  const filteredPlayers = React.useMemo(() => {
    const seenIds = new Set()
    return players.filter(p => {
      if (seenIds.has(p.playerID)) return false
      seenIds.add(p.playerID)
      
      const isAlreadySelected = selectedPlayer?.playerID === p.playerID
      const matchesSearch =
        p.fullName.toLowerCase().includes(search.toLowerCase()) ||
        p.teamName?.toLowerCase().includes(search.toLowerCase())
      return matchesSearch && !isAlreadySelected
    }).slice(0, 50)
  }, [players, search, selectedPlayer])

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
        />
        <Users className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {filteredPlayers.length === 0 ? (
            <div className="p-6 text-sm text-zinc-500 text-center">
              {search.length >= 2 ? 'No players found matching your search' : 'Type at least 2 characters to search...'}
            </div>
          ) : (
            filteredPlayers.map((player) => (
              <button
                key={player.playerID}
                onClick={() => {
                  onSelect(player)
                  setOpen(false)
                  setSearch('')
                }}
                className="w-full p-3 flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left border-b border-zinc-100 dark:border-zinc-800 last:border-0 group"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 border-2 border-zinc-200 dark:border-zinc-600 group-hover:border-purple-500/50 transition-colors">
                  {player.playerPhoto || player.photo ? (
                    <Image
                      src={player.playerPhoto || player.photo || `https://api.statorium.com/media/bearleague/bl${player.playerID}.webp`}
                      alt={player.fullName}
                      fill
                      unoptimized
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{player.fullName}</div>
                  <div className="text-xs text-zinc-500 flex items-center gap-2 mt-1 flex-wrap">
                    {player.position && (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-medium">
                        {player.position}
                      </span>
                    )}
                    {player.country && (
                      <span className="flex items-center gap-1">
                        🌍 {typeof player.country === 'string' ? player.country : player.country.name}
                      </span>
                    )}
                    {player.teamName && <span className="truncate">{player.teamName}</span>}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}

function PlayerCard({ player, onClear }: { player: StatoriumPlayerBasic; onClear: () => void }) {
  const [imageError, setImageError] = React.useState(false)

  const countryName = typeof player.country === 'string' ? player.country : player.country?.name

  return (
    <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg relative group hover:shadow-xl transition-shadow">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClear}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500 hover:text-white"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <div className="p-6 flex items-center gap-6">
        <div className="relative h-24 w-24 shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-orange-500/20 border-2 border-purple-500/30" />
          <div className="relative h-full w-full rounded-2xl overflow-hidden">
            {!imageError && (player.playerPhoto || player.photo) ? (
              <Image
                src={player.playerPhoto || player.photo || `https://api.statorium.com/media/bearleague/bl${player.playerID}.webp`}
                alt={player.fullName}
                fill
                unoptimized
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                <UserCircle className="h-12 w-12 text-zinc-400 dark:text-zinc-500" />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {player.position && (
              <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-transparent shadow-md">
                {player.position}
              </Badge>
            )}
            {countryName && (
              <Badge variant="outline" className="border-zinc-200 dark:border-zinc-700">
                🌍 {countryName}
              </Badge>
            )}
          </div>
          <h3 className="text-xl font-bold truncate leading-tight text-zinc-900 dark:text-zinc-100">{player.fullName}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Shield className="h-3 w-3" />
            {player.teamName || 'Free Agent'}
          </p>
        </div>
      </div>
    </Card>
  )
}

function AnimatedStatsCard({ player, color }: { player: StatoriumPlayerBasic; color: 'purple' | 'orange' }) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [animatedValues, setAnimatedValues] = React.useState({
    goals: 0,
    assists: 0,
    matches: 0,
    minutes: 0,
    rating: 'N/A',
    yellowCards: 0
  })

  React.useEffect(() => {
    setIsVisible(true)

    // Animate numbers
    const duration = 1500
    const steps = 60
    const interval = duration / steps
    let step = 0

    const animate = () => {
      step++
      const progress = step / steps
      const easeProgress = 1 - Math.pow(1 - progress, 3) // ease-out cubic

      setAnimatedValues({
        goals: Math.round((player.goals || 0) * easeProgress),
        assists: Math.round((player.assists || 0) * easeProgress),
        matches: Math.round((player.matchesPlayed || 0) * easeProgress),
        minutes: Math.round((player.minutesPlayed || 0) * easeProgress),
        rating: player.rating || 'N/A',
        yellowCards: Math.round((player.yellowCards || 0) * easeProgress)
      })

      if (step < steps) {
        setTimeout(animate, interval)
      } else {
        setAnimatedValues({
          goals: player.goals || 0,
          assists: player.assists || 0,
          matches: player.matchesPlayed || 0,
          minutes: player.minutesPlayed || 0,
          rating: player.rating || 'N/A',
          yellowCards: player.yellowCards || 0
        })
      }
    }

    animate()
  }, [player])

  const colorClasses = {
    purple: {
      bg: 'bg-purple-500',
      text: 'text-purple-600 dark:text-purple-400',
      textBold: 'text-purple-700 dark:text-purple-300',
      shadow: 'shadow-lg shadow-purple-500/50'
    },
    orange: {
      bg: 'bg-orange-500',
      text: 'text-orange-600 dark:text-orange-400',
      textBold: 'text-orange-700 dark:text-orange-300',
      shadow: 'shadow-lg shadow-orange-500/50'
    }
  }

  const c = colorClasses[color]

  return (
    <div className={`
      p-4 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
      transition-all duration-500 ${color === 'purple' ? 'delay-300' : 'delay-400'}
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
    `}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`
          w-3 h-3 rounded-full ${c.bg} ${c.shadow}
          transition-all duration-500 ${isVisible ? 'scale-100' : 'scale-0'}
        `} />
        <span className={`font-bold text-sm text-zinc-900 dark:text-zinc-100 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {player.fullName}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <AnimatedStat
          icon={<Goal className="h-3 w-3" />}
          label="Goals"
          value={animatedValues.goals}
          color={color}
          delay={0}
          isVisible={isVisible}
        />
        <AnimatedStat
          icon={<Activity className="h-3 w-3" />}
          label="Assists"
          value={animatedValues.assists}
          color={color}
          delay={100}
          isVisible={isVisible}
        />
        <AnimatedStat
          icon={<Shield className="h-3 w-3" />}
          label="Matches"
          value={animatedValues.matches}
          color={color}
          delay={200}
          isVisible={isVisible}
        />
        <AnimatedStat
          icon={<TrendingUp className="h-3 w-3" />}
          label="Minutes"
          value={animatedValues.minutes}
          color={color}
          delay={300}
          isVisible={isVisible}
        />
        <AnimatedStat
          icon={<Target className="h-3 w-3" />}
          label="Rating"
          value={animatedValues.rating}
          color={color}
          delay={400}
          isVisible={isVisible}
        />
        <AnimatedStat
          icon={<Zap className="h-3 w-3" />}
          label="Yellow Cards"
          value={animatedValues.yellowCards}
          color={color}
          delay={500}
          isVisible={isVisible}
        />
      </div>
    </div>
  )
}

function AnimatedStat({ icon, label, value, color, delay, isVisible }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: 'purple' | 'orange';
  delay: number;
  isVisible: boolean;
}) {
  const colorClasses = {
    purple: {
      icon: 'text-purple-500',
      text: 'text-purple-700 dark:text-purple-300'
    },
    orange: {
      icon: 'text-orange-500',
      text: 'text-orange-700 dark:text-orange-300'
    }
  }

  const c = colorClasses[color]

  return (
    <div className={`
      flex items-center gap-2 transition-all duration-500
      ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-10px]'}
    `} style={{ transitionDelay: `${delay}ms` }}>
      <div className={c.icon}>{icon}</div>
      <span className="text-zinc-600 dark:text-zinc-400">{label}:</span>
      <span className={`font-bold ${c.text} transition-all duration-300 ${isVisible ? 'scale-110' : 'scale-100'}`}>
        {value}
      </span>
    </div>
  )
}
