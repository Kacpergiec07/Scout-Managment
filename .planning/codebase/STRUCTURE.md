# Codebase Structure

**Analysis Date:** 2026-04-21

## Directory Layout

```
[project-root]/
├── app/                      # Next.js App Router (27 TS/TSX files)
│   ├── (dashboard)/          # Route group for authenticated dashboard pages
│   │   ├── analysis/         # Player analysis page
│   │   ├── compare/          # Player comparison page
│   │   ├── dashboard/        # Main dashboard page
│   │   ├── history/          # Analysis history page
│   │   ├── leagues/          # League standings and team details
│   │   │   └── team/[id]/    # Dynamic team detail pages
│   │   ├── players/new/      # Add new player page
│   │   ├── profile/          # User profile page
│   │   ├── settings/         # Settings page
│   │   ├── transfers/        # Transfer market page
│   │   │   └── intelligence/ # Transfer intelligence page
│   │   ├── watchlist/        # Watchlist management page
│   │   └── layout.tsx        # Dashboard layout wrapper
│   ├── actions/              # Server Actions (7 files)
│   │   ├── ai.ts             # AI narrative generation
│   │   ├── analysis.ts       # Compatibility analysis
│   │   ├── profile.ts        # User profile operations
│   │   ├── refresh-stats.ts  # Statistics refresh
│   │   ├── statorium.ts      # Statorium API integration
│   │   └── watchlist.ts      # Watchlist operations
│   ├── api/                  # API routes
│   │   ├── chat/             # AI chat endpoint
│   │   └── valuation/        # Player valuation endpoint
│   ├── auth/                 # Authentication pages and actions
│   │   ├── actions.ts        # Login/signup/signout actions
│   │   └── callback/         # OAuth callback handler
│   ├── login/                # Login page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Root page (redirects to /dashboard)
├── components/               # React components (44 TSX files)
│   ├── scout/                # Scout-specific components (17 files)
│   │   ├── ai-narrative.tsx  # AI-generated analysis text
│   │   ├── club-card.tsx     # Club information card
│   │   ├── global-market-card.tsx  # Market overview card
│   │   ├── kanban-board.tsx  # Kanban-style watchlist board
│   │   ├── kanban-card.tsx   # Kanban card component
│   │   ├── kanban-column.tsx  # Kanban column component
│   │   ├── league-center.tsx # League center hub
│   │   ├── player-form.tsx   # Player data entry form
│   │   ├── player-search.tsx # Player search interface
│   │   ├── radar-chart.tsx   # Stats radar chart
│   │   ├── ranking-list.tsx  # Ranking list display
│   │   ├── report-button.tsx # Report generation button
│   │   ├── scout-bot.tsx     # AI scout chatbot
│   │   ├── squad-row.tsx     # Squad row component
│   │   ├── tactical-pitch.tsx # Tactical pitch visualization
│   │   ├── transfer-details-modal.tsx # Transfer details modal
│   │   └── transfer-flow.tsx # Transfer flow component
│   ├── ui/                   # UI components (24+ files)
│   │   ├── 3d-globe.tsx      # 3D globe visualization
│   │   ├── badge.tsx         # Badge component
│   │   ├── button.tsx        # Button component
│   │   ├── card-stack.tsx    # Card stack animation
│   │   ├── card.tsx          # Card component
│   │   ├── chart.tsx         # Chart components
│   │   ├── checkbox.tsx      # Checkbox component
│   │   ├── command.tsx       # Command palette
│   │   ├── dialog.tsx        # Dialog component
│   │   ├── dropdown-menu.tsx # Dropdown menu
│   │   └── ...               # Additional UI components
│   ├── sidebar-wrapper.tsx   # Sidebar layout wrapper
│   ├── sidebar.tsx           # Main navigation sidebar
│   ├── theme-provider.tsx    # Theme context provider
│   └── theme-toggle.tsx      # Theme toggle button
├── lib/                      # Library and utilities (14 TS files)
│   ├── coaches-data.ts       # Coach information data
│   ├── statorium-data.ts     # Statorium static data cache
│   ├── engine/               # Scoring engine
│   │   ├── benchmark.ts      # Benchmark calculations
│   │   └── scoring.ts        # Compatibility scoring algorithm
│   ├── statorium/            # Statorium API integration
│   │   ├── client.ts         # API client class
│   │   ├── formation-service.ts # Formation parsing
│   │   └── types.ts         # API response types
│   ├── supabase/             # Supabase integration
│   │   ├── client.ts         # Browser client factory
│   │   ├── server.ts         # Server client factory
│   │   ├── middleware.ts     # Session management
│   │   ├── schema.sql        # Base database schema
│   │   ├── profiles-schema.sql # User profiles schema
│   │   ├── add-rls-policy.sql # RLS policies
│   │   ├── add-profile-stats-columns.sql # Profile stats columns
│   │   └── complete-profiles-migration.sql # Migration script
│   ├── types/                # Type definitions
│   │   └── player.ts        # Player type definitions
│   ├── utils/                # Utility functions
│   │   ├── geocoding.ts      # Geocoding utilities
│   │   └── pdf-generator.ts  # PDF generation utilities
│   └── utils.ts              # General utilities (cn function)
├── adapters/                 # Data transformation layer
│   └── player.ts             # Player data adapter
├── public/                   # Static assets
├── middleware.ts             # Next.js middleware for auth
├── next.config.mjs           # Next.js configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── [config files]            # ESLint, Prettier, PostCSS configs
```

## Directory Purposes

**app/**:
- Purpose: Next.js App Router pages, layouts, and server actions
- Contains: Page components, route handlers, server actions, authentication flow
- Key files: `layout.tsx` (root layout), `(dashboard)/layout.tsx` (dashboard layout), `actions/*.ts` (server-side business logic)

**components/**:
- Purpose: Reusable React components for UI and features
- Contains: Scout-specific components, generic UI components, layout components
- Key files: `components/scout/` (feature components), `components/ui/` (design system components)

**lib/**:
- Purpose: Shared libraries, utilities, and business logic
- Contains: Database clients, API clients, scoring engine, type definitions
- Key files: `lib/supabase/` (database layer), `lib/statorium/` (external API), `lib/engine/` (scoring algorithms)

**adapters/**:
- Purpose: Data transformation between external APIs and internal models
- Contains: Adapter functions for normalizing data structures
- Key files: `adapters/player.ts` (player data normalization)

**public/**:
- Purpose: Static assets served directly
- Contains: Images, fonts, favicon, other static resources

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout with theme provider and fonts
- `app/page.tsx`: Root page that redirects to dashboard
- `middleware.ts`: Route protection and session validation
- `app/(dashboard)/dashboard/page.tsx`: Main dashboard page

**Configuration:**
- `next.config.mjs`: Next.js configuration (image domains, etc.)
- `tsconfig.json`: TypeScript configuration (path aliases, compiler options)
- `package.json`: Dependencies and build scripts

**Core Logic:**
- `lib/engine/scoring.ts`: Compatibility scoring algorithm
- `lib/statorium/client.ts`: External API client
- `lib/supabase/client.ts` & `server.ts`: Database client factories
- `app/actions/`: Server-side business logic (7 action files)

**Testing:**
- No test files detected in current codebase

## Naming Conventions

**Files:**
- Page components: `page.tsx` (App Router convention)
- Layout components: `layout.tsx`
- Server Actions: `*.ts` with descriptive names (e.g., `watchlist.ts`, `statorium.ts`)
- UI Components: `kebab-case.tsx` (e.g., `card-stack.tsx`, `player-search.tsx`)
- Utility files: `*.ts` with descriptive names (e.g., `geocoding.ts`, `pdf-generator.ts`)

**Directories:**
- Route groups: `(group-name)` with parentheses (e.g., `(dashboard)`)
- Dynamic routes: `[param]` syntax (e.g., `team/[id]`)
- Feature directories: lowercase (e.g., `scout`, `ui`, `auth`)

## Where to Add New Code

**New Feature:**
- Primary code: Create new route in `app/(dashboard)/feature-name/page.tsx`
- Server Actions: Add to `app/actions/` or create feature-specific action file
- Tests: No test directory exists - would need to create `__tests__/` or `tests/` at root

**New Component/Module:**
- Implementation: Add to appropriate directory:
  - UI components: `components/ui/component-name.tsx`
  - Scout feature components: `components/scout/component-name.tsx`
  - Layout components: `components/component-name.tsx`
- Shared utilities: Add to `lib/utils/` or `lib/` for major utilities
- Types: Add to `lib/types/type-name.ts` or inline in consuming files

**Utilities:**
- Shared helpers: Add to `lib/utils.ts` for small utilities
- Specialized utilities: Create new file in `lib/utils/` (e.g., `geocoding.ts`, `pdf-generator.ts`)
- Database utilities: Add to `lib/supabase/` (e.g., new client factories, schema files)

## Special Directories

**app/(dashboard)/**:
- Purpose: Route group for authenticated pages sharing common layout
- Generated: No (user-defined)
- Committed: Yes
- Contains all dashboard routes that require authentication

**components/ui/**:
- Purpose: Design system components (likely from shadcn/ui)
- Generated: Partially (shadcn CLI generates components)
- Committed: Yes
- Contains reusable UI primitives

**lib/supabase/**:
- Purpose: Database integration layer
- Generated: No (user-defined)
- Committed: Yes
- Contains schema files, client factories, middleware

**.planning/codebase/**:
- Purpose: Codebase documentation and planning
- Generated: Yes (by GSD mapping agents)
- Committed: Yes
- Contains architecture, structure, conventions documentation

---

*Structure analysis: 2026-04-21*
