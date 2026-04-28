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
  if (!player) return null;

  const stats = (player as any).normalizedStats || {
    offensive: Math.min(100, (player.stats?.offensive?.goals * 10 || 0) + (player.stats?.offensive?.assists * 5 || 0) + 55),
    defensive: player.stats?.defensive?.tackles || 0,
    tactical: player.stats?.tactical?.progressivePasses || 0,
    physical: player.stats?.physical?.stamina || 0,
    dribbling: player.stats?.tactical?.dribbles || 0,
    passing: player.stats?.tactical?.passAccuracy || 0
  };

  const chartData = [
    { category: 'Offensive', value: stats.offensive },
    { category: 'Defensive', value: stats.defensive },
    { category: 'Tactical', value: stats.tactical },
    { category: 'Physical', value: stats.physical },
    { category: 'Dribbling', value: stats.dribbling },
    { category: 'Passing', value: stats.passing },
    { category: 'Rating', value: (player as any).rating || 80 },
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
        <PolarGrid stroke="hsl(var(--secondary) / 0.3)" />
        <Radar
          dataKey="value"
          fill="hsl(var(--secondary))"
          fillOpacity={0.2}
          stroke="hsl(var(--secondary))"
          strokeWidth={2}
          dot={{
            r: 4,
            fill: 'hsl(var(--secondary))',
            fillOpacity: 1,
          }}
        />
      </RadarChart>
    </ChartContainer>
  )
}
