'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getAllTop5PlayersAction, getPlayerDataAction } from '@/app/actions/statorium'
import { StatoriumPlayerBasic, StatoriumSeasonStats } from '@/lib/statorium/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Trash2, ArrowRightLeft, Loader2, UserCircle, TrendingUp, Shield, Zap, Target, Award, Activity, Goal, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

// Utility function to extract and normalize season statistics from top-tier 2024-25 season
function extractSeasonStats(player: any): {
  goals: number;
  assists: number;
  matches: number;
  minutes: number;
  yellowCards: number;
  redCards: number;
  secondYellowCards: number;
  ownGoals: number;
  penaltyGoals: number;
  missedPenalties: number;
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
    missedPenalties: 0
  };

  console.log(`[extractSeasonStats] Starting extraction for player:`, player?.fullName);
  console.log(`[extractSeasonStats] Player object:`, player);
  console.log(`[extractSeasonStats] Has stat property:`, !!player?.stat);
  console.log(`[extractSeasonStats] Stat array:`, player?.stat);

  if (!player) {
    console.log(`[extractSeasonStats] No player object, returning defaults`);
    return defaultStats;
  }

  // Try to get stats from the stat array (Statorium API format)
  const statsArray = player.stat;
  console.log(`[extractSeasonStats] Stats array:`, statsArray);
  console.log(`[extractSeasonStats] Stats array is array:`, Array.isArray(statsArray));
  console.log(`[extractSeasonStats] Stats array length:`, statsArray?.length || 0);

  if (statsArray && Array.isArray(statsArray) && statsArray.length > 0) {
    console.log(`[extractSeasonStats] Found ${statsArray.length} seasons`);

    // Find top-tier 2024-25 season statistics
    const topTierSeason = statsArray.find((season: any) => {
      const seasonName = season.season_name || '';
      const isTopTier = seasonName.includes('Premier League') ||
                         seasonName.includes('La Liga') ||
                         seasonName.includes('Bundesliga') ||
                         seasonName.includes('Serie A') ||
                         seasonName.includes('Ligue 1');
      const is2024_25 = seasonName.includes('2024-25');
      console.log(`[extractSeasonStats] Checking season: "${seasonName}" - TopTier: ${isTopTier}, 2024-25: ${is2024_25}`);
      return isTopTier && is2024_25;
    });

    console.log(`[extractSeasonStats] Found top-tier season:`, topTierSeason?.season_name);

    // Use top-tier season if found, otherwise use most recent
    const currentStat = topTierSeason || statsArray[0];
    console.log(`[extractSeasonStats] Using season: ${currentStat.season_name} for ${player.fullName}`);

    console.log(`[extractSeasonStats] Current stat object:`, currentStat);

    // API returns numbers, so handle both string and number types
    const result = {
      goals: parseInt(String(currentStat["Goals"] || currentStat["Goal"] || 0)),
      assists: parseInt(String(currentStat["Assist"] || 0)),
      matches: parseInt(String(currentStat["played"] || 0)),
      minutes: parseInt(String(currentStat["career_minutes"] || 0)),
      yellowCards: parseInt(String(currentStat["Yellow card"] || 0)),
      redCards: parseInt(String(currentStat["Red card"] || 0)),
      secondYellowCards: parseInt(String(currentStat["Second yellow"] || 0)),
      ownGoals: parseInt(String(currentStat["Own goal"] || 0)),
      penaltyGoals: parseInt(String(currentStat["Penalty goal"] || 0)),
      missedPenalties: parseInt(String(currentStat["Missed penalty"] || 0))
    };

    console.log(`[extractSeasonStats] Extracted stats:`, result);
    console.log(`[extractSeasonStats] Stats types:`, {
      goals: typeof result.goals,
      assists: typeof result.assists,
      matches: typeof result.matches,
      minutes: typeof result.minutes
    });
    return result;
  }

  console.log(`[extractSeasonStats] No stat array found, using fallback`);
  // Fallback to legacy format if available
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
    missedPenalties: 0
  };
}

function CompareContent() {
  const searchParams = useSearchParams()
  const [player1, setPlayer1] = React.useState<StatoriumPlayerBasic | null>(null)
  const [player2, setPlayer2] = React.useState<StatoriumPlayerBasic | null>(null)
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
        console.log('[Compare] Starting player load...')

        const players = await getAllTop5PlayersAction()
        console.log('[Compare] Loaded', players.length, 'players from database')
        setAllPlayers(players)

        const p1Id = searchParams.get('p1')
        const p2Id = searchParams.get('p2')

        console.log('[Compare] Player IDs from URL:', { p1Id, p2Id })
        console.log('[Compare] Players have stat array:', players.some(p => !!p.stat))

        // Parallel loading of both players with timeout
        if (p1Id || p2Id) {
          console.log('[Compare] Loading detailed data in parallel...')

          const detailedPromises = []

          if (p1Id) {
            const foundP1 = players.find(p => String(p.playerID) === p1Id)
            if (foundP1) {
              console.log('[Compare] Found Player1 in database:', foundP1.fullName)
              console.log('[Compare] Player1 from database has stat:', !!foundP1.stat)

              detailedPromises.push(
                getPlayerDataAction(foundP1.playerID, 8000) // 8 second timeout
                  .then(data => {
                    console.log('[Compare] 📥 Player1 data received:', data?.fullName)
                    console.log('[Compare] 📥 Player1 data has stat:', !!data?.stat)
                    console.log('[Compare] 📥 Player1 data keys:', data ? Object.keys(data) : 'null')
                    console.log('[Compare] 📥 Player1 full object:', JSON.stringify(data, null, 2))
                    return { player: 1, data, name: foundP1.fullName }
                  })
                  .catch(error => {
                    console.error('[Compare] ❌ Error loading Player1:', error)
                    setPlayer1Error('Failed to load player data')
                    return { player: 1, data: null, name: foundP1.fullName, error: error.message }
                  })
              )
            } else {
              console.warn('[Compare] Player1 not found in database')
              setPlayer1Error('Player not found')
            }
          }

          if (p2Id) {
            const foundP2 = players.find(p => String(p.playerID) === p2Id)
            if (foundP2) {
              console.log('[Compare] Found Player2 in database:', foundP2.fullName)
              console.log('[Compare] Player2 from database has stat:', !!foundP2.stat)

              detailedPromises.push(
                getPlayerDataAction(foundP2.playerID, 8000) // 8 second timeout
                  .then(data => {
                    console.log('[Compare] 📥 Player2 data received:', data?.fullName)
                    console.log('[Compare] 📥 Player2 data has stat:', !!data?.stat)
                    console.log('[Compare] 📥 Player2 data keys:', data ? Object.keys(data) : 'null')
                    console.log('[Compare] 📥 Player2 full object:', JSON.stringify(data, null, 2))
                    return { player: 2, data, name: foundP2.fullName }
                  })
                  .catch(error => {
                    console.error('[Compare] ❌ Error loading Player2:', error)
                    setPlayer2Error('Failed to load player data')
                    return { player: 2, data: null, name: foundP2.fullName, error: error.message }
                  })
              )
            } else {
              console.warn('[Compare] Player2 not found in database')
              setPlayer2Error('Player not found')
            }
          }

          if (detailedPromises.length > 0) {
            console.log('[Compare] Waiting for', detailedPromises.length, 'detailed data requests...')

            const results = await Promise.all(detailedPromises)
            console.log('[Compare] ✅ All detailed data requests completed!')
            console.log('[Compare] 📊 Results:', results.map(r => ({
              player: r.player,
              name: r.name,
              success: !!r.data,
              hasStat: !!r.data?.stat,
              dataKeys: r.data ? Object.keys(r.data) : []
            })))

            results.forEach(result => {
              if (result.data) {
                console.log(`[Compare] ✅ Player${result.player} success!`)
                console.log(`[Compare] ✅ Setting Player${result.player} state with:`, result.data.fullName)
                console.log(`[Compare] ✅ Has stat array:`, !!result.data.stat)
                console.log(`[Compare] ✅ Stat array length:`, result.data.stat?.length || 0)

                if (result.player === 1) {
                  console.log('[Compare] 🔄 Calling setPlayer1 with full object')
                  setPlayer1(result.data)
                  // Debug: check state after setting
                  setTimeout(() => {
                    console.log('[Compare] 📋 Player1 state after setPlayer1:')
                    console.log('   player1 has stat:', !!result.data.stat)
                  }, 100)
                } else {
                  console.log('[Compare] 🔄 Calling setPlayer2 with full object')
                  setPlayer2(result.data)
                  // Debug: check state after setting
                  setTimeout(() => {
                    console.log('[Compare] 📋 Player2 state after setPlayer2:')
                    console.log('   player2 has stat:', !!result.data.stat)
                  }, 100)
                }
              } else {
                console.log(`[Compare] ❌ Player${result.player} failed:`, 'error' in result ? result.error : 'Unknown error')
              }
            })
          }
        }
      } catch (error) {
        console.error('[Compare] Error loading players:', error)
      } finally {
        setLoading(false)
        setLoadingDetailed(false)
        console.log('[Compare] ✅ Player load completed')
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
    <div className="space-y-8 animate-in fade-in duration-500 min-h-screen">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-black tracking-tight text-foreground italic uppercase">Player Comparison <span className="text-primary font-mono ml-2">v4</span></h1>
        <p className="text-muted-foreground text-lg font-bold font-mono uppercase tracking-widest leading-relaxed max-w-2xl">Compare performance metrics between two top-tier athletes from Europe's TOP 5 leagues.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-green-500" />
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Loading players from Statorium API...</p>
          <p className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest leading-relaxed">Fetching data from TOP 5 European leagues...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <label className="text-sm font-black uppercase tracking-widest text-green-500">Player 1</label>
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
            <label className="text-sm font-black uppercase tracking-widest text-emerald-500">Player 2</label>
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
          rounded-3xl border border-border bg-card backdrop-blur-xl p-8 md:p-10 shadow-2xl transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-4
        `}>
          <div className={`
            flex items-center gap-4 mb-10 transition-all duration-500 delay-100 animate-in fade-in slide-in-from-left-4
          `}>
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center shadow-lg shadow-green-500/20 hover:scale-110 hover:shadow-green-500/40 transition-all duration-300 border border-green-500/20">
              <ArrowRightLeft className="h-7 w-7 text-green-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                Player Comparison Matrix
              </h2>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Advanced analytics & performance metrics from Statorium API</p>
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
            mt-10 rounded-2xl border border-border bg-accent/40 backdrop-blur-sm p-6
            transition-all duration-500 delay-200
            animate-in fade-in slide-in-from-bottom-4
          `}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 text-green-500 border border-green-500/20">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg uppercase tracking-tight italic">Season Statistics</h3>
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Real-time performance data from Statorium API</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] bg-green-500/10 border-green-500/30 text-green-500 font-semibold">
                📊 Live Data
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
              <div className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-widest py-8 italic">
                Loading advanced comparison data...
              </div>
            )}
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className={`
              p-6 rounded-2xl bg-primary/5 border border-primary/20 backdrop-blur-sm
              transition-all duration-500 delay-500 hover:scale-105 hover:shadow-lg hover:shadow-primary/20
              animate-in fade-in slide-in-from-left-4
            `}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
                <span className="font-bold text-green-500">{player1.fullName}</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  {player1.position && <span className="font-black text-foreground uppercase italic">{player1.position}</span>}
                  {player1.position && player1.country && <span className="text-border">•</span>}
                  {player1.country && (
                    <span className="flex items-center gap-1 font-bold uppercase tracking-tight">
                      🌍 {typeof player1.country === 'string' ? player1.country : player1.country.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground uppercase font-black tracking-tight text-[10px]">
                  <Shield className="h-3 w-3 text-green-500" />
                  {player1.teamName || 'Free Agent'}
                </div>
              </div>
            </div>
            <div className={`
              p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-sm
              transition-all duration-500 delay-600 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20
              animate-in fade-in slide-in-from-right-4
            `}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
                <span className="font-bold text-emerald-500">{player2.fullName}</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  {player2.position && <span className="font-black text-foreground uppercase italic">{player2.position}</span>}
                  {player2.position && player2.country && <span className="text-border">•</span>}
                  {player2.country && (
                    <span className="flex items-center gap-1 font-bold uppercase tracking-tight">
                      🌍 {typeof player2.country === 'string' ? player2.country : player2.country.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground uppercase font-black tracking-tight text-[10px]">
                  <Shield className="h-3 w-3 text-emerald-500" />
                  {player2.teamName || 'Free Agent'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-3xl bg-accent/40 backdrop-blur-sm">
          <Users className="h-16 w-16 text-muted-foreground/20 mb-6" />
          <p className="text-muted-foreground text-center font-black uppercase tracking-widest italic text-sm">Select two players to generate a side-by-side comparison report.</p>
        </div>
      )}
    </div>
  )
}

function calculateScore(player: StatoriumPlayerBasic, type: string): number {
  const position = player.position?.toUpperCase() || ''

  // Extract real season statistics
  const stats = extractSeasonStats(player)

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

  // Calculate base scores using actual season statistics
  let score = 0

  switch (type) {
    case 'technical':
      // Based on position, team strength, and actual performance data
      score = getPositionScore(position, 'technical')

      // Use actual season statistics
      if (stats.matches > 0) {
        // Goals per match ratio
        const goalsPerMatch = stats.goals / stats.matches
        const assistsPerMatch = stats.assists / stats.matches
        const contributionsPerMatch = goalsPerMatch + assistsPerMatch

        // Reward high contribution rates (0.5+ per match is excellent)
        const contributionBonus = Math.min(20, contributionsPerMatch * 30)
        score += contributionBonus

        // Penalty scoring ability
        if (stats.penaltyGoals > 0) {
          score += Math.min(5, stats.penaltyGoals * 2)
        }
      }

      // Add variance based on player ID for uniqueness
      score += (hash % 10) - 5
      break

    case 'physical':
      // Based on age, position, and playing time
      score = getPositionScore(position, 'physical')

      // Adjust based on minutes played (real endurance)
      if (stats.minutes > 500) {
        const fitnessLevel = Math.min(10, stats.minutes / 1000)
        score += fitnessLevel
      }

      // Games played consistency
      if (stats.matches >= 20) {
        score += 5
      } else if (stats.matches >= 10) {
        score += 2
      }

      // Younger players generally better physically, peak around 25-28
      const ageBonus = age < 25 ? (25 - age) * 2 : age > 30 ? (age - 30) * 3 : 0
      score = Math.max(score, 75 - ageBonus)
      score += (hash % 8) - 4
      break

    case 'tactical':
      // Based on position, experience (age), and discipline using real card stats
      score = getPositionScore(position, 'tactical')

      // Discipline calculation using real statistics
      if (stats.matches > 0) {
        const cardsPerMatch = (stats.yellowCards + stats.redCards * 3) / stats.matches
        const disciplineScore = Math.max(0, 10 - cardsPerMatch * 20) // Lower cards = better score
        score += disciplineScore

        // Second yellow cards indicate poor tactical awareness
        if (stats.secondYellowCards === 0 && stats.matches > 10) {
          score += 3 // Bonus for never getting second yellow
        }
      }

      // Older players generally better tactically
      const experienceBonus = age > 28 ? (age - 28) * 2 : 0
      score = Math.min(95, score + experienceBonus)
      score += (hash % 8) - 4
      break

    case 'market':
      // Based on team strength, age, and real performance
      score = teamStrength

      // Young players from top teams have higher market value
      if (age < 25) {
        score += (25 - age) * 2
      }

      // Performance impact on market value using real stats
      if (stats.goals > 0) {
        score += Math.min(10, stats.goals)
      }

      if (stats.assists > 0) {
        score += Math.min(5, stats.assists)
      }

      // Penalty takers have higher value
      if (stats.penaltyGoals > 0) {
        score += Math.min(3, stats.penaltyGoals)
      }

      // Consistency factor
      if (stats.matches >= 25) {
        score += 5
      }

      // Top teams have higher market values
      const topTeams = ['Man City', 'Real Madrid', 'Barcelona', 'Bayern', 'PSG']
      if (player.teamName && topTeams.some(team => player.teamName!.toLowerCase().includes(team.toLowerCase()))) {
        score += 10
      }
      score += (hash % 10) - 5
      break

    case 'recruitment':
      // Overall score combining all factors with real statistics
      const technical = calculateScore(player, 'technical')
      const physical = calculateScore(player, 'physical')
      const tactical = calculateScore(player, 'tactical')
      const market = calculateScore(player, 'market')

      // Weight technical higher for attackers, tactical for defenders
      let weights = { technical: 0.3, physical: 0.2, tactical: 0.3, market: 0.2 }

      if (position.includes('FW')) {
        weights = { technical: 0.35, physical: 0.25, tactical: 0.2, market: 0.2 }
      } else if (position.includes('DF')) {
        weights = { technical: 0.25, physical: 0.25, tactical: 0.35, market: 0.15 }
      } else if (position.includes('MF')) {
        weights = { technical: 0.3, physical: 0.2, tactical: 0.3, market: 0.2 }
      }

      score = technical * weights.technical + physical * weights.physical + tactical * weights.tactical + market * weights.market
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
      p-5 rounded-2xl bg-card/60 backdrop-blur-sm border border-border hover:border-primary/20 hover:bg-accent/80 transition-all duration-300
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`
            p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 text-green-500 border border-green-500/20
            transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
          `}>
            {icon}
          </div>
          <div className={`
            transition-all duration-500 delay-100
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
          `}>
            <h3 className="font-bold text-foreground text-lg tracking-tight uppercase italic">{label}</h3>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm font-black tabular-nums font-mono">
          <span className={`
            text-2xl transition-all duration-300
            ${winner === 'p1' ? 'text-green-500 scale-110 drop-shadow-lg drop-shadow-green-500/50' : 'text-muted-foreground/30'}
          `}>
            {animatedP1}%
          </span>
          <span className="text-muted-foreground/20 text-[10px] uppercase tracking-wider font-black">vs</span>
          <span className={`
            text-2xl transition-all duration-300
            ${winner === 'p2' ? 'text-emerald-500 scale-110 drop-shadow-lg drop-shadow-emerald-500/50' : 'text-muted-foreground/30'}
          `}>
            {animatedP2}%
          </span>
        </div>
      </div>

      <div className="relative h-6 overflow-hidden rounded-full bg-accent/50 backdrop-blur-sm shadow-inner border border-border">
        <div
          className={`
            absolute left-0 top-0 h-full transition-all duration-1000 ease-out
            ${winner === 'p1' ? 'rounded-l-full rounded-r-none shadow-lg shadow-green-500/30' : 'rounded-l-none'}
            bg-gradient-to-r from-green-600 via-green-500 to-emerald-400
          `}
          style={{ width: `${animatedP1}%` }}
        />
        <div
          className={`
            absolute right-0 top-0 h-full transition-all duration-1000 ease-out
            ${winner === 'p2' ? 'rounded-r-full rounded-l-none shadow-lg shadow-emerald-500/30' : 'rounded-r-none'}
            bg-gradient-to-l from-emerald-600 via-emerald-500 to-green-400
          `}
          style={{ width: `${animatedP2}%` }}
        />

        {winner !== 'tie' && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow-lg z-10 transition-all duration-1000 ease-out"
            style={{ left: `calc(${animatedP1}% - 3px)` }}
          />
        )}
      </div>

      <div className="flex justify-between mt-3 text-[10px] uppercase tracking-[0.3em] font-black italic">
        <span className={winner === 'p1' ? 'text-green-500' : 'text-muted-foreground/30'}>
          {animatedP1 >= 85 ? 'Elite' : animatedP1 >= 70 ? 'Good' : animatedP1 >= 55 ? 'Average' : 'Low'}
        </span>
        <span className={winner === 'p2' ? 'text-emerald-500' : 'text-muted-foreground/30'}>
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

  console.log('[PlayerSelector] 🔍 Filtering players:', {
    search: search,
    selectedPlayerId: selectedPlayer?.playerID || 'none',
    filteredCount: filteredPlayers.length,
    totalPlayers: players.length
  })

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
        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-accent/40 backdrop-blur-sm text-foreground placeholder-muted-foreground transition-all duration-300 hover:border-primary/50"
      />

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-card/95 backdrop-blur-2xl border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2">
          {filteredPlayers.length === 0 ? (
            <div className="p-10 text-[10px] text-muted-foreground text-center font-black uppercase tracking-widest italic">
              {search.length >= 2 ? 'No performance data found' : 'Type at least 2 chars...'}
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
                className="w-full p-4 flex items-center gap-4 hover:bg-accent/80 transition-all duration-300 text-left border-b border-border/50 last:border-0 group"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-accent border-2 border-border group-hover:border-primary/50 transition-all duration-300 shadow-lg">
                  {player.playerPhoto || player.photo ? (
                    <Image
                      src={player.playerPhoto || player.photo || `https://api.statorium.com/media/bearleague/bl${player.playerID}.webp`}
                      alt={player.fullName}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xl font-black text-muted-foreground/30 bg-accent uppercase italic">
                      {player.fullName.split(' ').slice(-1)[0][0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-foreground truncate group-hover:text-primary transition-colors italic uppercase tracking-tighter text-lg">
                    {player.fullName}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1 flex-wrap font-bold uppercase tracking-tight">
                    {player.position && (
                      <span className="px-2 py-0.5 rounded-full bg-accent text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
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
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}

function PlayerCard({ player, onClear }: { player: StatoriumPlayerBasic; onClear: () => void }) {
  const [imageError, setImageError] = React.useState(false)

  const countryName = typeof player.country === 'string' ? player.country : player.country?.name

  // Position mapping from Statorium API documentation
  const getPositionName = (player: any): string => {
    // Try to get position from additionalInfo or direct position field
    const positionValue = player.additionalInfo?.position || player.position

    if (positionValue === "1") return "Goalkeeper"
    if (positionValue === "2") return "Defender"
    if (positionValue === "3") return "Midfielder"
    if (positionValue === "4") return "Forward"

    // Fallback to existing position field
    if (player.position) {
      // Map common position abbreviations to full names
      const positionMap: Record<string, string> = {
        'GK': 'Goalkeeper',
        'DF': 'Defender',
        'MF': 'Midfielder',
        'FW': 'Forward',
        'ST': 'Forward',
        'CB': 'Defender',
        'RB': 'Defender',
        'LB': 'Defender',
        'CM': 'Midfielder',
        'CDM': 'Midfielder',
        'CAM': 'Midfielder',
        'RM': 'Midfielder',
        'LM': 'Midfielder',
        'RW': 'Midfielder',
        'LW': 'Midfielder'
      }
      return positionMap[player.position.toUpperCase()] || player.position
    }

    return "N/A"
  }

  const position = getPositionName(player)

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] group hover:scale-[1.02] hover:shadow-primary/20 transition-all duration-500 ease-out border-2">
      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClear}
        className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-red-500/10 hover:bg-red-500 hover:text-white backdrop-blur-md rounded-xl"
      >
        <Trash2 className="h-5 w-5" />
      </Button>

      {/* Player Photo - Fixed Size Container */}
      <div className="relative h-60 w-full flex items-center justify-center bg-gradient-to-b from-accent/50 to-card">
        <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-border shadow-2xl">
          {!imageError && (player.playerPhoto || player.photo) ? (
            <Image
              src={player.playerPhoto || player.photo || `https://api.statorium.com/media/bearleague/bl${player.playerID}.webp`}
              alt={player.fullName}
              fill
              unoptimized
              className="object-contain transition-transform duration-700 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-accent">
              <UserCircle className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
        </div>

        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-emerald-500 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Player Info */}
      <div className="relative z-20 p-6 space-y-5">
        {/* Player Name */}
        <h3 className="text-2xl font-black text-center text-foreground tracking-tighter italic uppercase">
          {player.fullName}
        </h3>

        {/* Position Badge */}
        <div className="flex justify-center">
          <Badge className="bg-primary/10 text-primary rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border border-primary/20">
            {position}
          </Badge>
        </div>

        {/* Team & Country */}
        <div className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground/60 leading-none">
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
            <span className="flex items-center gap-2">
              🌍 {countryName}
            </span>
          )}
        </div>

        {/* Decorative Line */}
        <div className="h-1 w-16 mx-auto bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
      </div>

      {/* Subtle Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  )
}

function AnimatedStatsCard({ player, color, loading, error }: { player: StatoriumPlayerBasic | null; color: 'green' | 'emerald'; loading?: boolean; error?: string | null }) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [seasonStats, setSeasonStats] = React.useState({
    goals: 0, assists: 0, matches: 0, minutes: 0,
    yellowCards: 0, redCards: 0, secondYellowCards: 0,
    ownGoals: 0, penaltyGoals: 0, missedPenalties: 0
  })
  const [animatedValues, setAnimatedValues] = React.useState({
    goals: 0, assists: 0, matches: 0, minutes: 0,
    yellowCards: 0, redCards: 0, secondYellowCards: 0,
    ownGoals: 0, penaltyGoals: 0, missedPenalties: 0
  })

  // Extract season stats when player changes
  React.useEffect(() => {
    if (player) {
      const stats = extractSeasonStats(player)
      setSeasonStats(stats)

      // Animate values
      setIsVisible(true)
      const duration = 1500
      const steps = 60
      const interval = duration / steps
      let step = 0

      const animate = () => {
        step++
        const progress = step / steps
        const easeProgress = 1 - Math.pow(1 - progress, 3) // ease-out cubic

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
          missedPenalties: Math.round(stats.missedPenalties * easeProgress)
        })

        if (step < steps) {
          setTimeout(animate, interval)
        } else {
          setAnimatedValues(stats)
        }
      }

      animate()
    }
  }, [player])

  const colorClasses = {
    green: {
      primary: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      accent: 'bg-green-500',
      glow: 'shadow-green-500/20'
    },
    emerald: {
      primary: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      accent: 'bg-emerald-500',
      glow: 'shadow-emerald-500/20'
    }
  }

  const c = colorClasses[color]

  // Show loading state
  if (loading) {
    return (
      <Card className={`${c.bg} border ${c.border} bg-accent/40 backdrop-blur-sm`}>
        <CardContent className="p-5 flex items-center justify-center h-40">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground uppercase font-black tracking-widest">Loading statistics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error) {
    return (
      <Card className={`${c.bg} border ${c.border} bg-accent/40 backdrop-blur-sm`}>
        <CardContent className="p-5 flex items-center justify-center h-40">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <span className="text-sm text-red-500 font-bold uppercase">{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show loading state if player doesn't have stat data yet
  if (!player?.stat || player.stat.length === 0) {
    return (
      <Card className={`${c.bg} border ${c.border} bg-accent/40 backdrop-blur-sm`}>
        <CardContent className="p-5 flex items-center justify-center h-40">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground font-black uppercase tracking-widest italic">Loading data for {player?.fullName || 'player'}...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${c.bg} border ${c.border} bg-accent/40 backdrop-blur-sm hover:${c.bg} transition-all duration-300 shadow-xl`}>
      <CardContent className="p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className={`${c.accent} text-primary p-2.5 rounded-xl shadow-lg ${c.glow} border border-primary/20`}>
              <Goal className="h-5 w-5" />
            </div>
            <div>
              <div className={`text-2xl font-black italic ${c.primary} tracking-tighter tabular-nums font-mono`}>
                {animatedValues.goals}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Goals</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`${c.accent} text-primary p-2.5 rounded-xl shadow-lg ${c.glow} border border-primary/20`}>
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className={`text-2xl font-black italic ${c.primary} tracking-tighter tabular-nums font-mono`}>
                {animatedValues.assists}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Assists</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-secondary p-2.5 rounded-xl shadow-lg border border-border">
              <Activity className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <div className={`text-2xl font-black italic ${c.primary} tracking-tighter tabular-nums font-mono`}>
                {animatedValues.matches}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Matches</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-secondary p-2.5 rounded-xl shadow-lg border border-border">
              <Clock className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <div className={`text-2xl font-black italic ${c.primary} tracking-tighter tabular-nums font-mono`}>
                {animatedValues.minutes}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Minutes</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/10 p-2.5 rounded-xl shadow-lg border border-yellow-500/20 text-yellow-600 dark:text-yellow-500">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className={`text-2xl font-black italic ${c.primary} tracking-tighter tabular-nums font-mono text-yellow-600 dark:text-yellow-500`}>
                {animatedValues.yellowCards}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest font-mono">Yellow Cards</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 p-2.5 rounded-xl shadow-lg border border-red-500/20 text-red-600 dark:text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className={`text-2xl font-black italic ${c.primary} tracking-tighter tabular-nums font-mono text-red-600 dark:text-red-500`}>
                {animatedValues.redCards}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest font-mono">Red Cards</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AdvancedStatsComparison({ player1, player2 }: { player1: StatoriumPlayerBasic; player2: StatoriumPlayerBasic }) {
  const stats1 = extractSeasonStats(player1)
  const stats2 = extractSeasonStats(player2)

  const comparisonMetrics = [
    { label: 'Goals per Match', value1: stats1.matches > 0 ? (stats1.goals / stats1.matches).toFixed(2) : '0.00', value2: stats2.matches > 0 ? (stats2.goals / stats2.matches).toFixed(2) : '0.00', winner: stats1.matches > 0 && stats2.matches > 0 ? (stats1.goals / stats1.matches) > (stats2.goals / stats2.matches) ? 'p1' : 'p2' : 'tie' },
    { label: 'Assists per Match', value1: stats1.matches > 0 ? (stats1.assists / stats1.matches).toFixed(2) : '0.00', value2: stats2.matches > 0 ? (stats2.assists / stats2.matches).toFixed(2) : '0.00', winner: stats1.matches > 0 && stats2.matches > 0 ? (stats1.assists / stats1.matches) > (stats2.assists / stats2.matches) ? 'p1' : 'p2' : 'tie' },
    { label: 'Minutes per Match', value1: stats1.matches > 0 ? Math.round(stats1.minutes / stats1.matches) : 0, value2: stats2.matches > 0 ? Math.round(stats2.minutes / stats2.matches) : 0, winner: stats1.matches > 0 && stats2.matches > 0 ? (stats1.minutes / stats1.matches) > (stats2.minutes / stats2.matches) ? 'p1' : 'p2' : 'tie' },
    { label: 'Discipline Rate', value1: stats1.matches > 0 ? ((stats1.yellowCards + stats1.redCards * 3) / stats1.matches).toFixed(2) : '0.00', value2: stats2.matches > 0 ? ((stats2.yellowCards + stats2.redCards * 3) / stats2.matches).toFixed(2) : '0.00', winner: stats1.matches > 0 && stats2.matches > 0 ? ((stats1.yellowCards + stats1.redCards * 3) / stats1.matches) < ((stats2.yellowCards + stats2.redCards * 3) / stats2.matches) ? 'p1' : 'p2' : 'tie' },
    { label: 'Penalty Success', value1: stats1.penaltyGoals > 0 ? `${stats1.penaltyGoals}/${stats1.penaltyGoals + stats1.missedPenalties}` : 'N/A', value2: stats2.penaltyGoals > 0 ? `${stats2.penaltyGoals}/${stats2.penaltyGoals + stats2.missedPenalties}` : 'N/A', winner: 'tie' }
  ]

  return (
    <div className="space-y-3">
      {comparisonMetrics.map((metric, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border hover:border-primary/20 transition-all duration-300">
          <span className="text-sm font-black text-foreground uppercase tracking-tight">{metric.label}</span>
          <div className="flex items-center gap-6 font-mono">
            <span className={`text-lg font-black ${metric.winner === 'p1' ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
              {metric.value1}
            </span>
            <span className="text-muted-foreground/30 text-[10px] uppercase tracking-wider font-black">vs</span>
            <span className={`text-lg font-black ${metric.winner === 'p2' ? 'text-emerald-600 dark:text-emerald-500' : 'text-muted-foreground'}`}>
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
    <Suspense fallback={<div>Loading...</div>}>
      <CompareContent />
    </Suspense>
  )
}