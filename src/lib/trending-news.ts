// Trending Transfer Rumors Intelligence System
// Aggregates football news from Polish and international sources

export interface TrendingNewsItem {
  id: string
  league?: 'premier-league' | 'la-liga' | 'serie-a' | 'bundesliga' | 'ligue-1' | 'ekstraklasa'
  headline: string // In style: "🚨 BREAKING: Mbappé to Real Madrid"
  player: string
  fromClub: string
  toClub?: string
  source: 'meczyki' | 'weszlo' | 'transfery' | 'romano' | 'athletic' | 'marca' | 'sky' | 'lequipe'
  sourceUrl: string
  confidence: 'confirmed' | 'high' | 'medium' | 'low'
  timestamp: string
  read: boolean
  annotationId?: string // For linking to specific annotation
}

// Source configurations with icons and REAL URLs
const NEWS_SOURCES = {
  // Polish sources (with Twitter/X post URLs)
  meczyki: {
    name: 'Meczyki.pl',
    url: 'https://x.com/Meczykipl',
    icon: '🇵🇱',
    type: 'transfer' as const,
    postUrl: (id: string) => `https://x.com/Meczykipl/status/${id}`
  },
  wszyszlo: {
    name: 'Weszło',
    url: 'https://x.com/weszlo',
    icon: '🇵🇱',
    type: 'injury' as const,
    postUrl: (id: string) => `https://x.com/weszlo/status/${id}`
  },
  transfery: {
    name: 'Transfery.info',
    url: 'https://x.com/transferyinfo',
    icon: '🇵🇱',
    type: 'transfer' as const,
    postUrl: (id: string) => `https://x.com/transferyinfo/status/${id}`
  },
  // International sources
  romano: {
    name: 'Fabrizio Romano',
    url: 'https://x.com/FabrizioRomano',
    icon: '🚨',
    type: 'transfer' as const,
    postUrl: (id: string) => `https://x.com/FabrizioRomano/status/${id}`
  },
  athletic: {
    name: 'The Athletic',
    url: 'https://theathletic.com/football',
    icon: '📰',
    type: 'transfer' as const,
    postUrl: (id: string) => `https://theathletic.com/football/transfer-news`
  },
  marca: {
    name: 'Marca',
    url: 'https://marca.com/en',
    icon: '🇪🇸',
    type: 'transfer' as const,
    postUrl: (id: string) => `https://marca.com/en/football/real-madrid/2024/07`
  },
  sky: {
    name: 'Sky Sports',
    url: 'https://skysports.com/football',
    icon: '🏴',
    type: 'transfer' as const,
    postUrl: (id: string) => `https://skysports.com/football/transfers`
  },
  lequipe: {
    name: "L'Équipe",
    url: 'https://lequipe.fr',
    icon: '🇫🇷',
    type: 'transfer' as const,
    postUrl: (id: string) => `https://lequipe.fr/football/transfers`
  },
}

// League configurations
const LEAGUES = {
  'premier-league': {
    name: 'Premier League',
    icon: '🇬🇧',
    color: '#3d195b'
  },
  'la-liga': {
    name: 'La Liga',
    icon: '🇪🇸',
    color: '#ee8700'
  },
  'serie-a': {
    name: 'Serie A',
    icon: '🇮🇹',
    color: '#008fd1'
  },
  'bundesliga': {
    name: 'Bundesliga',
    icon: '🇩🇪',
    color: '#d20515'
  },
  'ligue-1': {
    name: 'Ligue 1',
    icon: '🇫🇷',
    color: '#091c3d'
  },
  'ekstraklasa': {
    name: 'Ekstraklasa',
    icon: '🇵🇱',
    color: '#dc143c'
  },
}

// Realistic transfer rumors based on current market
const TRENDING_RUMORS: TrendingNewsItem[] = [
  {
    id: 'trend-001',
    league: 'premier-league',
    headline: '🚨 BREAKING: Liverpool submit £50M bid for Bellingham',
    player: 'Jude Bellingham',
    fromClub: 'Dortmund',
    toClub: 'Liverpool',
    source: 'romano',
    sourceUrl: 'https://x.com/FabrizioRomano/status/1789234789234',
    postId: '1789234789234',
    confidence: 'high',
    timestamp: '5 min temu',
    read: false,
    annotationId: 'bellingham-liverpool-deal'
  },
  {
    id: 'trend-002',
    league: 'la-liga',
    headline: '⚡ HERE WE GO: Real Madrid sign Mbappé until 2029',
    player: 'Kylian Mbappé',
    fromClub: 'PSG',
    toClub: 'Real Madrid',
    source: 'marca',
    sourceUrl: 'https://marca.com/en/football/real-madrid/2024/07/mbappe-signs-real-madrid',
    postId: 'mbappe-royal-announcement',
    confidence: 'confirmed',
    timestamp: '12 min temu',
    read: false,
    annotationId: 'mbappe-royal-move'
  },
  {
    id: 'trend-003',
    league: 'ekstraklasa',
    headline: '🇵🇱 Ekstraklasa: Lewandowski extension talks with Barcelona',
    player: 'Robert Lewandowski',
    fromClub: 'Barcelona',
    source: 'transfery',
    sourceUrl: 'https://x.com/transferyinfo/status/lewandowski-barcelona',
    postId: 'lewandowski-contract-talks',
    confidence: 'medium',
    timestamp: '30 min temu',
    read: false,
    annotationId: 'lewandowski-contract'
  },
  {
    id: 'trend-004',
    league: 'bundesliga',
    headline: '🏴🇩 Bayern pursue Havertz, €80M bid prepared',
    player: 'Kai Havertz',
    fromClub: 'Chelsea',
    toClub: 'Bayern Munich',
    source: 'sky',
    sourceUrl: 'https://skysports.com/football/transfers',
    postId: 'havertz-bayern-bid',
    confidence: 'medium',
    timestamp: '1 godz. temu',
    read: false,
    annotationId: 'havertz-bayern'
  },
  {
    id: 'trend-005',
    league: 'serie-a',
    headline: '⚡ INTEREST: Milan scouting Onana for €70M',
    player: 'Andre Onana',
    fromClub: 'Ajax',
    source: 'athletic',
    sourceUrl: 'https://theathletic.com/football/transfers',
    postId: 'onana-milan-scout',
    confidence: 'low',
    timestamp: '2 godz. temu',
    read: false,
    annotationId: 'onana-milan'
  },
  {
    id: 'trend-006',
    league: 'ligue-1',
    headline: '🇫🇷 PSG activate clause for Bernardo Silva',
    player: 'Bernardo Silva',
    fromClub: 'Man City',
    toClub: 'PSG',
    source: 'lequipe',
    sourceUrl: 'https://lequipe.fr/football/transfers',
    postId: 'bernardo-silva-clause',
    confidence: 'high',
    timestamp: '3 godz. temu',
    read: false,
    annotationId: 'bernardo-psg'
  },
  {
    id: 'trend-007',
    league: 'premier-league',
    headline: '🚨 INJURY: Kane out 4 weeks with ankle problem',
    player: 'Harry Kane',
    fromClub: 'Tottenham',
    source: 'wszyszlo',
    sourceUrl: 'https://x.com/weszlo/status/kane-injury-update',
    postId: 'kane-injury-ankle',
    confidence: 'confirmed',
    timestamp: '5 godz. temu',
    read: false,
    annotationId: 'kane-injury'
  },
  {
    id: 'trend-008',
    league: 'ekstraklasa',
    headline: '🇵🇱 TRANSFER: Zieliński to Napoli, €45M fee',
    player: 'Piotr Zieliński',
    fromClub: 'Napoli',
    source: 'meczyki',
    sourceUrl: 'https://x.com/Meczykipl/status/zielinski-napoli-transfer',
    postId: 'zielinski-transfer-news',
    confidence: 'low',
    timestamp: '8 godz. temu',
    read: false,
    annotationId: 'zielinski-napoli'
  },
  {
    id: 'trend-009',
    league: 'bundesliga',
    headline: '🏴🇩 CONFIRMED: Musiala joins Union Berlin',
    player: 'Jakub Musiala',
    fromClub: 'Union Berlin',
    source: 'romano',
    sourceUrl: 'https://x.com/FabrizioRomano/status/987234789234',
    postId: '987234789234',
    confidence: 'confirmed',
    timestamp: '12 godz. temu',
    read: false,
    annotationId: 'musiala-union'
  },
  {
    id: 'trend-010',
    league: 'premier-league',
    headline: '🚨 BREAKING: Arsenal agree Felix loan deal',
    player: 'João Félix',
    fromClub: 'Atlético Madrid',
    toClub: 'Arsenal',
    source: 'athletic',
    sourceUrl: 'https://theathletic.com/football/transfers',
    postId: 'felix-arsenal-loan',
    confidence: 'high',
    timestamp: '1 dzień temu',
    read: false,
    annotationId: 'felix-arsenal'
  },
]

// Functions
export async function getTrendingNews(): Promise<TrendingNewsItem[]> {
  console.log('🔍 Starting news fetch...')

  // Try to fetch real data from Twitter first
  try {
    const { fetchAllTransferIntelligence, isTwitterApiConfigured, twitterPostToNewsItem } = await import('./twitter-integration')

    if (isTwitterApiConfigured()) {
      console.log('🐦 Twitter API configured, fetching...')
      const intelligence = await fetchAllTransferIntelligence()

      // Convert real tweets to news items
      const realNewsItems = intelligence.tweets.map(tweet =>
        twitterPostToNewsItem(tweet, 'romano') // Default to romano source
      )

      if (realNewsItems.length > 0) {
        console.log(`✅ Fetched ${realNewsItems.length} real transfer news items from Twitter`)
        return realNewsItems
      }
    } else {
      console.log('🐦 Twitter API not configured, trying RSS feeds...')
    }
  } catch (error) {
    console.warn('⚠️ Failed to fetch Twitter news, trying RSS feeds:', error)
  }

  // Try RSS feeds as second option
  try {
    console.log('📰 Fetching RSS feeds...')
    const { getCombinedRSSNews } = await import('./rss-feeds')

    // Set a timeout for RSS fetching
    const rssPromise = getCombinedRSSNews()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('RSS fetch timeout')), 15000)
    )

    const rssNews = await Promise.race([rssPromise, timeoutPromise]) as any

    if (rssNews && rssNews.length > 0) {
      console.log(`✅ Fetched ${rssNews.length} transfer news items from RSS feeds`)
      return rssNews
    } else {
      console.log('📰 No RSS items found, using mock data...')
    }
  } catch (error) {
    console.warn('⚠️ Failed to fetch RSS news, using mock data:', error instanceof Error ? error.message : error)
  }

  // Final fallback to mock data
  console.log('📋 Using mock data as fallback')
  return TRENDING_RUMORS
}

export function getSourceConfig(source: TrendingNewsItem['source']) {
  return NEWS_SOURCES[source]
}

export function getLeagueConfig(league: TrendingNewsItem['league']) {
  return league ? LEAGUES[league] : null
}

export function getConfidenceColor(confidence: TrendingNewsItem['confidence']): string {
  switch (confidence) {
    case 'confirmed':
      return '#10b981' // green-600
    case 'high':
      return '#f59e0b' // amber-500
    case 'medium':
      return '#f97316' // orange-500
    case 'low':
      return '#64748b' // slate-500
    default:
      return '#64748b'
  }
}

export function getUnreadCount(items: TrendingNewsItem[]): number {
  return items.filter(item => !item.read).length
}

// Generate real post URL for X/Twitter
export function getPostUrl(source: TrendingNewsItem['source'], postId?: string): string {
  const config = getSourceConfig(source)
  if (!config) return '#'

  if (!postId) {
    return config.url || '#'
  }

  if (config.postUrl) {
    return config.postUrl(postId)
  }

  // Fallback for sources without postUrl function
  return config.url || '#'
}
