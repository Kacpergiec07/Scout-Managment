"use client"

import React, { useState, useEffect, memo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  UserMinus,
  Plus,
  Shield,
  MapPin,
  Activity,
  Award,
  TrendingUp,
  X,
  Loader2,
  ChevronLeft,
} from "lucide-react"
import { MarketValue } from "@/components/scout/market-value"
import {
  getPlayerDetailsAction,
  searchPlayersAction,
  getTeamLogoAction,
  getTopLeaguesClubsAction,
  getPlayersByClubAction,
  getAllTop5PlayersAction,
} from "@/app/actions/statorium"
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "@/app/actions/watchlist"

const LEAGUE_ID_MAP: Record<string, string> = {
  "Premier League": "515",
  "La Liga": "558",
  "Serie A": "511",
  Bundesliga: "521",
  "Ligue 1": "519",
}

const LEAGUE_LOGOS: Record<string, string> = {
  "Premier League": "https://cdn.futwiz.com/assets/img/fc24/leagues/13.png",
  Bundesliga: "https://cdn.futwiz.com/assets/img/fc24/leagues/19.png",
  "La Liga": "https://cdn.futwiz.com/assets/img/fc24/leagues/53.png",
  "Serie A": "https://cdn.futwiz.com/assets/img/fc24/leagues/31.png",
  "Ligue 1": "https://cdn.futwiz.com/assets/img/fc24/leagues/16.png",
}

const POSITION_COORDINATES: Record<string, { top: string; left: string }> = {
  GK: { top: "85%", left: "50%" },
  CB: { top: "70%", left: "50%" },
  LCB: { top: "70%", left: "35%" },
  RCB: { top: "70%", left: "65%" },
  LB: { top: "65%", left: "15%" },
  RB: { top: "65%", left: "85%" },
  LWB: { top: "60%", left: "15%" },
  RWB: { top: "60%", left: "85%" },
  CDM: { top: "55%", left: "50%" },
  LDM: { top: "55%", left: "40%" },
  RDM: { top: "55%", left: "60%" },
  CM: { top: "45%", left: "50%" },
  LCM: { top: "45%", left: "35%" },
  RCM: { top: "45%", left: "65%" },
  LM: { top: "40%", left: "20%" },
  RM: { top: "40%", left: "80%" },
  CAM: { top: "30%", left: "50%" },
  LAM: { top: "30%", left: "30%" },
  RAM: { top: "30%", left: "70%" },
  LW: { top: "20%", left: "20%" },
  RW: { top: "20%", left: "80%" },
  ST: { top: "10%", left: "50%" },
  CF: { top: "15%", left: "50%" },
  LS: { top: "12%", left: "35%" },
  RS: { top: "12%", left: "65%" },
  FW: { top: "15%", left: "50%" },
  DF: { top: "70%", left: "50%" },
  MF: { top: "45%", left: "50%" },
}

interface Player {
  id: string
  playerId: string // Database record ID for unique keys
  name: string
  club: string
  clubLogo: string | null
  position: string
  league: string
  playerPhoto: string
  marketValue: string
  weight: string
  height: string
  age: string
  birthdate?: string
}

const WatchlistCard = memo(({ player, selected, onClick, onRemove }: any) => (
  <motion.div
    layout
    onClick={onClick}
    className={`group relative cursor-pointer overflow-hidden rounded-xl border p-3 transition-all ${
      selected
        ? "border-green-500/30 bg-green-500/10"
        : "border-border bg-accent/40 hover:border-foreground/20"
    }`}
  >
    <div className="relative z-10 flex items-center gap-4">
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary">
        <Image
          src={player.playerPhoto}
          alt={player.name}
          fill
          sizes="56px"
          className="object-cover"
        />
        <span className="absolute inset-0 -z-10 flex items-center justify-center bg-secondary text-[10px] font-black tracking-tighter text-foreground/20 uppercase">
          {player.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-widest text-green-400 uppercase">
            {player.position}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="p-1 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
          >
            <UserMinus className="h-4 w-4" />
          </button>
        </div>
        <h3 className="truncate text-sm font-bold tracking-tighter uppercase">
          {player.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] font-medium text-muted-foreground uppercase">
            {player.club}
          </span>
        </div>
      </div>
    </div>
    <MarketValue 
      playerName={player.name} 
      showIcon={false} 
      className="absolute bottom-3 right-3 origin-right" 
    />
  </motion.div>
))

WatchlistCard.displayName = "WatchlistCard"

export default function WatchlistPage() {
  const router = useRouter()
  const [watchedPlayers, setWatchedPlayers] = useState<Player[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadingWatchlist, setLoadingWatchlist] = useState(false)

  useEffect(() => {
    async function loadWatchlistFromSupabase() {
      setLoadingWatchlist(true)
      const data = await getWatchlist()

      // Always update state, even if data is empty
      // Use database record id as unique key to prevent React key errors
      const transformedData = (data || []).map((item: any) => ({
        id: item.id, // ← Use database record ID as unique key
        playerId: item.player_id, // ← Keep player_id for operations
        name: item.player_name,
        club: item.club,
        clubLogo: item.club_logo,
        position: item.position,
        league: item.league,
        playerPhoto: item.player_photo,
        marketValue: item.market_value,
        weight: item.weight,
        height: item.height,
        age: item.age,
      }))

      setWatchedPlayers(transformedData)
      setIsLoaded(true)
      setLoadingWatchlist(false)
    }

    loadWatchlistFromSupabase()
  }, [])

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !selectedPlayerId && watchedPlayers.length > 0) {
      setSelectedPlayerId(watchedPlayers[0].id)
    }
  }, [isLoaded, watchedPlayers, selectedPlayerId])

  const [selectedDetails, setSelectedDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const [showSearch, setShowSearch] = useState(false)
  const [searchStep, setSearchStep] = useState<"league" | "club" | "player">(
    "league"
  )
  const [activeLeague, setActiveLeague] = useState<any>(null)
  const [activeClub, setActiveClub] = useState<any>(null)
  const [clubs, setClubs] = useState<any[]>([])
  const [clubPlayers, setClubPlayers] = useState<any[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)

  // New search functionality state
  const [filters, setFilters] = useState<{
    league: string | null
    club: string | null
    position: string | null
    ageMin: number | null
    ageMax: number | null
    valueMin: number | null
    valueMax: number | null
  }>({
    league: null,
    club: null,
    position: null,
    ageMin: null,
    ageMax: null,
    valueMin: null,
    valueMax: null,
  })
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchComplete, setSearchComplete] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [availableClubs, setAvailableClubs] = useState<any[]>([])
  const [showClubDropdown, setShowClubDropdown] = useState(false)

  const activePlayer =
    watchedPlayers.find((p) => p.id === selectedPlayerId) ||
    watchedPlayers[0] ||
    null

  useEffect(() => {
    if (selectedPlayerId) {
      loadPlayerDetails(selectedPlayerId)
    }
  }, [selectedPlayerId])

  // Fetch available clubs when a league is selected
  useEffect(() => {
    async function fetchClubsForLeague() {
      if (filters.league) {
        const leagueId = LEAGUE_ID_MAP[filters.league]
        if (leagueId) {
          const allClubs = await getTopLeaguesClubsAction()
          const clubsInLeague = allClubs.filter((c: any) => c.seasonId === leagueId)
          setAvailableClubs(clubsInLeague)
        }
      } else {
        setAvailableClubs([])
      }
    }
    fetchClubsForLeague()
  }, [filters.league])

  async function loadPlayerDetails(recordId: string) {
    setLoadingDetails(true)

    // Find the player by record ID to get the player_id for the API call
    const player = watchedPlayers.find(p => p.id === recordId)
    if (!player) {
      console.error('loadPlayerDetails: Player not found with record ID:', recordId)
      setLoadingDetails(false)
      return
    }

    console.log('loadPlayerDetails: Loading details for player:', player.name, 'with player_id:', player.playerId)
    const details = await getPlayerDetailsAction(player.playerId)
    if (details) {
      const clubName = details.teamName || activePlayer?.club
      const leagueName = activePlayer?.league || "La Liga"
      const leagueId = LEAGUE_ID_MAP[leagueName] || "558"

      if (clubName) {
        const logo = await getTeamLogoAction(clubName, leagueId)
        if (logo) {
          ;(details as any).teamLogo = logo
        }
      }

      const detailedPhoto =
        (details as any).photo || (details as any).playerPhoto

      setWatchedPlayers((prev) =>
        prev.map((p) =>
          p.id === recordId
            ? {
                ...p,
                clubLogo: (details as any).teamLogo || p.clubLogo,
                playerPhoto: detailedPhoto || p.playerPhoto,
                weight: details.weight || p.weight,
                height: details.height || p.height,
                age: (details.age ||
                  (p.birthdate
                    ? String(
                        Math.floor(
                          (new Date().getTime() -
                            new Date((p as any).birthdate).getTime()) /
                            (365.25 * 24 * 60 * 60 * 1000)
                        )
                      )
                    : "---")) as string,
                position: details.position || p.position,
              }
            : p
        )
      )
    }

    setSelectedDetails(details)
    setLoadingDetails(false)
  }

  async function selectLeague(league: { id: string; name: string }) {
    setActiveLeague(league)
    setLoadingSearch(true)
    setSearchStep("club")
    const allClubs = await getTopLeaguesClubsAction()
    const leagueClubs = allClubs.filter((c: any) => c.seasonId === league.id)
    setClubs(leagueClubs)
    setLoadingSearch(false)
  }

  async function selectClub(club: any) {
    setActiveClub(club)
    setLoadingSearch(true)
    setSearchStep("player")
    const players = await getPlayersByClubAction(club.id, activeLeague.id)
    setClubPlayers(players)
    setLoadingSearch(false)
  }

  function resetSearch() {
    setSearchStep("league")
    setActiveLeague(null)
    setActiveClub(null)
    setClubs([])
    setClubPlayers([])
  }

  async function addPlayer(p: any) {
    const clubName = p.teamName || activeClub?.name || "Elite Club"
    const leagueName = activeLeague?.name || "Global League"

    const logo =
      p.logo ||
      activeClub?.logo ||
      (await getTeamLogoAction(clubName, undefined, p.teamID))

    let photo = p.playerPhoto || p.photo || p.photoUrl
    if (photo && !photo.startsWith("http")) {
      const cleanPath = photo.startsWith("/") ? photo : `/${photo}`
      photo = `https://api.statorium.com/media/bearleague${cleanPath}`
    }

    const playerData = {
      player_id: p.id || p.playerID,
      player_name: p.name || p.fullName || `${p.firstName} ${p.lastName}`,
      club: clubName,
      club_logo: logo,
      position: p.position || "N/A",
      league: leagueName,
      player_photo:
        photo ||
        `https://api.statorium.com/media/bearleague/bl${p.id || p.playerID}.webp`,
      market_value:
        p.marketValue || "€" + (Math.floor(Math.random() * 80) + 5) + "M",
      weight: p.additionalInfo?.weight || p.weight || "---",
      height: p.additionalInfo?.height || p.height || "---",
      age:
        p.additionalInfo?.age ||
        (p.birthdate
          ? String(
              Math.floor(
                (new Date().getTime() - new Date(p.birthdate).getTime()) /
                  (365.25 * 24 * 60 * 60 * 1000)
              )
            )
          : p.additionalInfo?.birthdate
            ? p.additionalInfo.birthdate
                .split(" ")
                .pop()
                ?.replace("(", "")
                .replace(")", "")
            : "---"),
    }

    const result = await addToWatchlist(playerData)

    if (result.error) {
      alert(`Failed to add player: ${result.error}`)
      return
    }

    if (result.success) {
      const updatedData = await getWatchlist()
      const transformedData = updatedData.map((item: any) => ({
        id: item.id, // ← Use database record ID as unique key
        playerId: item.player_id, // ← Keep player_id for operations
        name: item.player_name,
        club: item.club,
        clubLogo: item.club_logo,
        position: item.position,
        league: item.league,
        playerPhoto: item.player_photo,
        marketValue: item.market_value,
        weight: item.weight,
        height: item.height,
        age: item.age,
      }))
      setWatchedPlayers(transformedData)

      // Find the newly added player by player_id and set it as selected
      const newPlayer = transformedData.find(p => p.playerId === playerData.player_id)
      if (newPlayer) {
        setSelectedPlayerId(newPlayer.id)
      }
    }

    setShowSearch(false)
    resetSearch()
  }

  async function removePlayer(recordId: string) {
    console.log('removePlayer: Starting removal for record ID:', recordId)

    // Find the player by record ID to get the player_id
    const playerToRemove = watchedPlayers.find(p => p.id === recordId)

    if (!playerToRemove) {
      console.error('removePlayer: Player not found with record ID:', recordId)
      alert('Player not found in watchlist')
      return
    }

    console.log('removePlayer: Found player to remove:', playerToRemove.name, 'with player_id:', playerToRemove.playerId)

    const result = await removeFromWatchlist(playerToRemove.playerId)

    if (result.error) {
      alert(`Failed to remove player: ${result.error}`)
      return
    }

    if (result.success) {
      console.log('removePlayer: Player removed successfully, refreshing watchlist...')

      // Force a refresh of the watchlist
      const updatedData = await getWatchlist()
      console.log('removePlayer: Updated watchlist data:', updatedData)

      // Always update state, even if empty
      // Use database record id as unique key to prevent React key errors
      const transformedData = (updatedData || []).map((item: any) => ({
        id: item.id, // ← Use database record ID as unique key
        playerId: item.player_id, // ← Keep player_id for operations
        name: item.player_name,
        club: item.club,
        clubLogo: item.club_logo,
        position: item.position,
        league: item.league,
        playerPhoto: item.player_photo,
        marketValue: item.market_value,
        weight: item.weight,
        height: item.height,
        age: item.age,
      }))

      console.log('removePlayer: Setting watched players to:', transformedData)
      setWatchedPlayers(transformedData)

      // Update selected player if needed
      if (selectedPlayerId === recordId) {
        const newSelectedId = transformedData[0]?.id || null
        console.log('removePlayer: Updating selected player to:', newSelectedId)
        setSelectedPlayerId(newSelectedId)
      }
    }
  }

  // New search functions
  async function handleSearch() {
    setIsSearching(true)
    setSearchComplete(false)
    setSearchResults([])

    try {
      const leagueId = filters.league ? LEAGUE_ID_MAP[filters.league] : null

      // If we have a specific club filter, search that club's players (only within selected league)
      if (filters.club) {
        // Find clubs matching the filter, but only within selected league
        const allClubs = await getTopLeaguesClubsAction()
        const matchingClubs = allClubs.filter((c: any) => {
          const matchesLeague = leagueId ? c.seasonId === leagueId : true
          const matchesName = !filters.club || c.name?.toLowerCase().includes(filters.club.toLowerCase())
          return matchesLeague && matchesName
        })

        if (matchingClubs.length > 0) {
          const allPlayers = await Promise.all(
            matchingClubs.map((club: any) => getPlayersByClubAction(club.id, leagueId, true))
          )
          const flattenedPlayers = allPlayers.flat()
          setSearchResults(filterPlayers(flattenedPlayers))
        } else {
          setSearchResults([])
        }
      } else if (leagueId) {
        // If we only have a league filter, get all clubs in that league and their players
        const leagueClubs = await getTopLeaguesClubsAction()
        const clubsInLeague = leagueClubs.filter((c: any) => c.seasonId === leagueId)

        const allPlayers = await Promise.all(
          clubsInLeague.slice(0, 10).map((club: any) => getPlayersByClubAction(club.id, club.seasonId, true))
        )
        const flattenedPlayers = allPlayers.flat()
        setSearchResults(filterPlayers(flattenedPlayers))
      } else {
        // If no specific filters, get some sample players from all leagues
        const allPlayers = await getAllTop5PlayersAction()
        setSearchResults(filterPlayers(allPlayers))
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
      setSearchComplete(true)
    }
  }

  function filterPlayers(players: any[]) {
    return players.filter((player) => {
      // Age filter
      const playerAge = parseInt(player.age) || 0
      if (filters.ageMin && playerAge < filters.ageMin) return false
      if (filters.ageMax && playerAge > filters.ageMax) return false

      // Position filter
      if (filters.position) {
        const playerPos = (player.position || '').toUpperCase()
        if (filters.position === 'GK' && !playerPos.includes('GK')) return false
        if (filters.position === 'DF' && !['DF', 'CB', 'LB', 'RB', 'LCB', 'RCB'].includes(playerPos)) return false
        if (filters.position === 'MF' && !['MF', 'CM', 'CDM', 'LM', 'RM', 'CAM', 'LCM', 'RCM'].includes(playerPos)) return false
        if (filters.position === 'FW' && !['FW', 'ST', 'RW', 'LW', 'CF'].includes(playerPos)) return false
      }

      // Value filter (parse from marketValue string like "€45M" or "€45.5M")
      if (filters.valueMin || filters.valueMax) {
        const valueStr = player.marketValue || "€0M"
        const valueMatch = valueStr.match(/€?([\d.]+)M?/i)
        const value = valueMatch ? parseFloat(valueMatch[1]) : 0
        if (filters.valueMin && value < filters.valueMin) return false
        if (filters.valueMax && value > filters.valueMax) return false
      }

      return true
    })
  }

  async function addPlayerFromSearch(player: any) {
    const playerData = {
      player_id: player.playerID || player.id,
      player_name: player.fullName || player.name,
      club: player.teamName || "Unknown Club",
      club_logo: null,
      position: player.position || "N/A",
      league: filters.league || "Global League",
      player_photo: player.playerPhoto || player.photo || `https://api.statorium.com/media/bearleague/bl${player.playerID}.webp`,
      market_value: player.marketValue || "€" + (Math.floor(Math.random() * 80) + 5) + "M",
      weight: player.additionalInfo?.weight || player.weight || "---",
      height: player.additionalInfo?.height || player.height || "---",
      age: player.age || player.additionalInfo?.age || "---",
    }

    const result = await addToWatchlist(playerData)

    if (result.error) {
      alert(`Failed to add player: ${result.error}`)
      return
    }

    if (result.success) {
      const updatedData = await getWatchlist()
      const transformedData = updatedData.map((item: any) => ({
        id: item.id,
        playerId: item.player_id,
        name: item.player_name,
        club: item.club,
        clubLogo: item.club_logo,
        position: item.position,
        league: item.league,
        playerPhoto: item.player_photo,
        marketValue: item.market_value,
        weight: item.weight,
        height: item.height,
        age: item.age,
      }))
      setWatchedPlayers(transformedData)
    }
  }

  const clubLogo = activePlayer?.clubLogo || selectedDetails?.teamLogo || null

  // Function to navigate to analysis page with player data
  function navigateToAnalysis(player: any) {
    const params = new URLSearchParams()
    params.set('id', player.playerId || player.id)
    params.set('name', player.name || player.fullName)
    params.set('club', player.club || 'Unknown Club')
    params.set('league', player.league || 'Unknown League')
    params.set('nation', player.nation || 'Unknown')
    params.set('pos', player.position || 'Unknown Position')
    params.set('photo', player.playerPhoto || '')

    router.push(`/analysis?${params.toString()}`)
  }

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Left Panel: Green Zone - Watched List */}
      <div className="relative z-10 flex h-full w-[320px] flex-col border-r border-border bg-card/40 backdrop-blur-3xl lg:w-[380px]">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-xl font-black tracking-widest text-foreground uppercase italic">
            Watchlist
          </h2>
        </div>

        <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
          {loadingWatchlist ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
              <p className="ml-3 text-sm text-muted-foreground">
                Loading watchlist...
              </p>
            </div>
          ) : watchedPlayers.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Your watchlist is empty. Add players to start scouting!
              </p>
            </div>
          ) : (
            <>
              {watchedPlayers.map((player: any) => (
                <WatchlistCard
                  key={player.id}
                  player={player}
                  selected={selectedPlayerId === player.id}
                  onClick={() => navigateToAnalysis(player)}
                  onRemove={() => removePlayer(player.id)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Right-side Content Area - Search Interface */}
      <div className="relative h-full flex-1 overflow-hidden">
        <div className="custom-scrollbar absolute inset-0 z-10 overflow-y-auto pt-8 pb-12">
          <div className="flex min-h-full flex-col p-8 lg:p-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
                Talent Scout
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Find and add players to your watchlist using advanced filters
              </p>
            </div>

            {/* Search Filters Section */}
            <div className="space-y-6 rounded-[40px] border border-border bg-card/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-[40px]">
              {/* League Filter (Required) */}
              <div className="space-y-3">
                <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                  League <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {Object.entries(LEAGUE_ID_MAP).map(([name, id]) => (
                    <button
                      key={id}
                      onClick={() => {
                        setFilters(prev => ({ ...prev, league: prev.league === name ? null : name }))
                      }}
                      className={`group flex items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${
                        filters?.league === name
                          ? "border-green-500/30 bg-green-500/10"
                          : "border-border bg-accent/20 hover:border-foreground/20"
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-zinc-950/80 p-1">
                        <img
                          src={LEAGUE_LOGOS[name]}
                          alt={name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <span className="text-xs font-black tracking-wider text-foreground uppercase transition-colors">
                        {name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Club Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                  Club {filters?.league && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground z-10" />
                  <input
                    type="text"
                    disabled={!filters?.league}
                    placeholder={filters?.league ? "Search clubs in selected league..." : "Select a league first to search clubs"}
                    value={filters?.club || ""}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, club: e.target.value }))
                      setShowClubDropdown(true)
                    }}
                    onFocus={() => setShowClubDropdown(true)}
                    onBlur={() => setTimeout(() => setShowClubDropdown(false), 200)}
                    className="w-full rounded-2xl border border-border bg-accent/20 py-4 pl-12 pr-4 text-sm font-black text-foreground placeholder:text-muted-foreground focus:border-green-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {showClubDropdown && filters?.league && (
                    <div className="absolute z-20 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border border-border bg-zinc-900 shadow-2xl">
                      {availableClubs
                        .filter((club: any) =>
                          !filters?.club || club.name?.toLowerCase().includes(filters.club.toLowerCase())
                        )
                        .slice(0, 10)
                        .map((club: any) => (
                          <button
                            key={club.id}
                            onClick={() => {
                              setFilters(prev => ({ ...prev, club: club.name }))
                              setShowClubDropdown(false)
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40 first:rounded-t-2xl last:rounded-b-2xl"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-zinc-950/80 p-1">
                              <img
                                src={club.logo}
                                alt={club.name}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <span className="text-xs font-black tracking-wider text-foreground uppercase">
                              {club.name}
                            </span>
                          </button>
                        ))}
                      {availableClubs.filter((club: any) =>
                        !filters?.club || club.name?.toLowerCase().includes(filters.club.toLowerCase())
                      ).length === 0 && (
                        <div className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          No clubs found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Position Filter (Required) */}
              <div className="space-y-3">
                <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                  Position <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["GK", "DF", "MF", "FW"].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => {
                        setFilters(prev => ({ ...prev, position: prev.position === pos ? null : pos }))
                      }}
                      className={`rounded-xl border py-3 text-xs font-black uppercase transition-all ${
                        filters?.position === pos
                          ? "border-green-500/30 bg-green-500/10 text-green-400"
                          : "border-border bg-accent/20 hover:border-foreground/20"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Range Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                  Age Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground">Min Age</span>
                    <input
                      type="number"
                      min="16"
                      max="45"
                      placeholder="16"
                      value={filters?.ageMin || ""}
                      onChange={(e) => setFilters(prev => ({ ...prev, ageMin: e.target.value ? parseInt(e.target.value) : null }))}
                      className="w-full rounded-xl border border-border bg-accent/20 py-3 px-4 text-center text-sm font-black text-foreground focus:border-green-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground">Max Age</span>
                    <input
                      type="number"
                      min="16"
                      max="45"
                      placeholder="45"
                      value={filters?.ageMax || ""}
                      onChange={(e) => setFilters(prev => ({ ...prev, ageMax: e.target.value ? parseInt(e.target.value) : null }))}
                      className="w-full rounded-xl border border-border bg-accent/20 py-3 px-4 text-center text-sm font-black text-foreground focus:border-green-500/50 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Market Value Range Filter */}
              <div className="space-y-3">
                <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                  Market Value Range (€M)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground">Min Value</span>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      placeholder="0"
                      value={filters?.valueMin || ""}
                      onChange={(e) => setFilters(prev => ({ ...prev, valueMin: e.target.value ? parseInt(e.target.value) : null }))}
                      className="w-full rounded-xl border border-border bg-accent/20 py-3 px-4 text-center text-sm font-black text-foreground focus:border-green-500/50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground">Max Value</span>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      placeholder="200"
                      value={filters?.valueMax || ""}
                      onChange={(e) => setFilters(prev => ({ ...prev, valueMax: e.target.value ? parseInt(e.target.value) : null }))}
                      className="w-full rounded-xl border border-border bg-accent/20 py-3 px-4 text-center text-sm font-black text-foreground focus:border-green-500/50 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 py-4 font-black text-green-400 uppercase tracking-widest transition-all hover:bg-green-500 hover:text-black disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Search Players</span>
                  </>
                )}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-black tracking-widest text-foreground uppercase">
                  Results ({searchResults.length})
                </h3>
                <div className="grid gap-4">
                  {searchResults.map((player, index) => (
                    <motion.div
                      key={`${player.playerID || player.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => navigateToAnalysis(player)}
                      className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-4 transition-all hover:border-green-500/30 hover:cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-zinc-950/20">
                          <img
                            src={player.playerPhoto}
                            alt={player.fullName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black tracking-widest text-green-400 uppercase">
                              {player.position}
                            </span>
                            <span className="text-xs font-bold text-muted-foreground uppercase">
                              {player.age || "N/A"} yrs
                            </span>
                            <MarketValue
                              playerName={player.fullName}
                              showIcon={false}
                              className="scale-75 origin-left h-5"
                            />
                          </div>
                          <h4 className="mt-1 truncate text-base font-bold tracking-tighter uppercase text-foreground">
                            {player.fullName}
                          </h4>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase">
                              {player.teamName || "Unknown Club"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => addPlayerFromSearch(player)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-green-500/20 bg-green-500/0 text-green-500 transition-all hover:bg-green-500 hover:text-black"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {searchComplete && searchResults.length === 0 && (
              <div className="mt-8 rounded-2xl border border-border bg-accent/20 p-8 text-center">
                <p className="text-muted-foreground">
                  No players found matching your criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search Modal Overlay */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-6 backdrop-blur-2xl"
            >
              <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[40px] border border-border bg-card shadow-[0_0_100px_rgba(0,0,0,0.1)] dark:shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-border bg-accent/20 p-8">
                  <div className="flex items-center gap-4">
                    {searchStep !== "league" && (
                      <button
                        onClick={() =>
                          setSearchStep(
                            searchStep === "player" ? "club" : "league"
                          )
                        }
                        className="rounded-full p-2 text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                    )}
                    <div>
                      <h3 className="text-xl font-black tracking-widest text-foreground uppercase">
                        {searchStep === "league"
                          ? "Select League"
                          : searchStep === "club"
                            ? "Select Club"
                            : "Select Talent"}
                      </h3>
                      <p className="mt-1 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                        {searchStep === "league"
                          ? "Global Market Scouting"
                          : activeLeague?.name}
                        {activeClub && ` • ${activeClub.name}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowSearch(false)
                      resetSearch()
                    }}
                    className="rounded-full p-3 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="relative h-1 w-full bg-muted">
                  <motion.div
                    initial={{ width: "33%" }}
                    animate={{
                      width:
                        searchStep === "league"
                          ? "33%"
                          : searchStep === "club"
                            ? "66%"
                            : "100%",
                    }}
                    className="absolute inset-0 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  />
                </div>

                {/* Modal Content */}
                <div className="custom-scrollbar flex-1 overflow-y-auto p-6 md:p-8">
                  {loadingSearch ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-6">
                      <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-green-500" />
                        <div className="absolute inset-0 animate-pulse bg-green-500/20 blur-xl" />
                      </div>
                      <span className="animate-pulse text-xs font-black tracking-[0.3em] text-muted-foreground uppercase">
                        Syncing Scout Data...
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {/* STEP 1: LEAGUES */}
                      {searchStep === "league" &&
                        Object.entries(LEAGUE_ID_MAP).map(
                          ([name, id]: [string, string]) => (
                            <motion.button
                              key={id}
                              whileHover={{
                                x: 10,
                                backgroundColor: "var(--accent)",
                              }}
                              onClick={() => selectLeague({ id, name })}
                              className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-all"
                            >
                              <div className="flex items-center gap-5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-zinc-950 p-2">
                                  <img
                                    src={LEAGUE_LOGOS[name]}
                                    alt={name}
                                    className="h-full w-full object-contain"
                                  />
                                </div>
                                <span className="text-lg font-black tracking-wider text-foreground uppercase transition-colors group-hover:text-primary">
                                  {name}
                                </span>
                              </div>
                              <Plus className="h-6 w-6 font-black text-muted-foreground transition-all group-hover:text-green-500" />
                            </motion.button>
                          )
                        )}

                      {/* STEP 2: CLUBS */}
                      {searchStep === "club" &&
                        clubs.map((club: any) => (
                          <motion.button
                            key={club.id}
                            whileHover={{ x: 10, borderLeftColor: "#22c55e" }}
                            onClick={() => selectClub(club)}
                            className="group flex items-center justify-between rounded-2xl border border-l-2 border-border border-l-transparent bg-card p-4 transition-all"
                          >
                            <div className="flex items-center gap-5">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-950/80 p-2 dark:bg-black/40">
                                <img
                                  src={club.logo}
                                  alt={club.name}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <div className="text-left">
                                <span className="block text-lg font-black tracking-wider text-foreground uppercase transition-colors group-hover:text-primary">
                                  {club.name}
                                </span>
                                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                  {club.city || "Top Division"}
                                </span>
                              </div>
                            </div>
                            <Plus className="h-6 w-5 font-black text-muted-foreground transition-all group-hover:text-green-500" />
                          </motion.button>
                        ))}

                      {/* STEP 3: PLAYERS */}
                      {searchStep === "player" &&
                        clubPlayers.map((player: any) => (
                          <motion.button
                            key={player.id}
                            whileHover={{
                              scale: 1.02,
                              backgroundColor: "rgba(34, 197, 94, 0.05)",
                            }}
                            onClick={() => addPlayer(player)}
                            className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all"
                          >
                            <div className="flex items-center gap-5">
                              <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/20 p-2 dark:bg-black/60">
                                <img
                                  src={player.photoUrl}
                                  alt={player.name}
                                  className="relative z-10 h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 -z-0 flex items-center justify-center text-center text-[10px] leading-none font-black whitespace-pre-wrap text-foreground/20 uppercase">
                                  {player.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .slice(0, 3)}
                                </div>
                              </div>
                              <div className="text-left">
                                <span className="block text-lg font-black tracking-wider text-foreground uppercase transition-colors group-hover:text-green-500">
                                  {player.name}
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-black tracking-widest text-green-500 uppercase dark:text-green-500/70">
                                    {player.position}
                                  </span>
                                  <MarketValue 
                                    playerName={player.name} 
                                    showIcon={false} 
                                    className="scale-75 origin-left h-5 bg-accent border-transparent" 
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-green-500/20 bg-green-500/0 text-green-500 transition-all group-hover:bg-green-500 group-hover:text-white">
                              <Plus className="h-6 w-6" />
                            </div>
                          </motion.button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  )
}
