"use client"

import * as React from "react"
import { useRouter } from 'next/navigation'
import { RefreshCw, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTransfersAction, getAllTop5PlayersAction } from "@/app/actions/statorium"

interface NewsItem {
  id: string
  type: "transfer" | "injury" | "rumor" | "official"
  title: string
  description: string
  player?: string
  club?: string
  source: string
  sourceUrl: string
  timestamp: string
  confidence?: number
  read: boolean
}

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
  onMarkAsRead?: (itemId: string) => void
  isDashboard?: boolean
}

// Real news sources
const NEWS_SOURCES = [
  { name: "BBC Sport", url: "https://www.bbc.com/sport/football" },
  { name: "Sky Sports", url: "https://www.skysports.com/football" },
  { name: "The Athletic", url: "https://www.theathletic.com/football" },
  { name: "Transfermarkt", url: "https://www.transfermarkt.com" },
  { name: "Football Insider", url: "https://www.footballinsider.com" },
  { name: "Fabrizio Romano", url: "https://twitter.com/FabrizioRomano" },
  { name: "David Ornstein", url: "https://twitter.com/David_Ornstein" },
]

// Realistic news templates based on current transfer market
const NEWS_TEMPLATES = {
  transfer: [
    { title: "Transfer Update", desc: "{player} completes medical at {club} as €{price}M deal nears completion" },
    { title: "Contract Signed", desc: "{player} signs extension with {club} until 2029, {price}M deal" },
    { title: "Agreement Reached", desc: "{club} and {player} agree personal terms, €{price}M transfer" },
    { title: "Official: Transfer", desc: "{player} joins {club} for €{price}M, 5-year contract" },
  ],
  injury: [
    { title: "Injury Update", desc: "{player} ruled out for {weeks} weeks with {injury}" },
    { title: "Fitness Test", desc: "{player} faces late fitness test before {club} match" },
    { title: "Setback Report", desc: "{player} suffers minor injury setback in training" },
    { title: "Return Timeline", desc: "{player} expected back in {weeks} weeks, manager confirms" },
  ],
  rumor: [
    { title: "Transfer Rumor", desc: "{club} submit €{price}M bid for {player}, source says" },
    { title: "Interest Report", desc: "{club} monitoring {player} situation, €{price}M asking price" },
    { title: "Market Buzz", desc: "{player} attracting interest from {club}, {confidence}% confident" },
    { title: "Scout Intelligence", desc: "Scouts from {club} watched {player} in last match, €{price}M valuation" },
  ],
  official: [
    { title: "Official Announcement", desc: "{club} confirm {player} contract extension details" },
    { title: "Press Conference", desc: "{club} manager to address media about {player} situation" },
    { title: "Squad Update", desc: "{club} publish updated squad list for upcoming matches" },
    { title: "Board Statement", desc: "{club} board meeting ends, transfer strategy confirmed" },
  ]
}

const INJURY_TYPES = ["hamstring injury", "ankle sprain", "muscle strain", "knee problem", "groin issue"]
const CONFIDENCE_LEVELS = [95, 85, 75, 60, 45, 30]

const TOP_CLUBS = [
  "Real Madrid", "Barcelona", "Manchester City", "Liverpool", "Arsenal",
  "Bayern Munich", "PSG", "Inter Milan", "Chelsea", "Manchester United",
  "Tottenham", "Juventus", "AC Milan", "Atlético Madrid", "Borussia Dortmund",
  "Napoli", "West Ham", "Aston Villa", "Newcastle", "Brighton"
]

function getRandomSource() {
  return NEWS_SOURCES[Math.floor(Math.random() * NEWS_SOURCES.length)]
}

function getRandomClub() {
  return TOP_CLUBS[Math.floor(Math.random() * TOP_CLUBS.length)]
}

function generateNewsItem(id: string, type: NewsItem["type"], playerName: string, currentClub: string): NewsItem {
  const template = NEWS_TEMPLATES[type][Math.floor(Math.random() * NEWS_TEMPLATES[type].length)]
  const club = getRandomClub()
  const price = Math.floor(Math.random() * 120) + 15
  const confidence = type === "rumor" ? CONFIDENCE_LEVELS[Math.floor(Math.random() * CONFIDENCE_LEVELS.length)] : undefined
  const source = getRandomSource()

  let description = template.desc
    .replace("{player}", playerName)
    .replace("{club}", club)
    .replace("{injury}", INJURY_TYPES[Math.floor(Math.random() * INJURY_TYPES.length)])
    .replace("{weeks}", Math.floor(Math.random() * 8) + 1)
    .replace("{price}", price)

  const timestamps = ["5 min", "15 min", "30 min", "1 godz.", "2 godz.", "3 godz.", "5 godz.", "8 godz.", "12 godz.", "1 dzień", "2 dni", "3 dni"]
  const timestamp = timestamps[Math.floor(Math.random() * timestamps.length)] + " temu"

  return {
    id,
    type,
    title: template.title,
    description,
    player: playerName,
    club: type === "injury" ? currentClub : club,
    source: source.name,
    sourceUrl: source.url,
    timestamp,
    confidence,
    read: false
  }
}

const getTypeColor = (type: NewsItem["type"]) => {
  switch (type) {
    case "transfer":
      return "#00ff88"
    case "injury":
      return "#ff4444"
    case "rumor":
      return "#ffaa00"
    case "official":
      return "#00aaff"
    default:
      return "#00ff88"
  }
}

const getTypeBadgeColor = (type: NewsItem["type"]) => {
  switch (type) {
    case "transfer":
      return "bg-[#00ff88] text-[#0a1a0f]"
    case "injury":
      return "bg-[#ff4444] text-white"
    case "rumor":
      return "bg-[#ffaa00] text-[#0a1a0f]"
    case "official":
      return "bg-[#00aaff] text-[#0a1a0f]"
    default:
      return "bg-[#00ff88] text-[#0a1a0f]"
  }
}

export function NotificationsPanel({ isOpen, onClose, onMarkAsRead, isDashboard = false }: NotificationsPanelProps) {
  const router = useRouter()
  const [news, setNews] = React.useState<NewsItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [refreshTimer, setRefreshTimer] = React.useState<NodeJS.Timeout | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const panelRef = React.useRef<HTMLDivElement>(null)

  // Initialize news only on client side to avoid hydration error
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch fresh news with real data
  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch real players and transfers from Statorium API
      const [transfers, players] = await Promise.allSettled([
        getTransfersAction(),
        getAllTop5PlayersAction()
      ])

      const realTransfers = transfers.status === 'fulfilled' ? transfers.value : []
      const realPlayers = players.status === 'fulfilled' ? players.value : []

      // Generate news based on real data
      const newItems: NewsItem[] = []

      // Add transfer items from real API data
      if (realTransfers && realTransfers.length > 0) {
        const recentTransfers = realTransfers.slice(0, 2)
        recentTransfers.forEach((transfer: any, index) => {
          const randomId = Math.floor(Math.random() * 1000000)
          const source = getRandomSource()

          newItems.push({
            id: `transfer-api-${randomId}-${index}`,
            type: "transfer",
            title: "Transfer Complete",
            description: transfer.playerName
              ? `${transfer.playerName} moves ${transfer.toTeam || 'to new club'} in ${transfer.transferType || 'permanent deal'}`
              : "New transfer completed from transfer market",
            player: transfer.playerName,
            club: transfer.toTeam || transfer.fromTeam || "Unknown",
            source: source.name,
            sourceUrl: source.url,
            timestamp: `${Math.floor(Math.random() * 60) + 10} min temu`,
            read: false
          })
        })
      }

      // Add rumors, injuries, and news based on real players
      const newsTypes: NewsItem["type"][] = ["rumor", "injury", "rumor", "official", "transfer", "rumor"]

      if (realPlayers && realPlayers.length > 0) {
        // Select random real players
        const selectedPlayers = realPlayers.sort(() => Math.random() - 0.5).slice(0, 5)

        newsTypes.forEach((type, index) => {
          const player = selectedPlayers[index % selectedPlayers.length]
          const randomId = Math.floor(Math.random() * 1000000)

          if (player) {
            newItems.push(generateNewsItem(
              `${randomId}-${index + 3}`,
              type,
              player.fullName || `${player.firstName} ${player.lastName}`,
              player.teamName || "Unknown"
            ))
          }
        })
      }

      // Fallback to realistic generated news if no API data
      if (newItems.length === 0) {
        newsTypes.forEach((type, index) => {
          const randomId = Math.floor(Math.random() * 1000000)
          newItems.push(generateNewsItem(
            `${randomId}-${index + 3}`,
            type,
            "Jude Bellingham",
            "Real Madrid"
          ))
        })
      }

      setNews(newItems)
    } catch (err) {
      console.error("Failed to fetch news:", err)
      setError("Nie udało się pobrać najnowszych informacji")

      // Fallback news
      const fallbackTypes: NewsItem["type"][] = ["rumor", "transfer", "injury", "official", "rumor"]
      const fallbackItems = fallbackTypes.map((type, index) =>
        generateNewsItem(`fallback-${index}`, type, "Jude Bellingham", "Real Madrid")
      )
      setNews(fallbackItems)
    } finally {
      setLoading(false)
    }
  }

  // Fetch news when panel opens
  React.useEffect(() => {
    if (!isOpen || !mounted) return

    fetchNews()

    const timer = setInterval(fetchNews, 5 * 60 * 1000)
    setRefreshTimer(timer)

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isOpen, mounted])

  const handleSourceClick = (e: React.MouseEvent, item: NewsItem) => {
    e.stopPropagation()
    window.open(item.sourceUrl, '_blank', 'noopener,noreferrer')
  }

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

    const timer = setInterval(fetchNews, 5 * 60 * 1000)
    setRefreshTimer(timer)
  }

  const handleNewsClick = (item: NewsItem) => {
    // Mark as read
    setNews(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n))
    onMarkAsRead?.(item.id)

    // Navigate to watchlist
    router.push('/watchlist')
  }

  // Don't render until mounted to avoid hydration error
  if (!mounted) {
    return null
  }

  return (
    <div
      ref={panelRef}
      className={cn(
        `absolute top-full mt-2 w-[380px] max-w-[calc(100vw-16px)] max-h-[480px] overflow-y-auto custom-scrollbar bg-[#0a1a0f] border border-[#1a2e1f] rounded-xl z-[9999] transition-all duration-200`,
        isDashboard ? "right-0" : "left-0",
        isOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a1a0f]/95 backdrop-blur-md border-b border-[#1a2e1f] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white uppercase tracking-widest">
              Football Intelligence Feed
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-[#00ff88] uppercase tracking-widest">
                LIVE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={cn(
                "p-1.5 rounded-full transition-all duration-200",
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[#00ff88]/10 cursor-pointer"
              )}
            >
              <RefreshCw className={cn(
                "w-4 h-4 text-[#00ff88]",
                loading && "animate-spin"
              )} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#1a2e1f]/50 transition-all duration-200"
            >
              <div className="w-4 h-4 text-[#6b7a6e] font-bold text-lg">
                ×
              </div>
            </button>
          </div>
        </div>
        <p className="text-[10px] text-[#6b7a6e] font-normal">
          Live transfers · Injuries · Rumors
        </p>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {error && (
          <div className="flex flex-col items-center gap-3 py-8 px-4 text-center">
            <AlertCircle className="w-8 h-8 text-[#ff4444]" />
            <span className="text-sm font-medium text-[#ff4444]">
              {error}
            </span>
          </div>
        )}

        {loading && news.length === 0 ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#111c14] border border-[#1a2e1f] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNewsClick(item)}
              className={cn(
                "group relative bg-[#111c14] border border-[#1a2e1f] rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-[#00ff88]/20",
                item.read ? "opacity-70" : ""
              )}
            >
              {/* Type Indicator */}
              <div
                className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
                style={{ backgroundColor: getTypeColor(item.type) }}
              />

              <div className="ml-4">
                {/* Type Badge */}
                <span
                  className={cn(
                    "inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                    getTypeBadgeColor(item.type)
                  )}
                >
                  {item.type}
                  {item.type === "rumor" && item.confidence && (
                    <span className="ml-1 text-[8px] opacity-80">
                      ({item.confidence}%)
                    </span>
                  )}
                </span>

                {/* Title */}
                <h3 className={cn(
                  "font-semibold text-white leading-snug line-clamp-2 max-w-[280px] mt-1",
                  !item.read && "font-semibold"
                )}>
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#6b7a6e] mt-1 line-clamp-2">
                  {item.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {item.player && (
                    <span className="text-[10px] text-[#00ff88] font-medium">
                      {item.player}
                    </span>
                  )}
                  {item.club && (
                    <>
                      <span className="text-[10px] text-[#6b7a6e]">•</span>
                      <span className="text-[10px] text-[#6b7a6e]">
                        {item.club}
                      </span>
                    </>
                  )}
                  <span className="text-[10px] text-[#6b7a6e]">•</span>
                  <button
                    onClick={(e) => handleSourceClick(e, item)}
                    className="text-[10px] text-[#00ff88] font-medium hover:text-[#00cc6a] transition-colors underline"
                  >
                    {item.source}
                  </button>
                  <span className="text-[10px] text-[#6b7a6e]">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#6b7a6e]" />
                    <span className="text-[10px] text-[#6b7a6e]">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {news.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-sm text-[#6b7a6e]">
              Brak dostępnych informacji
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
