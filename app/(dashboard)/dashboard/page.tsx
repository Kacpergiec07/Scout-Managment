'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Settings, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getStandingsAction } from '@/app/actions/statorium'
import { CardStack, CardStackItem } from '@/components/ui/card-stack'
import { NotificationsBell } from '@/components/notifications-bell-new'

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
    <div className={`relative w-full h-full flex flex-col justify-end overflow-hidden bg-background border border-border rounded-2xl ${isActive ? 'filter-none' : 'brightness-75'}`}>
      
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
      <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-background via-background/80 to-transparent z-10 pointer-events-none" />

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
          <h2 className="text-sm md:text-base lg:text-lg font-bold tracking-[0.3em] uppercase text-foreground/70 whitespace-nowrap px-4 drop-shadow-lg">
            {league.name}
          </h2>
      </div>
    </div>
  )
}

export default function DashboardPage() {
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
            topClubs = [...topClubs].sort((a: any, b: any) => {
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
    <div className="relative w-full h-full bg-background font-sans flex flex-col items-center select-none overflow-y-auto overflow-x-hidden min-h-screen">
      
      {/* Base global background */}
      <div className="fixed inset-0 bg-background z-0 pointer-events-none" />
      
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
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="text-2xl drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">⚽</span>
          <span className="text-xl font-bold tracking-widest text-foreground drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">SCOUT PRO</span>
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
              className="text-xs lg:text-sm font-semibold tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors duration-300 uppercase"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <NotificationsBell />
        </div>
      </nav>

      {/* Main Content Layout */}
      <div className="w-full flex-grow flex flex-col justify-center items-center relative z-10 pt-28 pb-12 px-4 sm:px-8 md:px-12 lg:px-20 min-h-screen">
        
        {isLoading ? (
          <div className="h-[65vh] w-full flex items-center justify-center text-muted-foreground text-2xl font-bold tracking-widest animate-pulse">
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
          <h1 className="text-2xl md:text-3xl font-black tracking-widest text-foreground mb-4 uppercase drop-shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_15px_rgba(0,0,0,1)] text-center">
            {activeLeague ? `Dominating ${activeLeague.name}` : "Explore The World's Best"}
          </h1>
          <Link 
            href={activeLeague ? `/leagues?sId=${activeLeague.id}` : "/leagues"}
            className="bg-foreground text-background px-12 py-3 text-sm font-black tracking-[0.2em] uppercase rounded-sm hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition-all duration-300 pointer-events-auto"
          >
            ENTER LEAGUE HUB
          </Link>
        </div>
      </div>
      
    </div>
  )
}
