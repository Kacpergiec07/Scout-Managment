import { CompatibilityResult } from '@/lib/engine/scoring'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface ClubCardProps {
  clubName: string
  leagueName: string
  score: number
  breakdown: CompatibilityResult['breakdown']
}

export function ClubCard({ clubName, leagueName, score, breakdown }: ClubCardProps) {
  const metrics = [
    { label: 'Tactical DNA', value: breakdown.tactical },
    { label: 'Benchmarking', value: breakdown.stats },
    { label: 'Squad Need', value: breakdown.positional },
    { label: 'Club Form', value: breakdown.form },
  ]

  return (
    <div className="group relative rounded-xl border border-border bg-card/40 backdrop-blur-xl p-5 shadow-lg hover:border-emerald-500/40 dark:hover:border-emerald-400/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300 h-[220px] flex flex-col">
      <div className="flex items-start justify-between mb-5 shrink-0">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {clubName}
          </h3>
          <p className="text-xs text-muted-foreground">{leagueName}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums" style={{ textShadow: '0 0 10px rgba(16, 185, 129, 0.3)' }}>
            {score}
          </span>
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">Score</p>
        </div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-2 gap-x-5 gap-y-3.5">
          {metrics.map((metric) => (
            <MetricRow
              key={metric.label}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </div>

        <div className="flex gap-2 mt-4 pt-3 border-t border-border shrink-0">
          <Badge className="text-[10px] bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 px-2 py-0.5 h-5">
            High Pressing
          </Badge>
          <Badge className="text-[10px] bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 px-2 py-0.5 h-5">
            Positional Need
          </Badge>
        </div>
      </div>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-tight">
          {label}
        </span>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
          {value}%
        </span>
      </div>
      <div className="w-full">
        <Progress value={value} className="h-1.5 bg-muted" indicatorClassName="bg-emerald-500 dark:bg-emerald-400" />
      </div>
    </div>
  )
}
