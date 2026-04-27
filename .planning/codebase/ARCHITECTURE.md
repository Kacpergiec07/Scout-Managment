# Architecture

**Analysis Date:** 2026-04-27

## Pattern Overview

**Overall:** Next.js 15 App Router with Server-First Architecture

**Key Characteristics:**
- Server-Side Rendering (SSR) for data-heavy pages
- Client Components for interactive UI elements
- Server Actions for mutations and API calls
- Row-Level Security (RLS) for data isolation
- Clean separation between presentation and business logic

## Layers

**Presentation Layer (Client Components):**
- Purpose: Interactive UI, user interactions, real-time updates
- Location: `src/components/`
- Contains: React components, hooks, stateful UI logic
- Depends on: Server Actions, API routes, lib utilities
- Used by: App Router pages

**Server Layer (Server Components & Actions):**
- Purpose: Data fetching, business logic, mutations
- Location: `src/app/` (pages, actions, API routes)
- Contains: Server Actions, API routes, page components
- Depends on: Database clients, external APIs, business engines
- Used by: Client components, middleware

**Data Layer (Supabase):**
- Purpose: Persistent storage, authentication, real-time subscriptions
- Location: Supabase cloud (configured via `src/lib/supabase/`)
- Contains: PostgreSQL database, auth, storage, realtime
- Depends on: Supabase infrastructure
- Used by: Server Actions, API routes, middleware

**Business Logic Layer:**
- Purpose: Domain-specific calculations, algorithms, data transformation
- Location: `src/lib/engine/`, `src/lib/statorium/`, `src/lib/utils/`
- Contains: Scoring engines, API clients, utilities
- Depends on: External APIs, type definitions
- Used by: Server Actions, API routes

**External Integration Layer:**
- Purpose: Third-party data sources and AI services
- Location: `src/lib/statorium/`, AI SDK integration
- Contains: API clients, data transformers, caching logic
- Depends on: External APIs (Statorium, AI providers)
- Used by: Server Actions, business logic layer

## Data Flow

**Authentication Flow:**

1. User navigates to `/login` → Server Component renders login page
2. User submits credentials → Server Action (`auth/actions.ts`) handles auth
3. Supabase Auth validates → Creates session
4. Middleware (`src/middleware.ts`) intercepts requests
5. `updateSession()` refreshes session cookies
6. Protected routes check user presence → Redirect to `/dashboard` or `/login`

**Player Data Flow:**

1. User searches for player → Client component calls `searchPlayersAction()`
2. Server Action queries Statorium API via `StatoriumClient`
3. Client processes and normalizes data → Returns to UI
4. User adds to watchlist → Server Action `addToWatchlist()`
5. Supabase upserts to `watchlist` table with RLS
6. Page revalidation updates UI

**Compatibility Analysis Flow:**

1. User selects player and target club → Client initiates analysis
2. Server Action `getCompatibilityAnalysis()` fetches player data
3. Scoring engine (`lib/engine/scoring.ts`) calculates compatibility
4. AI integration (`lib/ai.ts`) generates narrative
5. Results persisted to `analysis_history` table
6. Streaming response updates UI in real-time

**League Standings Flow:**

1. Dashboard page loads → Server Component `DashboardPage` fetches data
2. Parallel `getStandingsAction()` calls for each league (5 leagues)
3. Statorium API returns raw standings
4. Server Action processes: calculates form, resolves logos, filters
5. Client component `DashboardClient` receives and displays
6. Client-side interactions (sorting, filtering) without server round-trip

**State Management:**
- Server State: Managed via Server Actions and Next.js caching
- Client State: React state for UI interactions
- Session State: Supabase Auth with HTTP-only cookies
- Database State: Supabase PostgreSQL with RLS policies

## Key Abstractions

**StatoriumClient:**
- Purpose: Encapsulate Statorium API interactions
- Examples: `src/lib/statorium/client.ts`
- Pattern: Singleton with caching and fallback mock data

**Compatibility Engine:**
- Purpose: Calculate player-club fit scores
- Examples: `src/lib/engine/scoring.ts`
- Pattern: Pure function with weighted scoring algorithm

**Server Actions:**
- Purpose: Type-safe mutations and data fetching
- Examples: `src/app/actions/analysis.ts`, `src/app/actions/watchlist.ts`
- Pattern: `'use server'` directive with error handling and revalidation

**Supabase Client Factory:**
- Purpose: Create appropriately configured Supabase clients
- Examples: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- Pattern: Separate implementations for browser/server with cookie handling

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: All routes
- Responsibilities: Global providers (ThemeProvider), fonts, metadata

**Dashboard Layout:**
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: All dashboard routes
- Responsibilities: Sidebar, main content area, floating elements

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: All HTTP requests
- Responsibilities: Session refresh, route protection, redirects

**API Routes:**
- Location: `src/app/api/`
- Triggers: External HTTP requests
- Responsibilities: Public endpoints, webhooks, external integrations

## Error Handling

**Strategy:** Try-catch with graceful degradation and user feedback

**Patterns:**
- Server Actions: Return `{ error: string }` objects, log errors
- API Routes: Return appropriate HTTP status codes with error messages
- Client Components: Display error toasts, show fallback UI
- External APIs: Fallback to cached data or mock data on failure

**Cross-Cutting Concerns**

**Logging:** Console.log statements throughout, structured error logging
**Validation:** Zod schemas for form validation, type checking throughout
**Authentication:** Supabase Auth with RLS policies, middleware protection
**Authorization:** RLS policies on all user-specific tables
**Caching:** Next.js `unstable_cache`, Supabase query caching, API response caching
**Internationalization:** Not currently implemented (single language: English/Polish)
**Theming:** next-themes for dark/light mode toggle
**Performance:** Server-side data fetching, parallel API calls, image optimization

---

*Architecture analysis: 2026-04-27*
