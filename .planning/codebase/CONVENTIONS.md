# Coding Conventions

**Analysis Date:** 2026-05-04

## Naming Patterns

**Files:**
- **Components:** kebab-case (e.g., `fit-radar-chart.tsx`, `player-search.tsx`)
- **Utilities:** kebab-case (e.g., `transfermarkt.ts`, `geocoding.ts`)
- **Hooks:** kebab-case with `use-` prefix (e.g., `use-home-team.ts`, `use-market-value.ts`)
- **Types:** kebab-case in types directories (e.g., `player.ts`, `statorium/types.ts`)
- **Actions:** kebab-case (e.g., `statorium.ts`, `job-generation.ts`)

**Functions:**
- **Components:** PascalCase for function names (e.g., `function FitRadarChart()`, `export function PlayerSearch()`)
- **Hooks:** camelCase with `use` prefix (e.g., `export function useHomeTeam()`, `export function useMarketValue()`)
- **Utilities:** camelCase (e.g., `export function getMarketValue()`, `export function cn()`)
- **Actions:** camelCase (e.g., `export async function searchPlayersAction()`, `export async function getStandingsAction()`)

**Variables:**
- camelCase for all variables (e.g., `const [mounted, setMounted] = useState(false)`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `const BASE_URL = 'https://api.statorium.com/api/v1'`, `const CACHE_TTL = 10 * 60 * 1000`)
- React state: camelCase with setters (e.g., `const [results, setResults] = React.useState<StatoriumPlayerBasic[]>([])`)

**Types:**
- Interfaces: PascalCase (e.g., `export interface MarketValueData`, `export interface HomeTeam`)
- Type aliases: PascalCase (e.g., `export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CM' | 'CDM' | 'CAM' | 'LW' | 'RW' | 'ST'`)
- Enums: Not used in codebase

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
- **Ignores:** `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

**TypeScript:**
- **Strict mode:** enabled
- **Target:** ES2022
- **Module:** ESNext with bundler resolution
- **Path aliases:** `@/*` maps to `./src/*`
- **JSX:** preserve

## Import Organization

**Order:**
1. React and core framework imports
2. Third-party library imports
3. Internal imports (using `@/` alias)
4. Relative imports

**Path Aliases:**
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/components/ui` → `src/components/ui`
- `@/hooks` → `src/hooks`

**Examples:**
```typescript
// React and core
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// Third-party
import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from 'lucide-react'
import axios from 'axios'

// Internal
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { StatoriumPlayerBasic } from '@/lib/statorium/types'
import { searchPlayersAction } from '@/app/actions/statorium'
```

**Named exports preferred:**
```typescript
export function PlayerSearch({ ... }) { ... }
export { Button, buttonVariants }
```

## Error Handling

**Patterns:**
- **Try-catch for async operations:** Wrap external API calls in try-catch
- **Console.error for errors:** Use `console.error()` with descriptive messages
- **Return fallback values:** Functions return null/empty arrays on error
- **Server Actions:** Error thrown and caught by caller

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
```

## Logging

**Framework:** console (native browser/node console)

**Patterns:**
- **Debug logging:** `console.log()` with context prefixes like `[StatoriumClient]`
- **Error logging:** `console.error()` with descriptive messages
- **Warning logging:** `console.warn()` for non-critical issues
- **Context labels:** Use brackets to indicate source (e.g., `[Statorium Action]`, `[StatoriumClient]`)

**Examples:**
```typescript
console.log(`[StatoriumClient] Data from ${endpoint}:`, JSON.stringify(data).substring(0, 200) + '...')
console.warn('[StatoriumClient] Search API failed:', error)
console.error(`Scraper Error [${playerName}]:`, error)
```

**Note:** Extensive console logging present (352 occurrences across 53 files). Consider implementing proper logging framework for production.

## Comments

**When to Comment:**
- JSDoc/TSDoc for exported functions and interfaces
- Inline comments for complex logic or workarounds
- TODO comments for future work
- Section dividers for related functionality

**JSDoc/TSDoc:**
```typescript
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

## Function Design

**Size:** No strict size limit observed. Functions range from 10-200+ lines. Large files include:
- `europe-map-data.ts`: 8,785 lines (data export)
- `statorium-data.ts`: 1,759 lines (constants and mappings)
- `statorium.ts`: 1,604 lines (server actions)

**Parameters:**
- Destructured props for components: `function FitRadarChart({ playerFitData, overallFit = 88 }: FitRadarChartProps)`
- Interface definitions for complex props
- Default values provided in parameter lists

**Return Values:**
- Functions return typed values
- Fallback values on error (null, empty arrays, 'N/A')
- Server Actions return data or throw errors
- API routes return `NextResponse.json()`

**Examples:**
```typescript
// Component with props
export function PlayerSearch({ onSelect, placeholder, initialQuery = '', context }: PlayerSearchProps) { ... }

// Hook returning object
export function useHomeTeam() {
  const [homeTeam, setHomeTeam] = useState<HomeTeam | null>(null);
  return { homeTeam, selectHomeTeam, isLoaded };
}

// Utility with return type
export async function getMarketValue(playerName: string): Promise<MarketValueData> { ... }
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
export function FitRadarChart({ ... }) { ... }
export function PlayerSearch({ ... }) { ... }

// UI component with multiple exports
export { Button, buttonVariants }
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
```

## React-Specific Conventions

**Client Components:**
- Marked with `'use client'` directive at top of file
- Used for interactive components with useState, useEffect
- Examples: `player-search.tsx`, `theme-toggle.tsx`, `fit-radar-chart.tsx`

**Server Components:**
- No directive (default in Next.js 15)
- Used for pages and data-fetching components
- Examples: `dashboard/page.tsx`, `statorium.ts` (server actions)

**Server Actions:**
- Marked with `'use server'` directive
- Async functions that can be called from client
- Examples: All files in `src/app/actions/`

**State Management:**
- React hooks (useState, useEffect) for local state
- Custom hooks for reusable logic
- Supabase for database state
- No Redux or Context API used extensively

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

// Server action
"use server";
export async function searchPlayersAction(query: string): Promise<StatoriumPlayerBasic[]> { ... }
```

## Tailwind CSS Conventions

**Class Organization:**
- Handled by prettier-plugin-tailwindcss (automatic sorting)
- Utility-first approach
- Custom variants via `cn()` helper

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
```

## File Structure Conventions

**App Router:**
- Pages in `src/app/` directory
- Route groups in parentheses: `(dashboard)/`
- Dynamic routes in brackets: `[id]/`, `[playerName]/`
- Server actions in `src/app/actions/`
- API routes in `src/app/api/`

**Components:**
- Reusable UI components in `src/components/ui/` (shadcn/ui)
- Feature components in subdirectories: `src/components/scout/`, `src/components/dashboard/`
- Each component in its own file

**Lib:**
- Utilities in `src/lib/`
- External service clients in `src/lib/statorium/`, `src/lib/supabase/`
- Types in `src/lib/types/`
- Helper utilities in `src/lib/utils/`

---

*Convention analysis: 2026-05-04*
