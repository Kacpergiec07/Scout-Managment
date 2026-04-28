'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRightLeft,
  TrendingUp,
  DollarSign,
  Zap,
  Activity,
  Target,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  BrainCircuit,
  MapPin,
  Clock,
  Loader2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { VERIFIED_TRANSFERS as OFFICIAL_TRANSFERS } from '@/lib/statorium-data'

export function TransferWarRoom() {
  const [activeTab, setActiveTab] = useState('LIVE')
  const [search, setSearch] = useState('')

  // Deterministic hash for consistent hydration
  const getSuccessProbability = (id: string): number => {
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i)
      hash = hash & hash // Convert to 32bit integer
    }
    const absHash = Math.abs(hash)
    return 80 + (absHash % 20) // Returns 80-99
  }

  return (
    <div className="min-h-screen bg-background p-8 lg:p-12 space-y-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-border pb-16">
        <div className="space-y-6">
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 text-xs font-bold uppercase tracking-widest">
            Market Intelligence Hub
          </Badge>
          <h1 className="text-7xl lg:text-9xl font-bold tracking-tighter text-foreground uppercase leading-none">
            Transfer <span className="text-muted-foreground font-light">Market</span>
          </h1>
          <p className="text-lg font-medium text-muted-foreground max-w-2xl leading-relaxed">
            Real-time market tracking and high-value signature analysis. Strategic movement vectors activated for elite sectors.
          </p>
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3 px-6 py-2 bg-primary/10 rounded-full border border-primary/20">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Live Stream Active</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-2 bg-muted rounded-full border border-border">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold text-foreground uppercase tracking-widest">Window Closes: 12D 04H</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
        {/* Market Ticker Sidebar */}
        <div className="xl:col-span-1 space-y-8">
          <div className="premium-card p-8 flex flex-col h-[650px] rounded-[2.5rem]">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-10 flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary" /> Recent Movements
            </h3>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                {OFFICIAL_TRANSFERS.map((t, i) => (
                  <div key={i} className="group p-5 rounded-2xl border border-border/50 bg-muted/20 hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> 2m ago
                      </span>
                      <Badge className="bg-primary/10 text-primary text-[8px] font-bold border-none uppercase tracking-widest">Verified</Badge>
                    </div>
                    <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{t.playerName}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] font-medium text-muted-foreground truncate uppercase">{t.fromTeamName}</span>
                      <ArrowRightLeft className="w-3 h-3 text-muted-foreground/30" />
                      <span className="text-[10px] font-bold text-foreground truncate uppercase">{t.toTeamName}</span>
                    </div>
                    <p className="text-sm font-bold text-primary mt-4 italic">{t.fee}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="premium-card p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-3 text-amber-500">
              <TrendingUp className="w-5 h-5" /> Market Trend
            </h3>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed uppercase tracking-wider">
              Signatures for U21 forwards have surged by 240% in the last 48 hours. Strategic scarcity detected in Serie A.
            </p>
          </div>
        </div>

        {/* Tactical Map / Market Overview */}
        <div className="xl:col-span-3 space-y-12">
          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="premium-card p-10 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-transparent">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Total Market Volume</h4>
              <p className="text-5xl font-bold text-foreground tracking-tighter">€1.42B</p>
              <div className="flex items-center gap-2 mt-6 text-[10px] font-bold text-primary uppercase">
                <ArrowUpRight className="w-4 h-4" /> +12% VS Last Window
              </div>
            </div>
            <div className="premium-card p-10 rounded-[2.5rem]">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">High Value Targets</h4>
              <p className="text-5xl font-bold text-foreground tracking-tighter">42</p>
              <div className="flex items-center gap-2 mt-6 text-[10px] font-bold text-primary uppercase">
                <ShieldCheck className="w-4 h-4" /> Verified Profiles
              </div>
            </div>
            <div className="premium-card p-10 rounded-[2.5rem] border border-primary/20 bg-primary/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Neural Fit Analysis</h4>
              <p className="text-5xl font-bold text-primary tracking-tighter">98%</p>
              <div className="flex items-center gap-2 mt-6 text-[10px] font-bold text-foreground uppercase italic tracking-widest">
                <BrainCircuit className="w-4 h-4" /> Fit Accuracy
              </div>
            </div>
          </div>

          {/* Detailed Transfer List */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border pb-8">
              <h3 className="text-3xl font-bold tracking-tight">Market <span className="text-muted-foreground font-light">Ledger</span></h3>
              <div className="flex gap-2 p-1 bg-muted rounded-xl border border-border">
                {['ALL', 'ELITE', 'RUMOR', 'LOAN'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === tab
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="premium-card rounded-[2.5rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Player & Profile</th>
                      <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Origin</th>
                      <th className="w-12 text-center text-muted-foreground/30">→</th>
                      <th className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Destination</th>
                      <th className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Est. Fee</th>
                      <th className="px-8 py-5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tactical Fit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {OFFICIAL_TRANSFERS.map((t, idx) => (
                      <tr key={idx} className="group hover:bg-primary/5 transition-all cursor-pointer">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 relative bg-muted rounded-2xl p-1 shrink-0 overflow-hidden border border-border group-hover:scale-105 transition-transform">
                              <Image src={t.photoUrl} alt={t.playerName} fill className="object-cover" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-bold text-foreground text-sm uppercase">{t.playerName}</p>
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t.nationality}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            {t.fromTeamLogo ? (
                              <Image src={t.fromTeamLogo} alt="" width={24} height={24} className="grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100" />
                            ) : (
                              <div className="w-6 h-6 rounded-md bg-muted border border-border" />
                            )}
                            <span className="text-xs font-bold text-muted-foreground uppercase">{t.fromTeamName}</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <ArrowRightLeft className="w-4 h-4 mx-auto text-muted-foreground/20" />
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            {t.toTeamLogo ? (
                              <Image src={t.toTeamLogo} alt="" width={28} height={28} className="group-hover:scale-110 transition-transform" />
                            ) : (
                              <div className="w-7 h-7 rounded-md bg-muted border border-border" />
                            )}
                            <span className="text-xs font-bold text-primary uppercase">{t.toTeamName}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right font-bold text-lg italic tracking-tight">{t.fee}</td>
                        <td className="px-8 py-6 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-lg text-primary text-[10px] font-bold border border-primary/20">
                            {getSuccessProbability(t.id)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
