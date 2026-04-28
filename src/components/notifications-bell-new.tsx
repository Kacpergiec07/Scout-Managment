'use client'

import * as React from 'react'
import { Bell } from 'lucide-react'
import { NotificationsPanel } from './notifications-panel'
import { usePathname } from 'next/navigation'
import { getTrendingNews, getUnreadCount } from '@/lib/trending-news'
import { cn } from '@/lib/utils'

export function NotificationsBell() {
  const pathname = usePathname()
  const [isPanelOpen, setIsPanelOpen] = React.useState(false)
  const [trendingNews, setTrendingNews] = React.useState<any[]>([])
  const [mounted, setMounted] = React.useState(false)

  const isDashboard = pathname === '/dashboard'

  // Load trending news for badge count
  React.useEffect(() => {
    setMounted(true)
    const loadNews = async () => {
      try {
        const news = await getTrendingNews()
        setTrendingNews(news)
      } catch (error) {
        console.error('Failed to load news:', error)
        // Fallback to empty array
        setTrendingNews([])
      }
    }
    loadNews()
  }, [])

  const unreadCount = React.useMemo(() => {
    return getUnreadCount(trendingNews)
  }, [trendingNews])

  const hasUnread = unreadCount > 0

  return (
<<<<<<< HEAD
    <div className={cn(
      "relative w-14 h-14 transition-all duration-300",
      isPanelOpen ? "scale-105" : ""
    )}>
      <button
=======
    <div className="relative w-10 h-10">
      <div
        className="relative cursor-pointer flex items-center justify-center w-full h-full rounded-xl hover:bg-muted transition-all duration-300 group"
>>>>>>> 9990ce01dbdb2bbfead0c565e39f7fa66f06a642
        onClick={() => setIsPanelOpen(prev => !prev)}
        aria-label="Notifications"
        className="relative w-full h-full flex items-center justify-center p-2 rounded-xl bg-muted/50 hover:bg-primary/10 transition-all duration-300 group"
      >
<<<<<<< HEAD
        <Bell className={cn(
          "w-6 h-6 text-muted-foreground transition-colors duration-300",
          hasUnread ? "text-primary animate-pulse" : "group-hover:text-foreground"
        )} />

        {/* Dynamic Notification Badge */}
        {hasUnread && (
          <span className={cn(
            "absolute -top-1 -right-1 flex items-center justify-center rounded-full font-bold transition-all duration-300",
            unreadCount > 9
              ? "w-5 h-5 text-[10px] bg-red-500 text-white"
              : unreadCount > 4
              ? "w-4.5 h-4.5 text-[10px] bg-orange-500 text-white"
              : "w-4 h-4 text-[10px] bg-primary text-black"
          )} style={{
            boxShadow: unreadCount > 0 ? '0 0 12px rgba(0, 255, 136, 0.4)' : 'none',
          }}>
            {Math.min(unreadCount, 99)}
=======
        <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors pointer-events-none" />

        {/* Notification Badge */}
        {hasUnread && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground rounded-full w-4 h-4 text-[10px] font-black flex items-center justify-center pointer-events-none shadow-[0_0_10px_hsl(var(--secondary)/0.5)]">
            {Math.min(unreadCount, 9)}
>>>>>>> 9990ce01dbdb2bbfead0c565e39f7fa66f06a642
          </span>
        )}

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl" />
        </div>
      </button>

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false)
        }}
        onMarkAsRead={(itemId) => {
          setTrendingNews(prev => prev.map(n => n.id === itemId ? { ...n, read: true } : n))
        }}
        isDashboard={isDashboard}
      />
    </div>
  )
}
