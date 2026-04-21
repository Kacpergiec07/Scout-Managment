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
    <div style={{ position: 'relative', width: '56px', height: '56px' }}>
      <div
        style={{
          position: 'relative',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}
        onClick={() => setIsPanelOpen(prev => !prev)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-zinc-400 hover:text-foreground transition-colors pointer-events-none" />

        {/* Notification Badge */}
        {hasUnread && unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            background: '#00ff88',
            color: '#000',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            boxShadow: '0 0 10px rgba(0, 255, 136, 0.3)'
          }}>
            {Math.min(unreadCount, 99)}
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