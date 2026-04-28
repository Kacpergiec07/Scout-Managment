// RSS Feed Integration for Polish Football Portals
// Alternative to Twitter API - uses public RSS feeds

export interface RSSFeedItem {
  title: string
  link: string
  description: string
  pubDate: string
  source: string
  category?: string
}

// Polish football portal RSS feeds
const FOOTBALL_RSS_FEEDS = {
  // Polish sources (may not have RSS or may be blocked)
  meczyki: {
    name: 'Meczyki.pl',
    url: 'https://meczyki.pl/feed/',
    type: 'transfer',
    icon: '🇵🇱',
    reliable: false
  },
  weszlo: {
    name: 'Weszło',
    url: 'https://www.weszlo.com/rss',
    type: 'general',
    icon: '🇵🇱',
    reliable: false
  },
  transfery: {
    name: 'Transfery.info',
    url: 'https://transfery.info/feed/',
    type: 'transfer',
    icon: '🇵🇱',
    reliable: false
  },
  pilkanozna: {
    name: 'Piłka Nożna',
    url: 'https://www.pilkanozna.pl/feed',
    type: 'general',
    icon: '🇵🇱',
    reliable: false
  },
  // International reliable sources
  skysports: {
    name: 'Sky Sports',
    url: 'https://www.skysports.com/rss/12040', // Football transfers RSS
    type: 'transfer',
    icon: '🏴',
    reliable: true
  },
  bbc: {
    name: 'BBC Sport',
    url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
    type: 'general',
    icon: '🏴',
    reliable: true
  },
  goal: {
    name: 'Goal.com',
    url: 'https://www.goal.com/rss/transfer-news',
    type: 'transfer',
    icon: '⚽',
    reliable: true
  },
  espn: {
    name: 'ESPN FC',
    url: 'https://www.espn.com/espn/rss/soccer/news',
    type: 'general',
    icon: '⚽',
    reliable: true
  },
  guardian: {
    name: 'Guardian Football',
    url: 'https://www.theguardian.com/football/rss',
    type: 'general',
    icon: '🏴',
    reliable: true
  }
}

/**
 * Parse RSS XML to JSON
 */
export async function parseRSSFeed(url: string): Promise<RSSFeedItem[]> {
  let response: Response
  let usedProxy = false

  try {
    // Try to fetch RSS feed with CORS handling
    try {
      console.log(`📡 Attempting direct fetch: ${url}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      try {
        response = await fetch(url, {
          headers: {
            'Accept': 'application/rss+xml, application/xml, text/xml',
            'User-Agent': 'Mozilla/5.0 (compatible; ScoutPro/1.0)'
          },
          signal: controller.signal,
          mode: 'cors'
        })
      } finally {
        clearTimeout(timeoutId)
      }

      console.log(`✅ Direct fetch successful: ${response.status}`)

    } catch (fetchError) {
      // If direct fetch fails, try with CORS proxy
      console.warn(`⚠️ Direct fetch failed for ${url}, trying CORS proxy`)

      const corsProxy = process.env.NEXT_PUBLIC_CORS_PROXY_URL || 'https://api.allorigins.win/raw?url='
      const proxyUrl = `${corsProxy}${encodeURIComponent(url)}`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      try {
        response = await fetch(proxyUrl, {
          signal: controller.signal,
          mode: 'cors'
        })
        usedProxy = true
        console.log(`✅ Proxy fetch successful: ${response.status}`)
      } finally {
        clearTimeout(timeoutId)
      }
    }

    if (!response.ok) {
      console.error(`❌ RSS fetch failed: ${response.status} ${response.statusText}`)
      throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`)
    }

    const rssText = await response.text()
    console.log(`📄 RSS text length: ${rssText.length} characters`)

    // Simple XML parser (in production, use a proper XML parser library)
    const items: RSSFeedItem[] = []

    // Extract items using regex (simplified - use proper XML parser in production)
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    try {
      while ((match = itemRegex.exec(rssText)) !== null) {
        const itemContent = match[1]

        const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                          itemContent.match(/<title>(.*?)<\/title>/)
        const linkMatch = itemContent.match(/<link>(.*?)<\/link>/)
        const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
                         itemContent.match(/<description>(.*?)<\/description>/)
        const dateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/)

        if (titleMatch && linkMatch) {
          items.push({
            title: titleMatch[1].trim(),
            link: linkMatch[1].trim(),
            description: descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '',
            pubDate: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
            source: 'unknown'
          })
        }
      }
    } catch (parseError) {
      console.warn('⚠️ Error parsing RSS items:', parseError)
      // Return whatever we managed to parse
    }

    console.log(`📋 Parsed ${items.length} items from ${usedProxy ? 'proxy' : 'direct'} feed`)
    return items

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Error parsing RSS feed ${url}: ${errorMessage}`)

    // If it's a network or CORS error, return empty array but don't throw
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('CORS')) {
      console.log(`📡 Network/CORS error for ${url}, returning empty array`)
      return []
    }

    return []
  }
}

/**
 * Fetch all RSS feeds from football portals
 */
export async function fetchAllFootballRSS(): Promise<{
  source: string
  items: RSSFeedItem[]
  error?: string
}[]> {
  const results = []

  // Try reliable sources first
  const reliableSources = Object.entries(FOOTBALL_RSS_FEEDS)
    .filter(([_, feed]) => feed.reliable)

  console.log(`📡 Fetching ${reliableSources.length} reliable RSS sources`)

  for (const [key, feed] of reliableSources) {
    try {
      console.log(`🔄 Fetching RSS from ${feed.name} (${feed.url})`)
      const items = await parseRSSFeed(feed.url)
      console.log(`✅ ${feed.name}: ${items.length} items`)

      results.push({
        source: key,
        items: items.map(item => ({ ...item, source: feed.name }))
      })
    } catch (error) {
      console.error(`❌ Error fetching ${key} RSS:`, error)
      results.push({
        source: key,
        items: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // If we got results from reliable sources, return them
  const successfulResults = results.filter(r => r.items.length > 0)
  if (successfulResults.length > 0) {
    console.log(`✅ Got ${successfulResults.length} successful RSS feeds`)
    return results
  }

  // Otherwise try unreliable sources as fallback
  console.log('⚠️ No reliable sources worked, trying fallback sources...')
  const unreliableSources = Object.entries(FOOTBALL_RSS_FEEDS)
    .filter(([_, feed]) => !feed.reliable)

  for (const [key, feed] of unreliableSources) {
    try {
      console.log(`🔄 Fetching fallback RSS from ${feed.name}`)
      const items = await parseRSSFeed(feed.url)
      console.log(`✅ ${feed.name}: ${items.length} items`)

      results.push({
        source: key,
        items: items.map(item => ({ ...item, source: feed.name }))
      })
    } catch (error) {
      console.error(`❌ Error fetching fallback ${key} RSS:`, error)
      results.push({
        source: key,
        items: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

/**
 * Filter RSS items for transfer-related content
 */
export function filterTransferNews(items: RSSFeedItem[]): RSSFeedItem[] {
  const transferKeywords = [
    'transfer', 'signing', 'deal', 'contract', 'loan',
    'przelew', 'transfer', 'kontrakt', 'podpis', 'wypożyczenie',
    'here we go', 'breaking', 'rumor', 'plotka', 'informacja'
  ]

  return items.filter(item => {
    const text = (item.title + ' ' + item.description).toLowerCase()
    return transferKeywords.some(keyword => text.includes(keyword))
  })
}

/**
 * Convert RSS item to trending news format
 */
export function rssItemToNewsItem(
  item: RSSFeedItem,
  source: string
): import('./trending-news').TrendingNewsItem {
  const text = item.title.toLowerCase()

  // Determine confidence based on keywords
  let confidence: 'confirmed' | 'high' | 'medium' | 'low' = 'low'

  if (text.includes('potwierdz') || text.includes('confirmed') || text.includes('podpisano')) {
    confidence = 'confirmed'
  } else if (text.includes('blisk') || text.includes('negocjacje') || text.includes('talks')) {
    confidence = 'high'
  } else if (text.includes('zainteresowany') || text.includes('interest') || text.includes('plotka')) {
    confidence = 'medium'
  }

  // Extract player name (simplified - in production use NER)
  const playerMatch = item.title.match(/([A-Z][a-z]+ [A-Z][a-z]+)/)
  const player = playerMatch ? playerMatch[1] : 'Unknown'

  return {
    id: `rss-${item.link.replace(/[^a-zA-Z0-9]/g, '-')}`,
    headline: item.title,
    player: player,
    fromClub: 'Unknown',
    toClub: undefined,
    source: source as any,
    sourceUrl: item.link,
    confidence: confidence,
    timestamp: formatRSSDate(item.pubDate),
    read: false,
  }
}

/**
 * Format RSS date to relative time
 */
function formatRSSDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min temu`
    if (diffHours < 24) return `${diffHours} godz. temu`
    if (diffDays < 7) return `${diffDays} dni temu`

    return date.toLocaleDateString('pl-PL')
  } catch {
    return 'Unknown'
  }
}

/**
 * Get combined news from all RSS feeds
 */
export async function getCombinedRSSNews(): Promise<import('./trending-news').TrendingNewsItem[]> {
  try {
    console.log('🌐 Starting RSS news fetch...')

    const allResults = await fetchAllFootballRSS()

    // Combine all results (including errors)
    const allItems = allResults.flatMap(result =>
      filterTransferNews(result.items).map(item =>
        rssItemToNewsItem(item, result.source)
      )
    )

    console.log(`📊 Total RSS items found: ${allItems.length}`)

    // Sort by date (newest first) - simple string comparison for now
    allItems.sort((a, b) => {
      return b.timestamp.localeCompare(a.timestamp)
    })

    const finalItems = allItems.slice(0, 50) // Limit to 50 most recent items
    console.log(`📋 Returning ${finalItems.length} RSS news items`)

    return finalItems

  } catch (error) {
    console.error('❌ Error getting combined RSS news:', error)
    return []
  }
}
