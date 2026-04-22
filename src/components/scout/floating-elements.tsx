'use client'

import dynamic from 'next/dynamic'

const ScoutBot = dynamic(() => import('@/components/scout/scout-bot').then(m => m.ScoutBot), { ssr: false })

export function FloatingElements() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
      <ScoutBot />
    </div>
  )
}
