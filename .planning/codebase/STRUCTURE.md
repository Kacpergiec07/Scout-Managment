# Codebase Structure

**Analysis Date:** 2026-05-05

## Directory Layout

```
scout-managment/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── (dashboard)/              # Dashboard route group with shared layout
│   │   │   ├── dashboard/            # Main dashboard overview
│   │   │   ├── scout-jobs/           # Scout job management
│   │   │   ├── watchlist/            # Player watchlist
│   │   │   ├── compare/              # Player comparison tool
│   │   │   ├── history/              # Analysis history
│   │   │   ├── transfers/            # Transfer tracking
│   │   │   ├── transfers/intelligence/  # AI-powered transfer intelligence
│   │   │   ├── leagues/              # League standings and details
│   │   │   ├── teams/[id]/           # Individual team profiles
│   │   │   ├── players/new/          # Add new player
│   │   │   ├── analysis/             # Player analysis tools
│   │   │   ├── profile/              # User profile management
│   │   │   └── settings/             # Application settings
│   │   ├── actions/                  # Server Actions (mutations and data fetching)
│   │   ├── api/                      # API routes for external integrations
│   │   ├── auth/                     # Authentication pages and callbacks
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Root page (redirect to dashboard)
│   │   └── globals.css               # Global styles
│   ├── components/                   # React components
│   │   ├── scout/                    # Scout-specific components
│   │   ├── ui/                       # Reusable UI primitives (shadcn/ui)
│   │   ├── dashboard/                # Dashboard-specific components
│   │   ├── scout-jobs/               # Scout job components
│   │   ├── sidebar.tsx               # Main navigation sidebar
│   │   └── [other components]        # Shared components
│   ├── lib/                          # Utilities and business logic
│   │   ├── stadium/                  # Stadium API client and types
│   │   ├── supabase/                 # Supabase client and schema migrations
│   │   ├── engine/                   # Scoring and analysis engines
│   │   ├── types/                    # TypeScript type definitions
│   │   ├── utils/                    # Utility functions
│   │   └── [other libraries]         # Additional helper modules
│   └── hooks/                        # Custom React hooks
├── .planning/                        # GSD planning documents
├── .agents/                          # AI agent skills and configurations
├── .gsd/                             # GSD project management files
├── scratch/                          # Development and testing files (excluded from build)
├── public/                           # Static assets
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── next.config.mjs                   # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
└── [config files]                    # Other configuration files
```

## Directory Purposes

**src/app/:**
- Purpose: Next.js App Router pages and server-side logic
- Contains: Page components, layouts, server actions, API routes, authentication
- Key files: `page.tsx`, `layout.tsx`, `globals.css`

**src/components/scout/:**
- Purpose: Scout-specific UI components for player analysis
- Contains: Radar charts, tactical maps, player forms, transfer flows, watchlist components
- Key files: `kanban-board.tsx`, `radar-chart.tsx`, `tactical-pitch.tsx`, `transfer-war-room.tsx`

**src/components/ui/:**
- Purpose: Reusable UI primitives built with shadcn/ui
- Contains: Buttons, cards, dialogs, forms, inputs, charts, maps
- Key files: `button.tsx`, `card.tsx`, `dialog.tsx`, `chart.tsx`

**src/lib/stadium/:**
- Purpose: Stadium API integration for football data
- Contains: API client, type definitions, data transformation logic
- Key files: `client.ts`, `types.ts`

**src/lib/supabase/:**
- Purpose: Supabase database client and schema management
- Contains: Server/client clients, RLS policies, migration scripts
- Key files: `client.ts`, `server.ts`, `schema.sql`, `profiles-schema.sql`

**src/lib/engine/:**
- Purpose: Scoring and analysis algorithms
- Contains: Player-club compatibility scoring, benchmarking logic
- Key files: `scoring.ts`, `benchmark.ts`

**src/app/actions/:**
- Purpose: Server Actions for data mutations and complex queries
- Contains: Player fetching, watchlist management, analysis, AI integrations
- Key files: `stadium.ts`, `watchlist.ts`, `analysis.ts`, `ai.ts`

**src/hooks/:**
- Purpose: Custom React hooks for shared logic
- Contains: Market value fetching, home team selection
- Key files: `use-market-value.ts`, `use-home-team.ts`

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Root page that redirects to dashboard
- `src/app/(dashboard)/layout.tsx`: Dashboard layout with sidebar
- `src/app/layout.tsx`: Root layout with theme provider and global styles

**Configuration:**
- `tsconfig.json`: TypeScript compiler options and path aliases
- `next.config.mjs`: Next.js configuration (image domains, etc.)
- `tailwind.config.ts`: Tailwind CSS theme and plugins
- `package.json`: Dependencies and npm scripts
- `.env.local`: Environment variables (not in git)

**Core Logic:**
- `src/lib/stadium/client.ts`: External API client
- `src/lib/supabase/server.ts`: Supabase server client
- `src/app/actions/stadium.ts`: Main data fetching actions
- `src/lib/engine/scoring.ts`: Compatibility scoring algorithm

**Testing:**
- `scratch/`: Development and testing files (excluded from TypeScript)
- Test files are mixed with development files in `scratch/` directory

## Naming Conventions

**Files:**
- Components: PascalCase with `.tsx` extension (e.g., `kanban-board.tsx`, `radar-chart.tsx`)
- Server Actions: kebab-case with `.ts` extension (e.g., `stadium.ts`, `watchlist.ts`)
- Utilities: kebab-case with `.ts` extension (e.g., `custom-theme.ts`, `utils.ts`)
- Types: kebab-case with `.ts` extension (e.g., `player.ts`)
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- API Routes: `route.ts` (Next.js convention)

**Directories:**
- Route groups: Parenthesized names (e.g., `(dashboard)/`)
- Dynamic routes: Square brackets (e.g., `[id]/`, `[playerName]/`)
- Feature-based: lowercase with hyphens (e.g., `scout-jobs/`, `watchlist/`)
- Domain-based: lowercase (e.g., `components/scout/`, `lib/stadium/`)

## Where to Add New Code

**New Feature (Dashboard Page):**
- Primary code: `src/app/(dashboard)/[feature-name]/page.tsx`
- Client components: `src/components/[domain]/[component-name].tsx`
- Server Actions: `src/app/actions/[feature-name].ts`
- Types: `src/lib/types/[domain].ts` (if new types needed)

**New UI Component:**
- Implementation: `src/components/ui/[component-name].tsx` (if reusable)
- Feature-specific: `src/components/[domain]/[component-name].tsx`
- Styles: Tailwind classes in component, or `src/app/globals.css` for global

**New Server Action:**
- Implementation: `src/app/actions/[action-name].ts`
- Must include `'use server'` directive at top
- Export functions for use in components

**New API Route:**
- Implementation: `src/app/api/[route-path]/route.ts`
- HTTP methods as named exports (GET, POST, etc.)

**New Utility Function:**
- Shared helpers: `src/lib/utils/[utility-name].ts`
- Domain-specific: `src/lib/[domain]/[utility-name].ts`
- Type definitions: `src/lib/types/[domain].ts`

**Database Schema Changes:**
- Migration scripts: `src/lib/supabase/[feature]-schema.sql`
- Type updates: `src/lib/types/[domain].ts`

## Special Directories

**.planning/:**
- Purpose: GSD planning and documentation
- Generated: Yes
- Committed: Yes

**.agents/ and .agent/:**
- Purpose: AI agent configurations and skills
- Generated: Yes
- Committed: Yes

**.gsd/:**
- Purpose: GSD project management (phases, templates, examples)
- Generated: Yes
- Committed: Yes

**scratch/:**
- Purpose: Development, testing, and temporary files
- Generated: Yes
- Committed: Yes
- Note: Excluded from TypeScript compilation in `tsconfig.json`

**node_modules/:**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No (in .gitignore)

**.next/:**
- Purpose: Next.js build output
- Generated: Yes
- Committed: No (in .gitignore)

**public/:**
- Purpose: Static assets (images, fonts, etc.)
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-05-05*
