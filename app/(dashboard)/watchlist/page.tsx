import { KanbanBoard } from '@/components/scout/kanban-board'

export default function WatchlistPage() {
  // Verified data from Statorium API (Top 5 Leagues: PL, La Liga, Bundesliga, Ligue 1, Serie A)
  const initialData = {
    following: [
      { 
        id: '14633', 
        name: 'Florian Wirtz', 
        club: 'Liverpool FC', 
        position: 'CAM', 
        nationality: 'Germany',
        league: 'Premier League',
        score: 95,
        description: 'Elite technical ability. Scouting reports suggest a very high ceiling. Core of Leverkusen attack.',
        updatedAt: '2h ago',
        playerPhoto: 'https://api.statorium.com/media/bearleague/bl17158001911496.webp',
        age: 21
      },
      { 
        id: '6466', 
        name: 'Jude Bellingham', 
        club: 'Real Madrid', 
        position: 'CM', 
        nationality: 'England',
        league: 'La Liga',
        score: 92,
        description: 'Complete midfielder. Leadership qualities confirmed. Dominant presence in both boxes.',
        updatedAt: '1d ago',
        playerPhoto: 'https://api.statorium.com/media/bearleague/bl1695891720352.webp',
        age: 21
      },
      { 
        id: '53041', 
        name: 'Lamine Yamal', 
        club: 'FC Barcelona', 
        position: 'RW', 
        nationality: 'Spain',
        league: 'La Liga',
        score: 96,
        description: 'Once-in-a-generation talent. Exceptional decision-making for age. Defensive contribution improving.',
        updatedAt: '4h ago',
        playerPhoto: 'https://api.statorium.com/media/bearleague/bl17322791692175.webp',
        age: 17
      },
    ],
    priority: [
      { 
        id: '26718', 
        name: 'Amadou Onana', 
        club: 'Aston Villa', 
        position: 'CDM', 
        nationality: 'Belgium',
        league: 'Premier League',
        score: 85,
        description: 'Physical specimen. High duel success rate. Key for Villa mid-block stability.',
        updatedAt: '5h ago',
        playerPhoto: 'https://api.statorium.com/media/bearleague/bl17337166521193.webp',
        age: 23
      },
      { 
        id: '3482', 
        name: 'Lautaro Martínez', 
        club: 'Inter Milan', 
        position: 'ST', 
        nationality: 'Argentina',
        league: 'Serie A',
        score: 91,
        description: 'Elite finisher. Exceptional work rate and pressing ability. Captain and talisman.',
        updatedAt: '1d ago',
        playerPhoto: 'https://api.statorium.com/media/bearleague/bl1695386805672.webp',
        age: 27
      },
    ],
    analyzing: [
      { 
        id: '670', 
        name: 'Ousmane Dembélé', 
        club: 'Paris Saint-Germain', 
        position: 'RW', 
        nationality: 'France',
        league: 'Ligue 1',
        score: 89,
        description: 'Elite 1v1 ability and explosive pace. Exceptional creative output. Key playmaker in PSG wide areas.',
        updatedAt: '12h ago',
        playerPhoto: 'https://api.statorium.com/media/bearleague/bl1702304187852.webp',
        age: 27
      },
    ],
    complete: [],
  }

  return (
    <div className="space-y-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Watchlist</h1>
        <p className="text-zinc-400">Track and manage your scouting pipeline for Top 5 Leagues (PL, La Liga, Bundesliga, Ligue 1, Serie A).</p>
      </div>

      <KanbanBoard initialData={initialData} />
    </div>
  )
}
