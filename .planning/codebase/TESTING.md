# Testing Patterns

**Analysis Date:** 2026-04-21

## Test Framework

**Runner:**
- Framework: **None configured** (no Jest, Vitest, or other test runners detected)
- Config files: Not present (`jest.config.*`, `vitest.config.*` not found)
- Test command: Not available (no test script in package.json)
- Available scripts: `dev`, `build`, `start`, `lint`, `format`, `typecheck`

**Assertion Library:**
- Not applicable (no test framework in use)

**Run Commands:**
```bash
# No test commands available
# package.json scripts include:
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run typecheck    # TypeScript type checking
```

## Test File Organization

**Location:**
- **Not detected** - No test files found in codebase
- No `__tests__` directories in any part of the codebase
- No `*.test.ts` or `*.spec.ts` files (only found in node_modules dependencies)
- No separate test directories
- Test search found 0 test files in the main codebase

**Naming:**
- No test naming conventions established
- No consistent test file patterns observed

**Structure:**
- No test directory structure present
- Components and actions have no associated test files
- Business logic files have no test coverage

## Test Structure

**Suite Organization:**
- Not applicable - no test suites exist

**Patterns:**
- No setup/teardown patterns in use
- No assertion patterns established
- No test utilities or helpers
- No test fixtures or factories

**Current status:**
- All codebase testing is manual through development server
- No automated test infrastructure exists
- No test-driven development practices observed

## Mocking

**Framework:** None (no test framework configured)

**Patterns:**
- Mock data used in production code for development: `mockPool` in `lib/statorium/client.ts`
- API fallbacks: When API fails, falls back to mock player data
- Hardcoded test data: Mock clubs, players, and standings in action files
- Mock data embedded directly in production code

**What is Mocked:**
- API responses during development: Statorium API calls fall back to mock data
- External service dependencies: When `STATORIUM_API_KEY` is missing or API fails
- Player data: 30+ mock players with verified IDs and photos
- Club data: Mock club contexts for analysis functionality

**Mock Data Pattern (Production Code):**
```typescript
// Mock Pool with verified IDs and photos from Statorium API
const mockPool: (StatoriumPlayerBasic & { teamID?: string, league?: string, photo?: string })[] = [
  { playerID: '14633', firstName: 'Florian', lastName: 'Wirtz', fullName: 'Florian Wirtz', position: 'CAM', country: 'Germany', teamName: 'Bayer 04 Leverkusen', photo: 'https://api.statorium.com/media/bearleague/bl17158001911496.webp', teamID: '163', league: 'Bundesliga' },
  { playerID: '6466', firstName: 'Jude', lastName: 'Bellingham', fullName: 'Jude Bellingham', position: 'CM', country: 'England', teamName: 'Real Madrid', photo: 'https://api.statorium.com/media/bearleague/bl1695891720352.webp', teamID: '37', league: 'La Liga' },
  { playerID: '53041', firstName: 'Lamine', lastName: 'Yamal', fullName: 'Lamine Yamal', position: 'RW', country: 'Spain', teamName: 'FC Barcelona', photo: 'https://api.statorium.com/media/bearleague/bl17322791692175.webp', teamID: '23', league: 'La Liga' },
  // ... 27 more mock players
]

try {
  const data = await this.fetch<any>('/players/', { q: query })
  if (data.players && data.players.length > 0) {
    return data.players.map((p: any) => { ... })
  }
} catch (error) {
  console.warn('[StatoriumClient] Search API failed, using mock fallback:', error)
}

// Falls back to mockPool.filter(p => ...)
```

**Mock Clubs in Analysis:**
```typescript
// This would be loop-based in production, but for MVP we mock some clubs
// to verify the engine without hitting API limits during dev
const mockClubs: ClubContext[] = [
  {
    id: '1',
    name: 'Arsenal',
    dna: { possession: 80, pressing: 85, tempo: 75 },
    needs: { ST: 90, RW: 40 },
    form: 85,
    historyMatch: 70,
  },
  {
    id: '2',
    name: 'Dortmund',
    dna: { possession: 60, pressing: 90, tempo: 95 },
    needs: { ST: 70, CB: 80 },
    form: 65,
    historyMatch: 85,
  }
]
```

## Fixtures and Factories

**Test Data:**
- No test fixtures or factories
- Hardcoded mock data embedded in production code
- Mock player pool: 30+ players in `lib/statorium/client.ts`
- Mock club data in `app/actions/analysis.ts`
- Coach mapping data in `lib/coaches-data.ts`

**Location:**
- Inline in source files (not separate fixtures)
- `lib/statorium/client.ts`: Mock player pool with 30 players
- `app/actions/analysis.ts`: Mock club context data (2 clubs)
- `lib/coaches-data.ts`: Coach mapping constants
- No dedicated test fixtures directory

**Data Types:**
- Player fixtures: Complete StatoriumPlayerBasic objects
- Club fixtures: ClubContext interfaces with DNA and needs
- Coach data: COACH_MAP constant for coach name mapping

## Coverage

**Requirements:** None enforced
- No coverage thresholds configured
- No coverage reporting tool integrated
- No coverage measurement in place

**View Coverage:**
- Not available (no test runner configured)
- Commands: `npm run test` does not exist
- Coverage report: Not generated
- Coverage tracking: Not implemented

## Test Types

**Unit Tests:**
- Status: **Not implemented**
- Scope: None
- Approach: N/A
- Would cover: Individual functions, utility functions, business logic

**Integration Tests:**
- Status: **Not implemented**
- Scope: None
- Approach: N/A
- Would cover: Database operations, API integrations, multi-component flows

**E2E Tests:**
- Framework: **Not used**
- Scope: None
- Approach: N/A
- Would cover: Complete user flows, critical paths

## Current Testing Approach

**Manual Testing:**
- Development mode: `npm run dev`
- Next.js hot reload for quick feedback
- Browser-based manual testing
- Console logging for debugging
- Manual verification of functionality

**Type Checking:**
- TypeScript strict mode enabled
- Type checking command: `npm run typecheck`
- Catches type errors at compile time
- Provides some quality assurance
- Strict mode enforces type safety

**Linting:**
- ESLint configured for Next.js
- Lint command: `npm run lint`
- Catches code style and potential errors
- TypeScript ESLint rules enabled
- Next.js-specific rules included

**Formatting:**
- Prettier configured for consistent code style
- Format command: `npm run format`
- Ensures consistent formatting across codebase
- Tailwind CSS plugin for class sorting
- Automatic code formatting

**Debugging Practices:**
- Extensive console logging (178 console statements in app directory)
- Prefix-based logging: `FunctionName: Context message`
- Browser DevTools for debugging
- React DevTools for component inspection
- Network tab for API debugging

## Testing Gaps

**Critical Areas Without Tests:**

**Business Logic:**
- `lib/engine/scoring.ts`: Compatibility calculation algorithm (calculateCompatibility function)
- `app/actions/analysis.ts`: Player analysis logic
- `lib/engine/benchmark.ts`: Percentile calculation and benchmarking
- Weighted scoring algorithms: 5-category scoring system

**Data Transformations:**
- `app/actions/statorium.ts`: Complex API integration and normalization (781 lines)
- Player data normalization functions (normalizeName, resolvePosition)
- Photo URL resolution (resolvePlayerPhoto)
- Team data aggregation and transformation
- Standing data parsing and mapping

**Database Operations:**
- `app/actions/profile.ts`: Profile CRUD operations (225 lines)
- `app/actions/watchlist.ts`: Watchlist management (167 lines)
- `app/actions/refresh-stats.ts`: Statistics refresh logic
- Supabase query building and error handling
- Data validation and sanitization

**Authentication:**
- `app/auth/actions.ts`: Login/signup/logout flows (49 lines)
- Supabase authentication integration
- Session management
- Protected route handling

**API Clients:**
- `lib/statorium/client.ts`: External API integration (180 lines)
- Error handling and fallback logic
- Response parsing and validation
- API rate limiting and caching

**Components:**
- All React components in `components/`
- Interactive components (drag-and-drop, forms)
- Dashboard and league pages
- UI components (Card, Button, Input, etc.)
- Complex components like KanbanBoard, PlayerSearch, AiNarrative

**State Management:**
- React hooks usage (useState, useEffect)
- State transitions and updates
- Form handling and validation
- Loading states and error handling

## Common Patterns (Missing)

**Async Testing:**
- Not applicable (no tests exist)
- Would need: Test async/await patterns, API calls, server actions
- Async component mounting and data fetching
- Race condition handling
- Timeout and retry logic

**Error Testing:**
- Not applicable (no tests exist)
- Would need: Test error handling, fallback logic, edge cases
- Network failure scenarios
- API error responses
- Invalid input handling
- Database constraint violations

**State Testing:**
- Not applicable (no tests exist)
- Would need: Component state updates, form submissions
- React hooks testing
- State synchronization
- Side effect handling

## Quality Assurance Methods

**Manual QA Practices:**
- Manual testing in development environment
- Console logging for debugging
- Browser dev tools for inspection
- User flow testing by developers
- Manual regression testing

**Code Review:**
- Git version control for change tracking
- Commit history shows manual testing verification
- No automated CI/CD testing pipeline detected
- Manual code review process

**Type Safety:**
- TypeScript strict mode provides compile-time checking
- Type annotations on all functions and components
- Zod schema validation in forms
- Interface definitions for complex data structures

**Code Quality Tools:**
- ESLint for linting and code quality
- Prettier for code formatting
- TypeScript for type safety
- No pre-commit hooks detected
- No automated quality gates

## Recommendations

**Immediate Needs:**
1. Set up test framework (Jest or Vitest for this codebase)
2. Write unit tests for business logic (scoring, analysis)
3. Write tests for data transformation functions
4. Add tests for API client error handling
5. Create test utilities and helpers

**Medium Priority:**
1. Component testing for UI components
2. Integration tests for server actions
3. E2E tests for critical user flows (login, analysis, watchlist)
4. Set up test coverage reporting
5. Separate mock data from production code

**Long-term:**
1. Code coverage reporting with thresholds
2. CI/CD integration for automated testing
3. Mock data fixtures separation from production code
4. Test utilities and helpers
5. Performance testing
6. Accessibility testing

## Testing Infrastructure Requirements

**To Add Testing:**
1. Install test framework: `npm install -D vitest @testing-library/react @testing-library/jest-dom`
2. Create `vitest.config.ts` configuration
3. Add test scripts to `package.json`:
   ```json
   "test": "vitest",
   "test:ui": "vitest --ui",
   "test:coverage": "vitest --coverage"
   ```
4. Create `__tests__` directories alongside source files
5. Separate mock data from production code into fixtures
6. Set up test environment for Next.js App Router

**Example Test Structure (Not Currently Present):**
```
lib/
  __tests__/
    engine/
      scoring.test.ts        # Compatibility calculation tests
      benchmark.test.ts       # Percentile calculation tests
    statorium/
      client.test.ts         # API client tests
      formation-service.test.ts
    utils/
      geocoding.test.ts
app/
  __tests__/
    actions/
      analysis.test.ts       # Analysis action tests
      watchlist.test.ts      # Watchlist CRUD tests
      profile.test.ts        # Profile management tests
    auth/
      actions.test.ts        # Auth flow tests
components/
  __tests__/
    scout/
      player-form.test.ts    # Form component tests
      player-search.test.ts  # Search component tests
      kanban-board.test.ts   # Drag-and-drop tests
      ai-narrative.test.ts   # AI streaming component tests
    ui/
      button.test.ts         # UI component tests
      card.test.ts
```

**Example Test Cases (Not Currently Present):**
```typescript
// lib/engine/scoring.test.ts
import { describe, it, expect } from 'vitest'
import { calculateCompatibility } from '../scoring'
import { ScoutProPlayer } from '../../types/player'

describe('calculateCompatibility', () => {
  it('calculates total score correctly', () => {
    const player: ScoutProPlayer = {
      // ... player data
    }
    const club: ClubContext = {
      // ... club data
    }
    const result = calculateCompatibility(player, club)
    expect(result.totalScore).toBeGreaterThan(0)
    expect(result.totalScore).toBeLessThanOrEqual(100)
  })

  it('calculates breakdown scores correctly', () => {
    const player: ScoutProPlayer = { /* ... */ }
    const club: ClubContext = { /* ... */ }
    const result = calculateCompatibility(player, club)
    expect(result.breakdown.tactical).toBeGreaterThan(0)
    expect(result.breakdown.positional).toBeGreaterThan(0)
    expect(result.breakdown.stats).toBeGreaterThan(0)
  })
})

// app/actions/watchlist.test.ts
import { describe, it, expect } from 'vitest'
import { addToWatchlist, removeFromWatchlist } from '../watchlist'

describe('watchlist actions', () => {
  it('adds player to watchlist', async () => {
    const playerData = {
      player_id: '123',
      player_name: 'Test Player',
      // ... other fields
    }
    const result = await addToWatchlist(playerData)
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('removes player from watchlist', async () => {
    const result = await removeFromWatchlist('123')
    expect(result.success).toBe(true)
  })
})
```

## Risk Assessment

**High Risk Areas (No Tests):**
1. Business logic algorithms (scoring, compatibility)
2. Database operations (CRUD, migrations)
3. Authentication flows
4. API integrations with external services
5. Data transformation and normalization

**Medium Risk Areas:**
1. UI components and user interactions
2. Form handling and validation
3. State management
4. Error handling and edge cases

**Low Risk Areas:**
1. Static UI components
2. Utility functions (simple transformations)
3. Type definitions

---

*Testing analysis: 2026-04-21*