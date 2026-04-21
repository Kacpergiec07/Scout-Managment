# External Integrations

**Analysis Date:** 2026-04-21

## APIs & External Services

**Sports Data:**
- Statorium API - Football/soccer data provider
  - SDK/Client: Custom client implementation in `lib/statorium/client.ts`
  - Auth: STATORIUM_API_KEY environment variable
  - Base URL: https://api.statorium.com/api/v1
  - Features: Player search, team stats, standings, transfers, match data, formations
  - Caching: 3600 seconds (1 hour) via Next.js fetch cache
  - Fallback: Mock data pool for search when API fails

**AI & Machine Learning:**
- Z.ai (OpenAI-compatible) - Chat and advisory AI
  - SDK/Client: @ai-sdk/openai
  - Auth: ZAI_API_KEY environment variable
  - Base URL: https://api.z.ai/api/coding/paas/v4/
  - Model: glm-4.7 (configurable via ZAI_MODEL)
  - Use case: Scout AI chatbot in `app/api/chat/route.ts`
  - Streaming responses supported

- Anthropic Claude (via AI SDK) - Player valuation and analysis
  - SDK/Client: @ai-sdk/anthropic
  - Auth: ANTHROPIC_API_KEY environment variable
  - Model: claude-3-5-sonnet-20241022
  - Use case: Transfer fee valuation engine in `app/api/valuation/route.ts`

## Data Storage

**Databases:**
- Supabase (PostgreSQL) - Main database and authentication
  - Connection: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Client: @supabase/supabase-js, @supabase/ssr
  - Schema: Custom tables defined in `lib/supabase/schema.sql`
  - Tables:
    - profiles - User profiles with stats and preferences
    - watchlist - User-saved players for tracking
    - analysis_history - Historical analysis results
  - Features:
    - Row Level Security (RLS) enabled
    - User-specific data isolation
    - Auth users integration
    - Auto-profile creation on signup
    - Trigger-based timestamp updates
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
    - login - User sign in with email/password
    - signup - User registration
    - signOut - User logout
  - Callback route: `app/auth/callback/route.ts`
  - Redirect handling: Login with error messages, post-login redirects to dashboard
  - Path revalidation: Automatic cache clearing on auth changes
  - Profile auto-creation: Trigger on auth.users insert

## Monitoring & Observability

**Error Tracking:**
- None detected - No error tracking service integrated

**Logs:**
- Console logging in API clients and services
- Basic error logging in Statorium client (`[StatoriumClient]` prefix)
- API error handling with status codes and messages
- Warning logs for API fallbacks

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
- ZAI_API_KEY - Z.ai service API key
- ZAI_BASE_URL - Z.ai service endpoint (optional, defaults to https://api.z.ai/api/coding/paas/v4/)
- ZAI_MODEL - AI model selection (optional, defaults to glm-4.7)
- ANTHROPIC_API_KEY - Anthropic Claude API key

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
- Statorium API: https://api.statorium.com/media/bearleague/*
- ui-avatars.com: Avatar generation
- b.fssta.com: Sports imagery
- upload.wikimedia.org: General imagery
- images.unsplash.com: Stock photography
- assets.aceternity.com: UI assets
- unpkg.com: Package assets

## Data Flow

**External API Integration Pattern:**
1. Custom client class wraps external API (`lib/statorium/client.ts`)
2. Authentication via constructor injection of API key from environment
3. Centralized fetch method with error handling and logging
4. Response normalization and transformation
5. Cache headers for performance optimization (3600s revalidation)
6. Fallback to mock data when API fails (Statorium search with 30+ player pool)

**AI Integration Pattern:**
1. Route handlers receive requests (`app/api/*`)
2. Initialize AI SDK client with environment variables
3. Configure system prompts with context (scouting terminology, data awareness)
4. Stream or generate responses based on request type
5. Parse and return structured data (valuation API) or stream text (chat API)
6. Error handling with fallback responses (offline mode)

**Supabase Integration Pattern:**
1. Server client created with cookie-based session management
2. Browser client created with localStorage session management
3. Middleware handles session refresh on route changes
4. RLS policies enforce data isolation per user
5. Triggers auto-create profiles on signup
6. Functions handle timestamp updates automatically

---

*Integration audit: 2026-04-21*