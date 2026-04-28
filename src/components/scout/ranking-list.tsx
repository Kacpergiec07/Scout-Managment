import { ClubCard } from './club-card'
import { CompatibilityResult } from '@/lib/engine/scoring'

interface RankingListProps {
  results: {
    club: {
      name: string
      id: string
      league?: string
    }
    analysis: CompatibilityResult
  }[]
}

export function RankingList({ results }: RankingListProps) {
  return (
    <div className="grid gap-3 items-center">
      {results.map((result) => (
        <ClubCard
          key={result.club.id}
          clubName={result.club.name}
          leagueName={result.club.league || "Premier League"}
          score={result.analysis.totalScore}
          breakdown={result.analysis.breakdown}
        />
      ))}
    </div>
  )
}
