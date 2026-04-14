import { ClubCard } from './club-card'
import { CompatibilityResult } from '@/lib/engine/scoring'

interface RankingListProps {
  results: {
    club: {
      name: string
      teamID: string
    }
    analysis: CompatibilityResult
  }[]
}

export function RankingList({ results }: RankingListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-50">Club Compatibility Ranking</h2>
        <span className="text-sm text-zinc-500">{results.length} Clubs Analyzed</span>
      </div>
      
      <div className="grid gap-4">
        {results.map((result) => (
          <ClubCard
            key={result.club.teamID}
            clubName={result.club.name}
            leagueName="Premier League" // Mock league for MVP
            score={result.analysis.totalScore}
            breakdown={result.analysis.breakdown}
          />
        ))}
      </div>
    </div>
  )
}
