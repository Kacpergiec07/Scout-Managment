# Codebase Structure

**Analysis Date:** 2026-04-27

## Directory Layout

```
scout-managment/
├── src/                          # Main application source
│   ├── app/                      # Next.js App Router (Server & Client)
│   │   ├── (dashboard)/          # Dashboard route group
│   │   │   ├── analysis/         # Player analysis pages
│   │   │   ├── compare/          # Player comparison tool
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   ├── history/          # Analysis history
│   │   │   ├── leagues/          # League standings and details
│   │   │   ├── players/          # Player search and profiles
│   │   │   ├── profile/          # User profile settings
│   │   │   ├── settings/         # App settings
│   │   │   ├── teams/            # Team profiles
│   │   │   ├── transfers/        # Transfer intelligence
│   │   │   ├── watchlist/        # Watchlist management
│   │   │   └── layout.tsx        # Dashboard layout wrapper
│   │   ├── actions/              # Server Actions (mutations & data fetching)
│   │   ├── api/                  # API routes
│   │   ├── auth/                 # Authentication pages
│   │   ├── login/                # Login page
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page (redirects to /dashboard)
│   │   └── globals.css           # Global styles
│   ├── components/               # React components
│   │   ├── dashboard/            # Dashboard-specific components
│   │   ├── scout/                # Scouting-specific components
│   │   └── ui/                   # shadcn/ui components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Business logic and utilities
│   │   ├── engine/               # Scoring and analysis engines
│   │   ├── statorium/            # Statorium API client
│   │   ├── supabase/             # Supabase configuration and schemas
│   │   ├── types/                # TypeScript type definitions
│   │   └── utils/                # Utility functions
│   └── middleware.ts             # Next.js middleware
├── docs/                         # Documentation
├── public/                       # Static assets
├── scripts/                      # Automation and maintenance scripts
├── .env.local                    # Environment variables (not committed)
├── .gitignore                    # Git ignore rules
├── components.json               # shadcn/ui configuration
├── eslint.config.mjs             # ESLint configuration
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies and scripts
├── postcss.config.mjs            # PostCSS configuration
├── prettierrc                    # Prettier configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project documentation
```

## Directory Purposes

**`src/app/`**:
- Purpose: Next.js App Router pages and server logic
- Contains: Route groups, page components, server actions, API routes
- Key files: `layout.tsx`, `page.tsx`, `actions/`, `api/`

**`src/app/(dashboard)/`**:
- Purpose: Dashboard route group with shared layout
- Contains: All dashboard features (analysis, watchlist, leagues, etc.)
- Key files: `layout.tsx` (sidebar wrapper), individual feature pages

**`src/app/actions/`**:
- Purpose: Server Actions for mutations and data fetching
- Contains: Reusable server-side functions called from components
- Key files: `analysis.ts`, `watchlist.ts`, `statorium.ts`, `profile.ts`, `ai.ts`

**`src/app/api/`**:
- Purpose: RESTful API endpoints for external integrations
- Contains: Route handlers for HTTP requests
- Key files: `chat/route.ts`, `market-value/[playerName]/route.ts`

**`src/components/`**:
- Purpose: Reusable React components
- Contains: UI components organized by domain
- Key files: `dashboard/`, `scout/`, `ui/`

**`src/components/dashboard/`**:
- Purpose: Dashboard-specific UI components
- Contains: Main dashboard client component
- Key files: `dashboard-client.tsx`

**`src/components/scout/`**:
- Purpose: Scouting-specific UI components
- Contains: Player cards, tactical visualizations, transfer tools
- Key files: `player-search.tsx`, `club-card.tsx`, `tactical-pitch.tsx`, `transfer-flow.tsx`

**`src/components/ui/`**:
- Purpose: Generic UI components (shadcn/ui)
- Contains: Reusable primitives (Button, Card, Dialog, etc.)
- Key files: `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`

**`src/hooks/`**:
- Purpose: Custom React hooks for state management
- Contains: Domain-specific hooks
- Key files: `use-home-team.ts`, `use-market-value.ts`

**`src/lib/`**:
- Purpose: Business logic, utilities, and configurations
- Contains: Engines, API clients, type definitions, helpers
- Key files: `engine/`, `statorium/`, `supabase/`, `types/`, `utils/`

**`src/lib/engine/`**:
- Purpose: Core business logic and algorithms
- Contains: Scoring engines, benchmarking logic
- Key files: `scoring.ts` (compatibility calculation), `benchmark.ts`

**`src/lib/statorium/`**:
- Purpose: Statorium API integration
- Contains: API client, type definitions, formation service
- Key files: `client.ts`, `types.ts`, `formation-service.ts`

**`src/lib/supabase/`**:
- Purpose: Supabase configuration and database schemas
- Contains: Client factories, SQL schemas, RLS policies
- Key files: `client.ts`, `server.ts`, `middleware.ts`, `schema.sql`, `profiles-schema.sql`

**`src/lib/types/`**:
- Purpose: Shared TypeScript type definitions
- Contains: Domain models and API response types
- Key files: `player.ts` (ScoutProPlayer interface)

**`src/lib/utils/`**:
- Purpose: Utility functions and helpers
- Contains: Geocoding, PDF generation, helper functions
- Key files: `geocoding.ts`, `pdf-generator.ts`, `utils.ts`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout with global providers
- `src/app/page.tsx`: Home page (redirects to /dashboard)
- `src/app/(dashboard)/layout.tsx`: Dashboard layout with sidebar
- `src/middleware.ts`: Request middleware for auth and session management

**Configuration:**
- `next.config.mjs`: Next.js configuration (image domains, etc.)
- `tsconfig.json`: TypeScript configuration with path aliases
- `components.json`: shadcn/ui component configuration
- `.env.local`: Environment variables (not in git)

**Core Logic:**
- `src/lib/engine/scoring.ts`: Compatibility scoring algorithm
- `src/lib/statorium/client.ts`: Statorium API client
- `src/app/actions/statorium.ts`: Statorium data fetching actions
- `src/app/actions/analysis.ts`: Player-club compatibility analysis
- `src/app/actions/watchlist.ts`: Watchlist management

**Testing:**
- Not currently implemented (no test directory)

## Naming Conventions

**Files:**
- React Components: PascalCase with `.tsx` extension (`dashboard-client.tsx`)
- Server Actions: kebab-case with `.ts` extension (`watchlist.ts`, `analysis.ts`)
- Utilities: kebab-case with `.ts` extension (`geocoding.ts`, `pdf-generator.ts`)
- Types: kebab-case or camelCase with `.ts` extension (`player.ts`, `types.ts`)
- API Routes: `route.ts` in directory structure (`api/chat/route.ts`)

**Directories:**
- kebab-case for feature directories (`dashboard`, `watchlist`, `leagues`)
- kebab-case for library directories (`statorium`, `supabase`, `utils`)
- Parentheses for route groups (`(dashboard)`)

**Components:**
- PascalCase for component names (`DashboardClient`, `PlayerSearch`)
- kebab-case for component files (`dashboard-client.tsx`, `player-search.tsx`)

**Server Actions:**
- camelCase with descriptive names (`getWatchlist`, `addToWatchlist`, `getCompatibilityAnalysis`)

**Types/Interfaces:**
- PascalCase for type names (`ScoutProPlayer`, `ClubContext`, `CompatibilityResult`)
- kebab-case for type files (`player.ts`, `types.ts`)

## Where to Add New Code

**New Feature (Dashboard):**
- Primary code: `src/app/(dashboard)/[feature-name]/page.tsx`
- Server Actions: `src/app/actions/[feature-name].ts`
- Components: `src/components/scout/[feature-name].tsx` or `src/components/dashboard/[feature-name].tsx`
- Tests: Create `src/app/[feature-name]/__tests__/` (when tests are added)

**New API Endpoint:**
- Implementation: `src/app/api/[endpoint-name]/route.ts`
- Server Actions (if needed): `src/app/actions/[related-feature].ts`
- Types: `src/lib/types/[feature].ts`

**New Component:**
- Dashboard-specific: `src/components/dashboard/[component-name].tsx`
- Scouting-specific: `src/components/scout/[component-name].tsx`
- Generic UI: Use shadcn CLI: `npx shadcn@latest add [component-name]`

**New Business Logic:**
- Engine/Algorithm: `src/lib/engine/[logic-name].ts`
- Utility Function: `src/lib/utils/[function-name].ts`
- API Client: `src/lib/statorium/[client-name].ts` or new `src/lib/[provider]/`

**New Database Table:**
- Schema: `src/lib/supabase/[table-name]-schema.sql`
- Migration: Run SQL manually in Supabase dashboard
- Type Definitions: `src/lib/types/[domain].ts`
- Server Actions: `src/app/actions/[domain].ts`

**New External Integration:**
- Client: `src/lib/[provider]/client.ts`
- Types: `src/lib/[provider]/types.ts`
- Actions: `src/app/actions/[provider].ts`

## Special Directories

**`src/app/(dashboard)/`**:
- Purpose: Route group for dashboard pages with shared layout
- Generated: No (manually created)
- Committed: Yes
- Note: Parentheses in name indicate route group (not part of URL)

**`src/components/ui/`**:
- Purpose: shadcn/ui components (generated via CLI)
- Generated: Yes (via `npx shadcn@latest add [component]`)
- Committed: Yes
- Note: Don't edit manually unless necessary; regenerate via CLI

**`src/lib/statorium-data.ts`**:
- Purpose: Large static data files (player photos, verified transfers)
- Generated: Partially (from API responses)
- Committed: Yes
- Note: Contains mock data for development

**`.next/`**:
- Purpose: Next.js build output
- Generated: Yes (automatically by Next.js)
- Committed: No (in `.gitignore`)
- Note: Do not modify manually

**`node_modules/`**:
- Purpose: npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in `.gitignore`)
- Note: Do not modify manually

**`.planning/`**:
- Purpose: GSD planning documents and codebase analysis
- Generated: Yes (by GSD tools)
- Committed: Yes
- Note: Contains architecture, structure, and planning documents

---

*Structure analysis: 2026-04-27*
