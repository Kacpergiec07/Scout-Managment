'use client'

import * as React from 'react'
import { PlayerSearch } from '@/components/scout/player-search'
import { StatoriumPlayerBasic } from '@/lib/statorium/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Users, Trash2, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function ComparePage() {
  const [player1, setPlayer1] = React.useState<StatoriumPlayerBasic | null>(null)
  const [player2, setPlayer2] = React.useState<StatoriumPlayerBasic | null>(null)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Player Comparison</h1>
        <p className="text-muted-foreground text-lg">Compare performance metrics between two top-tier athletes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="text-sm font-semibold uppercase tracking-wider text-emerald-500">Player 1</label>
          {!player1 ? (
            <PlayerSearch onSelect={setPlayer1} placeholder="Select first player..." />
          ) : (
            <PlayerCard player={player1} onClear={() => setPlayer1(null)} />
          )}
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold uppercase tracking-wider text-emerald-500">Player 2</label>
          {!player2 ? (
            <PlayerSearch onSelect={setPlayer2} placeholder="Select second player..." />
          ) : (
            <PlayerCard player={player2} onClear={() => setPlayer2(null)} />
          )}
        </div>
      </div>

      {player1 && player2 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ArrowRightLeft className="h-5 w-5 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold">Deep Comparison Matrix</h2>
          </div>
          
          <div className="space-y-6">
            <ComparisonRow label="Technical Ability" p1={85} p2={78} />
            <ComparisonRow label="Physical Presence" p1={92} p2={88} />
            <ComparisonRow label="Tactical Intelligence" p1={75} p2={82} />
            <ComparisonRow label="Market Value Index" p1={95} p2={80} />
            <ComparisonRow label="Recruitment Score" p1={88} p2={84} />
          </div>

          <div className="mt-12 p-6 rounded-xl bg-orange-500/5 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm italic">
            Note: Advanced metrics comparison is based on simulated performance data for demonstration. 
            Real-time API comparison requires premium ScoutPro Tier 3 license.
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
          <Users className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
          <p className="text-zinc-500 text-center">Select two players to generate a side-by-side comparison report.</p>
        </div>
      )}
    </div>
  )
}

function PlayerCard({ player, onClear }: { player: StatoriumPlayerBasic; onClear: () => void }) {
  return (
    <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg relative group">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClear} 
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500 hover:text-white"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <div className="p-6 flex items-center gap-6">
        <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-emerald-500/20 shrink-0">
          <Image 
            src={player.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.fullName)}&background=047857&color=fff&size=200`} 
            alt={player.fullName} 
            fill 
            unoptimized 
            className="object-cover" 
          />
        </div>
        <div className="flex-1 min-w-0">
          <Badge className="mb-2 bg-emerald-500 hover:bg-emerald-600 text-white border-transparent">
            {player.position || 'Player'}
          </Badge>
          <h3 className="text-xl font-bold truncate leading-tight">{player.fullName}</h3>
          <p className="text-sm text-muted-foreground">{player.country || 'Unknown'}</p>
        </div>
      </div>
    </Card>
  )
}

function ComparisonRow({ label, p1, p2 }: { label: string; p1: number; p2: number }) {
  const p1Width = `${p1}%`
  const p2Width = `${p2}%`
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
        <span>{p1}%</span>
        <span className="text-zinc-400 dark:text-zinc-600 font-medium">{label}</span>
        <span>{p2}%</span>
      </div>
      <div className="flex h-3 gap-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className="relative h-full transition-all duration-1000 bg-emerald-500" style={{ width: p1Width }} />
        <div className="flex-1" />
        <div className="relative h-full transition-all duration-1000 bg-blue-500" style={{ width: p2Width }} />
      </div>
    </div>
  )
}
