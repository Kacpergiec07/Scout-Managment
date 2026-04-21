'use client'

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { ScoutProPlayer } from '@/lib/types/player'

export function PlayerRadarChart({ player }: { player: ScoutProPlayer }) {
  const chartData = [
    { category: 'Offensive', value: player.stats.offensive.goals + player.stats.offensive.assists },
    { category: 'xG/xA', value: player.stats.offensive.xG + player.stats.offensive.xA },
    { category: 'Tackles', value: player.stats.defensive.tackles },
    { category: 'Interceptions', value: player.stats.defensive.interceptions },
    { category: 'Dribbles', value: player.stats.tactical.dribbles },
    { category: 'Passing', value: player.stats.tactical.passAccuracy },
    { category: 'Progressive', value: player.stats.tactical.progressivePasses },
    { category: 'Stamina', value: player.stats.physical.stamina },
  ]

  const chartConfig = {
    value: {
      label: 'Score',
      color: 'var(--chart-emerald)',
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[350px]">
      <RadarChart data={chartData}>
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <PolarAngleAxis dataKey="category" />
        <PolarGrid stroke="rgba(0, 255, 136, 0.3)" />
        <Radar
          dataKey="value"
          fill="#00ff88"
          fillOpacity={0.2}
          stroke="#00ff88"
          strokeWidth={2}
          dot={{
            r: 4,
            fill: '#00ff88',
            fillOpacity: 1,
          }}
        />
      </RadarChart>
    </ChartContainer>
  )
}
