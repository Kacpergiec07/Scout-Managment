# Architecture

**Analysis Date:** 2026-05-05

## Pattern Overview

**Overall:** Next.js 15 with App Router, Server Components, and Server Actions

**Key Characteristics:**
- Full-stack React application with hybrid client/server rendering
- Server Actions for data mutations and API-like functionality
- Supabase for authentication, database, and real-time features
- External API integration (Stadium API) for football data
- AI-powered features using Anthropic and OpenAI SDKs
- Component-based architecture with shadcn/ui design system

## Layers

**Presentation Layer:**
- Purpose: UI rendering and user interaction
- Location: `src/app/` and `src/components/`
- Contains: React Server Components, Client Components, UI components
- Depends on: Server Actions, Supabase client, Statorium client
- Used by: End users via web browser

**Application Logic Layer:**
- Purpose: Business logic and data processing
- Location: `src/app/actions/`
- Contains: Server Actions for data operations, AI integrations, sync logic
- Depends on: Supabase server client, Statorium API client, external services
- Used by: Server Components and Client Components via action calls

**Data Access Layer:**
- Purpose: External API communication and data fetching
- Location: `src/lib/stadium/client.ts`, `src/lib/supabase/`
- Contains: API clients, database queries, caching strategies
- Depends on: External APIs (Stadium, Supabase), environment configuration
- Used by: Server Actions and Server Components

**Data Storage Layer:**
- Purpose: Persistent data storage
- Location: Supabase PostgreSQL database
- Contains: User profiles, watchlist, analysis history, cached data
- Depends on: Supabase infrastructure
- Used by: Data Access Layer

**Utility Layer:**
- Purpose: Helper functions and shared logic
- Location: `src/lib/`
- Contains: Type definitions, scoring engines, utilities
- Depends on: No dependencies (pure functions)
- Used by: All layers

## Data Flow

**Authentication Flow:**

1. User submits credentials via `src/app/login/page.tsx`
2. Server Action `login()` in `src/app/auth/actions.ts` authenticates with Supabase
3. Supabase returns session token stored in HTTP-only cookies
4. Middleware `middleware.ts` validates session on protected routes
5. Server components access user data via `createClient()` from `src/lib/supabase/server.ts`

**Player Data Fetching Flow:**

1. Client component triggers Server Action (e.g., `getTeamDetailsAction`)
2. Server Action checks multi-layer cache:
   - In-memory cache (GLOBAL_CACHE Map)
   - Supabase `cached_players` table
   - Local file cache (`scratch/cache/player_{id}.json`)
3. Cache miss: StatoriumClient fetches from `https://api.stadium.com/api/v1/`
4. Response is normalized, enriched, and cached at all levels
5. Enriched data returned to component for rendering

**AI-Powered Analysis Flow:**

1. User requests player analysis via UI
2. Server Action `calculateCompatibility()` in `src/lib/engine/scoring.ts` computes tactical fit
3. If AI narrative requested, `generateText()` from AI SDK calls Anthropic/OpenAI
4. Results stored in Supabase `analysis_history` table
5. Client renders analysis with visualizations (radar charts, tactical maps)

**State Management:**

- Server Components: No client-side state, fetch fresh data on each request
- Client Components: React hooks (useState, useEffect) for local state
- Server Actions: Atomic operations with automatic cache invalidation via `revalidatePath()`
- Real-time: Supabase subscriptions for live updates (where implemented)
- Authentication: Session stored in HTTP-only cookies, accessed via Supabase SSR client

## Key Abstractions

**StatoriumClient:**
- Purpose: Encapsulate Stadium API communication
- Examples: `src/lib/stadium/client.ts`
- Pattern: Singleton client class with method chaining, caching, and error handling

**Server Actions:**
- Purpose: Expose server-side functions to client components
- Examples: `src/app/actions/stadium.ts`, `src/app/actions/watchlist.ts`
- Pattern: `'use server'` directive, async functions, return typed responses

**Scouting Engine:**
- Purpose: Calculate player-club compatibility scores
- Examples: `src/lib/engine/scoring.ts`
- Pattern: Functional scoring algorithm with weighted breakdown (tactical, positional, stats, form, history)

**Component Categories:**
- Purpose: Organize UI components by domain
- Examples: `src/components/scout/`, `src/components/ui/`, `src/components/dashboard/`
- Pattern: Domain-driven component structure with shared UI primitives

## Entry Points

**Root Application:**
- Location: `src/app/page.tsx`
- Triggers: Application startup
- Responsibilities: Redirects to `/dashboard`

**Dashboard Route:**
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: Navigation to any dashboard route
- Responsibilities: Renders sidebar wrapper, floating elements, and child routes

**API Routes:**
- Location: `src/app/api/` (e.g., `src/app/api/chat/route.ts`)
- Triggers: HTTP requests to `/api/*` endpoints
- Responsibilities: Handle external integrations, webhooks, and AI streaming

**Auth Callback:**
- Location: `src/app/auth/callback/route.ts`
- Triggers: Email confirmation, OAuth callback
- Responsibilities: Complete authentication flow with Supabase

## Error Handling

**Strategy:** Multi-layer error handling with user-friendly fallbacks

**Patterns:**
- Server Actions: Try-catch blocks with logged errors and returned error objects
- API Client: Automatic retries, fallback to cached data, graceful degradation
- Components: Error boundaries (where implemented), loading states, empty states
- Database: RLS policies prevent unauthorized access, transaction rollbacks on failure

**Error Logging:**
- Console logging for development (`console.error`, `console.warn`)
- Supabase errors logged with context
- API errors include status codes and response text

## Cross-Cutting Concerns

**Authentication:** Supabase Auth with JWT tokens stored in HTTP-only cookies, protected by middleware

**Validation:** Zod schemas for form validation, TypeScript for compile-time type safety

**Caching:** Three-tier caching strategy (in-memory, database, filesystem) with 10-minute TTL

**Theming:** next-themes for dark/light mode, custom theme system in `src/lib/custom-theme.ts`

**Performance:** Next.js Image optimization, API route caching with `next: { revalidate: 3600 }`, React Server Components for reduced bundle size

**Internationalization:** Timezone handling (Europe/Warsaw), name normalization for player search

**Security:** RLS policies on all Supabase tables, environment variable protection, middleware route protection

---

*Architecture analysis: 2026-05-05*
