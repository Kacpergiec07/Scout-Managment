# External Integrations

**Analysis Date:** 2026-04-20

## APIs & External Services

**Sports Data:**
- Statorium API - Football/soccer data provider
  - SDK/Client: Custom client implementation in `lib/statorium/client.ts`
  - Auth: STATORIUM_API_KEY environment variable
  - Base URL: https://api.statorium.com/api/v1
  - Features: Player search, team stats, standings, transfers, match data
  - Caching: 3600 seconds (1 hour) via Next.js fetch cache

**AI & Machine Learning:**
- Anthropic Claude (via AI SDK) - Player valuation and analysis
  - SDK/Client: @ai-sdk/anthropic
  - Auth: ANTHROPIC_API_KEY environment variable
  - Model: claude-3-5-sonnet-20241022
  - Use case: Transfer fee valuation engine in `app/api/valuation/route.ts`

- Z.ai (OpenAI-compatible) - Chat and advisory AI
  - SDK/Client: @ai-sdk/openai
  - Auth: ZAI_API_KEY environment variable
  - Base URL: https://api.z.ai/api/coding/paas/v4/
  - Model: glm-4.7 (configurable via ZAI_MODEL)
  - Use case: Scout AI chatbot in `app/api/chat/route.ts`
  - Streaming responses supported

## Data Storage

**Databases:**
- Supabase (PostgreSQL) - Main database and authentication
  - Connection: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Client: @supabase/supabase-js, @supabase/ssr
  - Schema: Custom tables defined in `lib/supabase/schema.sql`
  - Tables:
    - watchlist - User-saved players for tracking
    - analysis_history - Historical analysis results
  - Features:
    - Row Level Security (RLS) enabled
    - User-specific data isolation
    - Auth users integration
  - Browser client: `lib/supabase/client.ts`
  - Server client: `lib/supabase/server.ts`
  - Middleware: `lib/supabase/middleware.ts`

**File Storage:**
- No dedicated file storage service detected
- Images served from external sources (Statorium API, Unsplash, etc.)

**Caching:**
- Next.js Data Cache (3600 seconds for Statorium API)
- Server-side React state management

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Built-in authentication service
  - Implementation: Email/password authentication
  - Client: `app/auth/actions.ts`
  - Functions:
    - login - User sign in
    - signup - User registration
    - signOut - User logout
  - Callback route: `app/auth/callback/route.ts`
  - Redirect handling: Login with error messages, post-login redirects
  - Path revalidation: Automatic cache clearing on auth changes

## Monitoring & Observability

**Error Tracking:**
- None detected - No error tracking service integrated

**Logs:**
- Console logging in API clients and services
- Basic error logging in Statorium client (`[StatoriumClient]` prefix)
- API error handling with status codes and messages

## CI/CD & Deployment

**Hosting:**
- Not specified - Compatible with any Next.js hosting platform
- Likely candidates: Vercel, Netlify, or custom Node.js server

**CI Pipeline:**
- None detected - No CI/CD configuration files found

## Environment Configuration

**Required env vars:**
- STATORIUM_API_KEY - Sports data API authentication
- NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase public access key
- ANTHROPIC_API_KEY - Anthropic Claude API key
- ZAI_API_KEY - Z.ai service API key
- ZAI_BASE_URL - Z.ai service endpoint (optional, defaults to https://api.z.ai/api/coding/paas/v4/)
- ZAI_MODEL - AI model selection (optional, defaults to glm-4.7)

**Secrets location:**
- .env.local file (not committed to git)
- Environment variables at deployment time

## Webhooks & Callbacks

**Incoming:**
- Supabase auth callback: `app/auth/callback/route.ts`

**Outgoing:**
- None detected - No outgoing webhooks configured

## Third-Party Content Sources

**Images:**
- Statorium API: https://api.stadium.com/media/bearleague/*
- ui-avatars.com: Avatar generation
- b.fssta.com: Sports imagery
- upload.wikimedia.org: General imagery
- images.unsplash.com: Stock photography
- assets.aceternity.com: UI assets
- unpkg.com: Package assets

## Data Flow

**External API Integration Pattern:**
1. Custom client class wraps external API (`lib/statorium/client.ts`)
2. Authentication via constructor injection of API key
3. Centralized fetch method with error handling
4. Response normalization and transformation
5. Cache headers for performance optimization
6. Fallback to mock data when API fails (Statorium search)

**AI Integration Pattern:**
1. Route handlers receive requests (`app/api/*`)
2. Initialize AI SDK client with environment variables
3. Configure system prompts with context
4. Stream or generate responses
5. Parse and return structured data (valuation API)
6. Error handling with fallback responses

---

*Integration audit: 2026-04-20*
