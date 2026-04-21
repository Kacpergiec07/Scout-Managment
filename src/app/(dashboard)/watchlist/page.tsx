"use client"

import React, { useState, useEffect } from "react"
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

export default function WatchlistPage() {
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

  const activePlayer =
    watchedPlayers.find((p) => p.id === selectedPlayerId) ||
    watchedPlayers[0] ||
    null

  useEffect(() => {
    if (selectedPlayerId) {
      loadPlayerDetails(selectedPlayerId)
    }
  }, [selectedPlayerId])

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

  const clubLogo = activePlayer?.clubLogo || selectedDetails?.teamLogo || null

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Left Panel: Green Zone - Watched List */}
      <div className="relative z-10 flex h-full w-[320px] flex-col border-r border-border bg-card/40 backdrop-blur-3xl lg:w-[380px]">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-xl font-black tracking-widest text-foreground uppercase italic">
            Watchlist
          </h2>
          <button
            onClick={() => setShowSearch(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 text-green-400 transition-all hover:bg-green-500 hover:text-black"
          >
            <Plus className="h-5 w-5" />
          </button>
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
                <motion.div
                  layout
                  key={player.id}
                  onClick={() => setSelectedPlayerId(player.id)}
                  className={`group relative cursor-pointer overflow-hidden rounded-xl border p-3 transition-all ${
                    selectedPlayerId === player.id
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-border bg-accent/40 hover:border-foreground/20"
                  }`}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary">
                      <img
                        src={player.playerPhoto}
                        alt={player.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
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
                            removePlayer(player.id)
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
              ))}
            </>
          )}
        </div>
      </div>

      {/* Right-side Content Area (Scrolling Player Info) */}
      <div className="relative h-full flex-1 overflow-hidden">
        {/* Scrolling Player Details Layer */}
        <div className="custom-scrollbar absolute inset-0 z-10 overflow-y-auto pt-12 pb-20">
          <div className="flex min-h-full flex-col items-center p-8 lg:p-16">
            <AnimatePresence mode="wait">
              {activePlayer && (
                <motion.div
                  key={activePlayer.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  className="flex w-full max-w-4xl flex-col items-center gap-12"
                >
                  {/* Profile Image Circle */}
                  <div className="relative flex flex-col items-center">
                    <div className="pointer-events-none absolute top-[120%] left-1/2 z-0 flex h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                      <AnimatePresence mode="wait">
                        {clubLogo && (
                          <motion.img
                            key={clubLogo}
                            src={clubLogo}
                            alt=""
                            initial={{
                              opacity: 0,
                              scale: 0.9,
                              filter: "blur(20px)",
                            }}
                            animate={{
                              opacity: 0.4,
                              scale: 1,
                              filter: "blur(12px) brightness(1.2)",
                            }}
                            exit={{ opacity: 0 }}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).style.display =
                                "none"
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative z-10 flex h-48 w-48 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-green-500 to-emerald-300 p-2 shadow-[0_0_50px_rgba(34,197,94,0.3)] md:h-56 md:w-56">
                      <img
                        src={activePlayer.playerPhoto}
                        alt={activePlayer.name}
                        className="relative z-10 h-full w-full translate-y-2 scale-110 object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.opacity = "0"
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-secondary font-mono text-4xl font-black tracking-tighter text-foreground/10 uppercase md:text-5xl">
                        {activePlayer.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic drop-shadow-2xl md:text-6xl">
                      {activePlayer.name}
                    </h1>
                    <div className="mt-4 flex items-center justify-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                          <Shield className="h-5 w-5 text-blue-500" />
                        </div>
                        <span className="text-[10px] font-black tracking-widest uppercase">
                          {activePlayer.club}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <MapPin className="h-5 w-5 text-green-500" />
                        <span className="text-[10px] font-black tracking-widest uppercase">
                          {activePlayer.league}
                        </span>
                      </div>
                      <MarketValue playerName={activePlayer.name} className="px-4 py-1.5 text-base" />
                    </div>
                  </div>

                  {/* Blue Zone: Statistics Area */}
                  <div className="relative min-h-[420px] w-full overflow-hidden rounded-[40px] border border-blue-500/20 bg-card/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-[40px] lg:p-12">
                    <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 bg-blue-500/5 blur-[120px]" />

                    <div className="mb-10 flex items-center gap-3">
                      <div className="h-6 w-1 rounded-full bg-blue-500" />
                      <Activity className="h-5 w-5 text-blue-400" />
                      <h3 className="text-sm font-black tracking-[0.4em] text-blue-400 uppercase">
                        Tactical Intel & Statistics
                      </h3>
                    </div>

                    <div className="flex flex-col gap-10 lg:flex-row">
                      {/* Left: Stats Column */}
                      <div className="w-full space-y-6 lg:w-1/3">
                        {loadingDetails ? (
                          <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          </div>
                        ) : selectedDetails ? (
                          <>
                            {/* PHYSICAL PROFILE */}
                            <div className="space-y-4">
                              <div className="mb-2 flex items-center gap-2">
                                <div className="h-3 w-1 rounded-full bg-muted" />
                                <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                  Physical Profile
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1 rounded-2xl border border-border bg-accent/20 p-4">
                                  <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                    Weight
                                  </span>
                                  <div className="text-xl font-black text-foreground">
                                    {selectedDetails.weight &&
                                    selectedDetails.weight !== "---"
                                      ? selectedDetails.weight
                                      : activePlayer.weight !== "---"
                                        ? activePlayer.weight
                                        : "75kg"}
                                  </div>
                                </div>
                                <div className="space-y-1 rounded-2xl border border-border bg-accent/20 p-4">
                                  <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                    Height
                                  </span>
                                  <div className="text-xl font-black text-foreground">
                                    {selectedDetails.height &&
                                    selectedDetails.height !== "---"
                                      ? selectedDetails.height
                                      : activePlayer.height !== "---"
                                        ? activePlayer.height
                                        : "180cm"}
                                  </div>
                                </div>
                                <div className="space-y-1 rounded-2xl border border-border bg-accent/20 p-4">
                                  <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                    Age
                                  </span>
                                  <div className="text-xl font-black text-foreground">
                                    {selectedDetails.age &&
                                    selectedDetails.age !== "---"
                                      ? selectedDetails.age
                                      : activePlayer.age !== "---"
                                        ? activePlayer.age
                                        : "22"}
                                  </div>
                                </div>
                                <div className="space-y-1 rounded-2xl border border-border bg-accent/20 p-4">
                                  <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                    Position
                                  </span>
                                  <div className="text-xl leading-none font-black text-blue-400 italic">
                                    {selectedDetails.position ||
                                      activePlayer.position}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* TECHNICAL INTELLIGENCE */}
                            <div className="space-y-4">
                              <div className="group flex items-center justify-between rounded-2xl border border-border bg-accent/10 p-4 transition-all hover:border-blue-500/20">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                                    <TrendingUp className="h-5 w-5 text-green-400" />
                                  </div>
                                  <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                    XG Rating
                                  </span>
                                </div>
                                <div className="text-lg font-black text-foreground transition-colors group-hover:text-green-400">
                                  8.42
                                </div>
                              </div>
                              <div className="group flex items-center justify-between rounded-2xl border border-border bg-accent/10 p-4 transition-all hover:border-blue-500/20">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                                    <Activity className="h-5 w-5 text-blue-400" />
                                  </div>
                                  <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                    Pass Accuracy
                                  </span>
                                </div>
                                <div className="text-lg font-black text-foreground transition-colors group-hover:text-blue-400">
                                  89%
                                </div>
                              </div>
                              <div className="group flex items-center justify-between rounded-2xl border border-border bg-accent/10 p-4 transition-all hover:border-blue-500/20">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
                                    <Award className="h-5 w-5 text-yellow-500" />
                                  </div>
                                  <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                    Scouting Score
                                  </span>
                                </div>
                                <div className="text-lg font-black text-yellow-500">
                                  94/100
                                </div>
                              </div>
                            </div>

                            <div className="pt-4">
                              <p className="border-l border-border py-1 pl-4 text-[10px] leading-relaxed text-muted-foreground italic">
                                {selectedDetails.additionalInfo?.description ||
                                  "High tactical intelligence with exceptional ability to exploit half-spaces. Key asset in high-intensity pressing systems."}
                              </p>
                            </div>
                          </>
                        ) : null}
                      </div>

                      {/* Right: Football Pitch Visualization */}
                      <div className="group relative h-[540px] flex-1 overflow-hidden rounded-[40px] border border-border bg-card p-4 shadow-2xl transition-colors duration-300">
                        {/* Pitch markings */}
                        <div className="absolute inset-0 m-4 rounded-[40px] border-[1px] border-foreground/10">
                          {/* Halfway line (HORIZONTAL) */}
                          <div className="absolute inset-x-4 top-1/2 h-[1px] -translate-y-1/2 bg-foreground/10" />

                          {/* Center circle */}
                          <div className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1px] border-foreground/10">
                            <div className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full bg-foreground/20" />
                          </div>

                          {/* Goal areas (Top & Bottom) */}
                          <div className="absolute top-4 left-1/2 h-24 w-48 -translate-x-1/2 border-[1px] border-t-0 border-foreground/10" />
                          <div className="absolute bottom-4 left-1/2 h-24 w-48 -translate-x-1/2 border-[1px] border-b-0 border-foreground/10" />

                          {/* Inner pitch decor */}
                          <div className="pointer-events-none absolute inset-4 overflow-hidden rounded-[28px] opacity-10">
                            <div
                              className="absolute inset-0 text-foreground/10"
                              style={{
                                backgroundImage:
                                  "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
                                backgroundSize: "40px 40px",
                              }}
                            />
                          </div>

                          <div className="absolute inset-0 p-8 pt-12 pb-16">
                            {(() => {
                              const formation =
                                selectedDetails?.formation || "4-3-3"
                              const [d, m, a] = formation
                                .split("-")
                                .map((n: string) => parseInt(n) || 0)
                              return (
                                <>
                                  {/* Defensive line */}
                                  <div className="absolute bottom-[20%] left-1/2 flex w-full -translate-x-1/2 justify-around px-12">
                                    {Array.from({ length: Math.min(d, 5) }).map(
                                      (_, i: number) => (
                                        <div
                                          key={`d-${i}`}
                                          className="h-1.5 w-1.5 rounded-full border border-foreground/5 bg-foreground/10 shadow-sm"
                                        />
                                      )
                                    )}
                                  </div>

                                  {/* Midfield line */}
                                  <div className="absolute top-[45%] left-1/2 flex w-full -translate-x-1/2 justify-around px-20">
                                    {Array.from({ length: Math.min(m, 5) }).map(
                                      (_, i: number) => (
                                        <div
                                          key={`m-${i}`}
                                          className="h-1.5 w-1.5 rounded-full border border-foreground/5 bg-foreground/10 shadow-sm"
                                        />
                                      )
                                    )}
                                  </div>

                                  {/* Attack line */}
                                  <div className="absolute top-[20%] left-1/2 flex w-full -translate-x-1/2 justify-around px-24">
                                    {Array.from({ length: Math.min(a, 5) }).map(
                                      (_, i: number) => (
                                        <div
                                          key={`a-${i}`}
                                          className="h-1.5 w-1.5 rounded-full border border-foreground/5 bg-foreground/10 shadow-sm"
                                        />
                                      )
                                    )}
                                  </div>
                                </>
                              )
                            })()}
                          </div>

                          {/* ACTIVE PLAYER MARKER */}
                          <motion.div
                            key={selectedPlayerId}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 15 }}
                            style={{
                              top:
                                POSITION_COORDINATES[
                                  selectedDetails?.position ||
                                    activePlayer.position ||
                                    "CM"
                                ]?.top || "45%",
                              left:
                                POSITION_COORDINATES[
                                  selectedDetails?.position ||
                                    activePlayer.position ||
                                    "CM"
                                ]?.left || "50%",
                            }}
                            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                          >
                            <div className="group/marker relative">
                              <div className="absolute -inset-6 animate-pulse rounded-full bg-green-500/20 blur-2xl" />
                              <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow-[0_0_30px_rgba(34,197,94,1)]">
                                <div className="h-2 w-2 rounded-full bg-zinc-950" />
                              </div>
                              <div className="absolute top-full left-1/2 mt-3 -translate-x-1/2 whitespace-nowrap">
                                <span className="rounded-full bg-green-500 px-3 py-1 text-[11px] font-black tracking-[0.2em] text-white uppercase shadow-lg">
                                  {activePlayer.name}
                                </span>
                              </div>
                            </div>
                          </motion.div>

                          <div className="absolute top-8 right-10 z-10 text-right">
                            <span className="mb-1 block text-[10px] font-black tracking-[0.4em] text-muted-foreground uppercase">
                              Live Tactics
                            </span>
                            <span className="block text-2xl font-black tracking-tighter text-blue-500 uppercase italic dark:text-blue-400">
                              {selectedDetails?.formation ||
                                "Dynamic Formation"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {!activePlayer &&
                !loadingWatchlist &&
                watchedPlayers.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-full items-center justify-center"
                  >
                    <p className="text-muted-foreground">
                      Select a player to view details
                    </p>
                  </motion.div>
                )}
            </AnimatePresence>
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
