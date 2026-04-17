'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, UserMinus, Plus, Shield, MapPin, Activity, Award, TrendingUp, X, Loader2, ChevronLeft } from 'lucide-react'
import { 
  getPlayerDetailsAction, 
  searchPlayersAction, 
  getTeamLogoAction,
  getTopLeaguesClubsAction,
  getPlayersByClubAction
} from '@/app/actions/statorium'

const LEAGUE_ID_MAP: Record<string, string> = {
  'Premier League': '515',
  'La Liga': '558',
  'Serie A': '511',
  'Bundesliga': '521',
  'Ligue 1': '519'
}

const LEAGUE_LOGOS: Record<string, string> = {
  'Premier League': 'https://cdn.futwiz.com/assets/img/fc24/leagues/13.png',
  'Bundesliga': 'https://cdn.futwiz.com/assets/img/fc24/leagues/19.png',
  'La Liga': 'https://cdn.futwiz.com/assets/img/fc24/leagues/53.png',
  'Serie A': 'https://cdn.futwiz.com/assets/img/fc24/leagues/31.png',
  'Ligue 1': 'https://cdn.futwiz.com/assets/img/fc24/leagues/16.png'
}

const POSITION_COORDINATES: Record<string, { top: string; left: string }> = {
  'GK': { top: '85%', left: '50%' },
  'CB': { top: '70%', left: '50%' },
  'LCB': { top: '70%', left: '35%' },
  'RCB': { top: '70%', left: '65%' },
  'LB': { top: '65%', left: '15%' },
  'RB': { top: '65%', left: '85%' },
  'LWB': { top: '60%', left: '15%' },
  'RWB': { top: '60%', left: '85%' },
  'CDM': { top: '55%', left: '50%' },
  'LDM': { top: '55%', left: '40%' },
  'RDM': { top: '55%', left: '60%' },
  'CM': { top: '45%', left: '50%' },
  'LCM': { top: '45%', left: '35%' },
  'RCM': { top: '45%', left: '65%' },
  'LM': { top: '40%', left: '15%' },
  'RM': { top: '40%', left: '85%' },
  'CAM': { top: '30%', left: '50%' },
  'LAM': { top: '30%', left: '30%' },
  'RAM': { top: '30%', left: '70%' },
  'LW': { top: '20%', left: '20%' },
  'RW': { top: '20%', left: '80%' },
  'ST': { top: '10%', left: '50%' },
  'CF': { top: '15%', left: '50%' },
  'LS': { top: '12%', left: '35%' },
  'RS': { top: '12%', left: '65%' },
  'FW': { top: '15%', left: '50%' },
  'DF': { top: '70%', left: '50%' },
  'MF': { top: '45%', left: '50%' },
}

interface Player {
  id: string
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

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('scout_pro_watchlist', JSON.stringify(watchedPlayers))
    }
  }, [watchedPlayers, isLoaded])

  useEffect(() => {
    const saved = localStorage.getItem('scout_pro_watchlist')
    if (saved) {
      try {
        setWatchedPlayers(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse watchlist', e)
      }
    } else {
      setWatchedPlayers([
        { 
          id: '14633', 
          name: 'Florian Wirtz', 
          club: 'Bayer 04 Leverkusen', 
          clubLogo: 'https://api.statorium.com/media/bearleague/bl1716291195914.webp',
          position: 'CAM', 
          league: 'Bundesliga',
          playerPhoto: 'https://api.statorium.com/media/bearleague/bl17158001911496.webp',
          marketValue: '€130M',
          weight: '68 kg',
          height: '175 cm',
          age: '22'
        },
        { 
          id: '53041', 
          name: 'Lamine Yamal', 
          club: 'FC Barcelona', 
          clubLogo: 'https://api.statorium.com/media/bearleague/bl17162989602486.webp',
          position: 'RW', 
          league: 'La Liga',
          playerPhoto: 'https://api.statorium.com/media/bearleague/bl17322791692175.webp',
          marketValue: '€150M',
          weight: '72kg',
          height: '178cm',
          age: '17'
        },
        { 
          id: '6466', 
          name: 'Jude Bellingham', 
          club: 'Real Madrid', 
          clubLogo: 'https://api.statorium.com/media/bearleague/bl17158022639459.webp',
          position: 'CM', 
          league: 'La Liga',
          playerPhoto: 'https://api.statorium.com/media/bearleague/bl1695891720352.webp',
          marketValue: '€180M',
          weight: '75kg',
          height: '186cm',
          age: '21'
        },
        { 
          id: '4812', 
          name: 'Erling Haaland', 
          club: 'Manchester City', 
          clubLogo: 'https://api.statorium.com/media/bearleague/bl17250630712759.webp',
          position: 'ST', 
          league: 'Premier League',
          playerPhoto: 'https://api.statorium.com/media/bearleague/bl17313179872374.webp',
          marketValue: '€200M',
          weight: '88kg',
          height: '194cm',
          age: '24'
        },
        { 
          id: '1407', 
          name: 'Robert Lewandowski', 
          club: 'FC Barcelona', 
          clubLogo: 'https://api.statorium.com/media/bearleague/bl17162989602486.webp',
          position: 'ST', 
          league: 'La Liga',
          playerPhoto: 'https://api.statorium.com/media/bearleague/bl16958917002070.webp',
          marketValue: '€15M',
          weight: '79kg',
          height: '185cm',
          age: '37'
        }
      ])
    }
    setIsLoaded(true)
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
  const [searchStep, setSearchStep] = useState<'league' | 'club' | 'player'>('league')
  const [activeLeague, setActiveLeague] = useState<any>(null)
  const [activeClub, setActiveClub] = useState<any>(null)
  const [clubs, setClubs] = useState<any[]>([])
  const [clubPlayers, setClubPlayers] = useState<any[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)

  const activePlayer = watchedPlayers.find(p => p.id === selectedPlayerId) || watchedPlayers[0]

  useEffect(() => {
    if (selectedPlayerId) {
      loadPlayerDetails(selectedPlayerId)
    }
  }, [selectedPlayerId])

  async function loadPlayerDetails(id: string) {
    setLoadingDetails(true)
    const details = await getPlayerDetailsAction(id)
    if (details) {
      const clubName = details.teamName || activePlayer?.club;
      const leagueName = activePlayer?.league || 'La Liga';
      const leagueId = LEAGUE_ID_MAP[leagueName] || '558';
      
      if (clubName) {
        const logo = await getTeamLogoAction(clubName, leagueId);
        if (logo) (details as any).teamLogo = logo;
      }

      const detailedPhoto = (details as any).photo || (details as any).playerPhoto;

      setWatchedPlayers(prev => prev.map(p =>
        p.id === id ? {
          ...p,
          clubLogo: (details as any).teamLogo || p.clubLogo,
          playerPhoto: detailedPhoto || p.playerPhoto,
          weight: details.weight || p.weight,
          height: details.height || p.height,
          age: (details.age || (p.birthdate ? String(Math.floor((new Date().getTime() - new Date(p.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))) : '---')) as string,
          position: details.position || p.position
        } as Player : p
      ));
    }
    setSelectedDetails(details)
    setLoadingDetails(false)
  }

  async function selectLeague(league: { id: string; name: string }) {
    setActiveLeague(league)
    setLoadingSearch(true)
    setSearchStep('club')
    const allClubs = await getTopLeaguesClubsAction()
    const leagueClubs = allClubs.filter(c => c.seasonId === league.id)
    setClubs(leagueClubs)
    setLoadingSearch(false)
  }

  async function selectClub(club: any) {
    setActiveClub(club)
    setLoadingSearch(true)
    setSearchStep('player')
    const players = await getPlayersByClubAction(club.id, activeLeague.id)
    setClubPlayers(players)
    setLoadingSearch(false)
  }

  function resetSearch() {
    setSearchStep('league')
    setActiveLeague(null)
    setActiveClub(null)
    setClubs([])
    setClubPlayers([])
  }

  async function addPlayer(p: any) {
    const clubName = p.teamName || activeClub?.name || 'Elite Club';
    const leagueName = activeLeague?.name || 'Global League';
    
    const logo = p.logo || activeClub?.logo || await getTeamLogoAction(clubName, undefined, p.teamID);
    
    let photo = p.playerPhoto || p.photo || p.photoUrl;
    if (photo && !photo.startsWith('http')) {
      const cleanPath = photo.startsWith('/') ? photo : `/${photo}`;
      photo = `https://api.statorium.com/media/bearleague${cleanPath}`;
    }

    const newPlayer: Player = {
      id: p.id || p.playerID,
      name: p.name || p.fullName || `${p.firstName} ${p.lastName}`,
      club: clubName,
      clubLogo: logo,
      position: p.position || 'N/A',
      league: leagueName,
      playerPhoto: photo || `https://api.statorium.com/media/bearleague/bl${p.id || p.playerID}.webp`,
      marketValue: p.marketValue || "€" + (Math.floor(Math.random() * 80) + 5) + "M",
      weight: p.additionalInfo?.weight || p.weight || '---',
      height: p.additionalInfo?.height || p.height || '---',
      age: p.additionalInfo?.age || (p.birthdate ? String(Math.floor((new Date().getTime() - new Date(p.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))) : (p.additionalInfo?.birthdate ? p.additionalInfo.birthdate.split(' ').pop()?.replace('(', '').replace(')', '') : '---'))
    }

    if (!watchedPlayers.find(wp => wp.id === newPlayer.id)) {
      setWatchedPlayers(prev => [newPlayer, ...prev])
      setSelectedPlayerId(newPlayer.id)
    }
    setShowSearch(false)
    resetSearch()
  }

  function removePlayer(id: string) {
    const newList = watchedPlayers.filter((p: any) => p.id !== id)
    setWatchedPlayers(newList)
    if (selectedPlayerId === id) {
      setSelectedPlayerId(newList[0]?.id || null)
    }
  }

  const clubLogo = activePlayer?.clubLogo || selectedDetails?.teamLogo || null;

  return (
    <div className="relative w-full h-full bg-[#050505] text-white overflow-hidden flex">
      
      {/* Left Panel: Green Zone - Watched List */}
      <div className="relative z-10 w-[320px] lg:w-[380px] h-full border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-widest text-zinc-100 italic uppercase">Watchlist</h2>
          <button 
            onClick={() => setShowSearch(true)}
            className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500 hover:text-black transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {watchedPlayers.map((player: any) => (
            <motion.div
              layout
              key={player.id}
              onClick={() => setSelectedPlayerId(player.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${
                selectedPlayerId === player.id 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex gap-4 items-center relative z-10">
                <div className="w-14 h-14 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                  <img 
                    src={player.playerPhoto} 
                    alt={player.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/20 uppercase tracking-tighter -z-10 bg-zinc-900 uppercase">
                    {player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">{player.position}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removePlayer(player.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-all"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-sm truncate uppercase tracking-tighter">{player.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-medium">{player.club}</span>
                    <span className="text-[10px] text-zinc-600">&bull;</span>
                    <span className="text-[10px] font-bold text-zinc-300">{player.marketValue}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right-side Content Area (Scrolling Player Info) */}
      <div className="relative flex-1 h-full overflow-hidden">
        
        {/* Scrolling Player Details Layer */}
        <div className="absolute inset-0 overflow-y-auto z-10 custom-scrollbar pt-12 pb-20">
          <div className="min-h-full flex flex-col items-center p-8 lg:p-16">
            <AnimatePresence mode="wait">
              {activePlayer && (
                <motion.div
                  key={activePlayer.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  className="w-full max-w-4xl flex flex-col items-center gap-12"
                >
              {/* Profile Image Circle */}
              <div className="relative flex flex-col items-center">
                 {/* Aligned Background Logo - Lowered significantly to reach page mid-section */}
                     <div className="absolute top-[120%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] pointer-events-none z-0 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          {clubLogo && (
                            <motion.img 
                              key={clubLogo}
                              src={clubLogo}
                              alt=""
                              initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                              animate={{ 
                                opacity: 0.4, 
                                scale: 1,
                                filter: 'blur(12px) brightness(1.2)'
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                        </AnimatePresence>
                     </div>

                 <div className="w-48 h-48 md:w-56 md:h-56 rounded-full p-2 bg-gradient-to-tr from-green-500 to-emerald-300 shadow-[0_0_50px_rgba(34,197,94,0.3)] relative z-10 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full rounded-full bg-[#050505] overflow-hidden border-2 border-[#050505] flex items-center justify-center relative">
                       <img 
                        src={activePlayer.playerPhoto} 
                        alt={activePlayer.name} 
                        className="w-full h-full object-cover scale-110 translate-y-2 relative z-10" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = '0';
                        }}
                       />
                       <span className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl font-black text-white/10 uppercase tracking-tighter bg-zinc-900 font-mono">
                         {activePlayer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                       </span>
                    </div>
                 </div>
                 <div className="mt-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white drop-shadow-2xl">{activePlayer.name}</h1>
                    <div className="flex items-center justify-center gap-6 mt-4">
                       <div className="flex items-center gap-2 text-zinc-400 uppercase font-bold tracking-widest text-sm">
                          <Shield className="w-4 h-4 text-green-500" /> {activePlayer.club}
                       </div>
                       <div className="flex items-center gap-2 text-zinc-400 uppercase font-bold tracking-widest text-sm">
                          <MapPin className="w-4 h-4 text-green-500" /> {activePlayer.league}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Blue Zone: Statistics Area */}
              <div className="w-full p-8 lg:p-12 rounded-[40px] bg-[#0A0F1E]/60 border border-blue-500/20 backdrop-blur-[40px] relative overflow-hidden min-h-[420px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[120px] pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-1 h-6 bg-blue-500 rounded-full" />
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-blue-400">Tactical Intel & Statistics</h3>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                  {/* Left: Stats Column */}
                  <div className="w-full lg:w-1/3 space-y-6">
                    {loadingDetails ? (
                      <div className="h-64 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      </div>
                    ) : selectedDetails ? (
                      <>
                        {/* PHYSICAL PROFILE */}
                        <div className="space-y-4">
                           <div className="flex items-center gap-2 mb-2">
                             <div className="w-1 h-3 bg-zinc-700 rounded-full" />
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Physical Profile</span>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                             <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                               <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Weight</span>
                               <div className="text-xl font-black text-white">{(selectedDetails.weight && selectedDetails.weight !== '---' ? selectedDetails.weight : (activePlayer.weight !== '---' ? activePlayer.weight : '75kg'))}</div>
                             </div>
                             <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                               <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Height</span>
                               <div className="text-xl font-black text-white">{(selectedDetails.height && selectedDetails.height !== '---' ? selectedDetails.height : (activePlayer.height !== '---' ? activePlayer.height : '180cm'))}</div>
                             </div>
                             <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                               <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Age</span>
                               <div className="text-xl font-black text-white">{(selectedDetails.age && selectedDetails.age !== '---' ? selectedDetails.age : (activePlayer.age !== '---' ? activePlayer.age : '22'))}</div>
                             </div>
                             <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                               <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Position</span>
                               <div className="text-xl font-black text-blue-400 italic leading-none">{selectedDetails.position || activePlayer.position}</div>
                             </div>
                           </div>
                        </div>

                        {/* TECHNICAL INTELLIGENCE */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                             <div className="w-1 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Technical Intelligence</span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/[0.03] border border-blue-500/10 hover:border-blue-500/20 transition-all group">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                  <TrendingUp className="w-5 h-5 text-green-400" />
                                </div>
                                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">XG Rating</span>
                              </div>
                              <div className="text-lg font-black text-white group-hover:text-green-400 transition-colors">8.42</div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/[0.03] border border-blue-500/10 hover:border-blue-500/20 transition-all group">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                  <Activity className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Pass Accuracy</span>
                              </div>
                              <div className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">89%</div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/[0.03] border border-blue-500/10 hover:border-blue-500/20 transition-all group">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                                  <Award className="w-5 h-5 text-yellow-500" />
                                </div>
                                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Scouting Score</span>
                              </div>
                              <div className="text-lg font-black text-yellow-500">94/100</div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4">
                           <p className="text-zinc-500 text-[10px] leading-relaxed italic border-l border-white/10 pl-4 py-1">
                             {selectedDetails.additionalInfo?.description || "High tactical intelligence with exceptional ability to exploit half-spaces. Key asset in high-intensity pressing systems."}
                           </p>
                        </div>
                      </>
                    ) : null}
                  </div>

                  {/* Right: Football Pitch Visualization */}
                  <div className="flex-1 h-[540px] relative rounded-[40px] overflow-hidden border border-white/10 bg-black shadow-2xl p-4 group">
                    {/* Pitch markings */}
                    <div className="absolute inset-0 border-[1px] border-white/10 rounded-[40px] m-4" />
                    
                    {/* Halfway line (HORIZONTAL) */}
                    <div className="absolute inset-x-4 top-1/2 h-[1px] bg-white/10 -translate-y-1/2" />
                    
                    {/* Center circle */}
                    <div className="absolute top-1/2 left-1/2 w-32 h-32 border-[1px] border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    
                    {/* Goal areas (Top & Bottom) */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-24 border-[1px] border-white/10 border-t-0" />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-24 border-[1px] border-white/10 border-b-0" />
                    
                    {/* Inner pitch decor */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-full" />

                    {/* Grass Pattern */}
                    <div className="absolute inset-4 overflow-hidden pointer-events-none opacity-10 rounded-[28px]">
                       <div className="absolute inset-0" style={{ 
                         backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                         backgroundSize: '40px 40px' 
                       }} />
                    </div>

                    {/* Players dots (Dynamic based on formation) */}
                    <div className="absolute inset-0 p-8 pt-12 pb-16">
                       {(() => {
                          const formation = selectedDetails?.formation || "4-3-3";
                          const [d, m, a] = formation.split('-').map((n: string) => parseInt(n) || 0);
                          return (
                             <>
                                {/* Defensive line */}
                                <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 flex justify-around w-full px-12">
                                   {Array.from({ length: Math.min(d, 5) }).map((_, i: number) => (
                                      <div key={`d-${i}`} className="w-1.5 h-1.5 rounded-full bg-white/10 shadow-[0_0_5px_rgba(255,255,255,0.1)]" />
                                   ))}
                                </div>
                                {/* Midfield line */}
                                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 flex justify-around w-full px-20">
                                   {Array.from({ length: Math.min(m, 5) }).map((_, i) => (
                                      <div key={`m-${i}`} className="w-1.5 h-1.5 rounded-full bg-white/10 shadow-[0_0_5px_rgba(255,255,255,0.1)]" />
                                   ))}
                                </div>
                                {/* Attack line */}
                                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex justify-around w-full px-24">
                                   {Array.from({ length: Math.min(a, 5) }).map((_, i) => (
                                      <div key={`a-${i}`} className="w-1.5 h-1.5 rounded-full bg-white/10 shadow-[0_0_5px_rgba(255,255,255,0.1)]" />
                                   ))}
                                </div>
                             </>
                          );
                       })()}

                       {/* ACTIVE PLAYER MARKER */}
                       <motion.div 
                          key={selectedPlayerId}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', damping: 15 }}
                          style={{ 
                            top: POSITION_COORDINATES[(selectedDetails?.position || activePlayer.position || 'CM')]?.top || '45%',
                            left: POSITION_COORDINATES[(selectedDetails?.position || activePlayer.position || 'CM')]?.left || '50%'
                          }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                       >
                          <div className="relative group/marker">
                            <div className="absolute -inset-6 bg-green-500/20 blur-2xl animate-pulse rounded-full" />
                            <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-[0_0_30px_rgba(34,197,94,1)] relative z-10 flex items-center justify-center">
                               <div className="w-2 h-2 bg-black rounded-full" />
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap">
                               <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white bg-green-500 px-3 py-1 rounded-full shadow-lg">
                                  {activePlayer.name}
                               </span>
                            </div>
                          </div>
                       </motion.div>
                    </div>

                    <div className="absolute top-8 right-10 text-right z-10">
                       <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-1">Live Tactics</span>
                       <span className="block text-2xl font-black italic text-blue-400 uppercase tracking-tighter">
                          {selectedDetails?.formation || "Dynamic Formation"}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Search Modal Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <div className="w-full max-w-2xl bg-zinc-900/90 rounded-[40px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  {searchStep !== 'league' && (
                    <button 
                      onClick={() => setSearchStep(searchStep === 'player' ? 'club' : 'league')}
                      className="p-2 hover:bg-white/10 rounded-full transition-all text-zinc-400 hover:text-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-widest text-white">
                      {searchStep === 'league' ? 'Select League' : searchStep === 'club' ? 'Select Club' : 'Select Talent'}
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">
                      {searchStep === 'league' ? 'Global Market Scouting' : activeLeague?.name} 
                      {activeClub && ` • ${activeClub.name}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setShowSearch(false); resetSearch(); }} className="p-3 hover:bg-red-500/10 hover:text-red-400 rounded-full transition-all text-zinc-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="h-1 w-full bg-white/5 relative">
                <motion.div 
                  initial={{ width: '33%' }}
                  animate={{ width: searchStep === 'league' ? '33%' : searchStep === 'club' ? '66%' : '100%' }}
                  className="absolute inset-0 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                />
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                {loadingSearch ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 animate-spin text-green-500" />
                      <div className="absolute inset-0 blur-xl bg-green-500/20 animate-pulse" />
                    </div>
                    <span className="font-black tracking-[0.3em] uppercase text-xs text-zinc-400 animate-pulse">Syncing Scout Data...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {/* STEP 1: LEAGUES */}
                    {searchStep === 'league' && Object.entries(LEAGUE_ID_MAP).map(([name, id]: [string, string]) => (
                      <motion.button
                        key={id}
                        whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        onClick={() => selectLeague({ id, name })}
                        className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-xl bg-black border border-white/10 flex items-center justify-center p-2">
                             <img src={LEAGUE_LOGOS[name]} alt={name} className="w-full h-full object-contain" />
                          </div>
                          <span className="text-lg font-black uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors">{name}</span>
                        </div>
                        <Plus className="w-6 h-6 text-zinc-700 group-hover:text-green-500 transition-all" />
                      </motion.button>
                    ))}

                    {/* STEP 2: CLUBS */}
                    {searchStep === 'club' && clubs.map((club: any) => (
                      <motion.button
                        key={club.id}
                        whileHover={{ x: 10, borderLeftColor: '#22c55e' }}
                        onClick={() => selectClub(club)}
                        className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between group transition-all border-l-2 border-l-transparent"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center p-2">
                             <img src={club.logo} alt={club.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="text-left">
                            <span className="block text-md font-black uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors">{club.name}</span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{club.city || 'Top Division'}</span>
                          </div>
                        </div>
                        <Plus className="w-5 h-5 text-zinc-700 group-hover:text-green-500 transition-all" />
                      </motion.button>
                    ))}

                    {/* STEP 3: PLAYERS */}
                    {searchStep === 'player' && clubPlayers.map((player: any) => (
                      <motion.button
                        key={player.id}
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(34,197,94,0.05)' }}
                        onClick={() => addPlayer(player)}
                        className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-black/60 border border-white/10 overflow-hidden relative">
                             <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover relative z-10" />
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white/20 uppercase whitespace-pre-wrap text-center leading-none -z-0">
                                   {player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 3)}
                                </div>
                             </div>
                          <div className="text-left">
                            <span className="block text-lg font-black uppercase tracking-wider text-white group-hover:text-green-400 transition-colors">{player.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-green-500/70 uppercase tracking-widest">{player.position}</span>
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">{player.marketValue}</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-500/0 border border-green-500/20 flex items-center justify-center group-hover:bg-green-500 group-hover:text-black transition-all text-green-500">
                          <Plus className="w-6 h-6" />
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
