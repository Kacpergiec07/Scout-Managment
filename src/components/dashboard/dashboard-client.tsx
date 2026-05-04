'use client'

import React from 'react'
import Link from 'next/link'
import { User, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { CustomThemeDialog } from '@/components/custom-theme-dialog'

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
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [isActive, league.id, league.clubs?.length])

  if (!league.clubs || league.clubs.length === 0) return null;

  const activeClub = league.clubs[clubIndex]

  return (
    <div className={`relative w-full h-full flex flex-col justify-end overflow-hidden bg-background border-none rounded-[2rem] shadow-xl ${isActive ? 'filter-none' : 'brightness-75'}`}>

      <div
        className="absolute inset-0 opacity-40 mix-blend-color-dodge transition-opacity duration-500 z-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, ${league.stormTint} 0%, transparent 80%)` }}
      />

      {/* Huge Dynamic Club Logo Background */}
      <div className="absolute inset-x-0 top-0 w-full h-[60%] z-10 pointer-events-none flex justify-center items-center overflow-visible p-6 sm:p-10">
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
      </div>

      <div className={`absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t ${league.color} to-transparent mix-blend-multiply z-10 opacity-90 pointer-events-none`} />
      <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-background via-background/80 to-transparent z-10 pointer-events-none" />

      <div className="absolute inset-0 w-full mb-16 flex flex-col items-center justify-center gap-1 z-20 transition-all duration-300 pointer-events-none">
        <motion.div
          animate={{ scale: isActive ? 1.2 : 1.0, y: isActive ? -10 : 0 }}
          transition={{ duration: 0.4 }}
          className="w-16 h-16 md:w-22 md:h-22 bg-background/5 backdrop-blur-md rounded-full shadow-[0_0_30px_rgba(0,0,0,0.2)] flex items-center justify-center p-3.5 mt-[35%]"
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
    <div className="w-full overflow-hidden rounded-[2rem] border-none bg-card/20 backdrop-blur-3xl shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-secondary/5 border-none">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">League</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Identifier</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Elite Clubs</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Intelligence</th>
            </tr>
          </thead>
          <tbody className="divide-none">
            {leagues.map((league, idx) => (
              <tr
                key={league.id}
                className={`group cursor-pointer hover:bg-primary/5 transition-all ${activeIndex === idx ? 'bg-primary/5' : ''}`}
                onClick={() => onSelect(idx)}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 relative bg-background rounded-xl p-1.5 shadow-inner border-none group-hover:scale-110 transition-transform">
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
                      <div key={club.teamID} className="w-8 h-8 rounded-full border-none bg-background p-1 relative overflow-hidden shadow-sm" title={club.teamName}>
                        <Image src={club.teamLogo} alt={club.teamName} fill className="object-contain p-0.5" />
                      </div>
                    ))}
                    {league.clubs.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-none bg-muted text-foreground flex items-center justify-center text-[8px] font-bold">
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
  return (
    <div className="relative w-full h-screen font-sans flex flex-col items-center select-none overflow-hidden bg-background text-foreground">
      {/* Refined Background Effect */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <nav className="fixed top-0 left-0 w-full z-50 bg-background/60 backdrop-blur-3xl border-none px-8 py-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center text-xl border-none group-hover:scale-110 transition-transform shadow-lg">
            <span className="filter drop-shadow-[0_0_8px_hsl(var(--secondary)/0.5)]">⚽</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground uppercase italic">SCOUT <span className="text-primary font-light">PRO</span></span>
        </div>

        <div className="hidden lg:flex gap-10 items-center justify-center absolute left-1/2 -translate-x-1/2">
          {[
            { name: 'Scout Jobs', href: '/scout-jobs' },
            { name: 'Watchlist', href: '/watchlist' },
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

        <div className="flex items-center gap-2">
          <Link href="/profile">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors" title="Profile">
              <User className="w-5 h-5" />
            </button>
          </Link>
          <Link href="/settings">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors" title="Settings">
              <Settings className="w-5 h-5" />
            </button>
          </Link>
          <CustomThemeDialog />
          <ThemeToggle />
        </div>
      </nav>

      <main className="w-full max-w-[1400px] mt-32 px-6 space-y-16 relative z-10 flex-1">
        {/* Application Description */}
        <div className="text-center space-y-6 py-12 relative">
          {/* Animated background elements */}
          <motion.div
            className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -top-10 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase text-foreground leading-[0.85] mb-6">
              SCOUT <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-500 to-emerald-900 animate-gradient bg-[length:200%_auto]">MANAGEMENT</span>
            </h1>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                Streamline your scouting workflow. Receive scout job assignments, track and compare players, analyze predispositions for club compatibility, monitor transfers, and get AI-powered recommendations to find the perfect talent.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-xs font-bold uppercase tracking-wider">
                {[
                  { text: "Assignments", icon: "📋" },
                  { text: "Player Tracking", icon: "👤" },
                  { text: "Comparisons", icon: "⚖️" },
                  { text: "Transfer Monitor", icon: "🔄" },
                  { text: "AI Assistant", icon: "🤖" },
                  { text: "Club Intelligence", icon: "🏟️" }
                ].map((item, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.08 }}
                    className="px-3 py-1.5 bg-primary/10 rounded-full border-none text-primary hover:bg-primary/20 hover:scale-105 transition-all cursor-default shadow-sm"
                  >
                    {item.icon} {item.text}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Button for Scout Jobs */}
        <div className="w-full flex justify-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/scout-jobs">
              <Button className="px-20 py-8 text-xl font-bold bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-black rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>

      </main>
    </div>
  )
}