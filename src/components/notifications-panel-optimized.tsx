"use client"

import * as React from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { RefreshCw, Clock, AlertCircle, ExternalLink, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { TrendingNewsItem, getTrendingNews, getSourceConfig, getLeagueConfig, getConfidenceColor, getUnreadCount, getPostUrl } from "@/lib/trending-news"
import { createPortal } from '@/lib/portal-utils'

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

  // Initialize news only on client side to avoid hydration error
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Scroll to specific annotation after navigation
  React.useEffect(() => {
    const annotationId = searchParams.get('highlight')

    if (annotationId && news.length > 0) {
      setTimeout(() => {
        const element = document.getElementById('news-item-' + annotationId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.classList.add('highlight-news')
          setTimeout(() => {
            element.classList.remove('highlight-news')
          }, 3000)
        }
      }, 500)
    }
  }, [news.length, searchParams])

  // Fetch trending news with updated data
  const fetchNews = async () => {
    setLoading(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 600))

      const trendingNews = getTrendingNews()
      setNews(trendingNews)
    } catch (err) {
      console.error("Failed to fetch news:", err)
      setError("Nie udało się pobrać najnowszych informacji")
      setNews(getTrendingNews().slice(0, 3))
    } finally {
      setLoading(false)
    }
  }

  // Fetch news when panel opens
  React.useEffect(() => {
    if (!isOpen || !mounted) return

    fetchNews()

    const timer = setInterval(fetchNews, 10 * 60 * 1000)
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

  const handleSourceClick = (e: React.MouseEvent, item: TrendingNewsItem) => {
    e.stopPropagation()

    const realUrl = getPostUrl(item.source, item.postId)

    if (realUrl) {
      window.open(realUrl, '_blank', 'noopener,noreferrer')
    } else {
      window.open(getSourceConfig(item.source)?.url, '_blank', 'noopener,noreferrer')
    }
  }

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
    setNews(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n))
    onMarkAsRead?.(item.id)

    if (item.annotationId) {
      router.push('/#' + item.annotationId)
    } else {
      router.push('/#')
    }

    setTimeout(() => {
      const element = document.getElementById('annotation-' + item.annotationId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('highlight-news')
        setTimeout(() => {
          element.classList.remove('highlight-news')
        }, 3000)
      }
    }, 100)

    onClose()
  }

  // Don't render until mounted to avoid hydration error
  if (!mounted) {
    return null
  }

  return createPortal(
      <div
        ref={panelRef}
        className={cn(
          "fixed top-0 right-0 w-[420px] max-h-[480px] overflow-y-auto custom-scrollbar bg-card border border-border rounded-2xl z-[99999] shadow-2xl transition-all duration-200",
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
        style={{
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Compact Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
                Trending Intelligence
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest">
                  LIVE
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className={cn(
                  "p-1 rounded-md transition-all duration-150",
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-primary/10 cursor-pointer"
                )}
              >
                <RefreshCw className={cn(
                  "w-3.5 h-3.5 text-primary",
                  loading && "animate-spin"
                )} />
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-accent transition-all duration-150"
              >
                <span className="text-sm text-muted-foreground">✕</span>
              </button>
            </div>
          </div>

          {/* Compact League Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 px-3 border-b border-border/20">
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
            }).map(([key, league]: [string, any]) => (
              <button
                key={key}
                onClick={() => {}}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-transparent hover:border-primary/30 bg-transparent hover:bg-primary/10 text-[10px] font-bold text-muted-foreground uppercase tracking-wider transition-all duration-150 whitespace-nowrap"
              >
                <span>{league.icon}</span>
                <span>{league.name}</span>
              </button>
            ))}
          </div>

          <p className="text-[9px] text-muted-foreground font-normal px-3 pb-2 flex items-center gap-1.5">
            <span>Live</span>
            <span className="text-border">·</span>
            <span>Breaking</span>
            <span className="text-border">·</span>
            <span>Polish</span>
          </p>

          {/* Compact Content */}
          <div className="p-3 space-y-2">
            {error && (
              <div className="flex flex-col items-center gap-2 py-6 px-3 text-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  {error}
                </span>
              </div>
            )}

            {loading && news.length === 0 ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-muted/20 border border-border/30 rounded-md animate-pulse" />
                ))}
              </div>
            ) : (
              news.map((item) => (
                <div
                  id={'news-item-' + (item.annotationId || item.id)}
                  key={item.id}
                  onClick={() => handleNewsClick(item)}
                  className={cn(
                    "group relative bg-accent/40 border border-border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:border-primary/30 hover:bg-accent/60 hover:scale-[1.01]",
                    item.read
                      ? "opacity-70 bg-accent/30"
                      : "bg-card"
                  )}
                >
                  {/* League Indicator (Left Border) */}
                  {item.league && getLeagueConfig(item.league) && (
                    <div
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-full transition-all duration-200"
                      style={{
                        backgroundColor: getLeagueConfig(item.league)!.color,
                        boxShadow: '0 0 6px ' + getLeagueConfig(item.league)!.color + '33',
                      }}
                    />
                  )}

                  <div className="ml-4">
                    {/* Headline with Source Icon */}
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-xs">
                        {getSourceConfig(item.source)?.icon}
                      </span>
                      <h3 className={cn(
                        "font-bold text-foreground leading-snug text-sm line-clamp-3",
                        !item.read && "font-extrabold"
                      )}>
                        {item.headline}
                      </h3>
                    </div>

                    {/* Player & Clubs Info */}
                    <div className="flex items-center gap-1.5 mt-1.5 mb-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-primary tracking-tight">
                        {item.player}
                      </span>
                      <ArrowRight className="w-3 h-3 text-border" />
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

                    {/* Compact Meta Bar */}
                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      {/* Source Button */}
                      <button
                        onClick={(e) => handleSourceClick(e, item)}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
                        title={'Open on ' + (getSourceConfig(item.source)?.name)}
                      >
                        <ExternalLink className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                          {getSourceConfig(item.source)?.name}
                        </span>
                      </button>

                      {/* Confidence Badge */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider",
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
                </div>
              ))
            )}

            {news.length === 0 && !loading && !error && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Brak dostępnych informacji
                </p>
              </div>
            )}

            {/* Compact Footer */}
            <div className="sticky bottom-0 z-10 bg-card/98 backdrop-blur-xl border-t border-border px-3 py-2">
              <div className="flex items-center justify-center gap-2 text-[9px] text-muted-foreground">
                <span className="font-medium">Sources:</span>
                <span className="font-bold text-primary">Meczyki.pl</span>
                <span className="text-border">·</span>
                <span className="font-bold text-primary">Weszło</span>
                <span className="text-border">·</span>
                <span className="font-bold text-primary">Romano</span>
                <span className="text-border">·</span>
                <span className="font-bold text-primary">The Athletic</span>
              </div>
            </div>
          </div>,
        document.body
    )
  }
}
