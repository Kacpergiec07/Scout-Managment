'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { CardStack, CardStackItem } from '@/components/ui/card-stack'
import { NotificationsBell } from '@/components/notifications-bell-new'
import { FloatingSettings } from '@/components/scout/floating-settings'
import { HomeTeamSelector } from '@/components/scout/home-team-selector'
import { SquadIntelligence } from '@/components/scout/squad-intelligence'

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

const DynamicLeagueCard = React.memo(function DynamicLeagueCard({ league, isActive }: { league: LeagueConfig, isActive: boolean }) {
  const [clubIndex, setClubIndex] = React.useState(0)

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && league.clubs && league.clubs.length > 0) {
      interval = setInterval(() => {
        setClubIndex((prev) => (prev + 1) % league.clubs.length)
      }, 5000) // Even slower for better performance
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
})

function DynamicLeagueTable({ leagues, activeIndex, onSelect }: { leagues: LeagueConfig[], activeIndex: number, onSelect: (idx: number) => void }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-card/30 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">League</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Identifier</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Elite Clubs</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Intelligence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {leagues.map((league, idx) => (
              <tr 
                key={league.id} 
                className={`group cursor-pointer hover:bg-primary/5 transition-all ${activeIndex === idx ? 'bg-primary/5' : ''}`}
                onClick={() => onSelect(idx)}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 relative bg-white rounded-xl p-1.5 shadow-sm border border-border group-hover:scale-110 transition-transform">
                      <Image src={league.logo} alt={league.name} fill className="object-contain" />
                    </div>
                    <span className="font-bold text-sm text-foreground">{league.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <code className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">{league.id}</code>
                </td>
                <td className="px-6 py-5">
                  <div className="flex -space-x-2">
                    {league.clubs.slice(0, 3).map((club) => (
                      <div key={club.teamID} className="w-8 h-8 rounded-full border-2 border-background bg-white p-1 relative overflow-hidden shadow-sm" title={club.teamName}>
                        <Image src={club.teamLogo} alt={club.teamName} fill className="object-contain p-0.5" />
                      </div>
                    ))}
                    {league.clubs.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-background bg-muted text-foreground flex items-center justify-center text-[8px] font-bold">
                        +{league.clubs.length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <Link href={`/leagues?sId=${league.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 px-4 text-[10px] font-bold hover:bg-primary hover:text-black transition-all rounded-xl">
                      ANALYZE
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function DashboardClient({ initialLeagues }: { initialLeagues: LeagueConfig[] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  const activeLeague = initialLeagues[activeIndex]

  return (
    <div className="relative w-full h-full bg-background font-sans flex flex-col items-center select-none overflow-y-auto overflow-x-hidden min-h-screen pb-20">
      {/* Refined Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-xl border border-primary/30 group-hover:scale-110 transition-transform">
            <span className="filter drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]">⚽</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground uppercase italic">SCOUT <span className="text-primary font-light">PRO</span></span>
        </div>

        <div className="hidden lg:flex gap-10 items-center justify-center absolute left-1/2 -translate-x-1/2">
          {[
            { name: 'Watchlist', href: '/watchlist' },
            { name: 'Compare', href: '/compare' },
            { name: 'Transfers', href: '/transfers' },
            { name: 'Leagues', href: '/leagues' }
          ].map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground hover:text-primary transition-all uppercase relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <HomeTeamSelector />
          <div className="h-6 w-px bg-border" />
          <NotificationsBell />
        </div>
      </nav>

      <main className="w-full max-w-[1400px] mt-32 px-6 space-y-20 relative z-10">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center py-12">
          <div className="lg:col-span-3 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Scouting Engine v4.0</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase text-foreground leading-[0.85]">
              TACTICAL <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">INTELLIGENCE</span>
            </h1>
            <p className="text-lg font-medium text-muted-foreground max-w-xl leading-relaxed">
              Global player monitoring, contract tracking, and AI-driven scouting vectors for the elite modern strategist.
            </p>
            <div className="flex gap-6 pt-4">
              <button className="premium-btn h-14 px-10 text-sm">Deploy Scout</button>
              <button className="h-14 px-10 text-sm font-bold uppercase tracking-widest border border-border rounded-2xl hover:bg-muted transition-colors">War Room</button>
            </div>
          </div>
          
          <div className="lg:col-span-2 premium-card p-1 rounded-[2.5rem] overflow-hidden">
             <div className="bg-card/50 backdrop-blur-xl p-8 rounded-[2.4rem]">
               <div className="flex items-center justify-between mb-8">
                 <div className="space-y-1">
                   <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Database Access</span>
                   <h3 className="font-bold uppercase tracking-tight text-xl">Global Leagues</h3>
                 </div>
                 <div className="w-10 h-10 rounded-2xl bg-primary text-black flex items-center justify-center text-xs font-black shadow-[0_0_20px_rgba(0,255,136,0.3)]">PRO</div>
               </div>
               <div className="space-y-4">
                 {initialLeagues.map((league, idx) => (
                   <div 
                     key={league.id} 
                     onClick={() => setActiveIndex(idx)}
                     className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${activeIndex === idx ? 'bg-primary/5 border-primary/30' : 'border-border/50 hover:border-border'}`}
                   >
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 relative bg-white rounded-xl p-1 shadow-sm border border-border group-hover:scale-110 transition-transform">
                         <Image src={league.logo} alt={league.name} fill className="object-contain" />
                       </div>
                       <span className={`font-bold text-sm ${activeIndex === idx ? 'text-primary' : 'text-foreground'}`}>{league.name}</span>
                     </div>
                     <Link href={`/leagues?sId=${league.id}`}>
                       <button className={`p-2 rounded-xl border transition-all ${activeIndex === idx ? 'bg-primary border-primary text-black' : 'border-border opacity-0 group-hover:opacity-100'}`}>
                         <Bell className="w-4 h-4" />
                       </button>
                     </Link>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>

        {/* Squad Intelligence Section */}
        <div className="w-full space-y-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight text-foreground uppercase italic">Active Operations</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Real-time squad analysis</p>
            </div>
            <div className="h-px flex-1 mx-12 bg-border/50" />
            <Link href="/compare">
              <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">View All Data</button>
            </Link>
          </div>
          <SquadIntelligence />
        </div>

        {/* Tactical Feed / Transfers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          <div className="premium-card p-8 rounded-[2rem] bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
            <h3 className="font-bold uppercase tracking-[0.2em] text-[10px] mb-6 text-amber-500">Market Alert</h3>
            <p className="text-2xl font-bold italic leading-tight mb-6">Transfer Window Opens In 12 Days</p>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-200/70 leading-relaxed uppercase">
              Expect high volatility in Premier League mid-field values.
            </div>
          </div>
          
          <div className="premium-card p-8 rounded-[2rem] bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <h3 className="font-bold uppercase tracking-[0.2em] text-[10px] mb-6 text-primary">Tactical Insight</h3>
            <p className="text-2xl font-bold italic leading-tight mb-6">Full-Back Inversion Meta Rising</p>
            <Link href="/compare">
              <button className="premium-btn w-full h-12 text-[10px]">Analyze Global Fit</button>
            </Link>
          </div>

          <div className="premium-card p-8 rounded-[2rem] bg-gradient-to-br from-zinc-500/5 to-transparent border-zinc-500/20">
            <h3 className="font-bold uppercase tracking-[0.2em] text-[10px] mb-6 text-muted-foreground">System Status</h3>
            <p className="text-2xl font-bold italic leading-tight mb-6">Database Fully Synchronized</p>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">All API Feeds Live</span>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-10 right-10 z-50">
        <FloatingSettings />
      </div>
    </div>
  )
}
