'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, ArrowUpDown, Calendar, User, Target } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [sortBy, setSortBy] = React.useState('date-desc')

  // Verified history data
  const history = [
    { 
      id: '14633', 
      date: '2026-04-15', 
      player: 'Florian Wirtz', 
      club: 'Bayer 04 Leverkusen', 
      league: 'Bundesliga', 
      highScore: 95, 
      nation: 'Germany', 
      pos: 'CAM',
      photo: 'https://api.statorium.com/media/bearleague/bl17158001911496.webp'
    },
    { 
      id: '6466', 
      date: '2026-04-15', 
      player: 'Jude Bellingham', 
      club: 'Real Madrid', 
      league: 'La Liga', 
      highScore: 92, 
      nation: 'England', 
      pos: 'CM',
      photo: 'https://api.statorium.com/media/bearleague/bl1695891720352.webp'
    },
    { 
      id: '53041', 
      date: '2026-04-14', 
      player: 'Lamine Yamal', 
      club: 'FC Barcelona', 
      league: 'La Liga', 
      highScore: 96, 
      nation: 'Spain', 
      pos: 'RW',
      photo: 'https://api.statorium.com/media/bearleague/bl17322791692175.webp'
    },
    { 
      id: '4812', 
      date: '2026-04-13', 
      player: 'Erling Haaland', 
      club: 'Man City', 
      league: 'Premier League', 
      highScore: 98, 
      nation: 'Norway', 
      pos: 'ST',
      photo: 'https://api.statorium.com/media/bearleague/bl17313179872374.webp'
    },
    { 
      id: '670', 
      date: '2026-04-13', 
      player: 'Ousmane Dembélé', 
      club: 'PSG', 
      league: 'Ligue 1', 
      highScore: 87, 
      nation: 'France', 
      pos: 'RW',
      photo: 'https://api.statorium.com/media/bearleague/bl1702304187852.webp'
    },
    { 
      id: '1994', 
      date: '2026-04-12', 
      player: 'Kylian Mbappé', 
      club: 'Real Madrid', 
      league: 'La Liga', 
      highScore: 97, 
      nation: 'France', 
      pos: 'FW',
      photo: 'https://api.statorium.com/media/bearleague/bl17023015741660.webp'
    },
    { 
      id: '26718', 
      date: '2026-04-12', 
      player: 'Amadou Onana', 
      club: 'Aston Villa', 
      league: 'Premier League', 
      highScore: 84, 
      nation: 'Belgium', 
      pos: 'CDM',
      photo: 'https://api.statorium.com/media/bearleague/bl17337166521193.webp'
    },
    { 
      id: '3482', 
      date: '2026-04-11', 
      player: 'Lautaro Martínez', 
      club: 'Inter Milan', 
      league: 'Serie A', 
      highScore: 91, 
      nation: 'Argentina', 
      pos: 'ST',
      photo: 'https://api.statorium.com/media/bearleague/bl1695386805672.webp'
    },
  ]

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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Scouting History</h1>
          <p className="text-zinc-400">Review and share your past compatibility analyses (Top 5 Leagues).</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Search by player or club..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-zinc-100"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px] bg-zinc-900 border-zinc-800 text-zinc-300 focus:ring-emerald-500">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
              <SelectItem value="date-desc">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Newest First</span>
                </div>
              </SelectItem>
              <SelectItem value="date-asc">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 opacity-50" />
                  <span>Oldest First</span>
                </div>
              </SelectItem>
              <SelectItem value="name-asc">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  <span>A-Z</span>
                </div>
              </SelectItem>
              <SelectItem value="name-desc">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 opacity-50" />
                  <span>Z-A</span>
                </div>
              </SelectItem>
              <SelectItem value="score-desc">
                <div className="flex items-center gap-2">
                  <Target className="h-3.5 w-3.5" />
                  <span>Score: High-Low</span>
                </div>
              </SelectItem>
              <SelectItem value="score-asc">
                <div className="flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 opacity-50" />
                  <span>Score: Low-High</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAndSortedHistory.length > 0 ? (
          filteredAndSortedHistory.map((record) => (
            <Link 
              key={record.id} 
              href={`/analysis?id=${record.id}&name=${encodeURIComponent(record.player)}&club=${encodeURIComponent(record.club)}&league=${encodeURIComponent(record.league)}&nation=${encodeURIComponent(record.nation)}&pos=${encodeURIComponent(record.pos)}&photo=${encodeURIComponent(record.photo)}`}
            >
              <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50 transition-all cursor-pointer group shadow-lg border-l-0 hover:border-l-4 hover:border-l-emerald-500">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex gap-6 items-center">
                    <div className="text-sm font-mono text-zinc-500 hidden md:block">{record.date}</div>
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-zinc-800 relative bg-zinc-800 group-hover:border-emerald-500/50 transition-colors">
                      <img 
                        src={record.photo}
                        alt={record.player}
                        className="object-cover w-full h-full"
                        onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(record.player)}&background=047857&color=fff`)}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-50 group-hover:text-emerald-400 transition-colors">{record.player}</h3>
                      <div className="flex items-center gap-2">
                         <p className="text-xs text-zinc-400">{record.club}</p>
                         <span className="text-[10px] text-zinc-600">•</span>
                         <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">{record.league}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-500 tabular-nums">{record.highScore}%</div>
                      <div className="text-[10px] uppercase text-zinc-500 tracking-tighter font-bold">Match Score</div>
                    </div>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      RE-ANALYZE
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-xl">
            <Search className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-400">No results found</h3>
            <p className="text-zinc-600">Try adjusting your search query or filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

