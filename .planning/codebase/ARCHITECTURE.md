# Architecture

**Analysis Date:** 2026-04-21

## Pattern Overview

**Overall:** Next.js 15 App Router with Server Components and Server Actions

**Key Characteristics:**
- Full-stack Next.js application with App Router architecture
- Server Components for data fetching and Server Actions for mutations
- Supabase for authentication and database operations
- External API integration (Statorium API) for football data
- AI-powered analysis using Vercel AI SDK
- Real-time data synchronization with React hooks

## Layers

**Presentation Layer (UI Components):**
- Purpose: React components for user interface rendering
- Location: `src/components/`
- Contains: UI primitives (shadcn/ui), domain-specific components (scout), layout components
- Depends on: Server Components, React hooks, UI libraries (Framer Motion, Tailwind)
- Used by: Next.js pages

**Business Logic Layer (Server Actions):**
- Purpose: Server-side data processing and mutations
- Location: `src/app/actions/`
- Contains: Data fetching, watchlist management, AI generation, profile operations
- Depends on: Supabase client, Statorium API client, scoring engine
- Used by: Server Components and API routes

**Data Access Layer:**
- Purpose: External API and database interactions
- Location: `src/lib/`
- Contains: Supabase clients (browser/server), Statorium client, utility functions
- Depends on: Supabase SDK, Statorium API, environment variables
- Used by: Server Actions

**Domain Logic Layer:**
- Purpose: Core business rules and calculations
- Location: `src/lib/engine/`
- Contains: Compatibility scoring, player benchmarking algorithms
- Depends on: Type definitions
- Used by: Server Actions and analysis components

**Type Definitions Layer:**
- Purpose: TypeScript interfaces and type definitions
- Location: `src/lib/types/`
- Contains: Player types, API response types, domain models
- Depends on: None (pure types)
- Used by: All layers

## Data Flow

**Authentication Flow:**

1. User visits `/login` page
2. Submits login form → `auth/actions.ts::login()`
3. Server Action calls Supabase auth
4. On success, redirects to `/dashboard`
5. Middleware (`src/middleware.ts`) validates session on each request
6. Server Components access user via `createClient()` from `lib/supabase/server.ts`

**Player Data Flow:**

1. User searches for players in `/watchlist` or `/dashboard`
2. Client component triggers Server Action (e.g., `searchPlayersAction()`)
3. Server Action calls `StatoriumClient.searchPlayers()`
4. Statorium API returns player data
5. Server Action normalizes data (position mapping, photo URLs)
6. Data passed to client component via props
7. Client component renders player cards with animations

**Watchlist Management Flow:**

1. User clicks "Add to Watchlist" on a player
2. Client component calls `addToWatchlist()` Server Action
3. Server Action validates user authentication
4. Inserts record into Supabase `watchlist` table
5. Calls `revalidatePath()` to update UI
6. Client component refetches watchlist via `getWatchlist()` action
7. UI updates with new player

**AI Analysis Flow:**

1. User requests compatibility analysis
2. Server Action calls `generateScoutNarrative()` with player/club data
3. Action creates streaming response using Vercel AI SDK
4. OpenAI-compatible API (Z.ai) generates text stream
5. Stream updates client component in real-time
6. Analysis displayed in `ai-narrative.tsx` component

**State Management:**
- Server Components: Read-only state from database/API (revalidated on mutations)
- Client Components: Local React state for UI interactions (selections, modals)
- Supabase Realtime: Not currently implemented (manual refetching used)

## Key Abstractions

**StatoriumClient:**
- Purpose: Encapsulates Statorium API interactions
- Examples: `src/lib/statorium/client.ts`
- Pattern: Singleton client with fetch wrapper, caching via Next.js `revalidate`, fallback mock data for development

**Server Actions:**
- Purpose: Type-safe server functions called from components
- Examples: All files in `src/app/actions/`
- Pattern: `'use server'` directive at top of file, async functions returning data or success/error objects

**Compatibility Scoring:**
- Purpose: Calculate player-club compatibility scores
- Examples: `src/lib/engine/scoring.ts`
- Pattern: Weighted scoring algorithm (tactical 30%, positional 25%, stats 25%, form 12%, history 8%)

**Supabase Client Factory:**
- Purpose: Create authenticated Supabase clients
- Examples: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- Pattern: Separate implementations for browser (cookie-based) and server (cookie store) environments

## Entry Points

**Root Page:**
- Location: `src/app/page.tsx`
- Triggers: Application startup
- Responsibilities: Redirects to `/dashboard`

**Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page render
- Responsibilities: Global theme provider, font configuration, HTML structure

**Dashboard Layout:**
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: All dashboard pages
- Responsibilities: Sidebar navigation, main content area wrapper

**API Routes:**
- Location: `src/app/api/chat/route.ts`
- Triggers: AI chat requests
- Responsibilities: Streaming AI responses, message handling

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: All HTTP requests (except static files)
- Responsibilities: Session validation, refresh user sessions

## Error Handling

**Strategy:** Graceful degradation with fallback data

**Patterns:**
- Server Actions return `{ success: boolean, data?: T, error?: string }` objects
- External API calls wrapped in try-catch with console.error logging
- Fallback data used when APIs fail (e.g., mock player pool in StatoriumClient)
- User-friendly error messages displayed via alerts or inline error states
- Database errors trigger schema migration prompts (watchlist feature)

## Cross-Cutting Concerns

**Logging:** Console.error for debugging, console.log for data flow tracking

**Validation:** Zod schemas for form validation (PlayerForm), runtime type checking in Server Actions

**Authentication:** Supabase Auth with session middleware, protected routes redirect to login

**Theme:** next-themes for dark/light mode, ThemeProvider wraps entire app

**Data Caching:** Next.js `revalidate` configuration (3600s for API calls), manual `revalidatePath()` for mutations

**Internationalization:** Not currently implemented (English only)

---

*Architecture analysis: 2026-04-21*
