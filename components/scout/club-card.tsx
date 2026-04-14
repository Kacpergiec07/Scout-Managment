import { CompatibilityResult } from '@/lib/engine/scoring'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface ClubCardProps {
  clubName: string
  leagueName: string
  score: number
  breakdown: CompatibilityResult['breakdown']
}

export function ClubCard({ clubName, leagueName, score, breakdown }: ClubCardProps) {
  return (
    <Card className="glass-panel overflow-hidden hover:border-emerald-500/50 transition-colors relative">
      <div className="absolute inset-0 emerald-gradient opacity-10 pointer-events-none" />
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-zinc-50">{clubName}</h3>
            <p className="text-sm text-zinc-400">{leagueName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-4xl font-black text-emerald-500">{score}</span>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Score</p>
            </div>
            {score >= 80 && (
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10 h-6">
                PRO RECOMMENDED
              </Badge>
            )}
          </div>
        </div>
        
        <div className="bg-zinc-950/50 p-6 pt-2 space-y-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <StatRow label="Tactical DNA" value={breakdown.tactical} />
            <StatRow label="Squad Need" value={breakdown.positional} />
            <StatRow label="Benchmarking" value={breakdown.stats} />
            <StatRow label="Club Form" value={breakdown.form} />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Badge variant="outline" className="text-[10px] border-zinc-800 text-zinc-500 uppercase">
              High Pressing
            </Badge>
            <Badge variant="outline" className="text-[10px] border-zinc-800 text-zinc-500 uppercase">
              Positional Need
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] uppercase tracking-tight text-zinc-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <Progress value={value} className="h-1 bg-zinc-800" indicatorClassName="bg-emerald-500" />
    </div>
  )
}
