# Testing Patterns

**Analysis Date:** 2026-04-20

## Test Framework

**Runner:**
- Framework: **None configured** (no Jest, Vitest, or other test runners detected)
- Config files: Not present (`jest.config.*`, `vitest.config.*` not found)
- Test command: Not available (no test script in package.json)

**Assertion Library:**
- Not applicable (no test framework in use)

**Run Commands:**
```bash
# No test commands available
# package.json scripts include: dev, build, start, lint, format, typecheck
```

## Test File Organization

**Location:**
- **Not detected** - No test files found in the codebase
- No `__tests__` directories
- No `*.test.ts` or `*.spec.ts` files
- No separate test directories

**Naming:**
- No test naming conventions established

**Structure:**
- No test directory structure present

## Test Structure

**Suite Organization:**
- Not applicable - no test suites exist

**Patterns:**
- No setup/teardown patterns in use
- No assertion patterns established
- No test utilities or helpers

## Mocking

**Framework:** None (no test framework configured)

**Patterns:**
- Mock data used in production code for development: `mockPool` in `stadium/client.ts`
- API fallbacks: When API fails, falls back to mock player data
- Hardcoded test data: Mock clubs, players, and standings in action files

**What is Mocked:**
- API responses during development: Stadium API calls fall back to mock data
- External service dependencies: When `STADIUM_API_KEY` is missing or API fails

**Mock Data Pattern (Production Code):**
```typescript
// Mock Pool with verified IDs and photos from Stadium API
const mockPool: (StadiumPlayerBasic & { teamID?: string, league?: string, photo?: string })[] = [
  { playerID: '14633', firstName: 'Florian', lastName: 'Wirtz', fullName: 'Florian Wirtz', position: 'CAM', country: 'Germany', teamName: 'Bayer 04 Leverkusen', photo: 'https://api.stadium.com/media/bearleague/bl17158001911496.webp', teamID: '163', league: 'Bundesliga' },
  // ... more mock players
]

try {
  const data = await this.fetch<any>('/players/', { q: query })
  if (data.players && data.players.length > 0) {
    return data.players.map((p: any) => { ... })
  }
} catch (error) {
  console.warn('[StadiumClient] Search API failed, using mock fallback:', error)
}

// Falls back to mockPool.filter(p => ...)
```

**Mock Clubs in Analysis:**
```typescript
const mockClubs: ClubContext[] = [
  {
    id: '1',
    name: 'Arsenal',
    dna: { possession: 80, pressing: 85, tempo: 75 },
    needs: { ST: 90, RW: 40 },
    form: 85,
    historyMatch: 70,
  },
  // ... more mock clubs
]
```

## Fixtures and Factories

**Test Data:**
- No test fixtures or factories
- Hardcoded mock data embedded in production code
- Mock player pool: 30+ players in `lib/stadium/client.ts`
- Mock club data in `app/actions/analysis.ts`

**Location:**
- Inline in source files (not separate fixtures)
- `lib/stadium/client.ts`: Mock player pool
- `app/actions/analysis.ts`: Mock club context data
- `lib/coaches-data.ts`: Coach mapping data

## Coverage

**Requirements:** None enforced
- No coverage thresholds configured
- No coverage reporting tool integrated

**View Coverage:**
- Not available (no test runner configured)
- Commands: `npm run test` does not exist
- Coverage report: Not generated

## Test Types

**Unit Tests:**
- Status: **Not implemented**
- Scope: None
- Approach: N/A

**Integration Tests:**
- Status: **Not implemented**
- Scope: None
- Approach: N/A

**E2E Tests:**
- Framework: **Not used**
- Scope: None
- Approach: N/A

## Current Testing Approach

**Manual Testing:**
- Development mode: `npm run dev`
- Next.js hot reload for quick feedback
- Browser-based manual testing
- Console logging for debugging

**Type Checking:**
- TypeScript strict mode enabled
- Type checking command: `npm run typecheck`
- Catches type errors at compile time
- Provides some quality assurance

**Linting:**
- ESLint configured for Next.js
- Lint command: `npm run lint`
- Catches code style and potential errors
- TypeScript ESLint rules enabled

**Formatting:**
- Prettier configured for consistent code style
- Format command: `npm run format`
- Ensures consistent formatting across codebase
- Tailwind CSS plugin for class sorting

## Testing Gaps

**Critical Areas Without Tests:**

**Business Logic:**
- `lib/engine/scoring.ts`: Compatibility calculation algorithm
- `app/actions/analysis.ts`: Player analysis logic
- `app/actions/watchlist.ts`: Watchlist CRUD operations
- `app/actions/stadium.ts`: Complex API integration and normalization

**Data Transformations:**
- Player data normalization functions
- Position resolution logic
- Photo URL resolution
- Team data aggregation

**API Clients:**
- `lib/stadium/client.ts`: External API integration
- Error handling and fallback logic
- Response parsing and validation

**Authentication:**
- `app/auth/actions.ts`: Login/signup/logout flows
- Supabase authentication integration
- Session management

**Components:**
- All React components in `components/`
- Interactive components (drag-and-drop, forms)
- Dashboard and league pages

## Common Patterns (Missing)

**Async Testing:**
- Not applicable (no tests exist)
- Would need: Test async/await patterns, API calls, server actions

**Error Testing:**
- Not applicable (no tests exist)
- Would need: Test error handling, fallback logic, edge cases

## Quality Assurance Methods

**Manual QA Practices:**
- Manual testing in development environment
- Console logging for debugging
- Browser dev tools for inspection

**Code Review:**
- Git version control for change tracking
- Commit history shows manual testing verification
- No automated CI/CD testing pipeline detected

**Type Safety:**
- TypeScript strict mode provides compile-time checking
- Type annotations on all functions and components
- Zod schema validation in forms

## Recommendations

**Immediate Needs:**
1. Set up test framework (Jest or Vitest)
2. Write unit tests for business logic (scoring, analysis)
3. Write tests for data transformation functions
4. Add tests for API client error handling

**Medium Priority:**
1. Component testing for UI components
2. Integration tests for server actions
3. E2E tests for critical user flows (login, analysis, watchlist)

**Long-term:**
1. Code coverage reporting
2. CI/CD integration for automated testing
3. Mock data fixtures separation from production code
4. Test utilities and helpers

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

**Example Test Structure (Not Currently Present):**
```
lib/
  __tests__/
    engine/
      scoring.test.ts
    stadium/
      client.test.ts
app/
  __tests__/
    actions/
      analysis.test.ts
      watchlist.test.ts
components/
  __tests__/
    scout/
      player-form.test.ts
      kanban-board.test.ts
```

---

*Testing analysis: 2026-04-20*
