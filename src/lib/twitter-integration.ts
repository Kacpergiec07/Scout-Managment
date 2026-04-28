// Real Twitter/X and Football Forum Integration
// This module handles fetching real transfer rumors from Twitter and football forums

export interface TwitterPost {
  id: string
  text: string
  author_id: string
  created_at: string
  public_metrics: {
    like_count: number
    retweet_count: number
    reply_count: number
  }
  entities?: {
    urls?: Array<{
      url: string
      expanded_url: string
      display_url: string
    }>
    hashtags?: Array<{
      tag: string
    }>
    mentions?: Array<{
      username: string
    }>
  }
}

export interface ForumPost {
  id: string
  title: string
  content: string
  author: string
  created_at: string
  url: string
  likes: number
  replies: number
}

// Twitter API v2 Configuration
const TWITTER_API_CONFIG = {
  baseUrl: 'https://api.twitter.com/2',
  // Note: In production, these should be environment variables
  bearerToken: process.env.NEXT_PUBLIC_TWITTER_BEARER_TOKEN || '',
  // Key football transfer accounts to follow
  accounts: [
    'FabrizioRomano',      // Fabrizio Romano
    'David_Ornstein',      // David Ornstein
    'TheAthleticFC',       // The Athletic
    'SkySportsNews',       // Sky Sports
    'DiMarzio',            // Gianluca Di Marzio
    'Meczykipl',           // Meczyki.pl
    'transferyinfo',       // Transfery.info
    'Piotr_Koziol',        // Piotr Koźniol
    'Tomasz_Wlodarczyk',   // Tomasz Włodarczyk
    'RomanoVid',           // Romano Video
    'GianlucaDiMarzio',    // Di Marzio
  ]
}

// Forum sources configuration
const FORUM_SOURCES = {
  reddit: {
    baseUrl: 'https://www.reddit.com/r/soccer',
    transferSubs: [
      'r/soccer',
      'r/football',
      'r/RedDevils',
      'r/LiverpoolFC',
      'r/Gunners',
      'r/Chelseafc',
      'r/COYS',
      'r/MCFC',
    ]
  },
  // Add more forum sources as needed
}

/**
 * Fetch tweets from specific Twitter accounts
 * Requires Twitter API Bearer Token
 */
export async function fetchTweetsFromAccounts(
  accountNames: string[] = TWITTER_API_CONFIG.accounts,
  maxResults: number = 20
): Promise<TwitterPost[]> {
  if (!TWITTER_API_CONFIG.bearerToken) {
    console.warn('Twitter API Bearer Token not configured')
    return []
  }

  try {
    // Get user IDs from usernames
    const userIdsResponse = await fetch(
      `${TWITTER_API_CONFIG.baseUrl}/users/by?usernames=${accountNames.join(',')}`,
      {
        headers: {
          'Authorization': `Bearer ${TWITTER_API_CONFIG.bearerToken}`,
        },
      }
    )

    if (!userIdsResponse.ok) {
      throw new Error('Failed to fetch user IDs')
    }

    const userIdsData = await userIdsResponse.json()
    const userIds = userIdsData.data?.map((user: any) => user.id) || []

    if (userIds.length === 0) return []

    // Fetch tweets from these users
    const tweetsResponse = await fetch(
      `${TWITTER_API_CONFIG.baseUrl}/users/${userIds[0]}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics,entities&expansions=author_id`,
      {
        headers: {
          'Authorization': `Bearer ${TWITTER_API_CONFIG.bearerToken}`,
        },
      }
    )

    if (!tweetsResponse.ok) {
      throw new Error('Failed to fetch tweets')
    }

    const tweetsData = await tweetsResponse.json()
    return tweetsData.data || []

  } catch (error) {
    console.error('Error fetching tweets:', error)
    return []
  }
}

/**
 * Search Twitter for transfer-related tweets
 */
export async function searchTransferTweets(
  query: string = 'transfer OR "here we go" OR "breaking" football',
  maxResults: number = 20
): Promise<TwitterPost[]> {
  if (!TWITTER_API_CONFIG.bearerToken) {
    console.warn('Twitter API Bearer Token not configured')
    return []
  }

  try {
    const response = await fetch(
      `${TWITTER_API_CONFIG.baseUrl}/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${maxResults}&tweet.fields=created_at,public_metrics,entities,author_id&expansions=author_id`,
      {
        headers: {
          'Authorization': `Bearer ${TWITTER_API_CONFIG.bearerToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to search tweets')
    }

    const data = await response.json()
    return data.data || []

  } catch (error) {
    console.error('Error searching tweets:', error)
    return []
  }
}

/**
 * Fetch posts from Reddit football forums
 * Note: This uses public Reddit API (no auth required for read-only)
 */
export async function fetchRedditTransferPosts(
  subreddit: string = 'soccer',
  limit: number = 20
): Promise<ForumPost[]> {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Reddit posts')
    }

    const data = await response.json()
    const posts = data.data?.children || []

    return posts
      .filter((post: any) => {
        const title = post.data.title.toLowerCase()
        // Filter for transfer-related posts
        return title.includes('transfer') ||
               title.includes('signing') ||
               title.includes('rumor') ||
               title.includes('here we go') ||
               title.includes('breaking')
      })
      .map((post: any) => ({
        id: post.data.id,
        title: post.data.title,
        content: post.data.selftext || '',
        author: post.data.author,
        created_at: new Date(post.data.created_utc * 1000).toISOString(),
        url: `https://www.reddit.com${post.data.permalink}`,
        likes: post.data.ups,
        replies: post.data.num_comments,
      }))

  } catch (error) {
    console.error('Error fetching Reddit posts:', error)
    return []
  }
}

/**
 * Parse Twitter post to extract transfer information
 */
export function parseTwitterTransferInfo(tweet: TwitterPost): {
  player?: string
  fromClub?: string
  toClub?: string
  confidence: 'confirmed' | 'high' | 'medium' | 'low'
  isBreaking: boolean
} {
  const text = tweet.text.toLowerCase()

  // Confidence indicators
  const isConfirmed = text.includes('here we go') ||
                      text.includes('✅') ||
                      text.includes('confirmed') ||
                      text.includes('deal done')

  const isHigh = text.includes('understand') ||
                 text.includes('told') ||
                 text.includes('agreement')

  const isMedium = text.includes('interest') ||
                   text.includes('talks') ||
                   text.includes('negotiations')

  const isBreaking = text.includes('breaking') ||
                     text.includes('🚨') ||
                     text.includes('⚡')

  let confidence: 'confirmed' | 'high' | 'medium' | 'low' = 'low'
  if (isConfirmed) confidence = 'confirmed'
  else if (isHigh) confidence = 'high'
  else if (isMedium) confidence = 'medium'

  // Extract player names (simplified - in production use NER)
  const playerMentions = tweet.entities?.mentions || []
  const players = playerMentions.map(m => m.username)

  return {
    player: players[0] || undefined,
    fromClub: undefined,
    toClub: undefined,
    confidence,
    isBreaking,
  }
}

/**
 * Fetch all transfer intelligence from multiple sources
 */
export async function fetchAllTransferIntelligence(): Promise<{
  tweets: TwitterPost[]
  redditPosts: ForumPost[]
  lastUpdated: string
}> {
  try {
    // Fetch from multiple sources in parallel
    const [tweets, redditPosts] = await Promise.all([
      fetchTweetsFromAccounts(TWITTER_API_CONFIG.accounts, 15),
      fetchRedditTransferPosts('soccer', 10),
    ])

    return {
      tweets,
      redditPosts,
      lastUpdated: new Date().toISOString(),
    }

  } catch (error) {
    console.error('Error fetching transfer intelligence:', error)
    return {
      tweets: [],
      redditPosts: [],
      lastUpdated: new Date().toISOString(),
    }
  }
}

/**
 * Convert Twitter post to trending news format
 */
export function twitterPostToNewsItem(
  tweet: TwitterPost,
  source: string
): import('./trending-news').TrendingNewsItem {
  const parsedInfo = parseTwitterTransferInfo(tweet)

  return {
    id: `twitter-${tweet.id}`,
    headline: tweet.text.substring(0, 100) + (tweet.text.length > 100 ? '...' : ''),
    player: parsedInfo.player || 'Unknown',
    fromClub: 'Unknown',
    toClub: parsedInfo.toClub,
    source: source as any,
    sourceUrl: `https://x.com/i/status/${tweet.id}`,
    confidence: parsedInfo.confidence,
    timestamp: formatTwitterTime(tweet.created_at),
    read: false,
    postId: tweet.id,
  }
}

/**
 * Format Twitter timestamp to relative time
 */
function formatTwitterTime(createdAt: string): string {
  const tweetDate = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - tweetDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min temu`
  if (diffHours < 24) return `${diffHours} godz. temu`
  if (diffDays < 7) return `${diffDays} dni temu`

  return tweetDate.toLocaleDateString('pl-PL')
}

/**
 * Check if Twitter API is configured
 */
export function isTwitterApiConfigured(): boolean {
  return !!TWITTER_API_CONFIG.bearerToken
}
