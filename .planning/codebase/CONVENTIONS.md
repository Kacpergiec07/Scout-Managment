# Coding Conventions

**Analysis Date:** 2026-04-20

## Naming Patterns

**Files:**
- PascalCase for components: `PlayerForm.tsx`, `KanbanBoard.tsx`, `PlayerSearch.tsx`
- camelCase for utilities: `client.ts`, `scoring.ts`, `utils.ts`
- kebab-case for pages: `analysis/page.tsx`, `compare/page.tsx`
- Descriptive names indicating purpose: `stadium-client.ts`, `stadium-service.ts`

**Functions:**
- camelCase: `getStadiumClient()`, `calculateCompatibility()`, `searchPlayers()`
- Action functions: `getStandingsAction()`, `addToWatchlist()`, `login()`
- Event handlers: `onSubmit()`, `onDragStart()`, `onDragEnd()`
- Async functions: explicitly named with async operations

**Variables:**
- camelCase: `clientInstance`, `debouncedQuery`, `activeIndex`
- Boolean flags: `isLoading`, `isMounted`, `isActive`
- Constants: UPPER_SNAKE_CASE: `TOP_LEAGUES`, `POSITION_MAP`

**Types/Interfaces:**
- PascalCase: `ScoutProPlayer`, `ClubContext`, `CompatibilityResult`, `StadiumTeam`
- Type aliases for mapped types: `AppLeagueConfig`, `Position`

## Code Style

**Formatting:**
- Tool: Prettier
- Key settings:
  - `semi: false` (no semicolons)
  - `singleQuote: false` (double quotes)
  - `tabWidth: 2`
  - `trailingComma: "es5"`
  - `printWidth: 80`
  - `endOfLine: "lf"`
- Tailwind CSS plugin: `prettier-plugin-tailwindcss`
- Custom functions for class sorting: `cn`, `cva`

**Linting:**
- Tool: ESLint
- Config: `eslint.config.mjs` using Next.js TypeScript presets
- Extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Global ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

## Import Organization

**Order:**
1. React imports (first line for components: `'use client'` or `'use server'`)
2. External dependencies (npm packages)
3. Internal imports with `@/` alias
4. Type imports (when needed)

**Examples:**
```typescript
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Settings, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getStandingsAction } from '@/app/actions/stadium'
import { CardStack, CardStackItem } from '@/components/ui/card-stack'
```

**Path Aliases:**
- `@/*`: Project root (configured in `tsconfig.json`)
- `@/components/*`: UI components
- `@/lib/*`: Library utilities and core logic
- `@/app/*`: Next.js app directory

**Import Style:**
- Named imports preferred: `import { useState } from 'react'`
- Default imports for components: `import DashboardPage from '@/app/dashboard/page'`
- Type imports when needed: `import type { ScoutProPlayer } from '@/lib/types/player'`

## Error Handling

**Patterns:**
- Server Actions: try-catch with console.error, return empty/null on failure
- API calls: try-catch with descriptive error messages
- Silent failures: return empty arrays/objects instead of throwing

**Examples:**
```typescript
// Server Action pattern
export async function getStandingsAction(seasonId: string) {
  try {
    const client = getStadiumClient()
    const standings = await client.getStandings(seasonId)
    return standings
  } catch (error) {
    console.error('Get Standings Action Error:', error)
    return []
  }
}

// API client pattern with fallback
try {
  const data = await this.fetch<any>('/players/', { q: query })
  if (data.players && data.players.length > 0) {
    return data.players.map(...)
  }
} catch (error) {
  console.warn('[StadiumClient] Search API failed, using mock fallback:', error)
}
// Fallback to mock data
```

**Error Logging:**
- Console.error for failures: `console.error('Analysis Action Error:', error)`
- Console.warn for expected fallbacks: `console.warn('[StadiumClient] API failed')`
- Structured logging with context prefixes: `[StadiumClient]`, `[Action]`

## Logging

**Framework:** Console (native browser console)

**Patterns:**
- Debug logging: `console.log()` with context prefixes
- Error logging: `console.error()` for failures
- Warning logging: `console.warn()` for expected issues
- Structured prefixes for filtering: `[StadiumClient]`, `[Action]`, `[getPlayerDataAction]`

**When to log:**
- API responses (truncated): `JSON.stringify(data).substring(0, 200) + '...'`
- Data transformations and normalization
- Performance timing: `console.log('Request completed in ${elapsed}ms')`
- Debugging complex data structures: `console.log('Player stat array:', playerData.stat)`

## Comments

**When to Comment:**
- Complex business logic (scoring algorithms, normalization)
- Workarounds and fallback mechanisms
- API integration notes
- Temporary mock data sections

**JSDoc/TSDoc:**
- Not consistently used
- Function parameters: Minimal documentation
- Return types: Rely on TypeScript type annotations

**Examples:**
```typescript
/**
 * Fetches a player's photo URL directly from the player details endpoint.
 * The /players/{id}/ endpoint reliably returns the `photo` field unlike search results.
 */
export async function getPlayerPhotoAction(playerId: string): Promise<string | null>

// Normalize a name by converting all special characters to ASCII equivalents
function normalizeName(name: string): string
```

## Function Design

**Size:** Functions typically 20-80 lines, with server actions being longer (100+ lines)

**Parameters:**
- Minimal required parameters
- Optional parameters with defaults: `limit: number = 10`, `seasonId?: string`
- Type annotations for all parameters
- Interface objects for complex parameters: `{ player: ScoutProPlayer, club: ClubContext }`

**Return Values:**
- Explicit return types: `Promise<StadiumTeamDetail>`, `StadiumTeamDetail | null`
- Fallback values: Return empty arrays, null, or default objects on errors
- Consistent error handling: Never throw from server actions, return empty values

**Examples:**
```typescript
export async function getTeamDetailsAction(
  teamId: string,
  seasonId?: string
): Promise<StadiumTeamDetail | null>

export function calculateCompatibility(
  player: ScoutProPlayer,
  club: ClubContext
): CompatibilityResult
```

## Module Design

**Exports:**
- Named exports for functions: `export async function getStandingsAction()`
- Named exports for constants: `export const TOP_LEAGUES = [...]`
- Default exports for pages: `export default function DashboardPage()`
- Class exports: `export class StadiumClient`

**Barrel Files:** Not extensively used (no `index.ts` re-exports found)

**Organization:**
- Server actions: `app/actions/*.ts`
- API clients: `lib/stadium/client.ts`
- Types: `lib/types/*.ts`
- Utilities: `lib/utils.ts`
- Components: `components/scout/*.tsx`, `components/ui/*.tsx`

## TypeScript Specifics

**Strict Mode:** Enabled (`strict: true` in `tsconfig.json`)

**Type Definitions:**
- Interfaces for data models: `ScoutProPlayer`, `ClubContext`, `StadiumTeam`
- Union types for positions: `type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CM' | 'CDM' | 'CAM' | 'LW' | 'RW' | 'ST'`
- Generic types: `Promise<T>`, `Record<string, string>`

**Any Usage:**
- Used sparingly for API response parsing: `data.players.map((p: any) => ...)`
- Type assertions: `as any` for complex transformations
- Prefer explicit types over `any` when possible

## React Conventions

**Component Structure:**
- `'use client'` directive for client components
- Functional components with hooks
- Props interfaces defined at file level
- TypeScript for all props

**Hook Usage:**
- State: `useState()` for component state
- Effects: `useEffect()` for side effects and data fetching
- Custom hooks: Minimal usage (e.g., `useDebounce` from library)
- Refs: Not extensively used

**Pattern:**
```typescript
'use client'

export function PlayerForm({ initialData }: { initialData?: Partial<ScoutProPlayer> }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { ... }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Submitting Player Profile:', values)
  }

  return <Form>...</Form>
}
```

## Server Actions

**Directive:**
- `'use server'` for server-side functions
- File server actions in `app/actions/` directory

**Patterns:**
- Supabase client creation with `await createClient()`
- Authentication checks: `const { data: { user } } = await supabase.auth.getUser()`
- Cache invalidation: `revalidatePath('/watchlist')`
- Redirects for auth flows: `redirect('/dashboard')`

## CSS and Styling

**Tailwind CSS:**
- Utility-first approach
- Custom utilities in `globals.css`: `.glass-panel`, `.emerald-gradient`
- Dark mode support: `.dark` class variants
- Theme variables: CSS custom properties for colors

**Styling Patterns:**
- Responsive design: `md:`, `lg:` prefixes
- Dark mode variants: `dark:bg-zinc-900`, `dark:text-zinc-50`
- Motion/animations: Framer Motion for animations
- Glass morphism: Backdrop blur and transparency

**Class Organization:**
- `cn()` utility for merging classes
- Tailwind plugin for class sorting
- Semantic class naming for complex components

---

*Convention analysis: 2026-04-20*
