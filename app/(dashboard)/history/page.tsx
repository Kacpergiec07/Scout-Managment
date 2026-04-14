import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function HistoryPage() {
  // Mock history data
  const history = [
    { id: '1', date: '2026-04-14', player: 'Erling Haaland', league: 'Premier League', highScore: 95 },
    { id: '2', date: '2026-04-13', player: 'Lamine Yamal', league: 'La Liga', highScore: 82 },
    { id: '3', date: '2026-04-12', player: 'Florian Wirtz', league: 'Bundesliga', highScore: 88 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Scouting History</h1>
        <p className="text-zinc-400">Review and share your past compatibility analyses.</p>
      </div>

      <div className="max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input 
          placeholder="Filter by player name..." 
          className="pl-10 bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
        />
      </div>

      <div className="grid gap-4">
        {history.map((record) => (
          <Card key={record.id} className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex gap-6 items-center">
                <div className="text-sm font-mono text-zinc-500">{record.date}</div>
                <div>
                  <h3 className="font-bold text-zinc-50">{record.player}</h3>
                  <p className="text-xs text-zinc-400">{record.league}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xl font-bold text-emerald-500">{record.highScore}</div>
                  <div className="text-[10px] uppercase text-zinc-500 tracking-tighter">Peak Match</div>
                </div>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  VIEW REPORT
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
