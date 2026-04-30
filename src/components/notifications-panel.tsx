"use client"

import * as React from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { RefreshCw, Clock, AlertCircle, ExternalLink, ArrowRight, Zap, Globe } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { TrendingNewsItem, getTrendingNews, getSourceConfig, getLeagueConfig, getConfidenceColor, getUnreadCount, getPostUrl } from "@/lib/trending-news"

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
  onMarkAsRead?: (itemId: string) => void
  isDashboard?: boolean
}


export function NotificationsPanel({ isOpen, onClose, onMarkAsRead, isDashboard = false }: NotificationsPanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [news, setNews] = React.useState<TrendingNewsItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [refreshTimer, setRefreshTimer] = React.useState<NodeJS.Timeout | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const panelRef = React.useRef<HTMLDivElement>(null)

  // Memoize unread count - must be before useEffect hooks
  const unreadCount = React.useMemo(() => getUnreadCount(news), [news])

  // Initialize news only on client side to avoid hydration error
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Scroll to specific annotation after navigation
  React.useEffect(() => {
    const annotationId = searchParams.get('highlight')

    if (annotationId && news.length > 0) {
      // Find the matching news item and scroll to it
      setTimeout(() => {
        const element = document.getElementById(`news-item-${annotationId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })

          // Add highlight animation
          element.classList.add('highlight-news')

          // Remove highlight after animation
          setTimeout(() => {
            element.classList.remove('highlight-news')
          }, 3000)
        }
      }, 500) // Wait for panel content to load
    }
  }, [news.length, searchParams])

  // Fetch trending news
  const fetchNews = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get trending news from our intelligence system (now async)
      const trendingNews = await getTrendingNews()

      setNews(trendingNews)
    } catch (err) {
      console.error("Failed to fetch news:", err)
      setError("Nie udało się pobrać najnowszych informacji")

      // Fallback to minimal news
      try {
        const fallbackNews = await getTrendingNews()
        setNews(fallbackNews.slice(0, 3))
      } catch (fallbackError) {
        setNews([])
      }
    } finally {
      setLoading(false)
    }
  }

  // Fetch news when panel opens
  React.useEffect(() => {
    if (!isOpen || !mounted) return

    fetchNews()

    const timer = setInterval(fetchNews, 10 * 60 * 1000) // Refresh every 10 minutes
    setRefreshTimer(timer)

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isOpen, mounted])

  // Close panel when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const handleRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      setRefreshTimer(null)
    }

    fetchNews()

    const timer = setInterval(fetchNews, 10 * 60 * 1000)
    setRefreshTimer(timer)
  }

  const handleNewsClick = (item: TrendingNewsItem) => {
    // Mark as read
    setNews(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n))
    onMarkAsRead?.(item.id)

    // Navigate to your site with annotation ID (CHANGE: twojastrona.pl to YOUR domain)
    if (item.annotationId) {
      router.push(`/#${item.annotationId}`)
    } else {
      // If no specific annotation, just go to your site
      router.push('/#')
    }

    // Close panel
    onClose()
  }

  const handleSourceClick = (e: React.MouseEvent, item: TrendingNewsItem) => {
    e.stopPropagation()

    // Open REAL post URL
    const realUrl = getPostUrl(item.source, item.postId)

    if (realUrl) {
      window.open(realUrl, '_blank', 'noopener,noreferrer')
    } else {
      // Fallback to source URL if no post ID
      window.open(getSourceConfig(item.source)?.url, '_blank', 'noopener,noreferrer')
    }
  }

  // Don't render until mounted to avoid hydration error
  if (!mounted) {
    return null
  }

  return (
    <div
      ref={panelRef}
      className={cn(
        `fixed top-[72px] w-[420px] max-w-[calc(100vw-32px)] max-h-[600px] overflow-y-auto custom-scrollbar bg-card/95 backdrop-blur-xl border border-border rounded-2xl z-[999999] shadow-2xl transition-all duration-300`,
        isDashboard ? "left-8" : "right-8",
        isOpen
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
      )}
    >
      {/* Header with League Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-10 bg-card/98 backdrop-blur-xl border-b border-border p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap className="w-5 h-5 text-primary" />
            </motion.div>
            <h2 className="text-base font-bold text-foreground uppercase tracking-widest">
              Trending Intelligence
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                LIVE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRefresh}
              disabled={loading}
              className={cn(
                "p-1.5 rounded-full transition-all duration-200",
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-secondary/10 cursor-pointer"
              )}
            >
              <RefreshCw className={cn(
                "w-4 h-4 text-secondary",
                loading && "animate-spin"
              )} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-accent transition-all duration-200"
            >
              <div className="w-4 h-4 text-muted-foreground font-bold text-lg">
                ×
              </div>
            </motion.button>
          </div>
        </div>

        {/* League Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {Object.entries({
            'all': { name: 'All', icon: '🌍' },
            ...Object.fromEntries(
              Object.entries({
                'premier-league': { name: 'EPL', icon: '🇬🇧' },
                'la-liga': { name: 'La Liga', icon: '🇪🇸' },
                'serie-a': { name: 'Serie A', icon: '🇮🇹' },
                'bundesliga': { name: 'Bundes', icon: '🇩🇪' },
                'ligue-1': { name: 'L1', icon: '🇫🇷' },
                'ekstraklasa': { name: 'Ekstra', icon: '🇵🇱' },
              })
            )
          }).map(([key, league]: [string, any], index) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {/* Add filtering logic here */}}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/20 bg-accent/30 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hover:border-primary/30 hover:bg-primary/10 transition-all duration-200 whitespace-nowrap"
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
              >
                {league.icon}
              </motion.span>
              <span>{league.name}</span>
            </motion.button>
          ))}
        </div>

        <p className="text-[9px] text-muted-foreground font-normal mt-2 flex items-center gap-2">
          <span>Live transfers</span>
          <span className="text-border">·</span>
          <span>Breaking news</span>
          <span className="text-border">·</span>
          <span>Polish sources</span>
        </p>
      </motion.div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {error && (
          <div className="flex flex-col items-center gap-3 py-8 px-4 text-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {error}
            </span>
          </div>
        )}

        {loading && news.length === 0 ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/30 border border-border/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <AnimatePresence>
              {news.map((item, index) => (
                <motion.div
                  id={`news-item-${item.annotationId || item.id}`}
                  key={item.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 200
                  }}
                  onClick={() => handleNewsClick(item)}
                  className={cn(
                  "group relative bg-gradient-to-br from-accent/40 to-accent/20 border border-border rounded-xl p-3 cursor-pointer transition-all duration-300 hover:border-primary/30 hover:bg-accent/60 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5",
                  item.read ? "opacity-60" : ""
                )}
              >
              {/* League Indicator (Left Border) */}
              {item.league && getLeagueConfig(item.league) && (
                <div
                  className="absolute left-0 top-3 bottom-3 w-1.5 rounded-full transition-all duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: getLeagueConfig(item.league)!.color,
                    boxShadow: `0 0 8px ${getLeagueConfig(item.league)!.color}33`,
                  }}
                />
              )}

              <div className="ml-5">
                {/* Headline with Source Icon */}
                <div className="flex items-start gap-2 mb-1.5">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="text-sm">
                      {getSourceConfig(item.source)?.icon}
                    </span>
                  </div>
                  <h3 className={cn(
                    "font-bold text-foreground leading-snug text-sm line-clamp-3",
                    !item.read && "font-extrabold"
                  )}>
                    {item.headline}
                  </h3>
                </div>

                {/* Player & Clubs Info */}
                <div className="flex items-center gap-2 mt-2 mb-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-primary tracking-tight">
                    {item.player}
                  </span>
                  <span className="text-border text-[10px]">→</span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {item.fromClub}
                  </span>
                  {item.toClub && (
                    <>
                      <ArrowRight className="w-3 h-3 text-border" />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {item.toClub}
                      </span>
                    </>
                  )}
                </div>

                {/* Meta Bar */}
                <div className="flex items-center justify-between gap-3 mt-2 flex-wrap">
                  {/* Source Button - Opens REAL post URL */}
                  <button
                    onClick={(e) => handleSourceClick(e, item)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                    title={`Open post on ${getSourceConfig(item.source)?.name}`}
                  >
                    <ExternalLink className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                      {getSourceConfig(item.source)?.name}
                    </span>
                  </button>

                  {/* Confidence Badge */}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider",
                    )}
                    style={{
                      backgroundColor: getConfidenceColor(item.confidence),
                      color: item.confidence === 'confirmed' ? '#ffffff' : '#1e293b',
                    }}
                  >
                    {item.confidence}
                  </span>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              </div>
              </motion.div>
            ))}
          </AnimatePresence>
          </>
        )}

        {news.length === 0 && !loading && !error && (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">
              Brak dostępnych informacji
            </p>
          </div>
        )}
      </div>

      {/* Footer with source information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="sticky bottom-0 z-10 bg-card/98 backdrop-blur-xl border-t border-border p-3"
      >
        <div className="flex flex-col gap-2">
          {/* Source badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[9px] text-muted-foreground font-medium">Live Sources:</span>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-bold text-primary">Twitter/X</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-500">RSS Feeds</span>
            </motion.div>
          </div>

          {/* Specific sources */}
          <div className="flex items-center justify-center gap-2 text-[9px] text-muted-foreground">
            <span className="font-medium">Trusted:</span>
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="font-bold text-primary hover:underline cursor-pointer"
              onClick={() => window.open('https://x.com/Meczykipl', '_blank')}
            >
              Meczyki.pl
            </motion.span>
            <span className="text-border">·</span>
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="font-bold text-primary hover:underline cursor-pointer"
              onClick={() => window.open('https://x.com/weszlo', '_blank')}
            >
              Weszło
            </motion.span>
            <span className="text-border">·</span>
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="font-bold text-primary hover:underline cursor-pointer"
              onClick={() => window.open('https://x.com/FabrizioRomano', '_blank')}
            >
              Romano
            </motion.span>
            <span className="text-border">·</span>
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="font-bold text-primary hover:underline cursor-pointer"
              onClick={() => window.open('https://theathletic.com', '_blank')}
            >
              The Athletic
            </motion.span>
          </div>

          {/* Data source indicator */}
          <div className="flex items-center justify-center gap-1 text-[8px] text-muted-foreground">
            <Globe className="w-3 h-3" />
            <span className="font-medium">Real-time Data</span>
            <span className="text-border">·</span>
            <span className="font-medium">Updated:</span>
            <motion.span
              key={Date.now()} // Force re-render to show current time
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold"
            >
              {new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
            </motion.span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
