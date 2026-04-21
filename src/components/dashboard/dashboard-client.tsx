'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { CardStack, CardStackItem } from '@/components/ui/card-stack'

interface Club {
  teamID: string;
  teamName: string;
  teamLogo: string;
}

interface LeagueConfig {
  id: string;
  name: string;
  logo: string;
  color: string;
  barColor: string;
  stormTint: string;
  clubs: Club[];
}

function DynamicLeagueCard({ league, isActive }: { league: LeagueConfig, isActive: boolean }) {
  const [clubIndex, setClubIndex] = React.useState(0)

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && league.clubs && league.clubs.length > 0) {
      interval = setInterval(() => {
        setClubIndex((prev) => (prev + 1) % league.clubs.length)
      }, 4000) // Slower for better performance
    }
    return () => clearInterval(interval)
  }, [isActive, league.id, league.clubs?.length])

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
        <AnimatePresence mode="wait">
          <motion.div
            key={activeClub.teamName + "_" + league.id}
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ 
              opacity: isActive ? 0.45 : 0.15, 
              x: 0, 
              scale: isActive ? 0.7 : 0.5, 
            }}
            exit={{ opacity: 0, x: -20, scale: 0.8 }}
            transition={{ duration: 0.8 }}
            className="absolute w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] origin-center flex items-center justify-center"
          >
             <Image
              src={activeClub.teamLogo}
              alt={activeClub.teamName}
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-contain"
              priority={isActive}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={`absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t ${league.color} to-transparent mix-blend-multiply z-10 opacity-90 pointer-events-none`} />
      <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-background via-background/80 to-transparent z-10 pointer-events-none" />

      <div className="absolute inset-0 w-full mb-16 flex flex-col items-center justify-center gap-1 z-20 transition-all duration-300 pointer-events-none">
         <motion.div 
           animate={{ scale: isActive ? 1.2 : 1.0, y: isActive ? -10 : 0 }}
           transition={{ duration: 0.4 }}
           className="w-16 h-16 md:w-22 md:h-22 bg-white/5 backdrop-blur-md rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center p-3.5 mt-[35%]"
         >
            <Image 
              src={league.logo} 
              alt="League Logo" 
              fill
              className="object-contain filter drop-shadow-xl opacity-90 relative z-30" 
            />
         </motion.div>
      </div>

      <div className="flex-1" />
      <div className="relative z-30 w-full py-8 text-center flex items-center justify-center">
          <h2 className="text-sm md:text-base lg:text-lg font-bold tracking-[0.3em] uppercase text-foreground/70 whitespace-nowrap px-4 drop-shadow-lg">
            {league.name}
          </h2>
      </div>
    </div>
  )
}

export function DashboardClient({ initialLeagues }: { initialLeagues: LeagueConfig[] }) {
  const [activeIndex, setActiveIndex] = useState(2)

  const activeLeague = initialLeagues[activeIndex]
  const activeBg = activeLeague?.logo;

  const stackItems: CardStackItem[] = initialLeagues.map((league) => ({
    id: league.id,
    title: league.name,
    leagueData: league 
  })) as any

  return (
    <div className="relative w-full h-full bg-background font-sans flex flex-col items-center select-none overflow-y-auto overflow-x-hidden min-h-screen">
      <div className="fixed inset-0 bg-background z-0 pointer-events-none" />
      
      <AnimatePresence>
         {activeBg && (
           <motion.div 
             key={activeBg}
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 0.1, scale: 1.2 }} // Reduced opacity for performance
             exit={{ opacity: 0, scale: 1.1 }}
             transition={{ duration: 1.2 }}
             className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none"
           >
              <Image 
                src={activeBg} 
                alt="League Background" 
                fill
                quality={50}
                className="object-contain filter blur-[40px] grayscale-[10%]" 
              />
           </motion.div>
         )}
      </AnimatePresence>

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
          <div className="relative cursor-pointer group">
            <Bell className="w-5 h-5 text-muted-foreground hover:text-green-500 transition-colors" />
            <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
              3
            </span>
          </div>
        </div>
      </nav>

      <div className="w-full flex-grow flex flex-col justify-center items-center relative z-10 pt-28 pb-12 px-4 sm:px-8 md:px-12 lg:px-20 min-h-screen">
        <div className="w-full max-w-[1500px] flex flex-col items-center justify-center mt-12 mb-8 relative z-20">
          <CardStack 
            items={stackItems} 
            initialIndex={2} 
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

        <div className="mt-8 flex flex-col items-center w-full z-20">
          <motion.h1 
            key={activeLeague?.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-black tracking-widest text-foreground mb-4 uppercase drop-shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_15px_rgba(0,0,0,1)] text-center"
          >
            {activeLeague ? `Dominating ${activeLeague.name}` : "Explore The World's Best"}
          </motion.h1>
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
