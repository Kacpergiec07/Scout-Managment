import { PlayerSearch } from '@/components/scout/player-search'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Scouting Dashboard</h1>
        <p className="text-zinc-400">Search for players to start a new compatibility analysis.</p>
      </div>
      
      <div className="max-w-xl">
        <PlayerSearch />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for Recent Analyses or Watchlist highlights */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h3 className="font-semibold text-zinc-300">New Analysis</h3>
          <p className="mt-2 text-sm text-zinc-500">
            Use the search above to ingest data from Statorium API or create a manual profile.
          </p>
        </div>
      </div>
    </div>
  )
}
