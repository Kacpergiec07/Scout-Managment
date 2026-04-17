<<<<<<< HEAD
import { PlayerSearch } from '@/components/scout/player-search'
import { TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Scouting Dashboard</h1>
        <p className="text-muted-foreground text-lg italic">Welcome back, Chief Scout. 12 new matches analyzed today.</p>
      </div>

      <div className="relative p-10 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-900 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            System Online: Statorium API Connected
          </div>
          <h2 className="text-3xl font-bold leading-tight">Begin a New Tactical Player Analysis</h2>
          <p className="text-emerald-50/80 text-lg">Enter a player name to ingest high-fidelity data and calculate squad compatibility scores.</p>
          <div className="max-w-md pt-2">
            <PlayerSearch placeholder="Search 25,000+ professional athletes..." />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DashboardCard 
          icon={TrendingUp} 
          title="Market Trends" 
          description="View rising stars and undervalued talents in Top 5 leagues." 
          href="/history"
        />
        <DashboardCard 
          icon={Users} 
          title="Compare Talent" 
          description="Side-by-side performance breakdown for final decision making." 
          href="/compare"
        />
=======
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Settings, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getStandingsAction } from '@/app/actions/statorium'
import { CardStack, CardStackItem } from '@/components/ui/card-stack'

const LEAGUE_CONFIGS = [
  {
    id: '515',
    name: 'PREMIER LEAGUE',
    logo: 'https://cdn.futwiz.com/assets/img/fc24/leagues/13.png',
    color: 'from-violet-600 to-indigo-950', 
    barColor: 'bg-indigo-700',
    stormTint: 'rgba(79, 70, 229, 0.4)',
  },
  {
    id: '521',
    name: 'BUNDESLIGA',
    logo: 'https://cdn.futwiz.com/assets/img/fc24/leagues/19.png',
    color: 'from-red-600 to-red-950',
    barColor: 'bg-red-700',
    stormTint: 'rgba(220, 38, 38, 0.4)',
  },
  {
    id: '558', // La Liga in the center
    name: 'LA LIGA',
    logo: 'https://cdn.futwiz.com/assets/img/fc24/leagues/53.png',
    color: 'from-orange-500 to-red-900',
    barColor: 'bg-orange-600',
    stormTint: 'rgba(249, 115, 22, 0.4)',
  },
  {
    id: '511',
    name: 'SERIE A',
    logo: 'https://cdn.futwiz.com/assets/img/fc24/leagues/31.png',
    color: 'from-blue-600 to-black',
    barColor: 'bg-blue-700',
    stormTint: 'rgba(37, 99, 235, 0.4)',
  },
  {
    id: '519',
    name: 'LIGUE 1',
    logo: 'https://cdn.futwiz.com/assets/img/fc24/leagues/16.png',
    color: 'from-lime-500 to-green-950',
    barColor: 'bg-lime-700',
    stormTint: 'rgba(132, 204, 22, 0.4)',
  }
]

type AppLeagueConfig = typeof LEAGUE_CONFIGS[0] & { clubs: any[] }

// Custom Component injected into the 3D render loop
function DynamicLeagueCard({ league, isActive }: { league: AppLeagueConfig, isActive: boolean }) {
  const [clubIndex, setClubIndex] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && league.clubs && league.clubs.length > 0) {
      interval = setInterval(() => {
        setClubIndex((prev) => (prev + 1) % league.clubs.length)
      }, 900) // Very fast smooth cycling
    }
    return () => clearInterval(interval)
  }, [isActive, league])

  if (!league.clubs || league.clubs.length === 0) return null;

  const activeClub = league.clubs[clubIndex]

  return (
    <div className={`relative w-full h-full flex flex-col justify-end overflow-hidden bg-[#0d0d0d] rounded-2xl ${isActive ? 'filter-none' : 'brightness-75'}`}>
      
      <div 
        className="absolute inset-0 opacity-40 mix-blend-color-dodge transition-opacity duration-500 z-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, ${league.stormTint} 0%, transparent 80%)` }}
      />
      
      {/* Huge Dynamic Club Logo Background */}
      <div className="absolute inset-x-0 top-0 w-full h-[60%] z-10 pointer-events-none flex justify-center items-center overflow-visible p-6 sm:p-10">
        <AnimatePresence>
          <motion.img
            key={activeClub.teamName}
            src={activeClub.teamLogo}
            alt={activeClub.teamName}
            initial={{ opacity: 0, x: 60, scale: 0.3, rotateY: 45, rotateZ: 10 }}
            animate={{ 
              opacity: isActive ? 0.45 : 0.15, 
              x: 0, 
              scale: isActive ? 0.7 : 0.5, 
              rotateY: 0, 
              rotateZ: 0 
            }}
            exit={{ opacity: 0, x: -60, scale: 0.3, rotateY: -45, rotateZ: -10 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.35 }}
            className="absolute w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] origin-center"
          />
        </AnimatePresence>
      </div>

      {/* Gradients to blend text at bottom */}
      <div className={`absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t ${league.color} to-transparent mix-blend-multiply z-10 opacity-90 pointer-events-none`} />
      <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent z-10 pointer-events-none" />

      {/* Center Layout for Text Info */}
      <div className="absolute inset-0 w-full mb-16 flex flex-col items-center justify-center gap-1 z-20 transition-all duration-300 pointer-events-none">
         {/* League Logo (Enlarges significantly on hover) */}
         <motion.div 
           animate={{ scale: isActive ? 1.2 : 1.0, y: isActive ? -10 : 0 }}
           transition={{ duration: 0.4 }}
           className="w-16 h-16 md:w-22 md:h-22 bg-white/5 backdrop-blur-md rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center p-3.5 mt-[35%]"
         >
            <img src={league.logo} alt="League Logo" className="w-full h-full object-contain filter drop-shadow-xl opacity-90 relative z-30" />
         </motion.div>
      </div>

      {/* Bottom Bar containing static league name */}
      <div className="flex-1" />
      <div className="relative z-30 w-full py-8 text-center flex items-center justify-center">
          <h2 className="text-sm md:text-base lg:text-lg font-bold tracking-[0.3em] uppercase text-zinc-200/70 whitespace-nowrap px-4 drop-shadow-lg">
            {league.name}
          </h2>
>>>>>>> 0fced7fac57a646d79d15a5adebe45adaee32fbd
      </div>
    </div>
  )
}

<<<<<<< HEAD
function DashboardCard({ icon: Icon, title, description, href }: { icon: any, title: string, description: string, href: string }) {
  return (
    <Link href={href} className="group p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm hover:shadow-md">
      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </Link>
=======
export default function ScoutProDashboard() {
  const [leaguesData, setLeaguesData] = useState<AppLeagueConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(2) // Default to center

  useEffect(() => {
    async function loadData() {
      const freshLeagues = await Promise.all(
        LEAGUE_CONFIGS.map(async (config) => {
          const standings = await getStandingsAction(config.id)
          // Grab all teams to cycle through
          let topClubs = standings || []

          // Ensure Real Madrid is the very first one for La Liga
          if (config.name === 'LA LIGA') {
            topClubs = topClubs.sort((a: any, b: any) => {
              const aIsRealContext = a.teamName?.toLowerCase().includes('real madrid');
              const bIsRealContext = b.teamName?.toLowerCase().includes('real madrid');
              if (aIsRealContext) return -1;
              if (bIsRealContext) return 1;
              return 0;
            });
          }

          return { ...config, clubs: topClubs }
        })
      )
      setLeaguesData(freshLeagues)
      setIsLoading(false)
    }
    loadData()
  }, [])

  const activeLeague = leaguesData[activeIndex]
  const activeBg = activeLeague?.logo;

  const stackItems: CardStackItem[] = leaguesData.map((league) => ({
    id: league.id,
    title: league.name,
    leagueData: league // pass custom payload
  })) as any

  return (
    <div className="relative w-full h-full bg-[#050505] font-sans flex flex-col items-center select-none overflow-y-auto overflow-x-hidden min-h-screen">
      
      {/* Base global black background */}
      <div className="fixed inset-0 bg-[#0a0a0a] z-0 pointer-events-none" />
      
      {/* Dynamic blurred league logo background */}
      <AnimatePresence>
         {activeBg && (
           <motion.div 
             key={activeBg}
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 0.2, scale: 1.3 }}
             exit={{ opacity: 0, scale: 1.1 }}
             transition={{ duration: 0.8 }}
             className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none"
           >
              <img src={activeBg} alt="League" className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] object-contain filter blur-[20px] grayscale-[5%]" />
           </motion.div>
         )}
      </AnimatePresence>

      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#090909]/80 backdrop-blur-lg border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="text-2xl drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">⚽</span>
          <span className="text-xl font-bold tracking-widest text-white drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">SCOUT PRO</span>
        </div>

        <div className="hidden md:flex gap-8 lg:gap-12 items-center justify-center absolute left-1/2 -translate-x-1/2">
          {[
            { name: 'Watchlist', href: '/watchlist' },
            { name: 'History', href: '/history' },
            { name: 'Compare Players', href: '/compare' },
            { name: 'Transfers', href: '/transfers' },
            { name: 'Leagues', href: '/leagues' }
          ].map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className="text-xs lg:text-sm font-semibold tracking-[0.15em] text-zinc-400 hover:text-white transition-colors duration-300 uppercase"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer group">
            <Bell className="w-5 h-5 text-zinc-300 hover:text-green-400 transition-colors" />
            <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-[#090909] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
              3
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content Layout */}
      <div className="w-full flex-grow flex flex-col justify-center items-center relative z-10 pt-28 pb-12 px-4 sm:px-8 md:px-12 lg:px-20 min-h-screen">
        
        {isLoading ? (
          <div className="h-[65vh] w-full flex items-center justify-center text-white/50 text-2xl font-bold tracking-widest animate-pulse">
            LOADING LEAGUES...
          </div>
        ) : (
          <div className="w-full max-w-[1500px] flex flex-col items-center justify-center mt-12 mb-8 relative z-20">
            <CardStack 
              items={stackItems} 
              initialIndex={2} // LaLiga focus
              maxVisible={5}
              cardWidth={500}
              cardHeight={500}
              overlap={0.4}
              spreadDeg={60}
              depthPx={120}
              onChangeIndex={(idx) => setActiveIndex(idx)}
              renderCard={(item: any, state) => (
                <DynamicLeagueCard league={item.leagueData} isActive={state.active} />
              )}
            />
          </div>
        )}

        {/* Below Hero Section CTA */}
        <div className="mt-8 flex flex-col items-center w-full z-20">
          <h1 className="text-2xl md:text-3xl font-black tracking-widest text-[#f8f8f8] mb-4 uppercase drop-shadow-[0_0_15px_rgba(0,0,0,1)] text-center">
            {activeLeague ? `Dominating ${activeLeague.name}` : "Explore The World's Best"}
          </h1>
          <Link 
            href={activeLeague ? `/leagues?sId=${activeLeague.id}` : "/leagues"}
            className="bg-white/90 backdrop-blur-md text-black px-12 py-3 text-sm font-black tracking-[0.2em] uppercase rounded-sm hover:-translate-y-1 hover:bg-white hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition-all duration-300 pointer-events-auto"
          >
            ENTER LEAGUE HUB
          </Link>
        </div>
      </div>
      
    </div>
>>>>>>> 0fced7fac57a646d79d15a5adebe45adaee32fbd
  )
}
