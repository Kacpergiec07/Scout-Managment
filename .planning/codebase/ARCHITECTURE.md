# Architecture

**Analysis Date:** 2026-05-05

## Pattern Overview

**Overall:** Next.js 15 Full-Stack Monolith with App Router

**Key Characteristics:**
- Server Components for data fetching and initial rendering
- Client Components for interactivity and state management
- Server Actions for mutations and business logic
- API Routes for external integrations and streaming responses
- Supabase for authentication, database, and real-time features

## Layers

**Presentation Layer (App Router):**
- Purpose: UI rendering and user interaction
- Location: `src/app/`
- Contains: Page components, layouts, API routes, and server actions
- Depends on: Components layer, Services layer (via imports)
- Used by: End users through browser

**Components Layer:**
- Purpose: Reusable UI components and domain-specific modules
- Location: `src/components/`
- Contains: UI primitives (`ui/`), dashboard components, scout components, scout-jobs components
- Depends on: Lib layer (utilities, types, services)
- Used by: Presentation layer pages

**Business Logic Layer:**
- Purpose: Core algorithms, data processing, and external API integration
- Location: `src/lib/`
- Contains: Engine (scoring, benchmarking), Statorium client, Supabase client, utilities, type definitions
- Depends on: External APIs (Statorium, AI SDKs), Supabase database
- Used by: Server actions, API routes, and components

**Data Layer:**
- Purpose: Persistent storage and authentication
- Location: Supabase (PostgreSQL)
- Contains: User profiles, watchlist, analysis history, job offers
- Depends on: External service (Supabase)
- Used by: Business logic layer via client instances

## Data Flow

**User Authentication Flow:**

1. User visits `/login` or any protected route
2. Middleware (`src/lib/supabase/middleware.ts`) intercepts request
3. `updateSession()` checks auth state
4. If unauthenticated and accessing protected route, redirect to `/login`
5. User authenticates via Supabase Auth
6. Callback handler (`src/app/auth/callback/route.ts`) exchanges code for session
7. Redirect to dashboard with authenticated session

**Player Analysis Flow:**

1. User searches for player via `PlayerSearch` component (`src/components/scout/player-search.tsx`)
2. Search calls `searchPlayersAction()` from `src/app/actions/statorium.ts`
3. Action first checks local JSON cache (`src/lib/all-players-db.json`) for instant results
4. If no local match, queries Statorium API via `StatoriumClient.searchPlayers()`
5. User selects player and requests compatibility analysis
6. `getCompatibilityAnalysis()` server action (`src/app/actions/analysis.ts`) executes:
   - Fetches league standings via Statorium client
   - Transforms standings to `ClubContext` objects
   - Calculates compatibility via `calculateCompatibility()` from `src/lib/engine/scoring.ts`
   - Persists results to Supabase `analysis_history` table
7. Results displayed in UI with radar charts and fit scores

**Scout Jobs Flow:**

1. Dashboard page (`src/app/(dashboard)/dashboard/page.tsx`) loads
2. `DashboardClient` component requests latest job
3. `getLatestJob()` server action (`src/app/actions/job-generation.ts`) executes:
   - Fetches club data from Statorium API
   - Generates job description via AI (Zhipu AI via OpenAI SDK)
   - Persists job to Supabase `jobs` table
4. Job displayed as card with accept/decline actions
5. User actions update job status and generate new assignments

**State Management:**

- **Server State:** Supabase database tables (watchlist, analysis_history, jobs, profiles, user_activities)
- **Client State:** React state for UI interactions (forms, modals, filters)
- **Cache State:** React cache for Statorium client, in-memory GLOBAL_CACHE (10min TTL), local filesystem cache (`scratch/cache/`)
- **Real-time Updates:** Not implemented

## Key Abstractions

**StatoriumClient:**
- Purpose: Encapsulate all external API calls to Statorium football data provider
- Examples: `src/lib/statorium/client.ts`
- Pattern: Singleton client class with typed methods for each endpoint

**Compatibility Engine:**
- Purpose: Calculate player-club fit scores based on multiple weighted factors
- Examples: `src/lib/engine/scoring.ts` (calculateCompatibility), `src/lib/engine/benchmark.ts` (percentiles)
- Pattern: Pure functions with domain-specific scoring algorithms

**ScoutProPlayer:**
- Purpose: Unified player data model across application
- Examples: `src/lib/types/player.ts`
- Pattern: TypeScript interface with normalized stats structure (offensive, defensive, physical, tactical)

**ClubContext:**
- Purpose: Represent a club's tactical DNA and needs for compatibility calculations
- Examples: `src/lib/engine/scoring.ts`
- Pattern: Interface derived from real standings data with synthetic DNA attributes (possession, pressing, tempo)

**Server Actions:**
- Purpose: Execute server-side logic from client components
- Examples: All files in `src/app/actions/`
- Pattern: `'use server'` directive, named exports, return typed results or error objects

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: All page requests
- Responsibilities: Font configuration (Inter, Geist Mono), ThemeProvider, Toaster notifications, HTML structure

**Root Page:**
- Location: `src/app/page.tsx`
- Triggers: Application entry at `/`
- Responsibilities: Redirect authenticated users to `/dashboard`, unauthenticated to `/login`

**Dashboard Layout:**
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: All dashboard routes (protected)
- Responsibilities: Render SidebarWrapper, FloatingElements background, main content area

**Middleware:**
- Location: `src/lib/supabase/middleware.ts`
- Triggers: All HTTP requests (except static assets)
- Responsibilities: Authentication check, session refresh, route protection

**API Routes:**
- Location: `src/app/api/*/route.ts`
- Triggers: External client requests or streaming responses
- Responsibilities: Chat streaming (`/api/chat`), market value fetching (`/api/market-value`), valuation (`/api/valuation`)

**Login Page:**
- Location: `src/app/login/page.tsx`
- Triggers: User visits `/login`
- Responsibilities: Supabase authentication UI, redirect after successful auth

## Error Handling

**Strategy:** Graceful degradation with user-friendly error messages

**Patterns:**
- **Server Actions:** Return `{ error: string }` object on failure, log to console
- **API Routes:** Return JSON with status code 500 and error message
- **Client Components:** Display error toasts via Sonner (`<Toaster>` in root layout)
- **API Client:** `StatoriumClient` throws errors with descriptive messages including endpoint

**Example from `src/lib/statorium/client.ts`:**
```typescript
if (!response.ok) {
  const errorText = await response.text();
  console.error(`[StatoriumClient] API Error ${response.status}:`, errorText);
  throw new Error(`Statorium API error: ${response.status} ${response.statusText} at ${endpoint}`);
}
```

## Cross-Cutting Concerns

**Authentication:** Supabase Auth with server-side session management via middleware, user context in server actions, Row Level Security (RLS) on all user-specific tables

**Validation:** Zod schemas used in some forms (react-hook-form with @hookform/resolvers), but minimal client-side validation in current implementation

**Logging:** Console logging throughout codebase with prefixes like `[Action]`, `[StatoriumClient]`, `[Cache]` for debugging

**Theming:** next-themes with custom theme support via `CustomThemeDialog`, dark mode by default, CSS variables for theming

**Type Safety:** Strict TypeScript mode, comprehensive type definitions in `src/lib/types/` and `src/lib/statorium/types.ts`

**Performance:** Multi-level caching (React cache, GLOBAL_CACHE with 10min TTL, Supabase cached_players/cached_teams tables, local filesystem cache), Next.js image optimization configured in `next.config.mjs`

**Internationalization:** Not implemented (English only)

**Notifications:** Sonner toast library for consistent error/success messaging across application

**CORS:** Next.js image optimization configured for allowed image domains (statorium.com, cdn.futwiz.com, tmssl.akamaized.net, etc.)

---

*Architecture analysis: 2026-05-05*
