# Coding Conventions

**Analysis Date:** 2026-04-27

## Naming Patterns

**Files:**
- **Components**: kebab-case for component files (`player-search.tsx`, `ai-narrative.tsx`, `kanban-board.tsx`, `home-team-selector.tsx`)
- **Pages**: `page.tsx` for Next.js App Router pages, organized in route groups
- **Server Actions**: kebab-case (`profile.ts`, `watchlist.ts`, `analysis.ts`, `statorium.ts`, `sync.ts`)
- **Utilities**: kebab-case (`utils.ts`, `geocoding.ts`, `benchmark.ts`)
- **Types**: TypeScript interfaces use PascalCase, defined in `lib/types/` directories
- **Page Routes**: Organized in route groups like `(dashboard)/profile/page.tsx`
- **Hooks**: kebab-case with `use-` prefix (`use-market-value.ts`, `use-home-team.ts`)

**Functions:**
- **Server Actions**: camelCase with descriptive names (`getProfileData`, `updateProfile`, `addToWatchlist`, `removeFromWatchlist`, `syncPlayerData`)
- **Helper Functions**: camelCase (`cn`, `calculateCompatibility`, `normalizeName`, `resolvePosition`)
- **Component Functions**: PascalCase for React components (`PlayerSearch`, `AiNarrative`, `Card`, `Button`, `HomeTeamSelector`)
- **Export Functions**: camelCase for utility exports (`getStatoriumClient`, `searchPlayersAction`, `getStandingsAction`)
- **Event Handlers**: camelCase (`handleProfileUpdate`, `handleNotificationUpdate`, `toggleTheme`, `selectHomeTeam`)
- **Hook Functions**: camelCase with `use` prefix (`useHomeTeam`, `useMarketValue`)

**Variables:**
- camelCase for all variables (`user`, `loading`, `profileData`, `watchlist`, `query`, `homeTeam`)
- Constants: SCREAMING_SNAKE_CASE for configuration constants (`COACH_MAP`, `POSITION_MAP`, `POSITION_OVERRIDE`, `LEAGUE_CONFIGS`)
- State variables: camelCase with descriptive names (`setUser`, `setLoading`, `setStats`, `setSaveStatus`, `setHomeTeam`)
- Boolean flags: `isLoading`, `isMounted`, `isActive`, `isLoaded`

**Types:**
- Interfaces: PascalCase with descriptive names (`UserProfile`, `ScoutProPlayer`, `ClubContext`, `CompatibilityResult`, `StatoriumTeam`, `HomeTeam`)
- Type unions: PascalCase with pipe-separated values (`Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CM' | 'CDM' | 'CAM' | 'LW' | 'RW' | 'ST'`)
- Generic types: PascalCase single letters or descriptive names (`T`, `ClassValue`, `StadiumPlayerBasic`)
- Type aliases: PascalCase for type definitions (`PlayerSearchProps`, `AiNarrativeProps`)

## Code Style

**Formatting:**
- **Tool**: Prettier with Tailwind CSS plugin
- **Configuration** (`.prettierrc`):
  - Line endings: `lf`
  - Semicolons: `false` (no semicolons)
  - Quotes: Double quotes (singleQuote: `false`)
  - Tab width: 2 spaces
  - Trailing commas: `es5`
  - Print width: 80 characters
- **Custom plugins**: `prettier-plugin-tailwindcss` with Tailwind functions: `cn`, `cva`
- **Tailwind stylesheet**: `app/globals.css`

**Linting:**
- **Tool**: ESLint with Next.js configuration
- **Configuration** (`eslint.config.mjs`):
  - Uses `eslint-config-next/core-web-vitals` for strict rules
  - Uses `eslint-config-next/typescript` for TypeScript support
  - Custom ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`
- **TypeScript**: Strict mode enabled (`"strict": true`)
- **ESLint**: Run with `npm run lint`
- **Type checking**: Run with `npm run typecheck`

## Import Organization

**Order:**
1. React and core framework imports
2. Third-party library imports
3. Local component imports (from `@/components/`)
4. Local utility imports (from `@/lib/`)
5. Type imports (mixed with regular imports)
6. Action imports (from `@/app/actions/`)
7. Hook imports (from `@/hooks/`)

**Path Aliases:**
- `@/*`: Root directory alias configured in `tsconfig.json`
- Example: `@/lib/utils`, `@/components/ui/button`, `@/app/actions/profile`, `@/hooks/use-home-team`
- All imports use the `@/` alias pattern consistently

**Import patterns observed:**
```typescript
// Framework imports first
import * as React from "react"
import { useRouter } from "next/navigation"
import { revalidatePath } from 'next/cache'

// Third-party libraries
import { motion } from 'framer-motion'
import { useDebounce } from 'use-debounce'
import Image from 'next/image'

// Local components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { HomeTeamSelector } from '@/components/scout/home-team-selector'

// Local utilities
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"

// Hooks
import { useHomeTeam } from '@/hooks/use-home-team'
import { useMarketValue } from '@/hooks/use-market-value'

// Actions
import { getProfileData } from "@/app/actions/profile"
import { searchPlayersAction } from "@/app/actions/statorium"
```

## Error Handling

**Patterns:**
- **Server Actions**: Always wrap in try-catch blocks, return error objects
- **Error Logging**: Extensive console.error logging with context (78+ files with console statements)
- **Error Returns**: Return objects with `{ error: string }` structure
- **Error User Messages**: User-friendly error messages returned to client
- **Error Object Structure**: Includes error details (message, code, details, hint)

**Error handling pattern from `app/actions/profile.ts`:**
```typescript
try {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('UpdateProfile: Database error:', error)
    console.error('UpdateProfile: Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    return { error: error.message }
  }

  return { success: true, data: {...} }
} catch (error) {
  console.error('UpdateProfile: Unexpected error:', error)
  return { error: 'An unexpected error occurred' }
}
```

**Authentication errors:**
- Check for user errors before proceeding with database operations
- Return specific error messages: `'User not authenticated'`
- Console error with descriptive prefixes: `'UpdateProfile: User not authenticated'`

**Silent failures:**
- Return empty arrays: `return []` for watchlist operations
- Return null: `return null` for profile data failures
- Never throw from server actions, always return error objects

**Hook error handling:**
```typescript
// From use-home-team.ts
useEffect(() => {
  const stored = localStorage.getItem('scoutpro_home_team');
  if (stored) {
    try {
      setHomeTeam(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to parse home team from localStorage', e);
    }
  }
  setIsLoaded(true);
}, []);
```

## Logging

**Framework:** Console logging throughout codebase (37 files with console statements)

**Patterns:**
- **Debug Logging**: Extensive logging prefixed with function names
- **Prefix Convention**: `FunctionName: Contextual message` format
- **Error Logging**: `console.error()` with structured error details
- **Success Logging**: `console.log()` for successful operations
- **Data Logging**: Truncated JSON data logging for debugging
- **Hook Logging**: Error logging in custom hooks for localStorage operations

**Logging patterns observed:**
```typescript
// Entry point logging
console.log('getProfileData: Starting profile data fetch...')
console.log('getWatchlist: Starting watchlist fetch...')

// State logging
console.log('UpdateProfile: Profile data to update:', profileData)
console.log('getWatchlist: User authenticated, fetching watchlist...', user.id)

// Error logging
console.error('UpdateProfile: Database error:', error)
console.error('UpdateProfile: Error details:', {
  message: error.message,
  code: error.code,
  details: error.details,
  hint: error.hint
})

// Success logging
console.log('UpdateProfile: Profile updated successfully:', data)
console.log('getWatchlist: Watchlist fetched successfully:', watchlist?.length || 0)

// Hook error logging
console.error('Failed to parse home team from localStorage', e);

// Data logging (truncated)
console.log('[StatoriumClient] Data from ${endpoint}:', JSON.stringify(data).substring(0, 200) + '...')
```

**Logging levels:**
- `console.log()`: General information, state changes, data flow
- `console.error()`: Errors, failures, exceptions
- `console.warn()`: Warnings, fallbacks, degraded functionality
- Console logging appears throughout all server actions and client components

## Comments

**When to Comment:**
- **Complex Logic**: Multi-step operations or calculations
- **Algorithm Explanations**: Mathematical formulas or scoring algorithms
- **Data Transformations**: Complex data normalization or mapping
- **API Fallbacks**: Comments explaining mock data or fallback behavior
- **Component Purpose**: Brief descriptions of component functionality
- **Performance Optimizations**: Comments explaining caching, memoization, or optimization strategies

**JSDoc/TSDoc:**
- **Not extensively used**: Minimal JSDoc documentation in codebase
- **Interface Comments**: Some interfaces have inline comments for fields
- **Function Comments**: Rare, mostly inline comments instead

**Comment patterns observed:**
```typescript
// Only add statistics fields if they have values
const yearsExperience = formData.get('yearsExperience')
if (yearsExperience) {
  profileData.years_experience = parseInt(yearsExperience as string)
}

// Fetch profile data
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

// If profile doesn't exist, create it
console.log('getProfileData: Profile not found, attempting to create...')

// Count players on watchlist - use auth.uid() for current user
console.log('getProfileData: Using user.id:', user.id)

// Performance optimization: memo to prevent unnecessary re-renders
const DynamicLeagueCard = React.memo(function DynamicLeagueCard({ league, isActive }: { league: LeagueConfig, isActive: boolean }) {
  // ...
})

// Even slower for better performance
interval = setInterval(() => {
  setClubIndex((prev) => (prev + 1) % league.clubs.length)
}, 5000)
```

**Algorithm comments:**
```typescript
// 1. Tactical (30%) - Based on DNA match
const tacticalScore = Math.max(0, 100 - (
  Math.abs(player.stats.tactical.pressing - club.dna.pressing) +
  Math.abs(player.stats.tactical.progressivePasses - club.dna.possession)
) / 2)

// 2. Positional (25%)
const positionalScore = club.needs[player.position] || 50
```

## Function Design

**Size:** No strict size limits, but server actions typically 50-200 lines
- **Large files**: `app/actions/statorium.ts` (781 lines) - complex API integration
- **Medium files**: `app/actions/profile.ts` (225 lines) - profile management
- **Small files**: `app/actions/analysis.ts` (59 lines) - focused analysis logic
- **Action files range**: 37-781 lines
- **Component files**: Can be large for complex UI (e.g., `dashboard-client.tsx` at 319 lines)

**Parameters:**
- **Server Actions**: FormData objects for form submissions, typed parameters for API calls
- **Component Props**: Interface-defined props with optional fields
- **Helper Functions**: Specific parameters with clear types
- **Event Handlers**: Typed with React event types
- **Hook Parameters**: Minimal parameters, typically configuration objects or simple values

**Parameter patterns:**
```typescript
// Server action with FormData
export async function updateProfile(formData: FormData)

// Server action with typed parameters
export async function getCompatibilityAnalysis(player: ScoutProPlayer)

// Server action with optional parameters
export async function getTeamDetailsAction(teamId: string, seasonId?: string)

// Component props with interface
export interface PlayerSearchProps {
  onSelect?: (player: StatoriumPlayerBasic) => void
  placeholder?: string
}

// Event handlers
const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()
}

// Hook with interface
export interface HomeTeam {
  id: string;
  name: string;
  logo: string;
  seasonId: string;
}

export function useHomeTeam() {
  // ...
}
```

**Return Values:**
- **Server Actions**: Object pattern with `{ success: boolean, data?: any, error?: string }`
- **Async Functions**: Typed return values with interfaces
- **Component Functions**: React elements or component references
- **Helper Functions**: Primitive values or complex objects
- **Hooks**: Object pattern with state and functions `{ homeTeam, selectHomeTeam, isLoaded }`

**Return value patterns:**
```typescript
// Server action success return
return {
  success: true,
  data: {
    ...profileData,
    email: user.email
  }
}

// Server action error return
return { error: 'User not authenticated' }

// Data fetching returns
return profile || []
return watchlist || []
return null

// Typed function returns
export function calculateCompatibility(
  player: ScoutProPlayer,
  club: ClubContext
): CompatibilityResult {
  return {
    totalScore,
    breakdown: {...}
  }
}

// Hook returns
return { homeTeam, selectHomeTeam, isLoaded };
```

## Module Design

**Exports:**
- **Named Exports**: Primary pattern for functions and utilities
- **Default Exports**: Used for React components and page exports
- **Type Exports**: Interfaces and types exported alongside functions

**Barrel Files:**
- **UI Components**: Individual exports from component files
- **Utilities**: Direct exports from utility modules
- **No barrel files observed**: Each module exports its own symbols

**Export patterns observed:**
```typescript
// Named exports for functions
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatoriumClient() {
  const key = process.env.STATORIUM_API_KEY
  if (!key) throw new Error('STATORIUM_API_KEY not found in environment')
  return new StatoriumClient(key)
}

// Multiple named exports from components
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

// Type exports
export interface UserProfile {
  id: string
  full_name: string | null
  email: string
}

// Default exports for pages/components
export default function ProfilePage() {
  return <div>...</div>
}

// Named component exports with functions
export function PlayerSearch({ onSelect, placeholder }: PlayerSearchProps) {
  return <div>...</div>
}

// Hook exports
export function useHomeTeam() {
  // ...
  return { homeTeam, selectHomeTeam, isLoaded };
}
```

## Server/Client Architecture

**Directives:**
- **Server Actions**: `'use server'` directive at top of action files
- **Client Components**: `'use client'` directive at top of component files
- **Page Components**: Both server and client pages depending on interactivity needs
- **Total Directives**: 37 files with 'use client' or 'use server' directives

**Server Action Patterns:**
- All server actions use `'use server'` directive
- Server actions handle database operations, API calls, and authentication
- Server actions return JSON-serializable objects
- Server actions use `revalidatePath()` for cache invalidation
- Server actions use `redirect()` for navigation

**Client Component Patterns:**
- Interactive components use `'use client'` directive
- Client components use React hooks (useState, useEffect, useDebounce)
- Client components call server actions directly
- Client components manage local state and UI interactions
- Client components handle form submissions
- Client components use custom hooks for reusable state logic

**Component organization:**
- **Dashboard pages**: Client components with `'use client'` directive
- **Action files**: Server actions with `'use server'` directive
- **UI components**: Generally client components but can be used in both contexts
- **Page components**: Can be server components (for data fetching) or client components (for interactivity)

**Examples:**
```typescript
// Server action
'use server'
export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // ... logic
}

// Client component
'use client'
export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  // ... logic
}

// Custom hook (implicitly client)
'use client'
export function useHomeTeam() {
  const [homeTeam, setHomeTeam] = useState<HomeTeam | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  // ... logic
  return { homeTeam, selectHomeTeam, isLoaded };
}
```

## React Patterns

**Component Structure:**
- **Functional Components**: Only functional components used (no class components)
- **Hooks**: Extensive use of React hooks (useState, useEffect, useDebounce, custom hooks)
- **Composition**: Component composition patterns for UI elements
- **Props Interface**: Component props defined as TypeScript interfaces
- **Performance Optimization**: Use of React.memo for expensive components

**State Management:**
- **Local State**: useState for component-level state
- **Server Actions**: Direct calls from client components
- **Context**: useTheme hook for theme management
- **Custom Hooks**: Reusable state logic (useHomeTeam, useMarketValue)
- **No Redux**: No global state management library observed

**Key React patterns:**
```typescript
// Client component with state and effects
'use client'
export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    async function loadProfileData() {
      setLoading(true)
      try {
        const profileData = await getProfileData()
        if (profileData) {
          setUser(profileData as UserProfile)
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
      setLoading(false)
    }
    loadProfileData()
  }, [])
}

// Performance-optimized component with React.memo
const DynamicLeagueCard = React.memo(function DynamicLeagueCard({ league, isActive }: { league: LeagueConfig, isActive: boolean }) {
  const [clubIndex, setClubIndex] = React.useState(0)

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && league.clubs && league.clubs.length > 0) {
      interval = setInterval(() => {
        setClubIndex((prev) => (prev + 1) % league.clubs.length)
      }, 5000) // Even slower for better performance
    }
    return () => clearInterval(interval)
  }, [isActive, league.id, league.clubs?.length])

  // ... component logic
})

// Custom hook pattern
export function useHomeTeam() {
  const [homeTeam, setHomeTeam] = useState<HomeTeam | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('scoutpro_home_team');
    if (stored) {
      try {
        setHomeTeam(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse home team from localStorage', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const selectHomeTeam = (team: HomeTeam | null) => {
    setHomeTeam(team);
    if (team) {
      localStorage.setItem('scoutpro_home_team', JSON.stringify(team));
    } else {
      localStorage.removeItem('scoutpro_home_team');
    }
  };

  return { homeTeam, selectHomeTeam, isLoaded };
}
```

## TypeScript Patterns

**Type Safety:**
- **Strict Mode**: TypeScript strict mode enabled
- **Type Annotations**: Function parameters and return values typed
- **Interface Definitions**: Clear interfaces for complex data structures
- **Type Guards**: Limited type guard usage observed
- **Type Inference**: Relies on TypeScript inference where possible

**Type Definition Patterns:**
```typescript
// Union types for constrained values
export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CM' | 'CDM' | 'CAM' | 'LW' | 'RW' | 'ST'

// Interface for complex objects
export interface UserProfile {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  role: string | null
  notification_preferences: {
    email_alerts: boolean
    push_notifications: boolean
    player_updates: boolean
    transfer_alerts: boolean
    weekly_reports: boolean
  }
}

// Optional fields with proper typing
export interface PlayerSearchProps {
  onSelect?: (player: StatoriumPlayerBasic) => void
  placeholder?: string
}

// Record types for key-value data
export interface ClubContext {
  id: string
  name: string
  dna: {
    possession: number
    pressing: number
    tempo: number
  }
  needs: {
    [position: string]: number
  }
  form: number
  historyMatch: number
}

// Hook interface pattern
export interface HomeTeam {
  id: string;
  name: string;
  logo: string;
  seasonId: string;
}
```

## Styling Patterns

**Tailwind CSS:**
- **Utility-first**: Tailwind utility classes for all styling
- **Responsive Design**: Mobile-first responsive patterns
- **Custom Utilities**: `cn()` function for conditional classes
- **Component Variants**: class-variance-authority (cva) for button variants
- **Dark Mode**: Dark mode support through next-themes
- **Performance**: Optimized class names and minimal inline styles

**Styling patterns:**
```typescript
// Utility function for conditional classes
import { cn } from "@/lib/utils"

// Class merging
className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "outline" && "outline-classes"
)}

// Tailwind responsive design
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"

// Dark mode support
className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"

// Component variants
const buttonVariants = cva(
  "base-button-classes",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border-border bg-background hover:bg-muted",
      },
      size: {
        default: "h-8 px-2.5",
        sm: "h-7 px-2 text-sm",
      },
    },
  }
)

// Performance-optimized styling with inline styles for dynamic values
style={{ background: `radial-gradient(ellipse at center, ${league.stormTint} 0%, transparent 80%)` }}
```

## Supabase Patterns

**Client Creation:**
- **Server Side**: Use `await createClient()` from `@/lib/supabase/server`
- **Authentication**: Check user before operations: `await supabase.auth.getUser()`
- **Database Operations**: Chainable query builder pattern
- **Error Handling**: Check for errors in response objects

**Supabase patterns observed:**
```typescript
// Server action with Supabase
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'User not authenticated' }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile', 'layout')
  return { success: true, data }
}
```

## Performance Patterns

**Optimization Techniques:**
- **React.memo**: Used for expensive components (DynamicLeagueCard)
- **useEffect cleanup**: Proper cleanup of intervals and subscriptions
- **Conditional rendering**: Early returns to avoid unnecessary rendering
- **Debouncing**: useDebounce hook for API calls and search
- **Image optimization**: Next.js Image component with proper sizing
- **Code splitting**: Dynamic imports where appropriate

**Performance patterns observed:**
```typescript
// React.memo for expensive components
const DynamicLeagueCard = React.memo(function DynamicLeagueCard({ league, isActive }: { league: LeagueConfig, isActive: boolean }) {
  // Component logic
})

// Proper useEffect cleanup
React.useEffect(() => {
  let interval: NodeJS.Timeout;
  if (isActive && league.clubs && league.clubs.length > 0) {
    interval = setInterval(() => {
      setClubIndex((prev) => (prev + 1) % league.clubs.length)
    }, 5000)
  }
  return () => clearInterval(interval)
}, [isActive, league.id, league.clubs?.length])

// Early returns for performance
if (!league.clubs || league.clubs.length === 0) return null;

// Next.js Image optimization
<Image
  src={activeClub.teamLogo}
  alt={activeClub.teamName}
  fill
  sizes="(max-width: 768px) 100vw, 500px"
  className="object-contain"
  priority={isActive}
/>
```

## Data Fetching Patterns

**Server-Side Fetching:**
- **Parallel fetching**: Use Promise.all for concurrent API calls
- **Server components**: Fetch data in server components when possible
- **Client-side fetching**: Use custom hooks for interactive data
- **Caching**: Implement local caching in hooks (useMarketValue)
- **Error handling**: Graceful fallbacks and error states

**Data fetching patterns:**
```typescript
// Server-side parallel fetching
export default async function DashboardPage() {
  const leaguesData = await Promise.all(
    LEAGUE_CONFIGS.map(async (config) => {
      const standings = await getStandingsAction(config.id)
      let topClubs = standings || []
      return { ...config, clubs: topClubs }
    })
  )
  return <DashboardClient initialLeagues={leaguesData} />
}

// Client-side data fetching with caching
const localCache: Record<string, MarketValueData> = {};

export function useMarketValue(playerName: string) {
  const [data, setData] = useState<MarketValueData | null>(() => {
    if (playerName && localCache[playerName]) {
      return localCache[playerName];
    }
    return null;
  });

  useEffect(() => {
    if (localCache[playerName]) {
      setData(localCache[playerName]);
      setIsLoading(false);
      return;
    }
    // Fetch and cache data
  }, [playerName]);
}
```

---

*Convention analysis: 2026-04-27*
