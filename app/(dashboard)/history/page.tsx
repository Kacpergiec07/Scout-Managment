'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search, Plus, Hexagon, ChevronDown, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getHistory } from '@/app/actions/history'

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [sortBy, setSortBy] = React.useState('date-desc')
  const [history, setHistory] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadHistory() {
      setLoading(true)
      const data = await getHistory()
      setHistory(data)
      setLoading(false)
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
          case 'date-desc':
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          case 'date-asc':
            return new Date(a.date).getTime() - new Date(b.date).getTime()
          case 'name-asc':
            return a.player.localeCompare(b.player)
          case 'name-desc':
            return b.player.localeCompare(a.player)
          case 'score-desc':
            return b.highScore - a.highScore
          case 'score-asc':
            return a.highScore - b.highScore
          default:
            return 0
        }
      })
  }, [searchQuery, sortBy])

  return (
    <>
      {/* Custom CSS - simple neon glow only, no spinning sensor */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Default state - completely static, no effects */
          .racing-border-card::before {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 12px;
            background: linear-gradient(135deg, #00ff88, transparent);
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          /* Hover state - simple border glow only */
          .racing-border-card:hover::before {
            opacity: 0.3;
          }

          /* Default state - no shadows/glow */
          .racing-border-card::after {
            content: '';
            position: absolute;
            inset: 0;
            background: inherit;
            border-radius: inherit;
            z-index: -1;
            box-shadow: none;
            transition: box-shadow 0.3s ease;
          }

          /* Hover state - neon green glow only */
          .racing-border-card:hover::after {
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.4),
                        0 0 60px rgba(0, 255, 136, 0.2),
                        inset 0 0 30px rgba(0, 255, 136, 0.1);
          }
        `
      }} />

      <div
        className="min-h-screen relative overflow-hidden"
        style={{
          backgroundColor: '#0a0f0a'
        }}
      >
      {/* Particle background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-emerald-500/10"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header Section */}
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00ff88]/20 blur-xl rounded-lg" />
              <div className="relative h-14 w-14 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center shadow-2xl shadow-[#00ff88]/20">
                <Hexagon className="h-7 w-7 text-[#00ff88]" fill="currentColor" />
              </div>
            </div>
            <div>
              <h1
                className="text-4xl sm:text-5xl font-bold tracking-tight"
                style={{
                  color: '#00ff88',
                  textShadow: '0 0 20px rgba(0, 255, 136, 0.5)'
                }}
              >
                Scouting History
              </h1>
              <p className="text-gray-400 text-base mt-2 font-medium">
                Review and share your past compatibility analyses (Top 5 Leagues).
              </p>
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
          {/* Search Input */}
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-[#00ff88]/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-hover:text-[#00ff88] transition-colors duration-300" />
              <Input
                placeholder="Search by player or club..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-3 h-12 bg-black/60 backdrop-blur-xl border-2 border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all duration-300 hover:border-gray-700"
              />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl border-2 border-gray-800 rounded-xl px-4 py-2 focus-within:border-[#00ff88] focus-within:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all duration-300">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              SORT
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-9 bg-transparent border-0 text-gray-300 text-sm font-semibold focus:ring-0 focus:ring-offset-0 px-0">
                <SelectValue placeholder="Newest" />
                <ChevronDown className="h-4 w-4 text-gray-500 ml-auto" />
              </SelectTrigger>
              <SelectContent className="bg-black/95 backdrop-blur-xl border-2 border-gray-800 text-gray-300 shadow-2xl min-w-[180px]">
                <SelectItem value="date-desc">Newest</SelectItem>
                <SelectItem value="date-asc">Oldest</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="score-desc">Score High-Low</SelectItem>
                <SelectItem value="score-asc">Score Low-High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Player Cards List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#00ff88] mx-auto mb-4" />
              <p className="text-gray-400">Loading history...</p>
            </div>
          ) : filteredAndSortedHistory.length > 0 ? (
            filteredAndSortedHistory.map((record, index) => (
              <Link
                key={record.id}
                href={`/analysis?id=${record.id}&name=${encodeURIComponent(record.player)}&club=${encodeURIComponent(record.club)}&league=${encodeURIComponent(record.league)}&nation=${encodeURIComponent(record.nation)}&pos=${encodeURIComponent(record.pos)}&photo=${encodeURIComponent(record.photo)}`}
                className="block group"
              >
                <div
                  className={`
                    racing-border-card relative bg-black/80 backdrop-blur-xl border-2 border-gray-800
                    rounded-xl p-5 shadow-xl
                    transition-all duration-300 ease-out
                    hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#00ff88]/20
                    hover:border-[#00ff88]/50 hover:bg-black/90
                    animate-in fade-in slide-in-from-bottom-4
                  `}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    '--angle': '0deg'
                  } as React.CSSProperties}
                >
                  <div className="relative flex items-center justify-between">
                    {/* Left Side - Player Info */}
                    <div className="flex items-center gap-5">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-[#00ff88] transition-all duration-300 shadow-lg">
                          <img
                            src={record.photo}
                            alt={record.player}
                            className="object-cover w-full h-full"
                            onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(record.player)}&background=00ff88&color=000&size=56`)}
                          />
                        </div>
                      </div>

                      {/* Player Details */}
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-[#00ff88] transition-colors duration-300 tracking-tight">
                          {record.player}
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 group-hover:text-gray-400 transition-colors">
                            {record.club}
                          </span>
                          <span className="text-gray-700">•</span>
                          <span className="text-gray-600 group-hover:text-gray-500 transition-colors">
                            {record.pos}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Match Score */}
                    <div className="flex items-center gap-6">
                      <div className="text-right space-y-1">
                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                          Match Score
                        </div>
                        <div
                          className="text-3xl font-black tabular-nums group-hover:scale-105 transition-transform duration-300"
                          style={{
                            color: '#00ff88'
                          }}
                        >
                          {record.highScore}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-gray-800 rounded-xl bg-black/40 backdrop-blur-xl">
              <div className="w-16 h-16 rounded-full bg-[#00ff88]/10 flex items-center justify-center mx-auto mb-4 border border-[#00ff88]/30">
                <Search className="h-8 w-8 text-[#00ff88]/50" />
              </div>
              <h3 className="text-lg font-bold text-gray-400">No history yet</h3>
              <p className="text-gray-600 text-sm mt-1">Players you remove from your watchlist will appear here.</p>
            </div>
          )}
              <div className="w-16 h-16 rounded-full bg-[#00ff88]/10 flex items-center justify-center mx-auto mb-4 border border-[#00ff88]/30">
                <Search className="h-8 w-8 text-[#00ff88]/50" />
              </div>
              <h3 className="text-lg font-bold text-gray-400">No results found</h3>
              <p className="text-gray-600 text-sm mt-1">Try adjusting your search query or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* FAB - Floating Action Button */}
      <Link
        href="/scouting"
        className="fixed bottom-8 right-8 z-50 group"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-[#00ff88]/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
          <div
            className="relative h-16 w-16 rounded-full bg-[#00ff88] flex items-center justify-center shadow-2xl shadow-[#00ff88]/30 hover:shadow-[#00ff88]/50 transition-all duration-300 group-hover:scale-110 group-active:scale-95"
            style={{
              boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)'
            }}
          >
            <Plus className="h-8 w-8 text-black" />
          </div>
        </div>
      </Link>
      </div>
    </>
  )
}
