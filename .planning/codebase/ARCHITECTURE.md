# Architecture

**Analysis Date:** 2026-04-20

## Pattern Overview

**Overall:** Next.js 16 App Router with Server-First Architecture

**Key Characteristics:**
- Modern React Server Components (RSC) with selective client interactivity
- Server Actions for data mutations and complex logic
- Layered service architecture with adapter pattern
- Streaming AI responses with React Server Components
- Hybrid client-side state with server data synchronization
- API route handlers for external integrations
- Supabase for authentication and data persistence

## Layers

**Presentation Layer (Components):**
- Purpose: UI rendering and user interaction
- Location: `components/`
- Contains: UI components, scout-specific widgets, 3D visualizations, layout wrappers
- Depends on: Server Actions, hooks, utility libraries
- Used by: App router pages

**App Router Layer (Pages):**
- Purpose: Route definitions and page orchestration
- Location: `app/`
- Contains: Page components, layouts, API routes, server actions
- Depends on: Services, data layers, components
- Used by: Next.js runtime

**Service Layer (Actions):**
- Purpose: Business logic and data orchestration
- Location: `app/actions/`
- Contains: Analysis logic, Statorium API integration, AI generation, watchlist management
- Depends on: Statorium client, scoring engine, Supabase client
- Used by: Pages, API routes

**Data Layer (Lib):**
- Purpose: External data access and domain logic
- Location: `lib/`
- Contains: Statorium client, scoring engine, benchmarking utilities, formation service, Supabase clients, type definitions
- Depends on: External APIs, databases
- Used by: Server Actions

**API Layer (Routes):**
- Purpose: External HTTP endpoints and streaming interfaces
- Location: `app/api/`
- Contains: Chat streaming, valuation endpoints
- Depends on: AI SDK, external services
- Used by: Client components, external consumers

## Data Flow

**Player Search & Analysis Flow:**

1. User enters search query in `components/scout/player-search.tsx`
2. Search action calls `app/actions/statorium.ts:searchPlayersAction()`
3. Statorium client queries external API with fallback to mock data
4. Results returned to component, user selects player
5. Analysis triggered via `app/actions/analysis.ts:getCompatibilityAnalysis()`
6. Scoring engine calculates player-club compatibility
7. Results persisted to Supabase analysis history
8. AI narrative generated via `app/actions/ai.ts:generateScoutNarrative()`
9. Streaming response rendered in `components/scout/ai-narrative.tsx`

**League & Team Data Flow:**

1. Dashboard loads `app/(dashboard)/dashboard/page.tsx`
2. Standings data fetched via `app/actions/statorium.ts:getStandingsAction()`
3. Team details fetched via `app/actions/statorium.ts:getTeamDetailsAction()`
4. Formation detected by `lib/statorium/formation-service.ts:getRealFormation()`
5. Squad filtered and ordered (starting XI first) in action layer
6. Results rendered in league cards and team pages

**AI Chat Flow:**

1. User sends message to `components/scout/scout-bot.tsx`
2. Client component streams request to `app/api/chat/route.ts`
3. OpenAI-compatible Z.ai API called via AI SDK
4. Streaming response returned to client
5. Messages rendered incrementally in chat interface

**State Management:**
- Server state: React Server Components (no client state needed)
- Client state: React hooks for UI state (open/close, selection, theme)
- Data persistence: Supabase for user data, analysis history
- API caching: Next.js built-in fetch caching with 1-hour revalidation

## Key Abstractions

**StatoriumClient:**
- Purpose: Encapsulate Statorium football data API integration
- Examples: `lib/statorium/client.ts`, `lib/statorium/types.ts`, `lib/statorium/formation-service.ts`
- Pattern: Singleton client with factory function, cached responses, fallback data, comprehensive type definitions

**ScoringEngine:**
- Purpose: Calculate player-club compatibility scores
- Examples: `lib/engine/scoring.ts`, `lib/engine/benchmark.ts`
- Pattern: Weighted scoring algorithm with tactical DNA matching, benchmarking against league cohorts, multi-dimensional analysis

**ClubContext:**
- Purpose: Rich representation of club tactical needs and characteristics
- Examples: `lib/engine/scoring.ts:ClubContext`
- Pattern: Structured object with possession/pressing/tempo DNA, position needs, form factors, historical patterns

**PlayerProPlayer:**
- Purpose: Normalized player data structure
- Examples: `lib/types/player.ts:ScoutProPlayer`
- Pattern: Standardized stats across offensive/defensive/physical/tactical categories, source-agnostic

**ServerActionPattern:**
- Purpose: Type-safe server-side business logic
- Examples: `app/actions/analysis.ts`, `app/actions/statorium.ts`, `app/actions/ai.ts`
- Pattern: Async functions with 'use server' directive, error handling, data transformation, validation

## Entry Points

**Root Application:**
- Location: `app/layout.tsx`
- Triggers: Application startup
- Responsibilities: Global layout, theme provider, font loading, metadata

**Dashboard Route:**
- Location: `app/page.tsx` (redirects to `/dashboard`)
- Triggers: Root URL access
- Responsibilities: User redirection to main dashboard

**Dashboard Layout:**
- Location: `app/(dashboard)/layout.tsx`
- Triggers: All dashboard routes
- Responsibilities: Sidebar wrapper, main content area layout

**API Chat Route:**
- Location: `app/api/chat/route.ts`
- Triggers: POST requests to `/api/chat`
- Responsibilities: AI chat streaming, prompt construction, error handling

**Auth Callback:**
- Location: `app/auth/callback/route.ts`
- Triggers: OAuth callbacks
- Responsibilities: Session management, user authentication

## Error Handling

**Strategy:** Try-catch in server actions with graceful fallbacks, console logging for debugging, user-facing error states

**Patterns:**
- Server actions wrap external API calls in try-catch blocks
- Return empty arrays/null on failure rather than throwing to client
- Log errors to console with context for debugging
- UI components handle loading states and error boundaries
- Fallback data used when external APIs fail (mock players, default formations)

**Specific Examples:**
- `app/actions/statorium.ts`: All actions include try-catch blocks returning fallback data
- `lib/statorium/client.ts`: API errors logged, fallback to mock pool for search
- `app/actions/ai.ts`: AI generation errors caught, fallback message provided

## Cross-Cutting Concerns

**Logging:** Console.error for server-side errors, console.log for debugging API responses and data transformations

**Validation:** TypeScript strict mode, runtime checks for required fields (e.g., teamId, playerId), fallback values for missing data

**Authentication:** Supabase Auth with server-side and client-side clients, user context in server actions, protected routes via auth checks

**Theme Management:** next-themes with server and client components, theme toggle in sidebar, ThemeProvider wrapper

**Caching:** Next.js fetch caching (3600s), in-memory formation cache (1 hour), Statorium client response caching, static data for player photos

**Data Normalization:** Position mapping, name normalization, photo URL resolution, stat array processing across API layers

---

*Architecture analysis: 2026-04-20*
