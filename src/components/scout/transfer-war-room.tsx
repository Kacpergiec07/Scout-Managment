'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Loader2,
  Heart,
  Star,
  Check,
  ArrowRight,
  RefreshCw,
  Plus,
  ChevronLeft,
  X,
  Eye,
  Trash2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { VERIFIED_TRANSFERS as OFFICIAL_TRANSFERS, LEAGUES } from '@/lib/statorium-data'
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { TransferDetailsModal } from "./transfer-details-modal"
import { searchPlayersAction, getPlayerLatestTransferAction, getStandingsAction, getPlayersByClubAction } from '@/app/actions/statorium'

const TEAM_TO_LEAGUE: Record<string, string> = {
  // Premier League
  "4": "Premier League", // Man City
  "16": "Premier League", // Bournemouth
  "2": "Premier League", // Tottenham
  "15": "Premier League", // Crystal Palace
  "112": "Premier League", // Aston Villa
  "7": "Premier League", // Man Utd
  "6": "Premier League", // Everton
  "8": "Premier League", // Chelsea
  "9": "Premier League", // Arsenal
  "3": "Premier League", // Liverpool

  // La Liga
  "37": "La Liga", // Real Madrid
  "39": "La Liga", // Atletico Madrid
  "23": "La Liga", // Barcelona
  "26": "La Liga", // Girona

  // Serie A
  "105": "Serie A", // Juventus
  "41": "Serie A", // Atalanta
  "96": "Serie A", // AC Milan
  "93": "Serie A", // Bologna

  // Bundesliga
  "47": "Bundesliga", // Bayern Munich
  "166": "Bundesliga", // RB Leipzig

  // Ligue 1
  "66": "Ligue 1", // PSG
  "69": "Ligue 1", // Lille
}

const TOP_LEAGUES_WIDGET = [
  { id: "515", name: "Premier League", logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/13.png", color: "#8000ff" },
  { id: "558", name: "La Liga", logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/53.png", color: "#ff1e2d" },
  { id: "511", name: "Serie A", logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/31.png", color: "#0064ff" },
  { id: "521", name: "Bundesliga", logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/19.png", color: "#ff0000" },
  { id: "519", name: "Ligue 1", logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/16.png", color: "#c8ff32" },
];

export function TransferWarRoom({ transfers: initialTransfers = OFFICIAL_TRANSFERS }: { transfers?: any[] }) {
  const [transfers, setTransfers] = useState(initialTransfers)
  const [activeTab, setActiveTab] = useState('LIVE')
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [focusedTransfer, setFocusedTransfer] = useState<any | null>(null)
  const [evaluating, setEvaluating] = useState<Record<string, boolean>>({})
  const [addStep, setAddStep] = useState<'league' | 'club' | 'talent'>('league')
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null)
  const [selectedClub, setSelectedClub] = useState<any>(null)
  const [modalClubs, setModalClubs] = useState<any[]>([])
  const [modalPlayers, setModalPlayers] = useState<any[]>([])
  const [modalLoading, setModalLoading] = useState(false)

  // Fetch clubs when league is selected
  useEffect(() => {
    if (addStep === 'club' && selectedLeagueId) {
      async function loadClubs() {
        setModalLoading(true)
        try {
          const data = await getStandingsAction(selectedLeagueId as string)
          setModalClubs(data || [])
        } catch (e) {
          console.error(e)
        } finally {
          setModalLoading(false)
        }
      }
      loadClubs()
    }
  }, [addStep, selectedLeagueId])

  // Fetch players when club is selected
  useEffect(() => {
    if (addStep === 'talent' && selectedClub) {
      async function loadPlayers() {
        setModalLoading(true)
        try {
          const data = await getPlayersByClubAction(selectedClub.teamID)
          setModalPlayers(data || [])
        } catch (e) {
          console.error(e)
        } finally {
          setModalLoading(false)
        }
      }
      loadPlayers()
    }
  }, [addStep, selectedClub])

  // Filter States (UI)
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([])
  const [feeRange, setFeeRange] = useState<[number, number]>([0, 150])
  const [sortOrder, setSortOrder] = useState<'NONE' | 'A-Z' | 'Z-A' | 'MIN-MAX' | 'MAX-MIN'>('NONE')

  // Applied Filters (Used for actual filtering)
  const [appliedFilters, setAppliedFilters] = useState({
    selectedLeagues: [] as string[],
    feeRange: [0, 150] as [number, number],
    sortOrder: 'NONE' as 'NONE' | 'A-Z' | 'Z-A' | 'MIN-MAX' | 'MAX-MIN'
  })

  const [notification, setNotification] = useState<string | null>(null)

  const toggleLeague = (league: string) => {
    setSelectedLeagues(prev => 
      prev.includes(league) ? prev.filter(l => l !== league) : [...prev, league]
    )
  }

  const filteredTransfers = useMemo(() => {
    let result = transfers.filter(t => {
      // League Filter
      if (appliedFilters.selectedLeagues.length > 0) {
        const fromLeague = TEAM_TO_LEAGUE[t.fromTeamID]
        const toLeague = TEAM_TO_LEAGUE[t.toTeamID]
        const matchesLeague = appliedFilters.selectedLeagues.some(l => l === fromLeague || l === toLeague)
        if (!matchesLeague) return false
      }

      // Fee Filter
      if (t.fee !== 'Free') {
        const feeVal = parseInt(t.fee.replace('€', '').replace('M', '')) || 0
        if (feeVal < appliedFilters.feeRange[0] || feeVal > appliedFilters.feeRange[1]) return false
      } else if (appliedFilters.feeRange[0] > 0) {
        return false // Free agents only if min fee is 0
      }

      return true
    })

    // Sorting
    if (appliedFilters.sortOrder === 'A-Z') {
      result.sort((a, b) => (a.playerName || '').localeCompare(b.playerName || ''))
    } else if (appliedFilters.sortOrder === 'Z-A') {
      result.sort((a, b) => (b.playerName || '').localeCompare(a.playerName || ''))
    } else if (appliedFilters.sortOrder === 'MIN-MAX') {
      result.sort((a, b) => {
        const feeA = a.fee === 'Free' ? 0 : parseInt(a.fee.replace('€', '').replace('M', '')) || 0
        const feeB = b.fee === 'Free' ? 0 : parseInt(b.fee.replace('€', '').replace('M', '')) || 0
        return feeA - feeB
      })
    } else if (appliedFilters.sortOrder === 'MAX-MIN') {
      result.sort((a, b) => {
        const feeA = a.fee === 'Free' ? 0 : parseInt(a.fee.replace('€', '').replace('M', '')) || 0
        const feeB = b.fee === 'Free' ? 0 : parseInt(b.fee.replace('€', '').replace('M', '')) || 0
        return feeB - feeA
      })
    }

    return result
  }, [transfers, appliedFilters, search])

  const getFlag = (teamName: string) => {
    if (!teamName) return "🏳️";
    const name = teamName.toLowerCase();
    
    // Country mappings for clubs
    if (name.includes('chelsea') || name.includes('arsenal') || name.includes('manchester') || 
        name.includes('tottenham') || name.includes('liverpool') || name.includes('villa') || 
        name.includes('everton') || name.includes('palace') || name.includes('bournemouth') ||
        name.includes('forest') || name.includes('wolves') || name.includes('leeds') ||
        name.includes('brighton') || name.includes('newcastle') || name.includes('west ham')) return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
        
    if (name.includes('madrid') || name.includes('barcelona') || name.includes('girona') || 
        name.includes('sevilla') || name.includes('sociedad') || name.includes('villareal') ||
        name.includes('valencia') || name.includes('bilbao') || name.includes('betis') ||
        name.includes('celta')) return "🇪🇸";
        
    if (name.includes('juventus') || name.includes('milan') || name.includes('inter') || 
        name.includes('roma') || name.includes('lazio') || name.includes('napoli') ||
        name.includes('atalanta') || name.includes('bologna') || name.includes('fiorentina')) return "🇮🇹";
        
    if (name.includes('bayern') || name.includes('dortmund') || name.includes('leipzig') || 
        name.includes('leverkusen') || name.includes('stuttgart') || name.includes('frankfurt') ||
        name.includes('gladbach')) return "🇩🇪";
        
    if (name.includes('psg') || name.includes('lille') || name.includes('monaco') || 
        name.includes('marseille') || name.includes('lyon') || name.includes('lens') ||
        name.includes('nice') || name.includes('rennes')) return "🇫🇷";

    if (name.includes('benfica') || name.includes('porto') || name.includes('sporting')) return "🇵🇹";

    const flags: Record<string, string> = {
      "PSG": "🇫🇷", "Real Madrid": "🇪🇸", "Manchester City": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Atlético Madrid": "🇪🇸",
      "Atletico Madrid": "🇪🇸", "Bournemouth": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Tottenham": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Crystal Palace": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      "Bayern Munich": "🇩🇪", "Aston Villa": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Juventus": "🇮🇹", "Lille": "🇫🇷",
      "Manchester United": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "RB Leipzig": "🇩🇪", "Barcelona": "🇪🇸", "Benfica": "🇵🇹",
      "Atalanta": "🇮🇹", "Everton": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "AC Milan": "🇮🇹", "Chelsea": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      "Girona": "🇪🇸", "Bologna": "🇮🇹", "Arsenal": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Liverpool": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Chelsea FC": "🏴󠁧󠁢󠁥󠁮󠁧󠁿"
    };
    return flags[teamName] || "🏳️";
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10 space-y-8 relative">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_hsl(var(--secondary) / 0.5)] flex items-center gap-3 border border-border/50"
          >
            <Check className="w-4 h-4" />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Top Search & Category Nav */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
         <div className="flex items-center gap-4">
           <div className="bg-secondary/20 p-3 rounded-2xl">
             <ArrowRightLeft className="w-6 h-6 text-secondary" />
           </div>
           <div>
             <h1 className="text-2xl font-black text-foreground">Transfer War Room</h1>
             <p className="text-sm text-muted-foreground font-medium">Live Intelligence & Market Analysis</p>
           </div>
         </div>
      </div>

      {/* Top Category Pills */}
      <div className="flex flex-wrap gap-3 pb-6 border-b border-border/50">
         {['All Transfers', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'].map((cat) => (
           <button 
             key={cat} 
             onClick={() => {
               if (cat === 'All Transfers') {
                 setSelectedLeagues([])
               } else {
                 toggleLeague(cat)
               }
             }}
             className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
               (cat === 'All Transfers' && selectedLeagues.length === 0) || selectedLeagues.includes(cat)
                ? 'bg-secondary text-secondary-foreground border-secondary shadow-[0_0_15px_hsl(var(--secondary) / 0.3)]' 
                : 'bg-muted/30 text-muted-foreground border-border/50 hover:border-secondary/50 hover:text-foreground'
             }`}
           >
             {cat}
           </button>
         ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-10 mt-8">
        {/* Left Sidebar (Filters) */}
        <div className="w-full lg:w-72 space-y-10 flex-shrink-0 bg-card/50 p-6 rounded-[2rem] border border-border/50 h-fit">
           

           {/* Target League */}
           <div className="space-y-5">
             <div className="flex justify-between items-center">
               <h3 className="font-black text-foreground uppercase tracking-widest text-sm">Target League</h3>
               <button 
                 onClick={() => setSelectedLeagues([])}
                 className="text-[10px] text-muted-foreground uppercase font-bold hover:text-secondary transition-colors"
               >
                 Reset
               </button>
             </div>
             <div className="space-y-4">
                {['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'].map((league) => {
                  const isSelected = selectedLeagues.includes(league)
                  return (
                    <label 
                      key={league} 
                      className="flex items-center justify-between group cursor-pointer"
                      onClick={() => toggleLeague(league)}
                    >
                       <span className={`text-sm font-semibold transition-colors ${isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{league}</span>
                       <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-secondary border-secondary shadow-[0_0_8px_hsl(var(--secondary) / 0.4)]' : 'border-muted-foreground/30 group-hover:border-secondary/50'}`}>
                          {isSelected && <Check className="w-3 h-3 text-background font-black" />}
                       </div>
                    </label>
                  )
                })}
             </div>
           </div>
           
           <div className="h-px bg-border/50 w-full" />
           
           {/* Alphabetical Sort */}
           <div className="space-y-5">
             <h3 className="font-black text-foreground uppercase tracking-widest text-sm">Alphabetical Sort</h3>
             <div className="flex gap-2">
               <button 
                 onClick={() => setSortOrder('A-Z')}
                 className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sortOrder === 'A-Z' ? 'bg-secondary text-secondary-foreground shadow-[0_0_15px_hsl(var(--secondary) / 0.3)]' : 'bg-muted/50 text-muted-foreground border border-border'}`}
               >
                 A - Z
               </button>
               <button 
                 onClick={() => setSortOrder('Z-A')}
                 className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sortOrder === 'Z-A' ? 'bg-secondary text-secondary-foreground shadow-[0_0_15px_hsl(var(--secondary) / 0.3)]' : 'bg-muted/50 text-muted-foreground border border-border'}`}
               >
                 Z - A
               </button>
             </div>
             {['A-Z', 'Z-A'].includes(sortOrder) && (
               <button 
                 onClick={() => setSortOrder('NONE')}
                 className="w-full text-[10px] text-muted-foreground uppercase font-bold hover:text-secondary transition-colors text-center mt-2"
               >
                 Clear Sort
               </button>
             )}
           </div>

           <div className="h-px bg-border/50 w-full" />

           {/* Price Sort */}
           <div className="space-y-5">
             <h3 className="font-black text-foreground uppercase tracking-widest text-sm">Price Sort</h3>
             <div className="flex gap-2">
               <button 
                 onClick={() => setSortOrder('MIN-MAX')}
                 className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sortOrder === 'MIN-MAX' ? 'bg-secondary text-secondary-foreground shadow-[0_0_15px_hsl(var(--secondary) / 0.3)]' : 'bg-muted/50 text-muted-foreground border border-border'}`}
               >
                 MIN - MAX
               </button>
               <button 
                 onClick={() => setSortOrder('MAX-MIN')}
                 className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sortOrder === 'MAX-MIN' ? 'bg-secondary text-secondary-foreground shadow-[0_0_15px_hsl(var(--secondary) / 0.3)]' : 'bg-muted/50 text-muted-foreground border border-border'}`}
               >
                 MAX - MIN
               </button>
             </div>
             {['MIN-MAX', 'MAX-MIN'].includes(sortOrder) && (
               <button 
                 onClick={() => setSortOrder('NONE')}
                 className="w-full text-[10px] text-muted-foreground uppercase font-bold hover:text-secondary transition-colors text-center mt-2"
               >
                 Clear Sort
               </button>
             )}
           </div>

           <div className="pt-6">
              <button 
                onClick={() => {
                  setEvaluating(prev => ({ ...prev, 'SAVE_SETTINGS': true }));
                  setTimeout(() => {
                    setEvaluating(prev => ({ ...prev, 'SAVE_SETTINGS': false }));
                    setAppliedFilters({
                      selectedLeagues,
                      sortOrder,
                      feeRange
                    });
                  }, 1000);
                }}
                className="w-full bg-background text-foreground border border-border py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-muted hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl hover:shadow-secondary/20 group"
              >
                {evaluating['SAVE_SETTINGS'] ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 group-hover:text-secondary transition-colors" />
                    <span>Save Intelligence Profile</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => {
                  setSelectedLeagues([]);
                  setFeeRange([0, 150]);
                  setSortOrder('NONE');
                  setSearch('');
                  setAppliedFilters({
                    selectedLeagues: [],
                    feeRange: [0, 150],
                    sortOrder: 'NONE'
                  });
                }}
                className="w-full mt-4 bg-muted/30 text-muted-foreground border border-border/50 py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-muted hover:text-foreground transition-all active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Total Reset</span>
              </button>

              <p className="text-[9px] text-muted-foreground text-center mt-4 font-bold uppercase tracking-widest opacity-50">Last Backup: Just now</p>
           </div>

           <div className="h-px bg-border/50 w-full mt-6" />

           <button 
             onClick={() => setIsAddModalOpen(true)}
             className="w-full mt-4 bg-transparent border-2 border-dashed border-border/50 text-muted-foreground hover:border-secondary/50 hover:text-foreground py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all group"
           >
             <Plus className="w-5 h-5 group-hover:scale-110 group-hover:text-secondary transition-all" />
             <span>Add Transfer</span>
           </button>

        </div>

        {/* Main Content Grid */}
        <div className="flex-1">
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredTransfers.map((t, idx) => (
                 <div 
                    key={idx} 
                    className="bg-card rounded-[2rem] p-5 flex flex-col items-center justify-between border border-border/50 hover:border-secondary/40 transition-all cursor-pointer group shadow-sm hover:shadow-2xl hover:shadow-secondary/5 relative min-h-[400px]"
                    onClick={() => {
                      setFocusedTransfer(t);
                      setEvaluating(prev => ({ ...prev, [t.id]: true }));
                      setTimeout(() => setEvaluating(prev => ({ ...prev, [t.id]: false })), 1500);
                    }}
                 >
                    {/* Background League Logo */}
                    {(() => {
                      const leagueName = TEAM_TO_LEAGUE[t.toTeamID];
                      const leagueLogo = LEAGUES.find(l => l.name === leagueName)?.logo;
                      if (!leagueLogo) return null;
                      return (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.15] group-hover:opacity-[0.25] transition-all duration-500 overflow-hidden rounded-[2rem] z-0">
                          <Image 
                            src={leagueLogo} 
                            alt="" 
                            width={320} 
                            height={320} 
                            className="object-contain filter blur-lg scale-125 transform -rotate-12 group-hover:scale-150 transition-transform duration-700"
                          />
                        </div>
                      );
                    })()}

                    {/* Top Row: Actions (Left) and Price (Right) */}
                    <div className="w-full flex justify-between items-center mb-4">
                      <div className="flex gap-2 z-20">
                        {/* Watchlist Eye */}
                        <button 
                          className="p-2.5 rounded-full bg-muted/30 border border-border/50 text-muted-foreground hover:text-secondary hover:border-secondary/50 hover:bg-secondary/10 transition-all backdrop-blur-sm group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotification(`SUCCESS: ${t.playerName.toUpperCase()} ADDED TO WATCHLIST SECTOR`);
                            setTimeout(() => setNotification(null), 3000);
                          }}
                        >
                          <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>

                        {/* Delete Trash */}
                        <button 
                          className="p-2.5 rounded-full bg-muted/30 border border-border/50 text-muted-foreground hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition-all backdrop-blur-sm group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTransfers(prev => prev.filter(item => item.id !== t.id));
                          }}
                        >
                          <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>

                      {/* Fee and Fit Column */}
                      <div className="flex flex-col items-end gap-[10px]">
                        <div className="bg-secondary/10 text-secondary font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full border border-secondary/30 shadow-[0_0_15px_hsl(var(--secondary) / 0.15)] group-hover:bg-secondary group-hover:text-secondary-foreground group-hover:shadow-[0_0_20px_hsl(var(--secondary) / 0.4)] transition-all">
                          {t.fee === 'Free' ? 'Free Agent' : t.fee.replace('€', '€ ')}
                        </div>
                        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-secondary/10 text-secondary border border-secondary/30 rounded-full shadow-[0_0_15px_hsl(var(--secondary) / 0.15)] group-hover:bg-secondary group-hover:text-secondary-foreground group-hover:shadow-[0_0_20px_hsl(var(--secondary) / 0.4)] transition-all">
                          <BrainCircuit className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{((idx * 17) % 15) + 85}% Fit</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-secondary/10 text-secondary border border-secondary/30 rounded-full shadow-[0_0_15px_hsl(var(--secondary) / 0.15)] group-hover:bg-secondary group-hover:text-secondary-foreground group-hover:shadow-[0_0_20px_hsl(var(--secondary) / 0.4)] transition-all">
                          <Target className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{t.position && t.position !== "N/A" ? t.position : "FW"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Center: Circular Player Photo */}
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-secondary/40 shadow-[0_0_30px_hsl(var(--secondary) / 0.15)] z-10 mb-6 bg-muted/30 p-1 group-hover:scale-105 group-hover:border-secondary transition-all duration-500 ring-4 ring-background">
                      <div className="relative w-full h-full rounded-full overflow-hidden bg-muted/50">
                        <Image 
                          src={t.photoUrl} 
                          alt={t.playerName} 
                          fill 
                          className="object-cover object-top transition-all duration-700" 
                        />
                      </div>
                    </div>

                    {/* Below Center: From Club -> To Club */}
                    <div className="flex items-start justify-center gap-5 mb-6 w-full mt-2">
                      {/* From Club Container */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-muted/20 rounded-full p-3 border border-border/50 shadow-md flex items-center justify-center relative w-16 h-16 group-hover:-translate-y-1 transition-transform duration-300">
                          {t.fromTeamLogo ? (
                            <img 
                              src={t.fromTeamLogo} 
                              alt="" 
                              className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-500" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.fromTeamName)}&background=random&color=fff`;
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">{t.fromTeamName.substring(0, 2)}</div>
                          )}
                        </div>
                        <div className="flex flex-col items-center gap-1.5 mt-1">
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-muted/30 rounded-md border border-border/50">
                            <span className="text-[10px] transition-all">{getFlag(t.fromTeamName)}</span>
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest truncate max-w-[60px]">{t.fromTeamName}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* White Arrow */}
                      <div className="h-16 flex items-center">
                        <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-secondary transition-colors stroke-[3px]" />
                      </div>
                      
                      {/* To Club Container */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-secondary/5 rounded-full p-3 border border-secondary/30 shadow-[0_0_15px_hsl(var(--secondary) / 0.1)] flex items-center justify-center relative w-16 h-16 group-hover:-translate-y-1 transition-transform duration-300 delay-75">
                          {t.toTeamLogo ? (
                            <img 
                              src={t.toTeamLogo} 
                              alt="" 
                              className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.toTeamName)}&background=random&color=fff`;
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">{t.toTeamName.substring(0, 2)}</div>
                          )}
                        </div>
                        <div className="flex flex-col items-center gap-1.5 mt-1">
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-secondary/10 rounded-md border border-secondary/30">
                            <span className="text-[10px]">{getFlag(t.toTeamName)}</span>
                            <span className="text-[8px] font-black text-secondary uppercase tracking-widest truncate max-w-[60px]">{t.toTeamName}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Player Name */}
                    <div className="w-full bg-muted/20 border border-border/50 text-center py-3 rounded-2xl mt-auto group-hover:bg-secondary/5 group-hover:border-secondary/40 transition-all shadow-sm">
                      <h3 className="font-black text-foreground group-hover:text-secondary uppercase tracking-widest truncate px-4 transition-colors">{t.playerName}</h3>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      <Dialog open={!!focusedTransfer} onOpenChange={v => !v && setFocusedTransfer(null)}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-border/50 text-foreground sm:max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Transfer Details - {focusedTransfer?.playerName}</DialogTitle>
          </DialogHeader>
           {focusedTransfer && (
             <TransferDetailsModal 
               transfer={focusedTransfer} 
               allClubs={[]} 
               onEvaluate={() => {
                 setEvaluating(prev => ({ ...prev, [focusedTransfer.id]: true }));
                 setTimeout(() => setEvaluating(prev => ({ ...prev, [focusedTransfer.id]: false })), 1000);
               }}
               evaluating={evaluating[focusedTransfer.id] || false}
             />
           )}
        </DialogContent>
      </Dialog>
      <Dialog open={isAddModalOpen} onOpenChange={(val) => {
        setIsAddModalOpen(val);
        if (!val) {
          setAddStep('league');
          setSelectedLeagueId(null);
          setSelectedClub(null);
        }
      }}>
        <DialogContent className="bg-card/80 backdrop-blur-xl border border-border/50 text-foreground sm:max-w-[550px] p-0 rounded-[3rem] overflow-hidden shadow-2xl [&>button:last-child]:text-muted-foreground [&>button:last-child]:hover:text-foreground [&>button:last-child]:transition-colors">
          {/* Shared Progress Bar */}
          <div className="absolute top-[88px] left-8 right-8 h-0.5 bg-accent overflow-hidden rounded-full z-50">
            <motion.div 
              className="h-full bg-[hsl(var(--secondary))] shadow-[0_0_15px_hsl(var(--secondary))]"
              initial={{ width: "33.33%" }}
              animate={{ 
                width: addStep === 'league' ? '33.33%' : addStep === 'club' ? '66.66%' : '100%' 
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
            {/* Subtle segment dividers */}
            <div className="absolute inset-0 flex pointer-events-none">
              <div className="flex-1 border-r border-border/30" />
              <div className="flex-1 border-r border-border/30" />
              <div className="flex-1" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {addStep === 'league' && (
              <motion.div 
                key="league-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="p-8 space-y-6"
              >
                <DialogHeader className="space-y-1 text-left">
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none">
                    Select League
                  </DialogTitle>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Global Market Scouting</p>
                </DialogHeader>

                <div className="h-0.5" /> {/* Spacer for shared progress bar */}

                <ScrollArea className="h-[500px] pr-2">
                  <div className="space-y-3 pt-2">
                    {TOP_LEAGUES_WIDGET.map((league) => (
                      <button
                        key={league.id}
                        onClick={() => {
                          setSelectedLeagueId(league.id);
                          setAddStep('club');
                        }}
                        className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 hover:border-[hsl(var(--secondary))]/30 transition-all group active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center p-2.5 border border-border shadow-inner">
                            <Image src={league.logo} alt={league.name} width={28} height={28} className="object-contain" />
                          </div>
                          <span className="text-sm font-black uppercase tracking-tight group-hover:text-[hsl(var(--secondary))] transition-colors">{league.name}</span>
                        </div>
                        <Plus className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                      </button>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}

            {addStep === 'club' && (
              <motion.div 
                key="club-step"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="p-8 space-y-6"
              >
                <DialogHeader className="flex flex-row items-center gap-4 relative">
                  <Button variant="ghost" size="icon" onClick={() => setAddStep('league')} className="rounded-full hover:bg-white/10 h-10 w-10">
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </Button>
                  <div className="space-y-1 text-left flex-1">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none">
                      Select Club
                    </DialogTitle>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                      {TOP_LEAGUES_WIDGET.find(l => l.id === selectedLeagueId)?.name} • TOP DIVISION
                    </p>
                  </div>
                </DialogHeader>

                <div className="h-0.5" /> {/* Spacer for shared progress bar */}

                <ScrollArea className="h-[500px] pr-2">
                  <div className="space-y-3 pt-2">
                    {modalLoading ? (
                      <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--secondary))]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Decrypting Sector...</span>
                      </div>
                    ) : (
                      modalClubs.map((club) => (
                        <button
                          key={club.teamID}
                          onClick={() => {
                            setSelectedClub(club);
                            setAddStep('talent');
                          }}
                          className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 hover:border-[hsl(var(--secondary))]/30 transition-all group active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center p-2.5 border border-border shadow-xl">
                              <img src={club.teamLogo} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-left">
                              <span className="text-sm font-black uppercase tracking-tight group-hover:text-[hsl(var(--secondary))] transition-colors block leading-none">{club.teamName}</span>
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5 block">Top Division</span>
                            </div>
                          </div>
                          <Plus className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            )}

            {addStep === 'talent' && (
              <motion.div 
                key="talent-step"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="p-8 space-y-6"
              >
                <DialogHeader className="flex flex-row items-center gap-4 relative">
                  <Button variant="ghost" size="icon" onClick={() => setAddStep('club')} className="rounded-full hover:bg-white/10 h-10 w-10">
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </Button>
                  <div className="space-y-1 text-left flex-1">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none">
                      Select Talent
                    </DialogTitle>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                      {TOP_LEAGUES_WIDGET.find(l => l.id === selectedLeagueId)?.name} • {selectedClub?.teamName}
                    </p>
                  </div>
                </DialogHeader>

                <div className="h-0.5" /> {/* Spacer for shared progress bar */}

                <ScrollArea className="h-[500px] pr-2">
                  <div className="space-y-3 pt-2">
                    {modalLoading ? (
                      <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--secondary))]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Squad Data...</span>
                      </div>
                    ) : (
                      modalPlayers.map((player, idx) => (
                        <button
                          key={player.playerID || `player-${idx}`}
                          onClick={async () => {
                            setModalLoading(true)
                            try {
                              const newTransfer = await getPlayerLatestTransferAction(
                                player.playerID.toString(),
                                selectedClub?.teamID?.toString(),
                                selectedClub?.teamName
                              )
                              if (newTransfer) {
                                setTransfers(prev => [newTransfer, ...prev])
                                setIsAddModalOpen(false)
                                setAddStep('league')
                                setSelectedLeagueId(null)
                                setSelectedClub(null)
                              } else {
                                alert(`No recent club transfer found for ${player.fullName || player.firstName}`)
                              }
                            } catch (e) {
                              console.error(e)
                            } finally {
                              setModalLoading(false)
                            }
                          }}
                          className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 hover:border-[hsl(var(--secondary))]/30 transition-all group active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-black/40 overflow-hidden border border-white/10 shadow-inner">
                              <img src={player.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.fullName)}&background=111&color=fff`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left">
                              <span className="text-sm font-black uppercase tracking-tight group-hover:text-[hsl(var(--secondary))] transition-colors block leading-none">{player.fullName}</span>
                              <span className="text-[9px] font-bold text-[hsl(var(--secondary))] uppercase tracking-widest mt-1.5 block">{player.position || 'Unknown'}</span>
                            </div>
                          </div>
                          <Plus className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

    </div>
  )
}

const LedgerRow = React.memo(({ t }: { t: any }) => (
  <tr className="group hover:bg-primary/5 transition-all cursor-pointer">
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
        {Math.floor(Math.random() * 20) + 80}%
      </div>
    </td>
  </tr>
))

LedgerRow.displayName = "LedgerRow"
