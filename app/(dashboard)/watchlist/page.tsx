import { KanbanBoard } from '@/components/scout/kanban-board'

export default function WatchlistPage() {
  // Mock data for MVP
  const initialData = {
    following: [
      { 
        id: '1731409249710', 
        name: 'Florian Wirtz', 
        club: 'Liverpool FC', 
        position: 'CAM', 
        nationality: 'Germany',
        league: 'Premier League',
        score: 88,
        description: 'Elite technical ability. Scouting reports suggest a very high ceiling. Monitor for summer window.',
        updatedAt: '2h ago',
        playerPhoto: 'https://api.statorium.com/media/bearleague/bl1731409249710.webp'
      },
      { 
        id: '1731409249711', 
        name: 'Jude Bellingham', 
        club: 'Real Madrid', 
        position: 'CM', 
        nationality: 'England',
        league: 'La Liga',
        score: 92,
        description: 'Complete midfielder. Leadership qualities confirmed. Low probability of transfer but remains top priority.',
        updatedAt: '1d ago',
        playerPhoto: 'https://api.statorium.com/media/bearleague/bl1731409249711.webp'
      },
      { 
        id: '1731409249712', 
        name: 'Lamine Yamal', 
        club: 'FC Barcelona', 
        position: 'RW', 
        nationality: 'Spain',
        league: 'La Liga',
        score: 94,
        description: 'Once-in-a-generation talent. Exceptional decision-making for age. Maintaining high-frequency monitoring.',
        updatedAt: '4h ago',
        playerPhoto: 'https://api.statorium.com/media/bearleague/bl1731409249712.webp'
      },
    ],
    priority: [
      { 
        id: '1731409249713', 
        name: 'Amadou Onana', 
        club: 'Aston Villa', 
        position: 'CDM', 
        nationality: 'Belgium',
        league: 'Premier League',
        score: 85,
        description: 'Physical specimen. High duel success rate. Primary target if mid-block reinforcement is required.',
        updatedAt: '5h ago',
        playerPhoto: 'https://api.statorium.com/media/bearleague/bl1731409249713.webp'
      },
      { 
        id: '1731409249714', 
        name: 'Gonçalo Inácio', 
        club: 'Sporting CP', 
        position: 'CB', 
        nationality: 'Portugal',
        league: 'Liga Portugal',
        score: 87,
        description: 'Modern ball-playing CB. Left-footed. Release clause makes him a highly realistic target.',
        updatedAt: '3d ago',
        playerPhoto: 'https://api.statorium.com/media/bearleague/bl1731409249714.webp'
      },
    ],
    analyzing: [
      { 
        id: '1731409249715', 
        name: 'Warren Zaïre-Emery', 
        club: 'PSG', 
        position: 'CM', 
        nationality: 'France',
        league: 'Ligue 1',
        score: 89,
        description: 'Analyzing high-pressure tolerance in UCL fixtures. Initial data looks world-class.',
        updatedAt: '12h ago',
        playerPhoto: 'https://api.statorium.com/media/bearleague/bl1731409249715.webp'
      },
    ],
    complete: [
      { 
        id: '1731409249716', 
        name: 'Viktor Gyökeres', 
        club: 'Sporting CP', 
        position: 'ST', 
        nationality: 'Sweden',
        league: 'Liga Portugal',
        score: 89,
        description: 'Profile matches tactical requirements. Final scouting report submitted: Highly Recommended.',
        updatedAt: '1w ago',
        playerPhoto: 'https://api.statorium.com/media/bearleague/bl1731409249716.webp'
      },
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
