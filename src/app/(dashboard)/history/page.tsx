'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Plus, Hexagon, ChevronDown, Loader2, RefreshCw, Trophy, History, Filter, UserMinus, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { MarketValue } from '@/components/scout/market-value'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getWatchHistory, updateWatchlistStatus } from '@/app/actions/watchlist'
import { motion, AnimatePresence } from 'framer-motion'

const HistoryCard = React.memo(({ record, index, restoringId, onRestore }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group relative"
  >
    <div className="absolute inset-0 bg-secondary/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="relative bg-card/30 backdrop-blur-md border border-border/50 rounded-3xl p-5 hover:border-secondary/50 transition-all duration-300 flex items-center justify-between shadow-xl">
      {/* Left Side - Player Info */}
      <Link
        href={`/analysis?id=${record.id}&name=${encodeURIComponent(record.player)}&club=${encodeURIComponent(record.club)}&league=${encodeURIComponent(record.league)}&nation=${encodeURIComponent(record.nation || 'Unknown')}&pos=${encodeURIComponent(record.pos)}&photo=${encodeURIComponent(record.photo)}`}
        className="flex items-center gap-6 flex-1 group/link"
      >
        <div className="relative h-16 w-16 shrink-0">
          <div className="absolute inset-0 bg-secondary/20 rounded-2xl blur-lg opacity-0 group-hover/link:opacity-100 transition-opacity" />
          <div className="relative h-full w-full rounded-2xl overflow-hidden border border-border group-hover/link:border-secondary transition-colors">
            <Image
              src={record.photo}
              alt={record.player}
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black tracking-tighter uppercase truncate group-hover/link:text-secondary transition-colors">
              {record.player}
            </h3>
            <Badge variant="secondary" className="text-[10px] uppercase font-black px-2 py-0 h-4 bg-secondary/10 text-secondary border-secondary/20">
              {record.position}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-secondary/60" />
              {record.club}
            </span>
            <span className="text-border">•</span>
            <MarketValue playerName={record.player} showIcon={false} className="text-secondary" />
          </div>
        </div>
      </Link>

      {/* Right Side - Actions & Metadata */}
      <div className="flex items-center gap-8 pl-6 border-l border-border/30">
        <div className="text-right space-y-1 hidden sm:block">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center justify-end gap-1.5">
            <Calendar className="w-3 h-3" />
            Removed
          </div>
          <div className="text-xs font-black text-foreground/70 uppercase">
            {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        <button
          onClick={() => onRestore(record.dbId, record.player)}
          disabled={restoringId === record.dbId}
          className="relative h-12 w-12 rounded-2xl bg-secondary/10 hover:bg-secondary text-secondary hover:text-secondary-foreground border border-secondary/20 flex items-center justify-center transition-all duration-300 group/btn overflow-hidden"
          title="Restore to watchlist"
        >
          {restoringId === record.dbId ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5 group-hover/btn:rotate-180 transition-transform duration-500" />
          )}
        </button>
      </div>
    </div>
  </motion.div>
))

HistoryCard.displayName = "HistoryCard"

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [sortBy, setSortBy] = React.useState('date-desc')
  const [mounted, setMounted] = React.useState(false)
  const [history, setHistory] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [restoringId, setRestoringId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setMounted(true)
    async function loadHistory() {
      try {
        const data = await getWatchHistory()
        if (data) {
          const uniqueData = data.reduce((acc: any[], current: any) => {
            const existingIndex = acc.findIndex(item => item.player_id === current.player_id)
            if (existingIndex === -1) {
              acc.push(current)
            } else if (new Date(current.removed_at) > new Date(acc[existingIndex].removed_at)) {
              acc[existingIndex] = current
            }
            return acc
          }, [])

          const transformedData = uniqueData.map((item: any) => ({
            id: item.player_id || item.id,
            dbId: item.id,
            player: item.player_name,
            club: item.club || 'Unknown Club',
            league: item.league || 'Unknown League',
            position: item.position || 'Unknown Position',
            photo: item.player_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.player_name)}&background=00ff88&color=000&size=56`,
            date: item.removed_at || item.created_at,
            market_value: item.market_value,
            highScore: 85,
            nation: 'Unknown',
            pos: item.position || 'Unknown Position'
          }))
          setHistory(transformedData)
        }
      } catch (err) {
        console.error('Failed to load history:', err)
        setError('Failed to load watch history')
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [])

  const filteredAndSortedHistory = React.useMemo(() => {
    return history
      .filter((record) =>
        record.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.club.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime()
          case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime()
          case 'name-asc': return a.player.localeCompare(b.player)
          case 'name-desc': return b.player.localeCompare(a.player)
          default: return 0
        }
      })
  }, [searchQuery, sortBy, history])

  const handleRestore = async (dbId: string, playerName: string) => {
    setRestoringId(dbId)
    try {
      const result = await updateWatchlistStatus(dbId, 'following')
      if (result.success) {
        setHistory(prev => prev.filter(item => item.dbId !== dbId))
      } else {
        alert(`Failed to restore ${playerName}: ${result.error}`)
      }
    } catch (error) {
      alert(`Failed to restore ${playerName}: An unexpected error occurred`)
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full -ml-64 -mb-64" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center border border-border shadow-2xl">
              <History className="w-7 h-7 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">Scouting Archive</h1>
              <p className="text-muted-foreground text-sm font-medium">Review past analyses and restore tracked talents.</p>
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
            <Input
              placeholder="Filter by name, club or league..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-14 bg-card/30 backdrop-blur-md border border-border rounded-2xl focus:border-secondary transition-all text-sm font-bold placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="flex items-center gap-2 bg-card/30 backdrop-blur-md border border-border rounded-2xl px-4 h-14 min-w-[200px]">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-0 bg-transparent h-full focus:ring-0 text-xs font-black uppercase tracking-widest text-foreground">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-border">
                <SelectItem value="date-desc">Newest Archive</SelectItem>
                <SelectItem value="date-asc">Oldest Archive</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 text-secondary animate-spin" />
              <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Accessing Archive...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center bg-red-500/5 border border-red-500/20 rounded-3xl">
              <UserMinus className="w-12 h-12 text-red-500/50 mx-auto mb-4" />
              <h3 className="text-lg font-black uppercase tracking-tight text-red-500">Archive Error</h3>
              <p className="text-sm text-red-500/60 mt-1">{error}</p>
            </div>
          ) : filteredAndSortedHistory.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                {filteredAndSortedHistory.map((record, index) => (
                  <HistoryCard
                    key={record.dbId}
                    record={record}
                    index={index}
                    restoringId={restoringId}
                    onRestore={handleRestore}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-20 text-center bg-card/20 border border-dashed border-border rounded-[3rem]">
              <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border">
                <Search className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Archive Empty</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">Players removed from your watchlist will appear here for future restoration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
