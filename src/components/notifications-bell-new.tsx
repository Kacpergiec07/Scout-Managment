'use client'

import * as React from 'react'
import { Bell } from 'lucide-react'
import { NotificationsPanel } from './notifications-panel'
import { usePathname } from 'next/navigation'

export function NotificationsBell() {
  const pathname = usePathname()
  const [isPanelOpen, setIsPanelOpen] = React.useState(false)
  const [hasUnread, setHasUnread] = React.useState(true)
  const [unreadCount, setUnreadCount] = React.useState(3)

  const isDashboard = pathname === '/dashboard'

  return (
    <div className="relative w-10 h-10">
      <div
        className="relative cursor-pointer flex items-center justify-center w-full h-full rounded-xl hover:bg-muted transition-all duration-300 group"
        onClick={() => setIsPanelOpen(prev => !prev)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors pointer-events-none" />

        {/* Notification Badge */}
        {hasUnread && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground rounded-full w-4 h-4 text-[10px] font-black flex items-center justify-center pointer-events-none shadow-[0_0_10px_hsl(var(--secondary)/0.5)]">
            {Math.min(unreadCount, 9)}
          </span>
        )}
      </div>

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false)
          setHasUnread(false)
          setUnreadCount(0)
        }}
        onMarkAsRead={(itemId) => {
          setUnreadCount(prev => Math.max(0, prev - 1))
          if (unreadCount - 1 === 0) {
            setHasUnread(false)
          }
        }}
        isDashboard={isDashboard}
      />
    </div>
  )
}