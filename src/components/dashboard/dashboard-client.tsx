'use client'

import React from 'react'
import Link from 'next/link'
import { User, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { CustomThemeDialog } from '@/components/custom-theme-dialog'

export function DashboardClient() {
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
          <span className="text-2xl font-black tracking-tighter text-foreground uppercase italic">SCOUT <span className="text-primary font-light">MANAGEMENT</span></span>
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

      <main className="w-full max-w-[1400px] mt-32 px-6 pb-24 space-y-16 relative z-10 flex-1">
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
                Streamline your scouting workflow. Receive scout job assignments, track and compare players, analyze predispositions for club compatibility, and monitor elite leagues with real-time intelligence.
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
        <div className="w-full flex justify-center pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/scout-jobs">
              <Button className="px-20 py-8 text-xl font-bold bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-black rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all duration-300">
                Go to Scout Missions
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  )
}