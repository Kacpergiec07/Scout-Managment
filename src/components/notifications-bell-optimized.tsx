'use client'

import * as React from 'react'
import { Bell } from 'lucide-react'
import { createPortal } from '@/lib/portal-utils'
import { NotificationsPanel } from './notifications-panel-optimized'
import { getTrendingNews, getUnreadCount } from '@/lib/trending-news'
import { cn } from '@/lib/utils'

export function NotificationsBell() {
  const [isPanelOpen, setIsPanelOpen] = React.useState(false)
  const [trendingNews, setTrendingNews] = React.useState<any[]>([])
  const [mounted, setMounted] = React.useState(false)

  // Load trending news for badge count
  React.useEffect(() => {
    setMounted(true)
    const news = getTrendingNews()
    setTrendingNews(news)
  }, [])

  const unreadCount = React.useMemo(() => {
    return getUnreadCount(trendingNews)
  }, [trendingNews])

  const hasUnread = unreadCount > 0

  if (!mounted) return null

  return createPortal(
    <>
      <button
        onClick={() => setIsPanelOpen(prev => !prev)}
        aria-label="Notifications"
        className="relative w-11 h-11 flex items-center justify-center p-1.5 rounded-lg bg-muted/50 hover:bg-primary/10 transition-all duration-200 group cursor-pointer"
      >
        <Bell className={cn(
          "w-4 h-4 text-muted-foreground transition-colors duration-200",
          hasUnread ? "text-primary animate-pulse" : "group-hover:text-foreground"
        )} />

        {/* Compact Notification Badge */}
        {hasUnread && (
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full font-bold transition-all duration-200 shadow-lg",
              unreadCount > 9
                ? "w-4 h-4 text-[10px] bg-red-500 text-white"
                : unreadCount > 4
                ? "w-3.5 h-3.5 text-[10px] bg-orange-500 text-white"
                : "w-3 h-3 text-[10px] bg-primary text-black"
            )}
            style={{
              boxShadow: unreadCount > 0 ? '0 0 8px rgba(0,255, 136, 0.3)' : 'none',
            }}
          >
            {Math.min(unreadCount, 99)}
          </span>
        )}

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="absolute inset-0 rounded-lg bg-primary/20 blur-sm" />
        </div>
      </button>

      {/* Notifications Panel */}
      <NotificationsPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} isDashboard={false} />
    </>,
    document.body
  )
}
