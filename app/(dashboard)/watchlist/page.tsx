import { KanbanBoard } from '@/components/scout/kanban-board'

export default function WatchlistPage() {
  // Mock data for MVP
  const initialData = {
    following: [
      { id: '1', name: 'Florian Wirtz', club: 'Leverkusen', position: 'CAM', score: 88 },
      { id: '2', name: 'Jude Bellingham', club: 'Real Madrid', position: 'CM', score: 92 },
    ],
    priority: [
      { id: '3', name: 'Amadou Onana', club: 'Aston Villa', position: 'CDM', score: 85 },
    ],
    analyzing: [],
    complete: [
      { id: '4', name: 'Viktor Gyökeres', club: 'Sporting', position: 'ST', score: 89 },
    ],
  }

  return (
    <div className="space-y-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Watchlist</h1>
        <p className="text-zinc-400">Track and manage your scouting pipeline.</p>
      </div>

      <KanbanBoard initialData={initialData} />
    </div>
  )
}
