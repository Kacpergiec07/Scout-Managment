# Testing Patterns

**Analysis Date:** 2026-05-04

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
├── components/
├── hooks/
├── lib/
└── middleware.ts

# Recommended structure for future testing
src/
├── app/
│   ├── __tests__/           # App route tests
│   └── actions/
│       └── __tests__/       # Server action tests
├── components/
│   └── __tests__/           # Component tests
├── hooks/
│   └── __tests__/           # Hook tests
├── lib/
│   └── __tests__/           # Utility tests
└── __tests__/               # Root-level tests
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

**CI/CD:**
- No GitHub Actions workflows detected
- No automated test execution pipeline

## Testing Gaps

**Untested Areas:**

**Server Actions (`src/app/actions/`):**
- `statorium.ts` - 1,604 lines, critical data fetching logic
- `job-generation.ts` - AI job offer generation
- `watchlist.ts` - User watchlist management
- `profile.ts` - User profile operations
- `analysis.ts` - Player analysis logic
- `ai.ts` - AI integration
- `sync.ts` - Data synchronization

**API Routes (`src/app/api/`):**
- `market-value/[playerName]/route.ts` - Transfermarkt scraping
- `valuation/route.ts` - Player valuation
- `chat/route.ts` - AI chat endpoint
- No API route tests

**Components (137 total files):**
- 28 UI components in `src/components/ui/`
- 25 scout components in `src/components/scout/`
- No component tests

**Hooks (`src/hooks/`):**
- `use-home-team.ts` - Home team state management
- `use-market-value.ts` - Market value fetching
- No hook tests

**Libraries (`src/lib/`):**
- `statorium/client.ts` - External API client
- `transfermarkt.ts` - Web scraping logic
- `engine/scoring.ts` - Scoring algorithms
- `engine/benchmark.ts` - Benchmarking logic
- No unit tests

## Recommended Testing Setup

**For Next.js 15 with TypeScript, recommended stack:**

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react

# Install mocking libraries
npm install -D msw

# Install coverage tools
npm install -D @vitest/coverage-v8
```

**Configuration Files Needed:**

1. **`vitest.config.ts`** - Vitest configuration
2. **`src/test/setup.ts`** - Test setup with @testing-library
3. **`src/test/mocks/handlers.ts`** - MSW handlers for API mocking

**Recommended Test Structure:**

```typescript
// Example: src/app/actions/__tests__/statorium.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchPlayersAction } from '../statorium'
import { StatoriumClient } from '@/lib/statorium/client'

describe('searchPlayersAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array for empty query', async () => {
    const result = await searchPlayersAction('')
    expect(result).toEqual([])
  })

  it('should fetch and return players', async () => {
    // Mock implementation
    const mockPlayers = [
      { playerID: '1', fullName: 'Test Player' }
    ]
    
    vi.spyOn(StatoriumClient.prototype, 'searchPlayers')
      .mockResolvedValue(mockPlayers)
    
    const result = await searchPlayersAction('test')
    expect(result).toEqual(mockPlayers)
  })

  it('should handle API errors gracefully', async () => {
    vi.spyOn(StatoriumClient.prototype, 'searchPlayers')
      .mockRejectedValue(new Error('API Error'))
    
    const result = await searchPlayersAction('test')
    expect(result).toEqual([])
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
```

**Error Testing:**
```typescript
it('should handle errors', async () => {
  vi.spyOn(api, 'get').mockRejectedValue(new Error('Failed'))
  await expect(fetchData()).rejects.toThrow('Failed')
})
```

**Component Testing:**
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

## Testing Priorities

**High Priority:**
1. Server actions (critical business logic)
2. API routes (external integrations)
3. Utility functions (pure functions, easy to test)

**Medium Priority:**
1. Hooks (state management)
2. Complex components (user interactions)
3. Scoring/engine logic (`src/lib/engine/`)

**Low Priority:**
1. Simple UI components (visual components)
2. Static components (display-only)

## Mocking Strategy (Recommended)

**External APIs:**
- Mock `StatoriumClient` in tests
- Use MSW for HTTP requests to external services
- Mock Supabase client for database operations

**Environment Variables:**
- Use `vi.stubEnv()` or `.env.test` file
- Mock `process.env.STATORIUM_API_KEY`

**Browser APIs:**
- Use `jsdom` environment
- Mock localStorage, fetch, etc.

## CI/CD Integration (Recommended)

**GitHub Actions Workflow:**

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run test:coverage
```

## Current Validation

**Type Checking:**
```bash
npm run typecheck
# Runs: tsc --noEmit
# Provides compile-time type safety
```

**Linting:**
```bash
npm run lint
# Runs: eslint
# Catches code quality issues
```

**Formatting:**
```bash
npm run format
# Runs: prettier --write "**/*.{ts,tsx}"
# Ensures consistent code style
```

These tools provide some quality assurance but do not replace actual tests.

---

*Testing analysis: 2026-05-04*
