# Codebase Structure

**Analysis Date:** 2026-05-04

## Directory Layout

```
scout-managment/
├── .agent/                # Agent workflow configurations
├── .agents/               # Agent skill definitions (GSD system)
├── .claude/               # Claude AI configuration
├── .gsd/                  # GSD (Global Software Development) phase templates
├── .next/                 # Next.js build output (generated)
├── .planning/             # Planning documents (this directory)
├── docs/                  # Additional documentation
├── node_modules/          # Dependencies (not committed)
├── public/                # Static assets (images, textures)
├── scratch/               # Temporary files and cached data
├── scripts/               # Utility scripts
├── src/                   # Application source code
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility libraries and services
├── supabase/              # Database migrations (not present in this repo)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── next.config.mjs        # Next.js configuration
├── postcss.config.mjs     # PostCSS configuration
├── eslint.config.mjs      # ESLint configuration
├── .prettierrc            # Prettier configuration
└── .env.local             # Environment variables (not committed)
```

## Directory Purposes

**src/app/:**
- Purpose: Next.js App Router pages, layouts, API routes, and server actions
- Contains: Route groups, page components, API handlers, server-side logic
- Key files: `layout.tsx` (root), `middleware.ts` (auth), `actions/` (server actions)

**src/components/:**
- Purpose: Reusable React components organized by domain
- Contains: UI primitives, dashboard components, scout components, scout-jobs components
- Key files: `sidebar.tsx` (navigation), `sidebar-wrapper.tsx` (conditional rendering)

**src/components/ui/:**
- Purpose: Base UI components built with shadcn/ui and Radix UI
- Contains: Buttons, cards, charts, dialogs, forms, inputs, etc.
- Key files: `button.tsx`, `card.tsx`, `chart.tsx`, `dialog.tsx`, `form.tsx`

**src/components/scout/:**
- Purpose: Domain-specific components for player scouting features
- Contains: Player search, radar charts, tactical visualizations, kanban boards
- Key files: `player-search.tsx`, `radar-chart.tsx`, `tactical-pitch.tsx`, `kanban-board.tsx`

**src/components/dashboard/:**
- Purpose: Dashboard-specific components and layout
- Contains: Main dashboard client, league cards, statistics
- Key files: `dashboard-client.tsx`

**src/components/scout-jobs/:**
- Purpose: Components for the scout jobs assignment system
- Contains: Job cards, application flow, status tracking
- Key files: `scout-jobs-client.tsx`

**src/lib/:**
- Purpose: Core business logic, utilities, and external service integrations
- Contains: Engine (algorithms), Stadium client, Supabase client, types, helpers
- Key files: `stadiumium/client.ts`, `engine/scoring.ts`, `types/player.ts`, `utils.ts`

**src/lib/engine/:**
- Purpose: Core algorithms for player analysis and compatibility scoring
- Contains: Scoring logic, benchmarking utilities
- Key files: `scoring.ts`, `benchmark.ts`

**src/lib/stadiumium/:**
- Purpose: External API client for football data
- Contains: API client, type definitions, formation service
- Key files: `client.ts`, `types.ts`, `formation-service.ts`

**src/lib/supabase/:**
- Purpose: Database and authentication client configuration
- Contains: Server and browser clients, middleware helpers
- Key files: `client.ts`, `server.ts`, `middleware.ts`

**src/lib/types/:**
- Purpose: TypeScript type definitions
- Contains: Domain models, API response types
- Key files: `player.ts`

**src/lib/utils/:**
- Purpose: Helper functions and utilities
- Contains: Geocoding, PDF generation, general utilities
- Key files: `geocoding.ts`, `pdf-generator.ts`, `utils.ts`

**src/hooks/:**
- Purpose: Custom React hooks for data fetching and state management
- Contains: Market value hook, home team hook
- Key files: `use-market-value.ts`, `use-home-team.ts`

**src/app/actions/:**
- Purpose: Server Actions for mutations and business logic
- Contains: Watchlist management, analysis, job generation, profile operations
- Key files: `watchlist.ts`, `analysis.ts`, `job-generation.ts`, `profile.ts`

**src/app/api/:**
- Purpose: API routes for external integrations and streaming
- Contains: Chat endpoint, market value endpoint, valuation endpoint
- Key files: `chat/route.ts`, `market-value/[playerName]/route.ts`, `valuation/route.ts`

**scratch/:**
- Purpose: Temporary files, cached data, and development artifacts
- Contains: Cached player data, test outputs, temporary scripts
- Generated: Yes (not committed to git typically)
- Committed: Some files committed (cache/ subdirectory)

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout with fonts, theme provider, and toast notifications
- `src/app/page.tsx`: Home page (likely redirects to dashboard or login)
- `src/app/(dashboard)/layout.tsx`: Dashboard layout with sidebar
- `src/middleware.ts`: Authentication middleware for route protection

**Configuration:**
- `package.json`: Dependencies and npm scripts
- `tsconfig.json`: TypeScript compiler configuration with path aliases (`@/*` → `src/*`)
- `next.config.mjs`: Next.js configuration (image domains, rewrites)
- `postcss.config.mjs`: PostCSS configuration for Tailwind
- `eslint.config.mjs`: ESLint configuration
- `.prettierrc`: Prettier formatting rules
- `components.json`: shadcn/ui component configuration

**Core Logic:**
- `src/lib/engine/scoring.ts`: Compatibility scoring algorithm
- `src/lib/engine/benchmark.ts`: Percentile and median calculations
- `src/lib/stadiumium/client.ts`: External API client
- `src/app/actions/analysis.ts`: Player analysis business logic
- `src/app/actions/watchlist.ts`: Watchlist CRUD operations
- `src/app/actions/job-generation.ts`: AI-powered job generation

**Testing:**
- No test files detected in the codebase (no `*.test.ts`, `*.spec.ts` files found)

## Naming Conventions

**Files:**
- Components: `kebab-case.tsx` (e.g., `player-search.tsx`, `radar-chart.tsx`)
- Server Actions: `kebab-case.ts` (e.g., `watchlist.ts`, `analysis.ts`)
- Utilities: `kebab-case.ts` (e.g., `utils.ts`, `geocoding.ts`)
- Types: `kebab-case.ts` (e.g., `player.ts`, `types.ts`)
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- API Routes: `route.ts` (Next.js convention)

**Directories:**
- Route groups: `(name)` (e.g., `(dashboard)`)
- Dynamic routes: `[id]` (e.g., `[id]/page.tsx`)
- Domain groups: lowercase (e.g., `scout/`, `scout-jobs/`, `ui/`)

**Functions/Variables:**
- Functions: `camelCase` (e.g., `calculateCompatibility`, `getWatchlist`)
- Components: `PascalCase` (e.g., `PlayerSearch`, `DashboardClient`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `LEAGUE_CONFIGS`, `POSITIONS`)

**Types/Interfaces:**
- Types/Interfaces: `PascalCase` (e.g., `ScoutProPlayer`, `ClubContext`)

## Where to Add New Code

**New Feature (Dashboard Page):**
- Primary code: `src/app/(dashboard)/[feature-name]/page.tsx`
- Components: `src/components/[domain]/[component-name].tsx`
- Server Actions: `src/app/actions/[feature-name].ts`

**New API Endpoint:**
- Implementation: `src/app/api/[endpoint-name]/route.ts`

**New Component/Module:**
- UI Component: `src/components/ui/[component-name].tsx`
- Domain Component: `src/components/[domain]/[component-name].tsx`

**New Utility Function:**
- Shared helpers: `src/lib/utils.ts` or `src/lib/utils/[category].ts`
- Domain logic: `src/lib/[domain]/[file].ts`

**New Type Definition:**
- Domain types: `src/lib/types/[domain].ts`
- General types: `src/lib/types/[type-name].ts`

**New Server Action:**
- Feature actions: `src/app/actions/[feature-name].ts`
- Shared actions: Add to existing action file

**New External Service Integration:**
- Client: `src/lib/[service-name]/client.ts`
- Types: `src/lib/[service-name]/types.ts`
- Utilities: `src/lib/[service-name]/[utility].ts`

## Special Directories

**.next/:**
- Purpose: Next.js build output directory
- Generated: Yes (by `next build` command)
- Committed: No (in .gitignore)

**node_modules/:**
- Purpose: npm package dependencies
- Generated: Yes (by `npm install` command)
- Committed: No (in .gitignore)

**scratch/:**
- Purpose: Temporary development files and cached data
- Generated: Partially (cache/ subdirectory generated at runtime)
- Committed: Some files (cache/ with JSON files committed)

**.planning/:**
- Purpose: GSD planning documents and codebase analysis
- Generated: Yes (by GSD commands)
- Committed: Yes (documentation intended for git)

**.gsd/:**
- Purpose: GSD system templates and phase configurations
- Generated: No (static templates)
- Committed: Yes (system configuration)

**public/:**
- Purpose: Static assets served directly by Next.js
- Generated: No (manual assets)
- Committed: Yes (images, fonts, textures)

**docs/:**
- Purpose: Additional project documentation
- Generated: No (manual documentation)
- Committed: Yes (markdown files)

---

*Structure analysis: 2026-05-04*
