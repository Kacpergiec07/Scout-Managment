# Architecture

**Analysis Date:** 2026-04-21

## Pattern Overview

**Overall:** Next.js 15 App Router with Server Actions + Supabase SSR

**Key Characteristics:**
- Server-side rendering with React Server Components
- Server Actions for mutations and data fetching
- Client-side interactivity for real-time features
- Row-level security for data isolation
- External API integration with caching

## Layers

**Presentation Layer:**
- Purpose: UI rendering and user interaction
- Location: `app/`, `components/`
- Contains: Pages, layouts, UI components, visualizations
- Depends on: Actions layer, data adapters, external APIs
- Used by: User browser

**Actions Layer:**
- Purpose: Server-side business logic and data operations
- Location: `app/actions/`
- Contains: Data fetching, mutations, authentication, API integration
- Depends on: Database layer, external API clients, scoring engine
- Used by: Presentation layer (Server Components and Client Components)

**Data Access Layer:**
- Purpose: Database and external API communication
- Location: `lib/supabase/`, `lib/statorium/`, `lib/engine/`
- Contains: Supabase clients, Statorium API client, scoring algorithms
- Depends on: Supabase backend, Statorium API
- Used by: Actions layer

**Utility Layer:**
- Purpose: Shared utilities and type definitions
- Location: `lib/utils/`, `lib/types/`, `adapters/`
- Contains: Helper functions, type definitions, data transformers
- Depends on: External libraries (leaflet, jspdf, etc.)
- Used by: All layers

## Data Flow

**Authentication Flow:**

1. User signs in via `app/auth/actions.ts` (login/signup)
2. Supabase auth creates session token
3. Middleware `middleware.ts` validates session on protected routes
4. Session is maintained via cookies (Supabase SSR)
5. Server Actions access user context via `createClient()` from `lib/supabase/server.ts`

**Player Search & Analysis Flow:**

1. User searches for player in `components/scout/player-search.tsx`
2. Server Action `app/actions/statorium.ts::searchPlayersAction()` queries Statorium API
3. Player data is normalized via `adapters/player.ts`
4. User requests compatibility analysis
5. Server Action `app/actions/analysis.ts::getCompatibilityAnalysis()` calculates compatibility
6. Scoring engine `lib/engine/scoring.ts` evaluates player-club match
7. Results are stored in `analysis_history` table via Supabase
8. Results are returned to UI for display

**Watchlist Management Flow:**

1. User adds/removes players via UI in `app/(dashboard)/watchlist/page.tsx`
2. Server Actions `app/actions/watchlist.ts` execute mutations
3. Actions authenticate user via Supabase client
4. Database operations execute with RLS policies
5. Cache invalidation via `revalidatePath()`
6. UI refreshes with updated data

**External API Integration Flow:**

1. Client code calls Server Action
2. Server Action creates Statorium client instance (`lib/statorium/client.ts`)
3. Client makes HTTP request to Statorium API with caching (3600s revalidation)
4. Response is normalized and typed
5. Data is returned to calling code
6. Optional: Data is cached or stored in database

**State Management:**
- Server state: Server Components fetch fresh data on each request
- Client state: React hooks (useState, useEffect) for UI interactions
- Persistent state: Supabase database with RLS
- Auth state: Supabase session in cookies, maintained by middleware

## Key Abstractions

**ScoutProPlayer:**
- Purpose: Unified player data model
- Examples: `lib/types/player.ts`, `adapters/player.ts`
- Pattern: Type definition + adapter functions for normalization

**ClubContext:**
- Purpose: Club tactical and positional context
- Examples: `lib/engine/scoring.ts`, `app/actions/analysis.ts`
- Pattern: Interface defining club DNA, needs, and form metrics

**CompatibilityResult:**
- Purpose: Player-club compatibility analysis result
- Examples: `lib/engine/scoring.ts`
- Pattern: Structured object with total score and breakdown by category

**StatoriumClient:**
- Purpose: Wrapper around Statorium API endpoints
- Examples: `lib/statorium/client.ts`
- Pattern: Class with methods for each API endpoint, centralized error handling

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: All page requests
- Responsibilities: Global theme provider, font configuration, metadata, HTML structure

**Dashboard Layout:**
- Location: `app/(dashboard)/layout.tsx`
- Triggers: All dashboard route requests
- Responsibilities: Sidebar layout, ScoutBot integration, main content area structure

**Root Page:**
- Location: `app/page.tsx`
- Triggers: Root URL access
- Responsibilities: Redirect to `/dashboard`

**Middleware:**
- Location: `middleware.ts`
- Triggers: All non-static, non-API route requests
- Responsibilities: Session validation, route protection, cookie management

**Server Actions:**
- Location: `app/actions/*.ts`
- Triggers: Form submissions, button clicks, data fetch requests from client
- Responsibilities: Business logic execution, database operations, external API calls, cache invalidation

## Error Handling

**Strategy:** Graceful degradation with logging

**Patterns:**
- Server Actions wrap logic in try-catch blocks
- Console.error logging for debugging (server-side)
- Return error objects with messages for client display
- Null checks on optional data
- API errors caught and logged, returning empty arrays or null values
- Timeout handling for long-running API requests (10s timeout on player data fetch)

## Cross-Cutting Concerns

**Authentication:** Supabase Auth with SSR support. All server actions validate user context. RLS policies ensure data isolation.

**Validation:** Zod schema validation (where applicable). Type safety via TypeScript interfaces throughout.

**Logging:** Console.error for server-side errors. Structured logging in Server Actions with context labels (e.g., `[StatoriumClient]`, `[Action]`).

**Caching:** Next.js `revalidate` tag for API responses (3600s default). Database queries not cached beyond Supabase connection pooling.

**Theme Management:** next-themes for dark/light mode with `ThemeProvider` wrapper component.

**Internationalization:** Not currently implemented.

**Performance:**
- Image optimization via Next.js Image component with allowed domains
- Code splitting via App Router
- Lazy loading of heavy 3D components (Three.js, React Three Fiber)
- API request caching to reduce external calls

---

*Architecture analysis: 2026-04-21*
