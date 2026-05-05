# Testing Patterns

**Analysis Date:** 2026-05-05

## Test Framework

**Runner:** Not configured

**Assertion Library:** Not configured

**Config:** None detected

**Status:** The codebase currently has **NO testing infrastructure** configured.

**Run Commands:**
```bash
# No test commands available in package.json
# Available scripts:
npm run dev              # Start development server
npm run dev:turbo        # Start with turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Run Prettier
npm run typecheck        # Run TypeScript type checking
```

## Test File Organization

**Location:** Not applicable - no test files exist

**Naming:** Not applicable

**Structure:**
```
# Current structure (no test directories)
src/
├── app/
│   ├── (dashboard)/
│   ├── actions/
│   ├── api/
│   └── auth/
├── components/
│   ├── dashboard/
│   ├── scout/
│   ├── scout-jobs/
│   └── ui/
├── hooks/
├── lib/
│   ├── engine/
│   ├── statorium/
│   ├── supabase/
│   ├── types/
│   └── utils/
└── middleware.ts

# Recommended structure for future testing
src/
├── app/
│   ├── __tests__/           # App route tests
│   ├── actions/
│   │   └── __tests__/       # Server action tests
│   └── api/
│       └── __tests__/       # API route tests
├── components/
│   ├── __tests__/           # Component tests
│   ├── dashboard/
│   │   └── __tests__/       # Dashboard component tests
│   ├── scout/
│   │   └── __tests__/       # Scout component tests
│   └── ui/
│       └── __tests__/       # UI component tests
├── hooks/
│   └── __tests__/           # Hook tests
├── lib/
│   ├── __tests__/           # Utility tests
│   ├── engine/
│   │   └── __tests__/       # Engine/scoring tests
│   ├── statorium/
│   │   └── __tests__/       # API client tests
│   └── supabase/
│       └── __tests__/       # Database tests
└── __tests__/               # Root-level integration tests
```

## Test Structure

**Suite Organization:** Not applicable

**Patterns:** Not applicable

**Setup pattern:** Not applicable

**Teardown pattern:** Not applicable

**Assertion pattern:** Not applicable

## Mocking

**Framework:** Not configured

**Patterns:** Not applicable

**What to Mock:** Not applicable

**What NOT to Mock:** Not applicable

## Fixtures and Factories

**Test Data:** Not applicable

**Location:** Not applicable

## Coverage

**Requirements:** None enforced

**View Coverage:** Not available

**Current Coverage:** 0% (no tests exist)

## Test Types

**Unit Tests:** Not implemented

**Integration Tests:** Not implemented

**E2E Tests:** Not implemented

**Manual Testing:** Currently the only testing approach

## Current Testing State

**Test Files Found:** 0 in `src/` directory

**Test Configuration Files:** 0
- No `jest.config.js` or `jest.config.ts`
- No `vitest.config.ts`
- No `cypress.config.ts` or `playwright.config.ts`
- No `.spec.ts` or `.test.ts` files in source code

**Dependencies:**
- No testing frameworks in `package.json`
- No assertion libraries (jest, vitest, @testing-library/react, etc.)
- No mocking libraries (msw, nock, etc.)
- No coverage tools (@vitest/coverage-v8, c8, etc.)

**CI/CD:**
- No GitHub Actions workflows detected (`.github/` directory doesn't exist)
- No automated test execution pipeline
- No pre-commit hooks for testing

**Manual Testing Tools:**
- TypeScript type checking (`npm run typecheck`)
- ESLint linting (`npm run lint`)
- Prettier formatting (`npm run format`)
- Development server (`npm run dev`)

## Testing Gaps

**Untested Areas:**

### Critical Business Logic (High Risk)

**Server Actions (`src/app/actions/`):**
- `statorium.ts` - 1,600+ lines, critical data fetching from external API
- `profile.ts` - User profile CRUD operations with Supabase
- `job-generation.ts` - AI-powered job offer generation
- `watchlist.ts` - User watchlist management (CRUD, status updates)
- `analysis.ts` - Player analysis and compatibility scoring
- `ai.ts` - AI integration with Anthropic Claude
- `sync.ts` - Data synchronization logic
- `scouting-hints.ts` - Scouting hint generation
- `refresh-stats.ts` - Statistics refresh logic

**API Routes (`src/app/api/`):**
- `chat/route.ts` - AI chat endpoint with streaming
- `market-value/[playerName]/route.ts` - Transfermarkt web scraping
- `valuation/route.ts` - Player valuation API
- `migrate-watchlist/route.ts` - Data migration endpoint

### Core Engine Logic (High Risk)

**Scoring & Algorithms (`src/lib/engine/`):**
- `scoring.ts` - Player-club compatibility algorithm (30% tactical, 25% positional, etc.)
- `benchmark.ts` - Player benchmarking and normalization
- No unit tests for mathematical calculations

### External API Clients (High Risk)

**Statorium API (`src/lib/statorium/`):**
- `client.ts` - External API client with authentication
- No tests for API response handling
- No tests for error scenarios
- No tests for data normalization

**Transfermarkt Integration (`src/lib/`):**
- `transfermarkt.ts` - Web scraping logic
- No tests for scraping resilience
- No tests for parsing edge cases

### Database Operations (Medium Risk)

**Supabase Client (`src/lib/supabase/`):**
- `server.ts` - Server-side Supabase client
- `client.ts` - Client-side Supabase client
- No tests for authentication flow
- No tests for RLS policies

**Migrations (`src/lib/supabase/*.sql`):**
- 18 SQL migration files
- No tests for migration safety
- No tests for data integrity

### Components (Medium Risk)

**Dashboard Components (137 total files):**
- 28 UI components in `src/components/ui/`
- 25+ scout components in `src/components/scout/`
- 10+ dashboard components
- Complex components like:
  - `notifications-panel.tsx` (19,299 bytes)
  - `dashboard-client.tsx` (6,971 bytes)
  - Various scout job components

**Feature Components:**
- `player-avatar.tsx` - Image loading and error handling
- `sidebar.tsx` - Navigation and routing
- `theme-toggle.tsx` - Theme switching with hydration
- No component tests for user interactions
- No tests for error states
- No tests for responsive behavior

### Hooks (Medium Risk)

**Custom Hooks (`src/hooks/`):**
- `use-home-team.ts` - LocalStorage persistence
- `use-market-value.ts` - API data fetching with caching
- No tests for hook behavior
- No tests for cleanup and unmounting
- No tests for error handling

### Utilities (Low Risk)

**Helper Functions (`src/lib/`):**
- `utils.ts` - `cn()` utility for class merging
- `league-utils.ts` - League data extraction
- `custom-theme.ts` - Theme color conversion
- `rss-feeds.ts` - RSS parsing (85+ lines)
- `twitter-integration.ts` - Twitter API integration
- No unit tests for pure functions

### Data Files (Low Risk)

**Static Data:**
- `statorium-data.ts` - 150KB of constants and mappings
- `europe-map-data.ts` - 168KB of geographic data
- `coaches-data.ts` - Coach information
- No tests for data consistency
- No tests for mapping correctness

## Recommended Testing Setup

**For Next.js 15 with TypeScript, recommended stack:**

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react happy-dom

# Install mocking libraries
npm install -D msw @vitest/coverage-v8

# Install E2E testing (optional but recommended)
npm install -D @playwright/test
```

**Configuration Files Needed:**

1. **`vitest.config.ts`** - Vitest configuration for Next.js
2. **`src/test/setup.ts`** - Test setup with @testing-library
3. **`src/test/mocks/handlers.ts`** - MSW handlers for API mocking
4. **`playwright.config.ts`** - E2E testing configuration (optional)

**Recommended Test Structure:**

```typescript
// Example: src/app/actions/__tests__/profile.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateProfile, getProfileData } from '../profile'
import { createClient } from '@/lib/supabase/server'

describe('Profile Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const formData = new FormData()
      formData.append('fullName', 'Test User')
      formData.append('bio', 'Test bio')

      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }) },
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: '123', full_name: 'Test User' }, error: null })
      }

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const result = await updateProfile(formData)

      expect(result.success).toBe(true)
      expect(result.data.full_name).toBe('Test User')
    })

    it('should handle unauthenticated users', async () => {
      const formData = new FormData()
      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') }) }
      }

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const result = await updateProfile(formData)

      expect(result.error).toBe('User not authenticated')
    })

    it('should handle database errors', async () => {
      const formData = new FormData()
      formData.append('fullName', 'Test User')

      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }) },
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
      }

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const result = await updateProfile(formData)

      expect(result.error).toBe('Database error')
    })
  })

  describe('getProfileData', () => {
    it('should fetch and return profile data', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockProfile = { id: '123', full_name: 'Test User' }

      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) },
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
      }

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const result = await getProfileData()

      expect(result).toBeDefined()
      expect(result?.full_name).toBe('Test User')
    })

    it('should create profile if it does not exist', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockNewProfile = { id: '123', full_name: 'test' }

      const mockSupabase = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) },
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
          .mockResolvedValueOnce({ data: null, error: new Error('Profile not found') })
          .mockResolvedValueOnce({ data: mockNewProfile, error: null }),
        insert: vi.fn().mockReturnThis()
      }

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const result = await getProfileData()

      expect(result).toBeDefined()
      expect(mockSupabase.insert).toHaveBeenCalled()
    })
  })
})
```

## Common Patterns (To Be Implemented)

**Async Testing:**
```typescript
it('should fetch data asynchronously', async () => {
  const result = await fetchData()
  expect(result).toBeDefined()
})

it('should handle loading state', async () => {
  const { result } = renderHook(() => useCustomHook())
  expect(result.current.isLoading).toBe(true)

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })
})
```

**Error Testing:**
```typescript
it('should handle errors', async () => {
  vi.spyOn(api, 'get').mockRejectedValue(new Error('Failed'))
  await expect(fetchData()).rejects.toThrow('Failed')
})

it('should return fallback value on error', async () => {
  vi.spyOn(api, 'get').mockRejectedValue(new Error('Failed'))
  const result = await fetchData()
  expect(result).toEqual([])
})
```

**Component Testing:**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))

    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  it('should show loading state', () => {
    render(<Button loading>Loading...</Button>)
    expect(screen.getByText('Loading...')).toBeDisabled()
  })
})
```

**Hook Testing:**
```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { useHomeTeam } from '@/hooks/use-home-team'

describe('useHomeTeam', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should load home team from localStorage', () => {
    const team = { id: '1', name: 'Test Team', logo: 'logo.png', seasonId: '123' }
    localStorage.setItem('scoutpro_home_team', JSON.stringify(team))

    const { result } = renderHook(() => useHomeTeam())

    expect(result.current.homeTeam).toEqual(team)
  })

  it('should save home team to localStorage', () => {
    const { result } = renderHook(() => useHomeTeam())

    const team = { id: '1', name: 'Test Team', logo: 'logo.png', seasonId: '123' }

    act(() => {
      result.current.selectHomeTeam(team)
    })

    expect(localStorage.getItem('scoutpro_home_team')).toBe(JSON.stringify(team))
  })
})
```

**API Route Testing:**
```typescript
import { POST } from '@/app/api/chat/route'
import { NextRequest } from 'next/server'

describe('Chat API', () => {
  it('should return streaming response', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] })
    })

    const response = await POST(req)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
  })

  it('should handle errors', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: 'invalid json'
    })

    const response = await POST(req)

    expect(response.status).toBe(500)
  })
})
```

## Testing Priorities

**High Priority (Critical Business Logic):**
1. **Server Actions** (`src/app/actions/`)
   - `profile.ts` - User authentication and profile management
   - `statorium.ts` - External API data fetching
   - `watchlist.ts` - Core user functionality
   - `analysis.ts` - Business logic algorithms

2. **API Routes** (`src/app/api/`)
   - `chat/route.ts` - AI integration point
   - `market-value/[playerName]/route.ts` - External API scraping

3. **Engine Logic** (`src/lib/engine/`)
   - `scoring.ts` - Core compatibility algorithm
   - `benchmark.ts` - Data normalization

**Medium Priority (State & UI):**
1. **Hooks** (`src/hooks/`)
   - `use-home-team.ts` - State persistence
   - `use-market-value.ts` - Data fetching with caching

2. **Complex Components**
   - `notifications-panel.tsx` - User notifications
   - Dashboard components with user interactions

3. **External API Clients**
   - `statorium/client.ts` - API client resilience
   - `transfermarkt.ts` - Web scraping logic

**Low Priority (Simple UI & Data):**
1. **Simple UI Components** (`src/components/ui/`)
   - Button, Card, Input components (already tested by shadcn/ui)

2. **Static Components**
   - Display-only components without state

3. **Data Files**
   - Static data consistency checks

## Mocking Strategy (Recommended)

**External APIs:**
```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('https://api.statorium.com/api/v1/search', () => {
    return HttpResponse.json({
      data: [
        { playerID: '1', fullName: 'Test Player' }
      ]
    })
  }),

  http.get('https://api.anthropic.com/v1/messages', () => {
    return HttpResponse.json({
      content: [{ text: 'AI response' }]
    })
  })
]
```

**Supabase Mock:**
```typescript
// src/test/mocks/supabase.ts
import { vi } from 'vitest'

export const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn()
  },
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  delete: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(),
  order: vi.fn(() => mockSupabase)
}
```

**Environment Variables:**
```typescript
import { vi } from 'vitest'

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'test-url')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-key')
  vi.stubEnv('STATORIUM_API_KEY', 'test-api-key')
})

afterEach(() => {
  vi.unstubAllEnvs()
})
```

**Browser APIs:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true
  }
})

// src/test/setup.ts
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

global.localStorage = localStorageMock as any
```

## CI/CD Integration (Recommended)

**GitHub Actions Workflow:**

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type check
        run: npm run typecheck

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Generate coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

**Pre-commit Hook (Recommended):**

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run typecheck && npm run lint && npm run test -- --run"
    }
  }
}
```

## Current Validation

**Type Checking:**
```bash
npm run typecheck
# Runs: tsc --noEmit
# Provides compile-time type safety
# Catches type errors before runtime
```

**Linting:**
```bash
npm run lint
# Runs: eslint
# Catches code quality issues
# Enforces Next.js best practices
```

**Formatting:**
```bash
npm run format
# Runs: prettier --write "**/*.{ts,tsx}"
# Ensures consistent code style
# Auto-fixes formatting issues
```

**Current Quality Assurance:**
- TypeScript strict mode catches type errors
- ESLint with Next.js config catches code quality issues
- Prettier ensures consistent formatting
- Manual testing in development environment
- No automated test suite
- No code coverage tracking

## Test Data Management (Recommended)

**Fixtures Directory:**
```
src/test/fixtures/
├── players.json
├── teams.json
├── leagues.json
└── profiles.json
```

**Example Fixtures:**
```typescript
// src/test/fixtures/players.json
{
  "validPlayer": {
    "id": "1",
    "name": "Test Player",
    "age": 25,
    "position": "MF",
    "club": "Test Club",
    "stats": {
      "offensive": { "goals": 10, "assists": 5, "xG": 8.5, "xA": 4.2, "keyPasses": 30 },
      "defensive": { "tackles": 20, "interceptions": 15, "aerialWins": 10, "clearances": 25 },
      "physical": { "distance": 10.5, "sprints": 30, "stamina": 85 },
      "tactical": { "dribbles": 15, "progressivePasses": 25, "passAccuracy": 88, "pressing": 75 }
    }
  },
  "minimalPlayer": {
    "id": "2",
    "name": "Minimal Player",
    "age": 20,
    "position": "GK",
    "club": "Test Club",
    "stats": { "offensive": {}, "defensive": {}, "physical": {}, "tactical": {} }
  }
}
```

## Performance Testing (Recommended)

**Load Testing:**
```typescript
import { describe, it, expect } from 'vitest'

describe('Performance Tests', () => {
  it('should calculate compatibility quickly', () => {
    const start = performance.now()
    const result = calculateCompatibility(player, club)
    const duration = performance.now() - start

    expect(duration).toBeLessThan(10) // Should complete in < 10ms
    expect(result.totalScore).toBeGreaterThan(0)
  })

  it('should handle large player lists efficiently', () => {
    const players = Array(1000).fill(mockPlayer)
    const start = performance.now()

    const results = players.map(p => calculateCompatibility(p, club))

    const duration = performance.now() - start
    expect(duration).toBeLessThan(1000) // Should handle 1000 players in < 1s
  })
})
```

## Accessibility Testing (Recommended)

**A11y Testing:**
```typescript
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>)
    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })
})
```

## Testing Best Practices (To Implement)

**Test Naming:**
- Use `describe` for test suites
- Use `it` or `test` for individual tests
- Names should describe behavior, not implementation
- Use `should` for expectations

**Test Structure (AAA Pattern):**
```typescript
it('should update user profile', async () => {
  // Arrange
  const formData = new FormData()
  formData.append('fullName', 'Test User')

  // Act
  const result = await updateProfile(formData)

  // Assert
  expect(result.success).toBe(true)
  expect(result.data.full_name).toBe('Test User')
})
```

**Test Isolation:**
- Each test should be independent
- Use `beforeEach`/`afterEach` for setup/teardown
- Clear mocks between tests
- Don't rely on test execution order

**Test Coverage Goals:**
- Aim for 80%+ coverage on critical paths
- 100% coverage on pure functions (utilities)
- Focus on edge cases and error handling
- Don't chase 100% for the sake of it

## Next Steps for Testing Implementation

**Phase 1: Setup (Week 1)**
1. Install Vitest and testing libraries
2. Configure `vitest.config.ts`
3. Set up MSW for API mocking
4. Create test setup file
5. Add test scripts to package.json

**Phase 2: Critical Path Tests (Week 2-3)**
1. Write tests for server actions (profile, statorium)
2. Write tests for API routes
3. Write tests for engine logic (scoring, benchmark)
4. Add tests for Supabase client mocking

**Phase 3: Component & Hook Tests (Week 4)**
1. Write tests for custom hooks
2. Write tests for complex components
3. Add integration tests for user flows

**Phase 4: CI/CD & Coverage (Week 5)**
1. Set up GitHub Actions workflow
2. Add coverage reporting
3. Configure coverage thresholds
4. Add pre-commit hooks

**Phase 5: Maintenance (Ongoing)**
1. Update tests with new features
2. Monitor coverage metrics
3. Refactor tests as needed
4. Document testing patterns

---

*Testing analysis: 2026-05-05*
