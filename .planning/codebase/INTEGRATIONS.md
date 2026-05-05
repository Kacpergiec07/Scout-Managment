# External Integrations

**Analysis Date:** 2026-05-05

## APIs & External Services

**Football Data API:**
- Statorium API - Primary data source for football statistics
  - SDK/Client: Custom client (`src/lib/statorium/client.ts`)
  - Auth: STATORIUM_API_KEY (env var)
  - Endpoints used: players, teams_stats, standings, matches, transfers, scorers
  - Base URL: https://api.statorium.com/api/v1
  - Features: Player search, team statistics, league standings, match data, transfer history
  - Caching: 3600s revalidation (`next: { revalidate: 3600 }`)
  - Implementation files: `src/lib/statorium/client.ts`, `src/app/actions/statorium.ts`

**AI/ML Services:**
- Zhipu AI (GLM models) - Primary AI provider for chat and analysis
  - SDK/Client: Vercel AI SDK with OpenAI-compatible adapter
  - Auth: ZAI_API_KEY (env var)
  - Base URL: ZAI_BASE_URL (env var)
  - Model: ZAI_MODEL (env var, default: glm-4.7)
  - Implementation: `src/app/actions/ai.ts`, `src/app/api/chat/route.ts`
  - Use cases: Chat assistant, scout narrative generation, scouting hints, job generation

- Anthropic Claude (Claude 3.5 Sonnet) - Secondary AI provider
  - SDK/Client: @ai-sdk/anthropic, @anthropic-ai/sdk
  - Auth: ANTHROPIC_API_KEY (env var, if configured)
  - Model: claude-3-5-sonnet-20241022
  - Implementation: `src/app/api/valuation/route.ts`
  - Use cases: Transfer valuation analysis

**Social Media & News:**
- Twitter/X API (Optional) - Real-time transfer rumors
  - SDK/Client: Custom fetch-based client
  - Auth: NEXT_PUBLIC_TWITTER_BEARER_TOKEN (env var, optional)
  - Base URL: https://api.twitter.com/2
  - Implementation: `src/lib/twitter-integration.ts`
  - Features: Fetch tweets from transfer reporters, timeline posts
  - Accounts tracked: FabrizioRomano, David_Ornstein, TheAthleticFC, SkySportsNews, DiMarzio, and Polish reporters

- RSS Feeds - News aggregation (fallback)
  - Implementation: `src/lib/rss-feeds.ts`
  - Reliable sources: Sky Sports, BBC Sport, Goal.com, ESPN FC, Guardian Football
  - Polish sources: Meczyki.pl, Weszło, Transfery.info, Piłka Nożna (may be blocked)
  - CORS proxy: NEXT_PUBLIC_CORS_PROXY_URL (optional, defaults to cors-anywhere.herokuapp.com)

**Web Scraping:**
- Transfermarkt.com - Market value data
  - SDK/Client: Custom scraper with axios + cheerio
  - Implementation: `src/lib/transfermarkt.ts`, `src/app/actions/transfermarkt.ts`
  - Auth: None (public scraping with User-Agent header)
  - Rate limiting: 1 second delay between requests
  - Features: Search players, parse market values (€M/€K formats)
  - User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0

## Data Storage

**Databases:**
- Supabase (PostgreSQL)
  - Connection: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (env vars)
  - Client: @supabase/supabase-js, @supabase/ssr
  - Implementation: `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (server), `src/lib/supabase/middleware.ts`
  - Tables: watchlist, analysis_history, profiles, transfers, user_activities, jobs, cached_players, cached_teams
  - Features: Row Level Security (RLS), real-time subscriptions, auth integration
  - Schema files: `src/lib/supabase/schema.sql`, `src/lib/supabase/profiles-schema.sql`, `src/lib/supabase/jobs-schema.sql`, `src/lib/supabase/user-activities-schema.sql`, `src/lib/supabase/transfers-schema.sql`
  - Optimization: Indexes on watchlist (user_id, status, created_at), BRIN indexes available

**File Storage:**
- Supabase Storage - Used for player photos and avatars
  - Images stored in Supabase buckets
  - Fallback to external URLs (Statorium API, ui-avatars.com, CDN sources)

**Caching:**
- Next.js Data Cache - Built-in fetch caching (3600s for Statorium API)
- Client-side: React state, Server Actions
- Database caching: cached_players, cached_teams tables
- Local file cache: scratch/cache/player_{id}.json (fallback)
- No external caching layer (Redis, etc.) detected

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Custom authentication system
  - Implementation: Supabase Auth with email/password
  - Client: @supabase/ssr for server-side auth
  - Middleware: `src/middleware.ts` with session refresh
  - Features: Email/password signup/signin, automatic profile creation, session management
  - Protected routes: All routes under `src/app/(dashboard)/`
  - RLS policies: Users can only access their own data
  - Implementation files: `src/app/auth/actions.ts`, `src/app/auth/callback/route.ts`

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, LogRocket, etc.)

**Logs:**
- Console logging throughout codebase
- Error handling in API routes with console.error
- Pattern: [StatoriumClient], [Action] prefixes
- No centralized logging service detected

## CI/CD & Deployment

**Hosting:**
- Vercel (likely, based on Next.js + no Dockerfile)
- Next.js 15 compatible hosting platform

**CI Pipeline:**
- None detected (no GitHub Actions, GitLab CI, etc.)

**Build & Deployment:**
- npm scripts: dev, dev:turbo, build, start, lint, format, typecheck
- No automated deployment configuration detected

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `STATORIUM_API_KEY` - Statorium API key for football data
- `ZAI_API_KEY` - Zhipu AI API key
- `ZAI_BASE_URL` - Zhipu AI base URL
- `ZAI_MODEL` - Zhipu AI model (default: glm-4.7)
- `NEXT_PUBLIC_APP_URL` - Application URL for auth callbacks
- `ANTHROPIC_API_KEY` - Anthropic API key (for valuation endpoint)

**Optional env vars:**
- `NEXT_PUBLIC_TWITTER_BEARER_TOKEN` - Twitter API bearer token
- `NEXT_PUBLIC_CORS_PROXY_URL` - CORS proxy for RSS feeds (default: https://cors-anywhere.herokuapp.com/)
- `NEXT_PUBLIC_ENABLE_MOCK_DATA` - Enable mock data fallback (default: true)
- `NEXT_PUBLIC_NEWS_REFRESH_INTERVAL` - News refresh interval in ms (default: 600000)

**Secrets location:**
- Environment variables in .env.local (not committed to git)
- Example configuration in `.env.example`
- No secrets in codebase (follows best practices)

## Webhooks & Callbacks

**Incoming:**
- Supabase Auth callback: `/auth/callback/route.ts`
  - Handles email confirmation redirects
  - Implements: `src/app/auth/callback/route.ts`

**Outgoing:**
- No outgoing webhooks detected

## Image Domains

**Allowed remote image sources (next.config.mjs):**
- api.statorium.com - Player and team photos
- ui-avatars.com - User avatars
- b.fssta.com - Sports images
- upload.wikimedia.org - Wikipedia images
- images.unsplash.com - Stock photos
- assets.aceternity.com - UI assets
- cdn.futwiz.com - Football game assets
- flagcdn.com - Country flags
- unpkg.com - Package assets
- tmssl.akamaized.net - Transfermarkt images

## Third-Party JavaScript

**CDN Dependencies:**
- None detected (all dependencies via npm)

## Analytics & Tracking

- None detected (no Google Analytics, Mixpanel, etc.)

## Email Services

- Supabase Auth handles email verification (built-in)
- No custom email service integration detected

## Payment Processing

- None detected (no Stripe, PayPal, etc.)

---

*Integration audit: 2026-05-05*
