# External Integrations

**Analysis Date:** 2026-05-04

## APIs & External Services

**Football Data APIs:**
- Statorium API - Professional football data provider
  - SDK/Client: Custom client at `src/lib/statorium/client.ts`
  - Auth: `STATORIUM_API_KEY` environment variable
  - Endpoints used: Players, teams, matches, standings, transfers, statistics
  - Cache: 3600 second revalidation via Next.js fetch

**AI Services:**
- Zhipu AI (GLM models) - Primary AI for chat and job generation
  - SDK/Client: `@ai-sdk/openai` with custom base URL
  - Auth: `ZAI_API_KEY`, `ZAI_BASE_URL` environment variables
  - Models: `glm-4-plus`, `glm-4.7`
  - Usage: Chatbot in `src/app/api/chat/route.ts`, scout narratives in `src/app/actions/ai.ts`, job generation in `src/app/actions/job-generation.ts`

- Anthropic Claude 3.5 Sonnet - Secondary AI for valuation
  - SDK/Client: `@ai-sdk/anthropic`
  - Auth: `ANTHROPIC_API_KEY` environment variable (assumed available)
  - Model: `claude-3-5-sonnet-20241022`
  - Usage: Transfer valuation in `src/app/api/valuation/route.ts`

**Web Scraping:**
- Transfermarkt.com - Football market value data
  - SDK/Client: `axios` with `cheerio` for HTML parsing
  - Auth: None (public scraping with rate limiting)
  - Implementation: `src/lib/transfermarkt.ts`
  - Rate limit: 1 second delay between requests

**Social Media:**
- Twitter/X API v2 - Transfer news and rumors
  - SDK/Client: Custom fetch-based client in `src/lib/twitter-integration.ts`
  - Auth: `NEXT_PUBLIC_TWITTER_BEARER_TOKEN` (optional)
  - Fallback: RSS feeds if not configured
  - Usage: Transfer intelligence gathering

**RSS Feeds:**
- Multiple football portal RSS feeds
  - Sources: Sky Sports, BBC Sport, Goal.com, ESPN FC, Guardian Football
  - SDK/Client: Custom XML parser in `src/lib/rss-feeds.ts`
  - Auth: None (public feeds)
  - CORS proxy: `NEXT_PUBLIC_CORS_PROXY_URL` (optional, defaults to allorigins.win)
  - Fallback sources: Meczyki.pl, Weszło, Transfery.info, Piłka Nożna

## Data Storage

**Databases:**
- Supabase (PostgreSQL) - Primary database and backend
  - Connection: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Client: `@supabase/supabase-js`, `@supabase/ssr`
  - Implementation: `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (server), `src/lib/supabase/middleware.ts`
  - Features: Real-time updates, Row Level Security (RLS), Authentication
  - Tables: `profiles`, `watchlist`, `analysis_history`, `jobs`
  - Schemas: `src/lib/supabase/schema.sql`, `src/lib/supabase/profiles-schema.sql`, `src/lib/supabase/jobs-schema.sql`

**File Storage:**
- Supabase Storage - Likely used for avatars and user uploads
  - Implementation: Through Supabase client
  - Auth: Same as database connection

**Caching:**
- Next.js built-in cache - API response caching
  - Configuration: `next: { revalidate: 3600 }` in fetch calls
  - Used in: Statorium API client for player/team data

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - User authentication and management
  - Implementation: Email/password authentication
  - Files: `src/app/auth/actions.ts`, `src/app/auth/callback/`
  - Flow: Login/signup in `src/app/auth/actions.ts`, callback handling in `src/app/auth/callback/`
  - Features: Email confirmation, session management, profile auto-creation
  - Row Level Security: Enabled on all user tables
  - Middleware: `src/middleware.ts` with `src/lib/supabase/middleware.ts` for session persistence

## Monitoring & Observability

**Error Tracking:**
- None detected - No dedicated error tracking service configured

**Logs:**
- Console logging - Standard console.log/error/warn throughout codebase
  - Pattern: `[StadiumClient]` prefix for API logs, emoji prefixes for RSS feed logs
  - Location: API clients, AI actions, data fetching functions

## CI/CD & Deployment

**Hosting:**
- Vercel (implied) - Next.js default hosting platform
  - Configuration: No vercel.json detected, using Vercel defaults

**CI Pipeline:**
- None detected - No GitHub Actions or CI configuration found

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `STATORIUM_API_KEY` - Statorium API key for football data
- `ZAI_API_KEY` - Zhipu AI API key
- `ZAI_BASE_URL` - Zhipu AI base URL
- `ANTHROPIC_API_KEY` - Anthropic API key (for valuation)

**Optional env vars:**
- `NEXT_PUBLIC_TWITTER_BEARER_TOKEN` - Twitter API bearer token
- `NEXT_PUBLIC_CORS_PROXY_URL` - CORS proxy URL for RSS feeds
- `NEXT_PUBLIC_ENABLE_MOCK_DATA` - Enable mock data for development
- `NEXT_PUBLIC_NEWS_REFRESH_INTERVAL` - News refresh interval in milliseconds
- `NEXT_PUBLIC_APP_URL` - Application URL for auth callbacks

**Secrets location:**
- `.env.local` - Local development (git-ignored)
- `.env.example` - Template with documentation

## Webhooks & Callbacks

**Incoming:**
- Supabase Auth callback - `/auth/callback` endpoint
  - Purpose: Handle email confirmation redirects
  - Implementation: `src/app/auth/callback/`

**Outgoing:**
- None detected - No outgoing webhook configurations found

## Third-Party Services

**Image Sources:**
- Statorium API - Player and team photos
  - Base URL: `https://api.statorium.com/media/bearleague/`
  - Configuration: Remote patterns in `next.config.mjs`

- External image domains (configured in Next.js):
  - `api.statorium.com` - Statorium API images
  - `ui-avatars.com` - User avatar fallbacks
  - `b.fssta.com` - Sports images
  - `upload.wikimedia.org` - Wikipedia images
  - `images.unsplash.com` - Stock photos
  - `assets.aceternity.com` - UI assets
  - `cdn.futwiz.com` - Football game assets (league logos)
  - `flagcdn.com` - Country flag images
  - `unpkg.com` - NPM package assets
  - `tmssl.akamaized.net` - Transfermarkt images

---

*Integration audit: 2026-05-04*
