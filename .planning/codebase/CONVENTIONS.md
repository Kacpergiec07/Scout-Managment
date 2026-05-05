# Coding Conventions

**Analysis Date:** 2026-05-05

## Naming Patterns

**Files:**
- **Components:** kebab-case (e.g., `player-avatar.tsx`, `notifications-panel.tsx`)
- **Utilities:** kebab-case (e.g., `transfermarkt.ts`, `league-utils.ts`)
- **Hooks:** kebab-case with `use-` prefix (e.g., `use-home-team.ts`, `use-market-value.ts`)
- **Types:** kebab-case in types directories (e.g., `player.ts`)
- **Actions:** kebab-case (e.g., `profile.ts`, `statorium.ts`)
- **Pages:** `page.tsx` or `layout.tsx` in route directories
- **API Routes:** `route.ts` in `api/` subdirectories

**Functions:**
- **Components:** PascalCase for function names (e.g., `export function PlayerAvatar()`, `export function Sidebar()`)
- **Hooks:** camelCase with `use` prefix (e.g., `export function useHomeTeam()`, `export function useMarketValue()`)
- **Utilities:** camelCase (e.g., `export function getMarketValue()`, `export function cn()`)
- **Actions:** camelCase (e.g., `export async function updateProfile()`, `export async function getProfileData()`)
- **API Handlers:** `GET`, `POST`, `PUT`, `DELETE` named exports

**Variables:**
- camelCase for all variables (e.g., `const [mounted, setMounted] = useState(false)`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `const BASE_URL = 'https://api.statorium.com/api/v1'`, `const LEAGUE_CONFIGS = [...]`)
- React state: camelCase with setters (e.g., `const [homeTeam, setHomeTeam] = useState<HomeTeam | null>(null)`)

**Types:**
- Interfaces: PascalCase (e.g., `export interface HomeTeam`, `export interface LeagueInfo`)
- Type aliases: PascalCase (e.g., `export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CM' | 'CDM' | 'CAM' | 'LW' | 'RW' | 'ST'`)
- Enums: Not used in codebase
- Generic types: PascalCase with `T` prefix (e.g., `T`, `TProps`, `TData`)

## Code Style

**Formatting:**
- **Tool:** Prettier 3.8.1 with prettier-plugin-tailwindcss
- **Key settings:**
  - Semi-colons: disabled (`semi: false`)
  - Quotes: double quotes (`singleQuote: false`)
  - Tab width: 2 spaces
  - Trailing commas: ES5
  - Print width: 80 characters
  - End of line: LF
  - Tailwind CSS classes sorted via plugin

**Linting:**
- **Tool:** ESLint 9.39.4 with eslint-config-next
- **Config:** `eslint.config.mjs` using flat config
- **Presets:** `nextVitals` (core-web-vitals), `nextTs` (typescript)
- **Ignores:** `.next/**`, `out/**`, `build/**`, `next-env.d.ts`, `scratch`, `scratch.ts`

**TypeScript:**
- **Strict mode:** enabled
- **Target:** ES2022
- **Module:** ESNext with bundler resolution
- **Path aliases:** `@/*` maps to `./src/*`
- **JSX:** preserve
- **NoUncheckedIndexedAccess:** Not configured (could be added for more safety)

**TypeScript Strictness:**
- All files type-checked with `tsc --noEmit`
- Interface definitions for complex props and data structures
- Type guards for runtime validation (using Zod where appropriate)
- `any` type used sparingly, primarily for Supabase JSON columns

## Import Organization

**Order:**
1. React and core framework imports
2. Third-party library imports
3. Internal imports (using `@/` alias)
4. Relative imports
5. Types (if separated with `import type`)

**Path Aliases:**
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/app` → `src/app`
- `@/hooks` → `src/hooks`

**Examples:**
```typescript
// React and core
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

// Third-party
import { motion, AnimatePresence } from 'framer-motion'
import { Search, List, User, LogOut } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'

// Internal
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { StatoriumPlayerBasic } from '@/lib/statorium/types'
import { searchPlayersAction } from '@/app/actions/statorium'

// Relative
import { PlayerAvatar } from './player-avatar'
import type { HomeTeam } from './types'
```

**Named exports preferred:**
```typescript
export function PlayerSearch({ ... }) { ... }
export { Button, buttonVariants }
export const LEAGUES = [...]
```

**Default exports:**
- Used for Next.js pages and layouts
- Used for main component exports in feature directories

## Error Handling

**Patterns:**
- **Try-catch for async operations:** Wrap external API calls, database operations, and parsing in try-catch
- **Console.error for errors:** Use `console.error()` with descriptive context prefixes
- **Return fallback values:** Functions return null, empty arrays, or default objects on error
- **Server Actions:** Return error objects or throw errors to be caught by caller
- **API Routes:** Return appropriate HTTP status codes with error messages

**Examples:**
```typescript
// Async error handling with fallback
try {
  const data = await searchPlayersAction(query)
  setResults(data)
} catch (err) {
  console.error(`Search error:`, err)
  setResults([])
} finally {
  setLoading(false)
}

// API route error handling
try {
  const data = await getCachedMarketValue(decodedName)
  return NextResponse.json(data)
} catch (error) {
  console.error('API Error fetching market value:', error)
  return NextResponse.json({ value: null, formatted: 'N/A' }, { status: 500 })
}

// Service class error handling
if (!response.ok) {
  const errorText = await response.text()
  console.error(`[StatoriumClient] API Error ${response.status}:`, errorText)
  throw new Error(`Statorium API error: ${response.status} ${response.statusText}`)
}

// Server action error handling
if (userError || !user) {
  console.error('UpdateProfile: User not authenticated')
  return { error: 'User not authenticated' }
}

try {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('UpdateProfile: Database error:', error)
    return { error: error.message }
  }

  return { success: true, data }
} catch (error) {
  console.error('UpdateProfile: Unexpected error:', error)
  return { error: 'An unexpected error occurred' }
}
```

**Error Context:**
- Always include context in error logs (e.g., `[UpdateProfile]`, `[StatoriumClient]`)
- Log error details for debugging (message, code, details, hint)
- Return user-friendly error messages to UI

## Logging

**Framework:** console (native browser/node console)

**Patterns:**
- **Debug logging:** `console.log()` with context prefixes like `[StatoriumClient]`, `[League]`
- **Error logging:** `console.error()` with descriptive messages and error objects
- **Warning logging:** `console.warn()` for non-critical issues or fallbacks
- **Context labels:** Use brackets to indicate source (e.g., `[UpdateProfile]`, `[getProfileData]`)

**Examples:**
```typescript
console.log('getProfileData: Starting profile data fetch...')
console.log(`[StatoriumClient] Data from ${endpoint}:`, JSON.stringify(data).substring(0, 200) + '...')
console.warn('[StatoriumClient] Search API failed:', error)
console.error(`Scraper Error [${playerName}]:`, error)
console.error('UpdateProfile: Error details:', {
  message: error.message,
  code: error.code,
  details: error.details,
  hint: error.hint
})
```

**Note:** Extensive console logging present throughout codebase. Consider implementing proper logging framework (e.g., pino, winston) for production.

## Comments

**When to Comment:**
- JSDoc/TSDoc for exported functions and interfaces
- Inline comments for complex logic or workarounds
- TODO comments for future work
- Section dividers for related functionality in large files
- Explanation of "why" not "what" for non-obvious code

**JSDoc/TSDoc:**
```typescript
/**
 * Player Avatar Component
 * Displays player photo with placeholder fallback
 */

/**
 * Parses Transfermarkt market value string to number
 * Examples:
 * "€200.00m" -> 200000000
 * "€45.50m" -> 45500000
 * "€500 Th." -> 500000
 */
function parseMarketValue(valueStr: string | null): number | null { ... }

export interface MarketValueData {
  value: number | null;
  formatted: string;
}
```

**Inline comments:**
```typescript
// Avoid hydration mismatch
useEffect(() => {
  setMounted(true)
}, [])

// Statorium API can nest standings in many ways. Let's be thorough.
let list: any[] = [];

// ============================================
// SMART RECLASSIFICATION RULES
// ============================================
const maxAttackers = 3;

// 1 second delay to avoid being blocked
await delay(1000);

// TODO: Remove this hardcoded data once Statorium API provides coach information
```

**Comment Style:**
- Use single-line comments (`//`) for most cases
- Use multi-line comments (`/* */`) for block descriptions
- Keep comments concise and focused on intent
- Update comments when code changes

## Function Design

**Size:** No strict size limit observed. Functions range from 5-200+ lines. Large files include:
- `statorium-data.ts`: 150,250 bytes (constants and mappings)
- `europe-map-data.ts`: 168,850 bytes (geographic data)
- `notifications-panel.tsx`: 19,299 bytes (complex UI component)
- `statorium.ts`: ~1,600 lines (server actions)

**Parameters:**
- Destructured props for components: `function PlayerAvatar({ photo, size = 40 }: { photo?: string | null; size?: number })`
- Interface definitions for complex props
- Default values provided in parameter lists
- FormData objects for server actions

**Return Values:**
- Functions return typed values
- Fallback values on error (null, empty arrays, 'N/A')
- Server Actions return `{ success: boolean, data?: any, error?: string }` pattern
- API routes return `NextResponse.json()`
- Hooks return objects with state and setters

**Examples:**
```typescript
// Component with props
export function PlayerAvatar({ photo, size = 40 }: { photo?: string | null; size?: number }) { ... }

// Hook returning object
export function useHomeTeam() {
  const [homeTeam, setHomeTeam] = useState<HomeTeam | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  return { homeTeam, selectHomeTeam, isLoaded };
}

// Utility with return type
export async function getMarketValue(playerName: string): Promise<MarketValueData> { ... }

// Server action with FormData
export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const fullName = formData.get('fullName') as string
  // ...
  return { success: true, data: profileData }
}

// API route
export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    // ...
    return new Response(result.textStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

## Module Design

**Exports:**
- Named exports preferred (except default exports for pages)
- Multiple exports from utility files
- Barrel files: Not extensively used (no index.ts files found)

**Barrel Files:**
- No barrel files (index.ts) detected in component or lib directories
- Components imported directly from file paths
- UI components imported individually (e.g., `import { Button } from '@/components/ui/button'`)

**Examples:**
```typescript
// Named exports from utils
export function cn(...inputs: ClassValue[]) { ... }
export function hexToHSL(hex: string) { ... }
export function applyCustomColors(colors: CustomColors | null) { ... }

// Named exports from components
export function PlayerAvatar({ ... }) { ... }
export function Sidebar() { ... }

// Constant exports
export const LEAGUES: LeagueInfo[] = [...]
export const POSITION_MAP: Record<string, string> = {...}

// Multiple exports from UI components
export { Button, buttonVariants }
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
```

**Module Organization:**
- Each module has a single responsibility
- Related functions grouped in same file
- Types exported alongside implementations
- Clear separation between client and server code

## React-Specific Conventions

**Client Components:**
- Marked with `'use client'` directive at top of file
- Used for interactive components with useState, useEffect, event handlers
- Examples: `player-avatar.tsx`, `theme-toggle.tsx`, `sidebar.tsx`, `notifications-panel.tsx`
- Avoids hydration issues with `mounted` state pattern

**Server Components:**
- No directive (default in Next.js 15)
- Used for pages and data-fetching components
- Examples: `dashboard/page.tsx`, `app/layout.tsx`
- Can import and use server actions directly

**Server Actions:**
- Marked with `'use server'` directive
- Async functions that can be called from client components
- Located in `src/app/actions/` directory
- Examples: `profile.ts`, `statorium.ts`, `job-generation.ts`
- Return data or error objects, not throw to UI

**State Management:**
- React hooks (useState, useEffect) for local component state
- Custom hooks for reusable logic (useHomeTeam, useMarketValue)
- Supabase for database state (profiles, watchlist, transfers)
- No Redux or Context API used extensively
- localStorage for client-side persistence (home team, preferences)

**Examples:**
```typescript
// Client component with hydration check
"use client";
export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  // ...
}

// Server component (no directive)
export default async function DashboardPage() {
  return <DashboardClient />
}

// Server action
"use server";
export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  // ...
  return { success: true, data: profileData }
}
```

**Component Patterns:**
- Functional components only (no class components)
- Props interfaces defined at top of file
- Early returns for conditional rendering
- Descriptive component names
- Props destructuring in function signature

## Tailwind CSS Conventions

**Class Organization:**
- Handled by prettier-plugin-tailwindcss (automatic sorting)
- Utility-first approach
- Custom variants via `cn()` helper
- Responsive classes with mobile-first approach

**Helper Function:**
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Usage:**
```typescript
className={cn(
  "base-classes",
  conditional && "conditional-classes",
  className // prop override
)}

// Example from Sidebar
className={`group flex items-center gap-4 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-all duration-300 ${
  isActive
   ? 'text-secondary bg-secondary/10 shadow-sm border border-secondary/20'
   : 'text-muted-foreground hover:bg-accent hover:text-foreground'
}`}
```

**Design System:**
- Tailwind CSS 4.2.1 with PostCSS
- Custom color palette in `globals.css` using CSS variables
- shadcn/ui components as base
- Neubrutalist design aesthetic
- Dark mode support via next-themes

**Responsive Design:**
- Mobile-first breakpoints
- Hidden elements: `hidden md:flex`, `lg:hidden`, etc.
- Responsive spacing and sizing
- Responsive typography

## File Structure Conventions

**App Router:**
- Pages in `src/app/` directory
- Route groups in parentheses: `(dashboard)/`
- Dynamic routes in brackets: `[id]/`, `[playerName]/`
- Server actions in `src/app/actions/`
- API routes in `src/app/api/`
- Layouts in `layout.tsx` files

**Components:**
- Reusable UI components in `src/components/ui/` (shadcn/ui)
- Feature components in subdirectories: `src/components/scout/`, `src/components/dashboard/`, `src/components/scout-jobs/`
- Each component in its own file
- Client components marked with 'use client'

**Lib:**
- Utilities in `src/lib/`
- External service clients in `src/lib/statorium/`, `src/lib/supabase/`
- Types in `src/lib/types/`
- Helper utilities in `src/lib/utils/` (small files like `utils.ts`, `portal-utils.ts`)
- Data files: `statorium-data.ts`, `coaches-data.ts`, `europe-map-data.ts`

**Hooks:**
- Custom React hooks in `src/hooks/`
- Each hook in its own file
- Named with `use-` prefix

**Naming Conventions Summary:**
- Directories: kebab-case or camelCase (e.g., `scout-jobs/`, `dashboard/`)
- Files: kebab-case (e.g., `player-avatar.tsx`, `use-home-team.ts`)
- Component files: kebab-case with `.tsx` extension
- Utility files: kebab-case with `.ts` extension
- Test files: `*.test.ts` or `*.spec.ts` (not currently used)

## Version Control Practices

**Commit Messages:**
- Conventional commits observed in recent history:
  - `feat: stabilize transfer war room and enhance scout management dashboard`
  - `predkosc i cofanie do watchlist` (speed and watchlist navigation)
  - `profile fix`
  - `Update codebase analysis documentation (2026-05-05)`
- Format: `type(scope): description` (English preferred, Polish偶尔出现)
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

**Branching:**
- Main branch: `master`
- Feature branches not extensively documented in recent commits
- Merge commits present (merge to master)

**Git Configuration:**
- `.gitignore` includes: `node_modules`, `.next`, `out`, `build`, `.env.local`, `scratch/`, `*.log`
- Large data files committed: `matches.json`, `matches_utf8.json`, `details_*.json`, `all-players-db.json`
- Temporary files excluded: `scratch.ts`, `scratch/` directory

**Commit Frequency:**
- Recent commits show active development
- Documentation commits indicate attention to code quality
- Fix commits suggest iterative development

## Code Review Standards

**Review Checklist (inferred from codebase):**
- TypeScript strict mode compliance
- Proper error handling with try-catch
- Console logging with context
- Component hydration safety (client components)
- Proper use of 'use client' and 'use server' directives
- Tailwind class organization (automatic via Prettier)
- Type safety for props and return values
- Supabase error handling
- API route error responses
- Accessibility (implied from core-web-vitals ESLint rule)

**Code Quality Metrics:**
- 144 TypeScript/TSX files
- ~14,340 total lines of code
- Strict TypeScript enabled
- ESLint with Next.js best practices
- Prettier for consistent formatting

## Database Conventions

**Supabase/PostgreSQL:**
- SQL migration files in `src/lib/supabase/*.sql`
- Row Level Security (RLS) policies
- TypeScript types derived from database schema
- Server actions for database operations
- Error handling with detailed logging

**Schema Naming:**
- Table names: snake_case (e.g., `profiles`, `watchlist`, `user_activities`)
- Column names: snake_case (e.g., `full_name`, `avatar_url`, `notification_preferences`)
- Foreign keys: snake_case (e.g., `user_id`, `player_id`)
- JSON columns: `notification_preferences`, custom objects

**Migration Files:**
- Descriptive names: `profiles-schema.sql`, `watchlist-schema.sql`, `user-activities-migration.sql`
- Separate files for schema changes and data migrations
- Safe migrations with checks (e.g., `safe-watchlist-migration.sql`)

## API Integration Patterns

**External APIs:**
- Statorium API: Football data and statistics
- Transfermarkt: Web scraping for market values
- Anthropic AI: Claude for AI-powered analysis
- Zhipu AI: Alternative AI model for chat

**API Client Patterns:**
- Client classes in `src/lib/[service]/client.ts`
- Async methods for data fetching
- Error handling with descriptive messages
- Type definitions for API responses
- Caching strategies (e.g., `getCachedMarketValue`)

**API Route Patterns:**
- Single file per route: `route.ts`
- Named exports for HTTP methods: `GET`, `POST`, `PUT`, `DELETE`
- Request body parsing with `await req.json()`
- Response with `NextResponse.json()`
- Error handling with appropriate status codes

**Example:**
```typescript
// API route in src/app/api/chat/route.ts
export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    // Process request
    return new Response(result.textStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

## Security Practices

**Authentication:**
- Supabase Auth for user authentication
- Middleware for session management: `src/middleware.ts`
- Server actions check authentication before database operations
- Row Level Security (RLS) policies on Supabase tables

**Environment Variables:**
- Stored in `.env.local` (not committed)
- Required vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STATORIUM_API_KEY`, `ANTHROPIC_API_KEY`
- Example file: `.env.example` for reference

**Data Validation:**
- TypeScript for compile-time validation
- Zod for runtime validation (used in some places)
- FormData validation in server actions
- Type casting with `as string` when accessing FormData

**API Security:**
- API keys stored in environment variables
- Server actions only callable from authenticated users
- No direct database access from client components

---

*Convention analysis: 2026-05-05*
