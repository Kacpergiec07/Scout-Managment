# Codebase Structure

**Analysis Date:** 2026-04-21

## Directory Layout

```
[project-root]/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (dashboard)/          # Route group for authenticated dashboard pages
│   │   │   ├── analysis/         # Player analysis page
│   │   │   ├── compare/          # Player comparison page
│   │   │   ├── dashboard/        # Main dashboard page
│   │   │   ├── history/          # Analysis history page
│   │   │   ├── leagues/          # League standings and team details
│   │   │   │   └── team/[id]/    # Dynamic team detail pages
│   │   │   ├── players/new/      # Add new player page
│   │   │   ├── profile/          # User profile page
│   │   │   ├── settings/         # Settings page
│   │   │   ├── transfers/        # Transfer market page
│   │   │   │   └── intelligence/ # Transfer intelligence page
│   │   │   ├── watchlist/        # Watchlist management page
│   │   │   └── layout.tsx        # Dashboard layout wrapper
│   │   ├── actions/              # Server Actions
│   │   │   ├── ai.ts             # AI narrative generation
│   │   │   ├── analysis.ts       # Compatibility analysis
│   │   │   ├── profile.ts        # User profile operations
│   │   │   ├── refresh-stats.ts  # Statistics refresh
│   │   │   ├── statorium.ts      # Statorium API integration
│   │   │   ├── watchlist.ts      # Watchlist operations
│   │   │   └── migrate-watchlist.ts # Database migration
│   │   ├── api/                  # API routes
│   │   │   ├── chat/             # AI chat endpoint
│   │   │   ├── market-value/     # Player valuation endpoint
│   │   │   └── valuation/        # Valuation endpoint
│   │   ├── auth/                 # Authentication pages and actions
│   │   │   ├── actions.ts        # Login/signup/signout actions
│   │   │   └── callback/         # OAuth callback handler
│   │   ├── login/                # Login page
│   │   ├── migrate-watchlist/    # Watchlist migration page
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Root page (redirects to /dashboard)
│   ├── components/               # React components
│   │   ├── scout/                # Scout-specific components
│   │   │   ├── ai-narrative.tsx  # AI-generated analysis text
│   │   │   ├── club-card.tsx     # Club information card
│   │   │   ├── global-market-card.tsx # Market overview card
│   │   │   ├── kanban-board.tsx  # Kanban-style watchlist board
│   │   │   ├── kanban-card.tsx   # Kanban card component
│   │   │   ├── kanban-column.tsx  # Kanban column component
│   │   │   ├── league-center.tsx # League center hub
│   │   │   ├── market-value.tsx  # Market value display
│   │   │   ├── player-form.tsx   # Player data entry form
│   │   │   ├── player-search.tsx # Player search interface
│   │   │   ├── radar-chart.tsx   # Stats radar chart
│   │   │   ├── ranking-list.tsx  # Ranking list display
│   │   │   ├── report-button.tsx # Report generation button
│   │   │   ├── scout-bot.tsx     # AI scout chatbot
│   │   │   ├── squad-row.tsx     # Squad row component
│   │   │   ├── tactical-pitch.tsx # Tactical pitch visualization
│   │   │   ├── transfer-details-modal.tsx # Transfer details modal
│   │   │   └── transfer-flow.tsx # Transfer flow component
│   │   ├── ui/                   # UI components (shadcn/ui)
│   │   │   ├── 3d-globe.tsx      # 3D globe visualization
│   │   │   ├── badge.tsx         # Badge component
│   │   │   ├── button.tsx        # Button component
│   │   │   ├── card-stack.tsx    # Card stack animation
│   │   │   ├── card.tsx          # Card component
│   │   │   ├── chart.tsx         # Chart components
│   │   │   ├── checkbox.tsx      # Checkbox component
│   │   │   ├── command.tsx       # Command palette
│   │   │   ├── dialog.tsx        # Dialog component
│   │   │   ├── dropdown-menu.tsx # Dropdown menu
│   │   │   ├── form.tsx          # Form components
│   │   │   ├── input-group.tsx   # Input group component
│   │   │   ├── input.tsx         # Input component
│   │   │   ├── label.tsx         # Label component
│   │   │   ├── popover.tsx       # Popover component
│   │   │   ├── progress.tsx      # Progress component
│   │   │   ├── scroll-area.tsx   # Scroll area component
│   │   │   ├── select.tsx        # Select component
│   │   │   ├── switch.tsx        # Switch component
│   │   │   ├── tabs.tsx          # Tabs component
│   │   │   ├── tactical-map.tsx  # Tactical map visualization
│   │   │   └── textarea.tsx      # Textarea component
│   │   ├── dashboard/            # Dashboard-specific components
│   │   │   └── dashboard-client.tsx # Dashboard client component
│   │   ├── notifications-bell-new.tsx # Notifications bell
│   │   ├── notifications-bell.tsx     # Legacy notifications
│   │   ├── notifications-panel.tsx    # Notifications panel
│   │   ├── sidebar-wrapper.tsx   # Sidebar layout wrapper
│   │   ├── sidebar.tsx           # Main navigation sidebar
│   │   ├── theme-provider.tsx    # Theme context provider
│   │   └── theme-toggle.tsx      # Theme toggle button
│   ├── hooks/                    # React hooks
│   │   └── use-market-value.ts  # Market value hook
│   ├── lib/                      # Library and utilities
│   │   ├── coaches-data.ts       # Coach information data
│   │   ├── statorium-data.ts     # Statorium static data cache
│   │   ├── transfermarkt.ts      # Transfermarkt scraper
│   │   ├── utils.ts              # General utilities (cn function)
│   │   ├── engine/               # Scoring engine
│   │   │   ├── benchmark.ts      # Benchmark calculations
│   │   │   └── scoring.ts        # Compatibility scoring algorithm
│   │   ├── statorium/            # Statorium API integration
│   │   │   ├── client.ts         # API client class
│   │   │   ├── formation-service.ts # Formation parsing
│   │   │   └── types.ts         # API response types
│   │   ├── supabase/             # Supabase integration
│   │   │   ├── client.ts         # Browser client factory
│   │   │   ├── server.ts         # Server client factory
│   │   │   └── middleware.ts     # Session management
│   │   ├── types/                # Type definitions
│   │   │   └── player.ts        # Player type definitions
│   │   └── utils/                # Utility functions
│   │       ├── geocoding.ts      # Geocoding utilities
│   │       └── pdf-generator.ts  # PDF generation utilities
│   └── middleware.ts             # Next.js middleware for auth
├── public/                       # Static assets
├── docs/                         # Documentation
│   ├── adapters/                 # Adapter documentation
│   ├── internal/                 # Internal documentation
│   └── reports/                  # Reports
├── scripts/                      # Build/deployment scripts
├── .planning/                    # Planning directory
│   └── codebase/                # Codebase documentation
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── [config files]                # ESLint, Prettier, PostCSS configs
```

## Directory Purposes

**src/app/**:
- Purpose: Next.js App Router pages, layouts, and server actions
- Contains: Page components, route handlers, server actions, authentication flow
- Key files: `layout.tsx` (root layout), `(dashboard)/layout.tsx` (dashboard layout), `actions/*.ts` (server-side business logic)

**src/components/**:
- Purpose: Reusable React components for UI and features
- Contains: Scout-specific components, generic UI components, layout components
- Key files: `components/scout/` (feature components), `components/ui/` (design system components)

**src/lib/**:
- Purpose: Shared libraries, utilities, and business logic
- Contains: Database clients, API clients, scoring engine, type definitions
- Key files: `lib/supabase/` (database layer), `lib/statorium/` (external API), `lib/engine/` (scoring algorithms)

**src/hooks/**:
- Purpose: Custom React hooks for state management and data fetching
- Contains: Market value hook, future hooks for other reusable logic
- Key files: `use-market-value.ts`

**public/**:
- Purpose: Static assets served directly
- Contains: Images, fonts, favicon, other static resources

**docs/**:
- Purpose: Project documentation
- Contains: Adapter documentation, internal docs, reports
- Key files: Documentation for adapters and internal processes

**scripts/**:
- Purpose: Build, deployment, and maintenance scripts
- Contains: Automation scripts for various tasks

**.planning/**:
- Purpose: Planning and development documentation
- Contains: Codebase analysis, phase plans, examples
- Key files: Codebase architecture and structure docs

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout with theme provider and fonts
- `src/app/page.tsx`: Root page that redirects to dashboard
- `src/middleware.ts`: Route protection and session validation
- `src/app/(dashboard)/dashboard/page.tsx`: Main dashboard page

**Configuration:**
- `next.config.mjs`: Next.js configuration (image domains, etc.)
- `tsconfig.json`: TypeScript configuration (path aliases, compiler options)
- `package.json`: Dependencies and build scripts
- `tailwind.config.ts`: Tailwind CSS configuration
- `eslint.config.mjs`: ESLint configuration
- `postcss.config.mjs`: PostCSS configuration

**Core Logic:**
- `src/lib/engine/scoring.ts`: Compatibility scoring algorithm
- `src/lib/statorium/client.ts`: External API client
- `src/lib/supabase/client.ts` & `server.ts`: Database client factories
- `src/app/actions/`: Server-side business logic (8 action files)

**Testing:**
- No test files detected in current codebase

## Naming Conventions

**Files:**
- Page components: `page.tsx` (App Router convention)
- Layout components: `layout.tsx`
- Server Actions: `*.ts` with descriptive names (e.g., `watchlist.ts`, `statorium.ts`)
- UI Components: `kebab-case.tsx` (e.g., `card-stack.tsx`, `player-search.tsx`)
- Utility files: `*.ts` with descriptive names (e.g., `geocoding.ts`, `pdf-generator.ts`)
- Route handlers: `route.ts` (in API directories)

**Directories:**
- Route groups: `(group-name)` with parentheses (e.g., `(dashboard)`)
- Dynamic routes: `[param]` syntax (e.g., `team/[id]`)
- Feature directories: lowercase (e.g., `scout`, `ui`, `auth`)
- Utility directories: lowercase (e.g., `lib`, `hooks`, `utils`)

## Where to Add New Code

**New Feature:**
- Primary code: Create new route in `src/app/(dashboard)/feature-name/page.tsx`
- Server Actions: Add to `src/app/actions/` or create feature-specific action file
- Tests: No test directory exists - would need to create `__tests__/` or `tests/` at root

**New Component/Module:**
- Implementation: Add to appropriate directory:
  - UI components: `src/components/ui/component-name.tsx`
  - Scout feature components: `src/components/scout/component-name.tsx`
  - Dashboard components: `src/components/dashboard/component-name.tsx`
  - Layout components: `src/components/component-name.tsx`
- Shared utilities: Add to `src/lib/utils/` or `src/lib/` for major utilities
- Types: Add to `src/lib/types/type-name.ts` or inline in consuming files

**Utilities:**
- Shared helpers: Add to `src/lib/utils.ts` for small utilities
- Specialized utilities: Create new file in `src/lib/utils/` (e.g., `geocoding.ts`, `pdf-generator.ts`)
- Database utilities: Add to `src/lib/supabase/` (e.g., new client factories, schema files)
- API utilities: Add to `src/lib/statorium/` for Statorium API related utilities

**Hooks:**
- Custom hooks: Add to `src/hooks/hook-name.ts`
- Keep hooks focused and reusable across components

## Special Directories

**src/app/(dashboard)/**:
- Purpose: Route group for authenticated pages sharing common layout
- Generated: No (user-defined)
- Committed: Yes
- Contains all dashboard routes that require authentication

**src/components/ui/**:
- Purpose: Design system components (likely from shadcn/ui)
- Generated: Partially (shadcn CLI generates components)
- Committed: Yes
- Contains reusable UI primitives

**src/lib/supabase/**:
- Purpose: Database integration layer
- Generated: No (user-defined)
- Committed: Yes
- Contains client factories, middleware

**src/lib/statorium/**:
- Purpose: Statorium API integration
- Generated: No (user-defined)
- Committed: Yes
- Contains API client, types, formation service

**.planning/codebase/**:
- Purpose: Codebase documentation and planning
- Generated: Yes (by GSD mapping agents)
- Committed: Yes
- Contains architecture, structure, conventions documentation

---

*Structure analysis: 2026-04-21*
