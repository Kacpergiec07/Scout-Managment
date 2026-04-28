'use client'

import { PlayerForm } from '@/components/scout/player-form'
import { getPlayerDetailsAction } from '@/app/actions/statorium'
import { useSearchParams } from 'next/navigation'
import * as React from 'react'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

function NewPlayerContent() {
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
            name: (player as any).fullName || `${(player as any).firstName} ${(player as any).lastName}`,
            nationality: (player as any).country || '',
            position: (player as any).position || 'ST', 
            club: '',
            league: '',
          })
        }
        setLoading(false)
      }
    }
    load()
  }, [statoriumId])

  if (loading) return <div className="text-zinc-500 p-8 flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Fetching player data from Statorium...</div>

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

export default function NewPlayerPage() {
  return (
    <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
          <p className="text-zinc-400 font-medium">Preparing Player Creation Forge...</p>
        </div>
      }>
      <NewPlayerContent />
    </Suspense>
  )
}
