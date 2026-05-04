# Architecture

**Analysis Date:** 2026-05-04

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
2. Middleware (`src/middleware.ts`) intercepts request
3. `updateSession()` from `src/lib/supabase/middleware.ts` checks auth state
4. If unauthenticated and accessing protected route, redirect to `/login`
5. User authenticates via Supabase Auth
6. Callback handler (`src/app/auth/callback/route.ts`) exchanges code for session
7. Redirect to dashboard with authenticated session

**Player Analysis Flow:**

1. User searches for player via `PlayerSearch` component (`src/components/scout/player-search.tsx`)
2. Search calls `searchPlayers()` from `src/lib/statorium/client.ts`
3. User selects player and requests compatibility analysis
4. `getCompatibilityAnalysis()` server action (`src/app/actions/analysis.ts`) executes:
   - Fetches league standings via Statorium client
   - Transforms standings to `ClubContext` objects
   - Calculates compatibility via `calculateCompatibility()` from `src/lib/engine/scoring.ts`
   - Persists results to Supabase `analysis_history` table
5. Results displayed in UI with radar charts and fit scores

**Scout Jobs Flow:**

1. Dashboard page (`src/app/(dashboard)/dashboard/page.tsx`) loads
2. `DashboardClient` component requests latest job
3. `getLatestJob()` server action (`src/app/actions/job-generation.ts`) executes:
   - Fetches club data from Statorium API
   - Generates job description via AI (Zhipu AI via OpenAI SDK)
   - Persists job to Supabase `scout_jobs` table
4. Job displayed as card with accept/decline actions
5. User actions update job status and generate new assignments

**State Management:**

- **Server State:** Supabase database tables (watchlist, analysis_history, scout_jobs)
- **Client State:** React state for UI interactions (forms, modals, filters)
- **Cache State:** React cache for Statorium client, in-memory GLOBAL_CACHE for frequent requests
- **Real-time Updates:** Supabase subscriptions (if implemented)

## Key Abstractions

**StatoriumClient:**
- Purpose: Encapsulate all external API calls to Statorium football data provider
- Examples: `src/lib/stadiumium/client.ts`
- Pattern: Singleton client class with typed methods for each endpoint

**Compatibility Engine:**
- Purpose: Calculate player-club fit scores based on multiple weighted factors
- Examples: `src/lib/engine/scoring.ts` (calculateCompatibility), `src/lib/engine/benchmark.ts` (percentiles)
- Pattern: Pure functions with domain-specific scoring algorithms

**ScoutProPlayer:**
- Purpose: Unified player data model across the application
- Examples: `src/lib/types/player.ts`
- Pattern: TypeScript interface with normalized stats structure

**ClubContext:**
- Purpose: Represent a club's tactical DNA and needs for compatibility calculations
- Examples: `src/lib/engine/scoring.ts`
- Pattern: Interface derived from real standings data with synthetic DNA attributes

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: All page requests
- Responsibilities: Font configuration, theme provider, toast notifications, HTML structure

**Dashboard Layout:**
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: All dashboard routes (protected)
- Responsibilities: Sidebar navigation, main content area wrapper, floating elements

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: All HTTP requests (except static assets)
- Responsibilities: Authentication check, session refresh, route protection

**API Routes:**
- Location: `src/app/api/*/route.ts`
- Triggers: External client requests or streaming responses
- Responsibilities: Chat streaming (`/api/chat`), market value fetching (`/api/market-value`), valuation (`/api/valuation`)

**Server Actions:**
- Location: `src/app/actions/*.ts`
- Triggers: Form submissions, button clicks from client components
- Responsibilities: Database mutations, API calls, business logic execution

## Error Handling

**Strategy:** Try-catch in all async functions with logging and user-friendly error messages

**Patterns:**
- **Server Actions:** Return `{ error: string }` object on failure, log to console
- **API Routes:** Return JSON with status code 500 and error message
- **Client Components:** Display error toasts via Sonner (`<Toaster>` in root layout)
- **API Client:** `StadiumClient` throws errors with descriptive messages including endpoint

**Example from `src/lib/stadiumium/client.ts`:**
```typescript
if (!response.ok) {
  const errorText = await response.text();
  console.error(`[StadiumClient] API Error ${response.status}:`, errorText);
  throw new Error(`Stadium API error: ${response.status} ${response.statusText} at ${endpoint}`);
}
```

## Cross-Cutting Concerns

**Authentication:** Supabase Auth with server-side session management via middleware, user context in server actions

**Validation:** Zod schemas for form validation (react-hook-form with @hookform/resolvers)

**Logging:** Console.log statements throughout for debugging, especially in server actions

**Theming:** next-themes with custom theme support (light/dark/custom), defined in `src/components/theme-provider.tsx`

**Type Safety:** Strict TypeScript mode, comprehensive type definitions in `src/lib/types/`

**Performance:** React.cache for expensive operations, in-memory caching with TTL (GLOBAL_CACHE), Next.js image optimization

**Internationalization:** Not implemented (Polish/English support mentioned in chat API but not system-wide)

**Error Notifications:** Sonner toast library for consistent error/success messaging across the application

---

*Architecture analysis: 2026-05-04*
