'use client'

import * as React from 'react'
import { Bell } from 'lucide-react'
import { NotificationsPanel } from '@/components/notifications-panel-optimized'
import { cn } from '@/lib/utils'

export function NotificationsBell() {
  const [isPanelOpen, setIsPanelOpen] = React.useState(false)

  return (
    <>
      <button
        onClick={() => setIsPanelOpen(prev => !prev)}
        aria-label="Notifications"
        className="relative w-11 h-11 flex items-center justify-center p-1.5 rounded-lg bg-muted/50 hover:bg-primary/10 transition-all duration-200 group cursor-pointer"
      >
        <Bell className="w-4 h-4 text-muted-foreground transition-colors duration-200 group-hover:text-foreground" />

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="absolute inset-0 rounded-lg bg-primary/20 blur-sm" />
        </div>
      </button>

      {/* Notifications Panel */}
      <NotificationsPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} isDashboard={false} />
    </>
  )
}
