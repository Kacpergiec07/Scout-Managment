'use client'

import { ScoutBot } from '@/components/scout/scout-bot'

export function FloatingElements() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
      <ScoutBot />
    </div>
  )
}
