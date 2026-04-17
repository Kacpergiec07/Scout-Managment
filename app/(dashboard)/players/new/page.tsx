'use client'

import { PlayerForm } from '@/components/scout/player-form'
import { getPlayerDetailsAction } from '@/app/actions/statorium'
import { useSearchParams } from 'next/navigation'
import * as React from 'react'

export default function NewPlayerPage() {
  const searchParams = useSearchParams()
  const statoriumId = searchParams.get('statoriumId')
  const [initialData, setInitialData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(!!statoriumId)

  React.useEffect(() => {
    async function load() {
      if (statoriumId) {
        const player = await getPlayerDetailsAction(statoriumId)
        if (player) {
          // Simple mapping for Phase 1
          setInitialData({
            name: `${player.firstName} ${player.lastName}`,
            nationality: player.country || '',
            position: 'ST', // Fallback, mapping needed
            club: '',
            league: '',
          })
        }
        setLoading(false)
      }
    }
    load()
  }, [statoriumId])

  if (loading) return <div className="text-zinc-500 p-8">Fetching player data from Statorium...</div>

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-50">Create Player Profile</h1>
        <p className="text-zinc-400">
          Refine the statistics below. We've pre-filled what we could from Statorium.
        </p>
      </div>

      <PlayerForm initialData={initialData} />
    </div>
  )
}
