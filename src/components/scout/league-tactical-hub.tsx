'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  ChevronRight, 
  Search, 
  Filter, 
  Activity, 
  Target,
  Globe2,
  TrendingUp,
  MapPin
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LEAGUES } from '@/lib/statorium-data'

export function LeagueTacticalHub() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  const filteredLeagues = LEAGUES.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'ALL' || l.country?.toUpperCase() === filter
    return matchesSearch && matchesFilter
  })

  const countries = ['ALL', ...Array.from(new Set(LEAGUES.map(l => l.country?.toUpperCase() || 'UNKNOWN')))]

  return (
    <div className="min-h-screen bg-background p-8 lg:p-12 space-y-16">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-border pb-16">
        <div className="space-y-6">
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 text-xs font-bold uppercase tracking-widest">
            Tactical Coverage v4.0
          </Badge>
          <h1 className="text-7xl lg:text-9xl font-bold tracking-tighter text-foreground leading-none">
            League <span className="text-muted-foreground font-light">Directory</span>
          </h1>
          <p className="text-lg font-medium text-muted-foreground max-w-2xl leading-relaxed">
            Real-time surveillance across global competitive sectors. Select a professional theater to begin deep tactical analysis.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Filter by league or sector..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-16 pl-14 bg-muted/50 border-border rounded-2xl font-bold uppercase tracking-widest focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-1 bg-muted/30 rounded-2xl border border-border w-fit">
        {countries.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
              filter === c 
              ? "bg-card text-primary shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Leagues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {filteredLeagues.map((league) => (
          <motion.div
            key={league.id}
            whileHover={{ y: -8 }}
            className="group relative"
          >
            <div className="premium-card overflow-hidden flex flex-col h-full rounded-[2.5rem]">
              {/* Card Header with Flag */}
              <div className="relative h-56 border-b border-border overflow-hidden bg-muted/20">
                {league.flag && (league.flag.startsWith('http') || league.flag.startsWith('/')) ? (
                  <Image 
                    src={league.flag} 
                    alt={league.country || 'Flag'} 
                    fill 
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105 opacity-10 group-hover:opacity-40"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-5 group-hover:opacity-10 transition-opacity">
                    {league.flag || '⚽'}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-8 left-8 flex items-center gap-6">
                  <div className="w-20 h-20 bg-card rounded-2xl border border-border p-3 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {league.logo && (league.logo.startsWith('http') || league.logo.startsWith('/')) ? (
                      <Image src={league.logo} alt={league.name} width={80} height={80} className="object-contain" />
                    ) : (
                      <Globe2 className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-foreground leading-none">{league.name}</h2>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">{league.country}</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8 space-y-8 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-muted/30 border border-border/50">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Market Value</span>
                    <p className="text-xl font-bold text-foreground leading-none mt-2 italic">€4.2B</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-muted/30 border border-border/50">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Clubs Active</span>
                    <p className="text-xl font-bold text-foreground leading-none mt-2 italic">20</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-muted-foreground">Tactical Complexity</span>
                    <span className="text-primary">94%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden border border-border/30">
                    <div className="h-full bg-primary shadow-[0_0_10px_rgba(0,255,136,0.5)]" style={{ width: '94%' }} />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-4 border-card bg-muted flex items-center justify-center text-[10px] font-bold shadow-sm">
                        {i}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight ml-2">Assigned Scouts</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-8 pt-0 mt-auto">
                <Link href={`/dashboard?sId=${league.id}`}>
                  <Button className="premium-btn w-full h-16 text-xs group/btn">
                    VIEW HUB <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Corner Badge */}
            <div className="absolute -top-3 -right-3 bg-primary text-black px-4 py-1.5 font-bold text-[10px] uppercase italic tracking-widest shadow-xl rounded-lg z-10">
              HOT SECTOR
            </div>
          </motion.div>
        ))}
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-16">
        {[
          { label: 'Players Tracked', val: '124,502', icon: Globe2, color: 'text-blue-400' },
          { label: 'Market Flow', val: '842', icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'System Precision', val: '99.8%', icon: Target, color: 'text-amber-400' },
          { label: 'Strategic Nodes', val: '42', icon: Activity, color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="premium-card p-10 rounded-[2rem] bg-gradient-to-br from-muted/20 to-transparent">
            <div className="flex items-center justify-between mb-8">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div className="bg-primary/5 px-3 py-1 rounded-full text-[8px] font-bold text-primary uppercase tracking-widest border border-primary/20">Active</div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">{stat.label}</p>
            <p className="text-4xl font-bold text-foreground italic tracking-tight">{stat.val}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
