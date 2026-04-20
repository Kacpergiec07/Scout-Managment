# Codebase Structure

**Analysis Date:** 2026-04-20

## Directory Layout

```
scout-managment/
├── app/                      # Next.js App Router pages and routes
│   ├── (dashboard)/         # Dashboard route group with layout
│   │   ├── analysis/        # Player analysis page
│   │   ├── compare/         # Player comparison page
│   │   ├── dashboard/       # Main dashboard with league cards
│   │   ├── history/         # Analysis history page
│   │   ├── leagues/         # League standings and team details
│   │   ├── players/         # Player management pages
│   │   ├── transfers/       # Transfer market and intelligence
│   │   └── watchlist/       # Player watchlist page
│   ├── actions/             # Server actions for business logic
│   ├── api/                 # API routes for external endpoints
│   ├── auth/                # Authentication routes
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Root page (redirects)
├── components/              # React components
│   ├── scout/              # Scout-specific feature components
│   ├── ui/                 # Reusable UI components (shadcn/ui)
│   ├── notifications-bell.tsx
│   ├── sidebar-wrapper.tsx
│   ├── sidebar.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/                     # Core libraries and utilities
│   ├── coaches-data.ts     # Coach information
│   ├── engine/             # Scoring and benchmarking engine
│   ├── statorium/          # Statorium API client and services
│   ├── statorium-data.ts   # Static player photo mappings
│   ├── supabase/           # Supabase client setup
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── utils.ts            # Common utilities
├── adapters/               # External service adapters (empty)
├── hooks/                  # Custom React hooks (empty)
├── public/                 # Static assets
├── scratch/                # Development/scratch files
├── .agent/                 # Claude Agent workflow files
├── .agents/                # Agent skills and configurations
├── .claude/                # Claude settings
├── .gsd/                   # GSD (Get Shit Done) planning files
├── .planning/              # Planning documents
└── package.json            # Dependencies and scripts
```

## Directory Purposes

**app/(dashboard)/:**
- Purpose: Dashboard route group with shared layout
- Contains: Page components for main application features, league cards, player analysis
- Key files: `layout.tsx`, `dashboard/page.tsx`, `leagues/page.tsx`

**app/actions/:**
- Purpose: Server-side business logic and data operations
- Contains: Analysis actions, Statorium API integration, AI generation, watchlist management
- Key files: `analysis.ts`, `statorium.ts`, `ai.ts`, `watchlist.ts`

**app/api/:**
- Purpose: HTTP API endpoints for external integrations
- Contains: Chat streaming route, valuation endpoints
- Key files: `chat/route.ts`, `valuation/route.ts`

**components/scout/:**
- Purpose: Feature-specific components for scouting functionality
- Contains: Player search, tactical pitch, radar charts, kanban boards, AI narrative
- Key files: `player-search.tsx`, `tactical-pitch.tsx`, `radar-chart.tsx`, `kanban-board.tsx`

**components/ui/:**
- Purpose: Reusable UI component library based on shadcn/ui
- Contains: Buttons, cards, dialogs, inputs, charts, 3D globe
- Key files: `button.tsx`, `card.tsx`, `dialog.tsx`, `3d-globe.tsx`

**lib/:**
- Purpose: Core business logic, data access, and utilities
- Contains: API clients, scoring engine, type definitions, utility functions
- Key files: `stadium/client.ts`, `engine/scoring.ts`, `types/player.ts`

**lib/statorium/:**
- Purpose: Statorium API integration layer
- Contains: API client, type definitions, formation detection service
- Key files: `client.ts`, `types.ts`, `formation-service.ts`

**lib/engine/:**
- Purpose: Scoring and benchmarking algorithms
- Contains: Compatibility scoring, percentile calculations
- Key files: `scoring.ts`, `benchmark.ts`

**lib/supabase/:**
- Purpose: Supabase database and authentication clients
- Contains: Client and server-side Supabase setup
- Key files: `client.ts`, `server.ts`, `middleware.ts`

**lib/types/:**
- Purpose: TypeScript type definitions
- Contains: Player types, domain models
- Key files: `player.ts`

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout with theme provider
- `app/page.tsx`: Root page redirects to dashboard
- `app/(dashboard)/layout.tsx`: Dashboard layout with sidebar
- `app/(dashboard)/dashboard/page.tsx`: Main dashboard page

**Configuration:**
- `package.json`: Dependencies and npm scripts
- `tsconfig.json`: TypeScript configuration with path aliases
- `next.config.mjs`: Next.js configuration
- `app/globals.css`: Global styles and Tailwind imports

**Core Logic:**
- `lib/statorium/client.ts`: Statorium API client
- `lib/engine/scoring.ts`: Player-club compatibility scoring
- `app/actions/stadium.ts`: Football data server actions
- `app/actions/analysis.ts`: Analysis orchestration

**Components:**
- `components/sidebar.tsx`: Main navigation sidebar
- `components/scout/scout-bot.tsx`: AI chat assistant
- `components/scout/player-search.tsx`: Player search component
- `components/ui/3d-globe.tsx`: 3D globe visualization

**Testing:**
- No dedicated test directory (testing not detected in current structure)

## Naming Conventions

**Files:**
- kebab-case for component files: `player-search.tsx`, `tactical-pitch.tsx`
- kebab-case for page files: `dashboard/page.tsx`, `leagues/page.tsx`
- kebab-case for utility files: `utils.ts`, `benchmark.ts`
- PascalCase for TypeScript types: `ScoutProPlayer`, `ClubContext`, `CompatibilityResult`

**Directories:**
- lowercase for directories: `app/`, `components/`, `lib/`, `utils/`
- lowercase for feature directories: `scout/`, `ui/`, `stadium/`
- kebab-case for multi-word directories: `stadium-data.ts`, `game-data.ts`

**Components:**
- PascalCase for component exports: `export function ScoutBot()`, `export function PlayerSearch()`
- kebab-case for component files: `scout-bot.tsx`, `player-search.tsx`

**Functions/Variables:**
- camelCase for functions: `searchPlayersAction`, `calculateCompatibility`
- camelCase for variables: `activeLeague`, `playerData`, `teamStats`
- SCREAMING_SNAKE_CASE for constants: `LEAGUE_CONFIGS`, `TOP_LEAGUES`

**Types/Interfaces:**
- PascalCase for types and interfaces: `type Position`, `interface ClubContext`
- Descriptive names ending with type: `type ScoutProPlayer`, `interface StatoriumTeam`

## Where to Add New Code

**New Feature:**
- Primary code: `app/actions/` for business logic, `components/scout/` for UI components
- Tests: Create `__tests__/` directories alongside feature files (not currently implemented)
- Types: Add to `lib/types/` if reusable, inline in files if feature-specific

**New Page:**
- Implementation: `app/(dashboard)/feature-name/page.tsx`
- Components: `components/scout/` or `components/ui/` depending on reusability
- Actions: `app/actions/feature.ts` for server-side logic

**New API Endpoint:**
- Implementation: `app/api/endpoint-name/route.ts`
- Actions: Use existing `app/actions/` or create new action files
- Types: Add to `lib/types/` if needed

**New Component/Module:**
- Implementation: `components/scout/` for feature components, `components/ui/` for reusable UI
- Styles: Use Tailwind CSS classes, no separate CSS files
- Hooks: Add to `hooks/` directory if creating custom hooks

**Utilities:**
- Shared helpers: `lib/utils/` for utility functions
- Data processing: `lib/` for core utilities
- Type definitions: `lib/types/` for reusable types

**External Integration:**
- Client implementation: `lib/service-name/client.ts`
- Type definitions: `lib/service-name/types.ts`
- Server actions: `app/actions/service-name.ts`

**Database Operations:**
- Client setup: `lib/supabase/` for Supabase-specific code
- Data access: Server actions in `app/actions/`
- Type definitions: `lib/types/` for data models

## Special Directories

**.agent/ and .agents/:**
- Purpose: Claude Agent workflow configurations and skills
- Generated: Yes (automated agent files)
- Committed: Yes (version controlled)

**.gsd/ and .planning/:**
- Purpose: GSD (Get Shit Done) planning and documentation
- Generated: Yes (planning documents)
- Committed: Yes (version controlled)

**.next/:**
- Purpose: Next.js build output and cache
- Generated: Yes (automatic build artifacts)
- Committed: No (gitignored)

**scratch/:**
- Purpose: Development experiments and temporary files
- Generated: Yes (development artifacts)
- Committed: Yes (version controlled for reference)

**node_modules/:**
- Purpose: npm package dependencies
- Generated: Yes (automatic from package.json)
- Committed: No (gitignored)

**.git/, .claude/, .gemini/:**
- Purpose: Version control and AI assistant configuration
- Generated: Yes (repository and tool configuration)
- Committed: Yes (repository files, .gitignored specific files)

---

*Structure analysis: 2026-04-20*
