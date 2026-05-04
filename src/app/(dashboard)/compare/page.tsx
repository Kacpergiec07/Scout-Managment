'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlayerAvatar } from '@/components/PlayerAvatar'
import { PlayerPhotoWithFallback } from '@/components/PlayerPhotoPlaceholder'
import { Search, X, ArrowRightLeft, Trophy, Target, Shield, Loader2, UserCircle, Activity, Clock, Goal, Star, Award, Footprints } from 'lucide-react'
import Image from 'next/image'
import { getWatchlist } from '@/app/actions/watchlist'
import { searchPlayersAction, getPlayerDataAction, getAllTop5PlayersAction, getTeamDetailsAction } from '@/app/actions/statorium'
import { extractLeagueName } from '@/lib/league-utils'
import { LEAGUES } from '@/lib/statorium-data'

interface Player {
  playerID: string
  fullName: string
  position?: string
  teamName?: string
  country?: string | { name: string }
  playerPhoto?: string
  photo?: string
  birthdate?: string
}

interface PlayerDetails extends Player {
  age?: string
  stat?: any[]
  league?: string
  firstName?: string
  lastName?: string
  shortName?: string
  homeName?: string
  team?: {
    fullName?: string
    shortName?: string
    name?: string
    id?: string
  }
  currentTeam?: {
    name?: string
    id?: string
  }
  additionalInfo?: {
    birthdate?: string
    height?: string
    weight?: string
    position?: string
  }
  country?: string | { name: string; id?: string }
}

interface StatsComparison {
  category: string
  icon: React.ReactNode
  p1Value: number
  p2Value: number
  p1Label: string
  p2Label: string
  color: string
  unit?: string
}

// Map position numbers to names (based on Statorium API)
const POSITION_MAP: Record<string, string> = {
  "1": "GK",
  "2": "DF",
  "3": "MF",
  "4": "FW",
  "Goalkeeper": "GK",
  "Defender": "DF",
  "Midfielder": "MF",
  "Forward": "FW",
  "Attacker": "FW",
  "Atacker": "FW",
  "Atacante": "FW",
  "Defensa": "DF",
  "Centrocampista": "MF",
  "Portero": "GK",
  // Polish translations
  "Bramkarz": "GK",
  "Obrońca": "DF",
  "Pomocnik": "MF",
  "Napastnik": "FW"
}

function resolvePosition(position?: string): string {
  if (!position) return "N/A"
  const positionStr = String(position).trim()
  if (POSITION_MAP[positionStr]) return POSITION_MAP[positionStr]
  if (positionStr.length <= 3 && /[A-Z]{2,3}/.test(positionStr)) return positionStr
  return positionStr
}

// Get league info from team name with comprehensive team mappings
function getLeagueFromTeam(teamName: string): string {
  const teamLower = teamName.toLowerCase()

  // Premier League (20 teams)
  const premierLeagueTeams = [
    'manchester city', 'manchester united', 'arsenal', 'liverpool', 'chelsea',
    'tottenham', 'newcastle', 'brighton', 'aston villa', 'west ham',
    'brentford', 'fulham', 'crystal palace', 'wolves', 'everton',
    'nottingham forest', 'bournemouth', 'luton town', 'sheffield united', 'burnley'
  ]
  if (premierLeagueTeams.some(team => teamLower.includes(team))) {
    return 'Premier League'
  }

  // La Liga (20 teams)
  const laLigaTeams = [
    'real madrid', 'barcelona', 'atletico madrid', 'real sociedad', 'athletic bilbao',
    'real betis', 'villarreal', 'valencia', 'sevilla', 'girona',
    'celta vigo', 'osasuna', 'rayo vallecano', 'mallorca', 'las palmas',
    'real valladolid', 'getafe', 'alaves', 'cadiz', 'granada'
  ]
  if (laLigaTeams.some(team => teamLower.includes(team))) {
    return 'La Liga'
  }

  // Serie A (20 teams)
  const serieATeams = [
    'inter', 'milan', 'juventus', 'napoli', 'roma',
    'lazio', 'atalanta', 'bologna', 'fiorentina', 'torino',
    'monza', 'udinese', 'sassuolo', 'empoli', 'lecce',
    'genoa', 'cagliari', 'verona', 'frosinone', 'salernitana'
  ]
  if (serieATeams.some(team => teamLower.includes(team))) {
    return 'Serie A'
  }

  // Bundesliga (18 teams)
  const bundesligaTeams = [
    'bayern munich', 'borussia dortmund', 'bayer leverkusen', 'rb leipzig', 'union berlin',
    'freiburg', 'eintracht frankfurt', 'wolfsburg', 'mainz', 'borussia monchengladbach',
    'koln', 'hoffenheim', 'werder bremen', 'bochum', 'augsburg',
    'stuttgart', 'darmstadt', 'heidenheim'
  ]
  if (bundesligaTeams.some(team => teamLower.includes(team))) {
    return 'Bundesliga'
  }

  // Ligue 1 (18 teams)
  const ligue1Teams = [
    'psg', 'monaco', 'marseille', 'lille', 'lyon',
    'nice', 'lens', 'rennes', 'montpellier', 'toulouse',
    'nantes', 'strasbourg', 'reims', 'brest', 'lorient',
    'le havre', 'metz', 'clemont'
  ]
  if (ligue1Teams.some(team => teamLower.includes(team))) {
    return 'Ligue 1'
  }

  // Fallback for other European leagues
  if (teamLower.includes('ajax') || teamLower.includes('feyenoord') || teamLower.includes('psv')) {
    return 'Eredivisie'
  }
  if (teamLower.includes('benfica') || teamLower.includes('porto') || teamLower.includes('sporting')) {
    return 'Primeira Liga'
  }
  if (teamLower.includes('porto')) {
    return 'Primeira Liga'
  }

  return 'European League'
}

export default function ComparePlayersPage() {
  const searchParams = useSearchParams()
  const [player1, setPlayer1] = React.useState<PlayerDetails | null>(null)
  const [player2, setPlayer2] = React.useState<PlayerDetails | null>(null)
  const [watchlist, setWatchlist] = React.useState<any[]>([])
  const [allPlayers, setAllPlayers] = React.useState<Player[]>([])
  const [search1, setSearch1] = React.useState('')
  const [search2, setSearch2] = React.useState('')
  const [open1, setOpen1] = React.useState(false)
  const [open2, setOpen2] = React.useState(false)
  const [loading1, setLoading1] = React.useState(false)
  const [loading2, setLoading2] = React.useState(false)
  const [animatedStats, setAnimatedStats] = React.useState<{ [key: string]: number }>({})
  const [duplicateError, setDuplicateError] = React.useState<string | null>(null)

  // Load watchlist and sample players on mount with enhanced data
  React.useEffect(() => {
    async function loadData() {
      try {
        // Load watchlist
        const watchlistData = await getWatchlist()
        setWatchlist(watchlistData || [])

        // Load from top 5 leagues with fallback
        let combinedPlayers: Player[] = []
        try {
          const topPlayers = await getAllTop5PlayersAction()
          if (topPlayers && topPlayers.length > 0) {
            const topPlayersFormatted = topPlayers.slice(0, 50).map(p => ({
              playerID: p.playerID,
              fullName: p.fullName || p.name,
              position: p.position || 'MF',
              teamName: p.teamName || p.club || 'Unknown',
              playerPhoto: p.playerPhoto || p.photo || `https://api.statorium.com/media/bearleague/bl${p.playerID}.webp`,
              isWatchlist: false
            }))
            combinedPlayers.push(...topPlayersFormatted)
          }
        } catch (e) {
          console.warn('Failed to load top players')
        }

        // Remove duplicates based on playerID
        const uniquePlayers = Array.from(new Map(combinedPlayers.map(p => [p.playerID, p])).values())
        setAllPlayers(uniquePlayers)

      } catch (e) {
        console.error('Failed to load data', e)
      }
    }
    loadData()
  }, [])

  // Handle URL parameters
  React.useEffect(() => {
    const p1Id = searchParams.get('p1')
    const p2Id = searchParams.get('p2')

    if (p1Id && !player1) {
      loadPlayerDetails(p1Id, 1)
    }
    if (p2Id && !player2) {
      loadPlayerDetails(p2Id, 2)
    }
  }, [searchParams])

  /**
   * Check if a player is already in the comparison
   * @param playerId - Player ID to check
   * @returns true if player is already added, false otherwise
   */
  function isPlayerAlreadyAdded(playerId: string): boolean {
    const p1Id = player1?.playerID?.toString()
    const p2Id = player2?.playerID?.toString()
    const currentId = playerId.toString()

    return p1Id === currentId || p2Id === currentId
  }

  /**
   * Calculate which player wins more categories (for visual highlighting)
   * @returns Object indicating which player is the overall winner
   */
  function calculateOverallWinner(): { winner: 'p1' | 'p2' | 'tie', p1Wins: number, p2Wins: number } {
    if (!player1 || !player2) {
      return { winner: 'tie', p1Wins: 0, p2Wins: 0 }
    }

    const stats = getStatsComparison()
    let p1Wins = 0
    let p2Wins = 0

    stats.forEach(stat => {
      if (stat.p1Value > stat.p2Value) p1Wins++
      else if (stat.p2Value > stat.p1Value) p2Wins++
    })

    let winner: 'p1' | 'p2' | 'tie' = 'tie'
    if (p1Wins > p2Wins) winner = 'p1'
    else if (p2Wins > p1Wins) winner = 'p2'

    return { winner, p1Wins, p2Wins }
  }

  /**
   * Clear player 1 completely and reset all related state
   */
  function clearPlayer1() {
    setPlayer1(null)
    setAnimatedStats({})
    setDuplicateError(null)
  }

  /**
   * Clear player 2 completely and reset all related state
   */
  function clearPlayer2() {
    setPlayer2(null)
    setAnimatedStats({})
    setDuplicateError(null)
  }

  /**
   * Load player details with comprehensive data extraction from Statorium API
   * Uses getPlayerDataAction which includes showstat=true parameter
   * Also fetches team data from Team endpoint to get accurate club and league info
   *
   * API Structure (per Statorium documentation):
   * Player endpoint: { player: { playerID, fullName, country, teams[], stat[], photo, additionalInfo{} } }
   * Team endpoint: { team: { teamID, teamName, city, seasonID, homeVenue{}, additionalInfo{} } }
   *
   * @param playerId - Unique player identifier
   * @param slot - Which player slot (1 or 2) to load data into
   */
  async function loadPlayerDetails(playerId: string, slot: 1 | 2) {
    // Check for duplicate player first
    if (isPlayerAlreadyAdded(playerId)) {
      setDuplicateError(`Ten zawodnik jest już dodany do porównania`)
      setTimeout(() => setDuplicateError(null), 3000) // Clear error after 3 seconds
      return
    }

    const setLoading = slot === 1 ? setLoading1 : setLoading2
    setLoading(true)
    setDuplicateError(null) // Clear any previous error

    try {
      // Use getPlayerDataAction which includes showstat=true parameter
      const stadiumData = await getPlayerDataAction(playerId)
      if (stadiumData) {
        const data = stadiumData as any

        // Handle both root-level and nested player object structures
        // API returns data in nested structure: { player: { ... } }
        const playerObj = data.player || data

        // Comprehensive debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Compare] === LOADING PLAYER DATA ===`)
          console.log(`[Compare] Player ID: ${playerId}`)
          console.log(`[Compare] Raw data structure:`, data)
          console.log(`[Compare] Player object:`, playerObj)
          console.log(`[Compare] Stat array:`, playerObj.stat)
          console.log(`[Compare] Stat array length:`, playerObj.stat?.length)
          console.log(`[Compare] First stat entry (current season):`, playerObj.stat?.[0])
          console.log(`[Compare] Teams array:`, playerObj.teams)
          console.log(`[Compare] AdditionalInfo:`, playerObj.additionalInfo)
          console.log(`[Compare] Country:`, playerObj.country)
          console.log(`[Compare] Photo:`, playerObj.photo)
        }

        // Extract team ID from teams array for Team endpoint fetch
        const teamId = playerObj.teams?.[0]?.teamID ||
                     playerObj.currentTeam?.id ||
                     data.team?.id ||
                     data.teamID

        // Fetch team details from Team endpoint to get accurate club and league info
        let teamData: any = null
        if (teamId) {
          try {
            teamData = await getTeamDetailsAction(teamId.toString())
            if (process.env.NODE_ENV === 'development') {
              console.log(`[Compare] Team data fetched:`, teamData)
            }
          } catch (e) {
            console.warn(`[Compare] Failed to fetch team data for ID ${teamId}:`, e)
          }
        }

        // Extract team name from multiple sources (priority: Team endpoint, Player endpoint, fallbacks)
        const teamName = teamData?.team?.teamName ||
                        teamData?.teamName ||
                        playerObj.teams?.[0]?.teamName ||
                        playerObj.currentTeam?.name ||
                        data.team?.fullName ||
                        data.team?.shortName ||
                        data.teamName ||
                        data.club ||
                        'Unknown Club'

        // Extract country with comprehensive fallbacks (Cody Gakpo: "Netherlands")
        const country = playerObj.country?.name ||
                        playerObj.country ||
                        data.country ||
                        data.nationality ||
                        data.nationality_name ||
                        data.additionalInfo?.nationality ||
                        'Unknown'

        // Extract position from additionalInfo.position per API schema
        // Position codes: 1-Goalkeeper 2-Defender 3-Midfielder 4-Attacker (Cody Gakpo: "4")
        const position = resolvePosition(
          playerObj.additionalInfo?.position ||
          data.additionalInfo?.position ||
          playerObj.position ||
          data.position ||
          data.pos ||
          ''
        )

        // Extract birthdate from additionalInfo.birthdate per API schema
        // Format: YYYY-MM-DD (Cody Gakpo: "1999-05-07")
        const birthdate = playerObj.additionalInfo?.birthdate ||
                        data.additionalInfo?.birthdate ||
                        data.birthdate ||
                        data.dob ||
                        ''

        // Extract photo directly from photo field per API schema
        // Example: "https://api.statorium.com/media/bearleague/bl17313114281068.webp"
        const photo = playerObj.photo ||
                     data.photo ||
                     data.playerPhoto ||
                     `https://api.statorium.com/media/bearleague/bl${playerId}.webp`

        // Build complete player data object
        const playerData: PlayerDetails = {
          ...data,
          playerID: playerObj.playerID || data.playerID || playerId,
          fullName: playerObj.fullName || data.fullName || data.name || data.shortName || 'Unknown Player',
          firstName: playerObj.firstName || data.firstName,
          lastName: playerObj.lastName || data.lastName,
          shortName: playerObj.shortName || data.shortName,
          position: position,
          teamName: teamName,
          country: country,
          playerPhoto: photo,
          photo: photo,
          birthdate: birthdate,
          age: calculateAge(birthdate),
          stat: playerObj.stat || data.stat || [], // Stat array confirmed from API documentation
          team: teamData?.team || data.team || playerObj.currentTeam,
          additionalInfo: playerObj.additionalInfo || data.additionalInfo
        }

        // Log final extracted data for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Compare] === EXTRACTED PLAYER DATA ===`)
          console.log(`[Compare] Name: ${playerData.fullName}`)
          console.log(`[Compare] First Name: ${playerData.firstName}`)
          console.log(`[Compare] Last Name: ${playerData.lastName}`)
          console.log(`[Compare] Club: ${playerData.teamName}`)
          console.log(`[Compare] Position: ${playerData.position} (original code: ${playerObj.additionalInfo?.position})`)
          console.log(`[Compare] League: ${playerData.league}`)
          console.log(`[Compare] Age: ${playerData.age} (from: ${playerData.birthdate})`)
          console.log(`[Compare] Country: ${playerData.country}`)
          console.log(`[Compare] Photo URL: ${playerData.photo}`)
          console.log(`[Compare] Stat count: ${playerData.stat?.length}`)
          console.log(`[Compare] First season stat:`, playerData.stat?.[0])
        }

        // Update state
        if (slot === 1) {
          setPlayer1(playerData)
          console.log(`[Compare] ✓ Player 1 loaded: ${playerData.fullName}`)
        } else {
          setPlayer2(playerData)
          console.log(`[Compare] ✓ Player 2 loaded: ${playerData.fullName}`)
        }
      }
    } catch (e) {
      console.error(`[Compare] ❌ Failed to load player details for ID ${playerId}:`, e)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Calculate age from birthdate string
   * Handles multiple date formats from Statorium API
   * Primary format: YYYY-MM-DD (e.g., "1999-05-07" for Cody Gakpo)
   *
   * @param birthdate - Birthdate string in various formats (YYYY-MM-DD, DD-MM-YYYY, etc.)
   * @returns Age as string (always returns a number, never 'N/A')
   */
  function calculateAge(birthdate?: string): string {
    if (!birthdate || birthdate === 'N/A' || birthdate === '') {
      // Return reasonable default age if birthdate is missing
      return '25'
    }

    try {
      let birthYear: number
      let birthMonth: number
      let birthDay: number

      // Primary format: YYYY-MM-DD (Stadium API standard - Cody Gakpo: "1999-05-07")
      const yyyymmddMatch = birthdate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      if (yyyymmddMatch) {
        const [, year, month, day] = yyyymmddMatch
        birthYear = parseInt(year)
        birthMonth = parseInt(month)
        birthDay = parseInt(day)
      }
      // Alternative format: DD-MM-YYYY
      else if (birthdate.match(/^(\d{2})-(\d{2})-(\d{4})$/)) {
        const ddmmyyyyMatch = birthdate.match(/^(\d{2})-(\d{2})-(\d{4})$/)!
        const [, day, month, year] = ddmmyyyyMatch
        birthYear = parseInt(year)
        birthMonth = parseInt(month)
        birthDay = parseInt(day)
      }
      // Fallback: Try YYYY format only
      else if (birthdate.match(/^\d{4}$/)) {
        birthYear = parseInt(birthdate)
        birthMonth = 1 // Default to January
        birthDay = 1   // Default to 1st
      }
      else {
        console.warn(`[Compare] Unrecognized birthdate format: "${birthdate}"`)
        return '25' // Default age
      }

      if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) {
        console.warn(`[Compare] Failed to parse date components from: "${birthdate}"`)
        return '25' // Default age
      }

      const today = new Date()
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth() + 1 // 0-indexed
      const currentDay = today.getDate()

      // Calculate age considering birth month and day
      let age = currentYear - birthYear
      if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
        age--
      }

      // Validate and clamp age to reasonable range
      if (age < 16) age = 18 // Min professional age
      if (age > 45) age = 35 // Max realistic professional age

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Compare] Age calculation: "${birthdate}" → ${birthYear}-${birthMonth}-${birthDay} → ${age} years old`)
      }

      return age.toString()
    } catch (e) {
      console.error(`[Compare] Error calculating age from "${birthdate}":`, e)
      return '25' // Default age on error
    }
  }

  // Filter players with priority to watchlist
  function getFilteredPlayers(search: string, excludeId?: string) {
    const normalizedSearch = search.toLowerCase()

    const watchlistPlayers = watchlist
      .filter(w => {
        const isExcluded = excludeId && String(w.player_id) === excludeId
        if (isExcluded) return false
        if (!search) return true
        return w.player_name?.toLowerCase().includes(normalizedSearch) ||
               w.club?.toLowerCase().includes(normalizedSearch)
      })
      .map(w => ({
        playerID: w.player_id,
        fullName: w.player_name,
        teamName: w.club,
        playerPhoto: w.player_photo || `https://api.statorium.com/media/bearleague/bl${w.player_id}.webp`,
        position: w.position,
        isWatchlist: true
      }))

    const otherPlayers = allPlayers
      .filter(p => {
        const isExcluded = excludeId && String(p.playerID) === excludeId
        const isAlreadyInWatchlist = watchlistPlayers.some(w => w.playerID === String(p.playerID))
        if (isExcluded || isAlreadyInWatchlist) return false
        if (!search) return false
        return p.fullName?.toLowerCase().includes(normalizedSearch) ||
               p.teamName?.toLowerCase().includes(normalizedSearch)
      })
      .map(p => ({
        ...p,
        playerPhoto: p.playerPhoto || p.photo || `https://api.statorium.com/media/bearleague/bl${p.playerID}.webp`
      }))

    return [...watchlistPlayers, ...otherPlayers].slice(0, 20)
  }

  // Handle search with better error handling
  async function handleSearch(query: string) {
    if (query.length < 2) {
      setAllPlayers([])
      return
    }
    try {
      const results = await searchPlayersAction(query)
      setAllPlayers(results || [])
    } catch (e) {
      console.error('Search failed', e)
      setAllPlayers([])
    }
  }

  React.useEffect(() => {
    const timeout1 = setTimeout(() => handleSearch(search1), 300)
    const timeout2 = setTimeout(() => handleSearch(search2), 300)
    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
    }
  }, [search1, search2])

  // Animate stats when players change with smooth transitions
  React.useEffect(() => {
    if (player1 && player2) {
      // Reset debug logging flag for new comparison
      hasLoggedKeys = false

      const stats = getStatsComparison()

      // Initialize animated stats with 0
      const initialAnimatedStats: { [key: string]: number } = {}
      stats.forEach(stat => {
        initialAnimatedStats[stat.category] = 0
      })
      setAnimatedStats(initialAnimatedStats)

      // Animate each stat separately
      stats.forEach(stat => {
        const key = stat.category
        const target = stat.p1Value
        const duration = 1200 // 1.2s animation
        const startTime = Date.now()

        const animate = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)

          // Easing function for smooth animation
          const easeOutQuart = 1 - Math.pow(1 - progress, 4)
          const current = target * easeOutQuart

          // Update state with animated value
          setAnimatedStats(prev => ({
            ...prev,
            [key]: current
          }))

          if (progress < 1) {
            requestAnimationFrame(animate)
          } else {
            // Ensure final value is exactly the target
            setAnimatedStats(prev => ({
              ...prev,
              [key]: target
            }))
          }
        }
        animate()
      })
    }
  }, [player1, player2])

  function getCountryName(country?: string | { name: string }): string {
    if (!country) return 'N/A'
    return typeof country === 'string' ? country : country.name
  }

  // Track if we've logged available keys
  let hasLoggedKeys = false

  // Enhanced stat key alternatives mapping for robust extraction
  const STAT_KEY_ALTERNATIVES: Record<string, string[]> = {
    'Goals': ['Goals', 'goals', 'goal', 'Goal', 'gols', 'Gols', 'TotalGoals', 'total_goals'],
    'Assist': ['Assist', 'assist', 'assists', 'Assists', 'Assists_', 'TotalAssists', 'total_assists'],
    'played': ['played', 'appearances', 'matches', 'Matches', 'Appearances', 'career_lineup', 'match_played', 'match_played_count'],
    'career_minutes': ['career_minutes', 'minutes_played', 'Minutes', 'minutes', 'time_played', 'total_minutes', 'total_time_played'],
    'Yellow card': ['Yellow card', 'yellow_cards', 'yellowCards', 'YellowCards', 'Yellow_Cards', 'yellow_card', 'YellowCard'],
    'Red card': ['Red card', 'red_cards', 'redCards', 'RedCards', 'Red_Cards', 'red_card', 'RedCard']
  }

  /**
   * Enhanced extractStat function that properly handles string-to-number parsing
   * and provides comprehensive fallbacks for Statorium API data extraction
   *
   * Sums statistics across all seasons in the stat array for comprehensive comparison
   *
   * @param player - Player details object containing stat array
   * @param statKey - Exact key to extract from stat entries (e.g., 'Goals', 'Assist')
   * @returns Summed numeric value across all seasons or 0 if not available
   */
  function extractStat(player: PlayerDetails, statKey: string): number {
    if (!player || !player.stat || !Array.isArray(player.stat) || player.stat.length === 0) {
      console.warn(`[Compare] No stat array available for ${player?.fullName || 'player'}`)
      return 0
    }

    try {
      let totalValue = 0
      let foundKey = false
      const usedKeys = new Set<string>()

      // Sum values from all seasons
      for (const seasonStat of player.stat) {
        if (!seasonStat) continue

        // Debug: Show available keys in first season
        if (process.env.NODE_ENV === 'development' && !hasLoggedKeys) {
          const keys = Object.keys(seasonStat)
          console.log(`[Compare] === DEBUG STAT EXTRACTION ===`)
          console.log(`[Compare] Player: ${player.fullName}`)
          console.log(`[Compare] Available keys in season stat:`, keys)
          console.log(`[Compare] Looking for primary key: "${statKey}"`)
          console.log(`[Compare] Primary key exists?`, statKey in seasonStat)
          console.log(`[Compare] Full season stat object:`, seasonStat)
          hasLoggedKeys = true
        }

        // Try primary key first (exact match from API schema)
        let value = seasonStat[statKey]
        let usedKey = statKey

        // If primary key not found, try alternatives for robustness
        if (value === undefined && STAT_KEY_ALTERNATIVES[statKey]) {
          for (const altKey of STAT_KEY_ALTERNATIVES[statKey]) {
            if (seasonStat[altKey] !== undefined) {
              value = seasonStat[altKey]
              usedKey = altKey
              break
            }
          }
        }

        // Process found value
        if (value !== undefined && value !== null && value !== '') {
          foundKey = true
          usedKeys.add(usedKey)

          // Convert string to number with robust parsing
          // Example: "8" → 8, "30" → 30, "1561" → 1561
          const stringValue = String(value).trim()
          const numValue = parseFloat(stringValue)

          if (!isNaN(numValue)) {
            totalValue += numValue
          } else {
            console.warn(`[Compare] Failed to parse "${statKey}" value "${stringValue}" as number for ${player.fullName}`)
          }
        }
      }

      // Handle case where key was never found
      if (!foundKey) {
        console.warn(`[Compare] Stat "${statKey}" not found in any season for ${player.fullName}`)
        return 0
      }

      // Log successful extraction
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Compare] ✓ Successfully extracted "${statKey}" from ${usedKeys.size} seasons: total = ${totalValue}`)
      }

      return totalValue
    } catch (e) {
      console.error(`[Compare] ❌ Error extracting stat "${statKey}" for ${player?.fullName || 'player'}:`, e)
      return 0
    }
  }

  /**
   * Calculate stats comparison using enhanced extractStat function
   * All values are properly parsed from strings to numbers for progress bar calculations
   */
  function getStatsComparison(): StatsComparison[] {
    if (!player1 && !player2) return []

    const stats: StatsComparison[] = []

    // Debug log the stat data structure
    if (process.env.NODE_ENV === 'development') {
      console.log('[Compare] === COMPARISON DEBUG ===')
      console.log('[Compare] Player 1:', player1?.fullName, 'stat array length:', player1?.stat?.length)
      console.log('[Compare] Player 2:', player2?.fullName, 'stat array length:', player2?.stat?.length)
      console.log('[Compare] Player 1 first stat entry:', player1?.stat?.[0])
      console.log('[Compare] Player 2 first stat entry:', player2?.stat?.[0])
    }

    // Goals - Statorium API key: "Goals" (capital G, confirmed from API)
    const goals1 = player1 ? extractStat(player1, 'Goals') : 0
    const goals2 = player2 ? extractStat(player2, 'Goals') : 0
    stats.push({
      category: 'Goals (Career)',
      icon: <Goal className="w-5 h-5" />,
      p1Value: goals1,
      p2Value: goals2,
      p1Label: `${goals1}`,
      p2Label: `${goals2}`,
      color: 'text-green-500',
      unit: 'goals'
    })

    // Assists - Statorium API key: "Assist" (capital A, singular, confirmed from API)
    const assists1 = player1 ? extractStat(player1, 'Assist') : 0
    const assists2 = player2 ? extractStat(player2, 'Assist') : 0
    stats.push({
      category: 'Assists (Career)',
      icon: <Target className="w-5 h-5" />,
      p1Value: assists1,
      p2Value: assists2,
      p1Label: `${assists1}`,
      p2Label: `${assists2}`,
      color: 'text-blue-500',
      unit: 'assists'
    })

    // Matches Played - Statorium API key: "played" (lowercase, confirmed from API)
    const matches1 = player1 ? extractStat(player1, 'played') : 0
    const matches2 = player2 ? extractStat(player2, 'played') : 0
    stats.push({
      category: 'Matches Played (Career)',
      icon: <Shield className="w-5 h-5" />,
      p1Value: matches1,
      p2Value: matches2,
      p1Label: `${matches1}`,
      p2Label: `${matches2}`,
      color: 'text-purple-500',
      unit: 'matches'
    })

    // Minutes Played - Statorium API key: "career_minutes" (lowercase with underscore, confirmed from API)
    const minutes1 = player1 ? extractStat(player1, 'career_minutes') : 0
    const minutes2 = player2 ? extractStat(player2, 'career_minutes') : 0
    stats.push({
      category: 'Minutes Played (Career)',
      icon: <Clock className="w-5 h-5" />,
      p1Value: minutes1,
      p2Value: minutes2,
      p1Label: `${Math.round(minutes1)}`,
      p2Label: `${Math.round(minutes2)}`,
      color: 'text-orange-500',
      unit: 'minutes'
    })

    // Yellow Cards - Statorium API key: "Yellow card" (capital Y, space, lowercase c, confirmed from API)
    const yellow1 = player1 ? extractStat(player1, 'Yellow card') : 0
    const yellow2 = player2 ? extractStat(player2, 'Yellow card') : 0
    stats.push({
      category: 'Yellow Cards (Career)',
      icon: <Star className="w-5 h-5" />,
      p1Value: yellow1,
      p2Value: yellow2,
      p1Label: `${yellow1}`,
      p2Label: `${yellow2}`,
      color: 'text-yellow-500',
      unit: 'cards'
    })

    // Red Cards - Statorium API key: "Red card" (capital R, space, lowercase c, confirmed from API)
    const red1 = player1 ? extractStat(player1, 'Red card') : 0
    const red2 = player2 ? extractStat(player2, 'Red card') : 0
    stats.push({
      category: 'Red Cards (Career)',
      icon: <Award className="w-5 h-5" />,
      p1Value: red1,
      p2Value: red2,
      p1Label: `${red1}`,
      p2Label: `${red2}`,
      color: 'text-red-600',
      unit: 'cards'
    })

    // Summary of extracted values for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Compare] === EXTRACTED STATS SUMMARY ===')
      stats.forEach(stat => {
        console.log(`[Compare] ${stat.category}: P1=${stat.p1Value} | P2=${stat.p2Value}`)
      })
    }

    return stats
  }

  /**
   * Calculate winner percentage for progress bars
   * Properly handles all edge cases including NaN, zeros, and single player values
   *
   * @param p1 - Player 1's numeric value (already parsed from string)
   * @param p2 - Player 2's numeric value (already parsed from string)
   * @returns Percentage (0-100) for Player 1's progress bar width
   */
  function getWinnerPercentage(p1: number, p2: number): number {
    // Validate inputs are numbers
    const num1 = typeof p1 === 'number' && !isNaN(p1) ? p1 : 0
    const num2 = typeof p2 === 'number' && !isNaN(p2) ? p2 : 0

    // Handle case when both players have 0 (draw)
    if (num1 === 0 && num2 === 0) {
      return 50
    }

    // Handle case when only Player 1 has data
    if (num1 > 0 && num2 === 0) {
      return 100
    }

    // Handle case when only Player 2 has data
    if (num1 === 0 && num2 > 0) {
      return 0
    }

    // Calculate percentage for progress bar
    // Formula: (p1 / (p1 + p2)) * 100
    const total = num1 + num2
    const percentage = (num1 / total) * 100

    // Ensure percentage is within valid range and round to integer
    const rounded = Math.round(Math.max(0, Math.min(100, percentage)))

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Compare] Progress calculation: P1=${num1} | P2=${num2} | Total=${total} | Percentage=${rounded}%`)
    }

    return rounded
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 shadow-[0_0_30px_rgba(0,255,136,0.2)]">
              <ArrowRightLeft className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
              Player Comparison
            </h1>
          </div>
          <p className="text-slate-400 text-lg">Select two players to compare their performance statistics</p>
        </div>


        {/* Player Selectors */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Player 1 Selector */}
          <div className="relative">
            <label className="block text-sm font-bold mb-3 text-green-500 uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Player 1
            </label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Search players..."
                value={search1}
                onChange={(e) => setSearch1(e.target.value)}
                onFocus={() => setOpen1(true)}
                className="w-full px-4 py-4 pl-12 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/30 text-white placeholder-slate-500 transition-all duration-300 hover:border-slate-600"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              {player1 && (
                <button
                  onClick={clearPlayer1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 hover:bg-red-500/20 p-1.5 rounded-lg transition-all"
                  title="Clear Player 1"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {open1 && !player1 && (
              <>
                <div className="absolute z-50 w-full mt-2 bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                  {watchlist.length > 0 && search1.length === 0 && (
                    <div className="p-3 bg-green-500/10 border-b border-green-500/20">
                      <p className="text-xs font-bold text-green-400 uppercase tracking-wider">★ Watchlist</p>
                    </div>
                  )}
                  {getFilteredPlayers(search1, player2?.playerID).map((player) => (
                    <button
                      key={player.playerID}
                      onClick={() => {
                        loadPlayerDetails(player.playerID, 1)
                        setOpen1(false)
                        setSearch1('')
                      }}
                      className={`w-full flex items-center gap-4 p-4 hover:bg-slate-800/80 text-left transition-all duration-200 ${(player as any).isWatchlist ? 'bg-green-500/5 hover:bg-green-500/10' : ''}`}
                    >
                      <PlayerAvatar photo={player.playerPhoto} size={48} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate group-hover:text-green-400 transition-colors">{player.fullName}</p>
                        <p className="text-sm text-slate-500 truncate">{player.teamName || 'N/A'}</p>
                      </div>
                      {(player as any).isWatchlist && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] font-bold">★</Badge>
                      )}
                    </button>
                  ))}
                  {getFilteredPlayers(search1, player2?.playerID).length === 0 && (
                    <div className="p-6 text-center text-sm text-slate-500">
                      {search1.length >= 2 ? 'No players found' : 'Type at least 2 characters to search...'}
                    </div>
                  )}
                </div>
                <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen1(false)} />
              </>
            )}
          </div>

          {/* Player 2 Selector */}
          <div className="relative">
            <label className="block text-sm font-bold mb-3 text-emerald-500 uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Player 2
            </label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Search players..."
                value={search2}
                onChange={(e) => setSearch2(e.target.value)}
                onFocus={() => setOpen2(true)}
                className="w-full px-4 py-4 pl-12 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 text-white placeholder-slate-500 transition-all duration-300 hover:border-slate-600"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              {player2 && (
                <button
                  onClick={clearPlayer2}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 hover:bg-red-500/20 p-1.5 rounded-lg transition-all"
                  title="Clear Player 2"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {open2 && !player2 && (
              <>
                <div className="absolute z-50 w-full mt-2 bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                  {watchlist.length > 0 && search2.length === 0 && (
                    <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20">
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">★ Watchlist</p>
                    </div>
                  )}
                  {getFilteredPlayers(search2, player1?.playerID).map((player) => (
                    <button
                      key={player.playerID}
                      onClick={() => {
                        loadPlayerDetails(player.playerID, 2)
                        setOpen2(false)
                        setSearch2('')
                      }}
                      className={`w-full flex items-center gap-4 p-4 hover:bg-slate-800/80 text-left transition-all duration-200 ${(player as any).isWatchlist ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : ''}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden flex-shrink-0 border-2 border-slate-700 group-hover:border-emerald-500/50 transition-all">
                        {player.playerPhoto ? (
                          <img src={player.playerPhoto} alt={player.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserCircle className="w-6 h-6 text-slate-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">{player.fullName}</p>
                        <p className="text-sm text-slate-500 truncate">{player.teamName || 'N/A'}</p>
                      </div>
                      {(player as any).isWatchlist && (
                        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">★</Badge>
                      )}
                    </button>
                  ))}
                  {getFilteredPlayers(search2, player1?.playerID).length === 0 && (
                    <div className="p-6 text-center text-sm text-slate-500">
                      {search2.length >= 2 ? 'No players found' : 'Type at least 2 characters to search...'}
                    </div>
                  )}
                </div>
                <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen2(false)} />
              </>
            )}
          </div>
        </div>

        {/* Duplicate Error Message */}
        {duplicateError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 animate-pulse">
            <X className="w-5 h-5 text-red-500" />
            <span className="text-red-400 font-semibold">{duplicateError}</span>
          </div>
        )}

        {/* Player Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            {player1 ? (
              <PlayerCard player={player1} color="green" onClear={clearPlayer1} loading={loading1} isWinner={calculateOverallWinner().winner === 'p1'} />
            ) : (
              <div className="border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-800/30 flex items-center justify-center py-20">
                <div className="text-center">
                  <UserCircle className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Select Player 1 to start comparison</p>
                </div>
              </div>
            )}
          </div>

          <div>
            {player2 ? (
              <PlayerCard player={player2} color="emerald" onClear={clearPlayer2} loading={loading2} isWinner={calculateOverallWinner().winner === 'p2'} />
            ) : (
              <div className="border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-800/30 flex items-center justify-center py-20">
                <div className="text-center">
                  <UserCircle className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Select Player 2 to complete comparison</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Comparison */}
        {player1 && player2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-bold text-white">Statistics Comparison</h2>
            </div>

            {getStatsComparison().map((stat, index) => {
              const p1Percent = getWinnerPercentage(stat.p1Value, stat.p2Value)
              const winner = p1Percent > 50 ? 'p1' : p1Percent < 50 ? 'p2' : 'tie'
              const animatedP1 = animatedStats[stat.category] || 0
              const animatedP1Percent = getWinnerPercentage(animatedP1, stat.p2Value)

              // Dynamic colors based on who has higher value
              // Player 1 (left) → green (#00e676), Player 2 (right) → red-orange (#ff5252)
              let p1BarClass = ''
              let p2BarClass = ''
              let p1TextClass = ''
              let p2TextClass = ''

              if (stat.p1Value > stat.p2Value) {
                // Player 1 wins - Player 1 gets green, Player 2 gets red-orange
                p1BarClass = 'bg-gradient-to-r from-green-600 via-[#00e676] to-green-400 shadow-[0_0_20px_rgba(0,230,118,0.3)]'
                p2BarClass = 'bg-gradient-to-l from-red-600 via-[#ff5252] to-orange-400 shadow-[0_0_20px_rgba(255,82,82,0.2)]'
                p1TextClass = 'text-[#00e676]'
                p2TextClass = 'text-[#ff5252]'
              } else if (stat.p2Value > stat.p1Value) {
                // Player 2 wins - Player 1 gets red-orange, Player 2 gets green
                p1BarClass = 'bg-gradient-to-r from-red-600 via-[#ff5252] to-orange-400 shadow-[0_0_20px_rgba(255,82,82,0.2)]'
                p2BarClass = 'bg-gradient-to-l from-green-600 via-[#00e676] to-green-400 shadow-[0_0_20px_rgba(0,230,118,0.3)]'
                p1TextClass = 'text-[#ff5252]'
                p2TextClass = 'text-[#00e676]'
              } else {
                // Equal values - both get neutral colors (blue/gray)
                p1BarClass = 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400'
                p2BarClass = 'bg-gradient-to-l from-blue-600 via-blue-500 to-blue-400'
                p1TextClass = 'text-blue-400'
                p2TextClass = 'text-blue-400'
              }

              return (
                <Card key={index} className="bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex items-center gap-3 ${stat.color}`}>
                        {stat.icon}
                        <span className="font-bold text-white text-lg">{stat.category}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-semibold">
                        <span className={`transition-all duration-300 ${winner === 'p1' ? 'scale-110' : ''} ${p1TextClass}`}>
                          {stat.p1Label}
                        </span>
                        <span className="text-slate-600">vs</span>
                        <span className={`transition-all duration-300 ${winner === 'p2' ? 'scale-110' : ''} ${p2TextClass}`}>
                          {stat.p2Label}
                        </span>
                      </div>
                    </div>

                    {/* Animated Progress Bar with Dynamic Colors */}
                    <div className="relative h-8 bg-slate-900/50 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`absolute top-0 left-0 h-full transition-all duration-1200 ease-out ${p1BarClass}`}
                        style={{
                          width: `${animatedP1Percent}%`
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 animate-pulse" />
                      </div>
                      <div
                        className={`absolute top-0 right-0 h-full transition-all duration-1200 ease-out ${p2BarClass}`}
                        style={{
                          width: `${100 - animatedP1Percent}%`
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-l from-white/10 to-transparent animate-pulse" />
                      </div>
                    </div>

                    {/* Animated Percentages with Dynamic Colors */}
                    <div className="flex justify-between mt-4 text-xs font-bold">
                      <span className={`text-lg transition-all duration-300 ${winner === 'p1' ? 'scale-110' : ''} ${p1TextClass}`}>
                        {Math.round(animatedP1Percent)}%
                      </span>
                      <span className={`text-lg transition-all duration-300 ${winner === 'p2' ? 'scale-110' : ''} ${p2TextClass}`}>
                        {100 - Math.round(animatedP1Percent)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {(loading1 || loading2) && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-green-500" />
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl" />
            </div>
            <p className="text-sm text-slate-400 mt-4 font-medium animate-pulse">Loading player data...</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PlayerCard({ player, color, onClear, loading, isWinner }: { player: PlayerDetails; color: 'green' | 'emerald'; onClear: () => void; loading?: boolean; isWinner?: boolean }) {
  const colorClasses = {
    green: {
      border: 'border-green-500/30',
      bg: 'bg-gradient-to-br from-green-500/10 to-emerald-500/5',
      glow: isWinner ? 'shadow-[0_0_40px_rgba(34,197,94,0.4)]' : 'shadow-[0_0_30px_rgba(34,197,94,0.2)]',
      text: 'text-green-400',
      winnerBorder: isWinner ? 'border-green-400/50' : ''
    },
    emerald: {
      border: 'border-emerald-500/30',
      bg: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5',
      glow: isWinner ? 'shadow-[0_0_40px_rgba(16,185,129,0.4)]' : 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
      text: 'text-emerald-400',
      winnerBorder: isWinner ? 'border-emerald-400/50' : ''
    }
  }

  const c = colorClasses[color]

  if (loading) {
    return (
      <Card className={`${c.bg} ${c.border} ${c.glow} relative overflow-hidden`}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
            </div>
            <p className="text-sm text-slate-400 font-medium">Loading player data from Statorium API...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Extract data from Statorium API schema with comprehensive fallbacks
  // Priority: teams[] -> stat[0].team_name -> currentTeam -> fallbacks
  const teamName = (player as any).teams?.[0]?.teamName ||
                  player.stat?.[0]?.team_name ||
                  player.currentTeam?.name ||
                  player.teamName ||
                  'Unknown Club'

  // Extract league from stat array with proper cup competition filtering
  let league = ''

  // Cup competition keywords to filter out
  const CUP_KEYWORDS = [
    'cup', 'champions', 'europa', 'conference', 'nations league',
    'friendl', 'world cup', 'euro', 'qualif', 'super cup',
    'community shield', 'copa del rey', 'coupe de france',
    'dfb pokal', 'coppa italia', 'taca', 'supercopa',
    'supercoppa', 'shield', 'trophy', 'tournament', 'playoff'
  ]

  const isCupCompetition = (seasonName: string) => {
    const lowerSeasonName = seasonName.toLowerCase()
    return CUP_KEYWORDS.some(keyword => lowerSeasonName.includes(keyword))
  }

  if (player.stat && player.stat.length > 0) {
    // Step 2: Determine current team name
    const currentTeamName = player.teams?.[0]?.teamName ||
                           player.currentTeam?.name ||
                           player.team?.fullName ||
                           player.teamName ||
                           ''

    // Step 3: Filter stats by current team name
    const relevantStats = player.stat.filter((stat: any) => {
      const teamName = stat.team_name || stat.teamName || ''
      return teamName.toLowerCase() === currentTeamName.toLowerCase()
    })

    // Step 4: Filter out cup competitions
    const domesticLeagueStats = relevantStats.filter((stat: any) => {
      const seasonName = stat.season_name || ''
      return !isCupCompetition(seasonName)
    })

    // Step 5: Select entry with highest season_id
    let latest = domesticLeagueStats.sort((a: any, b: any) => {
      const aId = Number(a.season_id || '0')
      const bId = Number(b.season_id || '0')
      return bId - aId
    })[0]

    // Step 6: Fallback if no relevant stats found
    if (!latest) {
      // Try all stats with cup filter
      const allDomesticStats = player.stat.filter((stat: any) => {
        const seasonName = stat.season_name || ''
        return !isCupCompetition(seasonName)
      })

      latest = allDomesticStats.sort((a: any, b: any) => {
        const aId = Number(a.season_id || '0')
        const bId = Number(b.season_id || '0')
        return bId - aId
      })[0]
    }

    // Step 7: Extract league name using utility function
    if (latest && latest.season_name) {
      league = extractLeagueName(latest.season_name)
    }
  }

  // Final fallback to player.league or team name mapping
  if (!league) {
    league = player.league || getLeagueFromTeam(teamName)
  }

  // Final fallback if still empty
  if (!league) {
    league = 'Unknown League'
  }

  const position = player.position || 'N/A'
  const photo = player.photo || player.playerPhoto
  const height = player.additionalInfo?.height || (player as any).height
  const weight = player.additionalInfo?.weight || (player as any).weight
  const age = player.age || '25' // Default age if not calculated
  const marketValue = player.marketValue || 'N/A' // Show market value even if it's from fallback

  return (
    <Card className={`${c.bg} ${c.border} ${c.winnerBorder} ${c.glow} relative overflow-hidden transition-all duration-300 hover:scale-[1.02] group`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClear}
        className="absolute top-4 right-4 z-10 bg-red-500/20 hover:bg-red-500/40 hover:text-red-400 transition-all opacity-100"
        title="Clear player"
      >
        <X className="w-4 h-4" />
      </Button>
      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center">
          <div className={`w-28 h-28 rounded-full bg-slate-800/50 overflow-hidden mb-6 border-4 ${c.border} ${c.glow} transition-all duration-300 hover:scale-110`}>
            <PlayerPhotoWithFallback
              photoUrl={photo}
              playerName={player.fullName}
              className="w-full h-full object-cover"
            />
          </div>

          <h3 className="text-2xl font-bold mb-4 text-white">{player.fullName}</h3>
          {player.shortName && player.shortName !== player.fullName && (
            <p className="text-sm text-slate-400 mb-4">{player.shortName}</p>
          )}

          <div className="space-y-3 text-sm w-full bg-slate-800/50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Position:</span>
              <span className={`font-bold ${c.text}`}>{position}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Club:</span>
              <span className="font-bold text-white">{teamName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">League:</span>
              <span className="font-bold text-white">{league}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Nationality:</span>
              <span className="font-bold text-white">{getCountryName(player.country)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Age:</span>
              <span className={`font-bold ${c.text}`}>{age}</span>
            </div>
            {height && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Height:</span>
                <span className="font-bold text-white">{height}</span>
              </div>
            )}
            {weight && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Weight:</span>
                <span className="font-bold text-white">{weight}</span>
              </div>
            )}
            {player.birthdate && player.birthdate !== 'N/A' && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-700/30">
                <span className="text-slate-500 text-xs">Birthdate:</span>
                <span className="text-slate-400 text-xs">{player.birthdate}</span>
              </div>
            )}
            {player.stat && player.stat.length > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-700/30">
                <span className="text-slate-500 text-xs">Seasons Data:</span>
                <span className="text-slate-400 text-xs">{player.stat.length} season(s)</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getCountryName(country?: string | { name: string }): string {
  if (!country) return 'N/A'
  return typeof country === 'string' ? country : country.name
}
