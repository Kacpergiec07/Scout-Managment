# Codebase Concerns

**Analysis Date:** 2026-05-04

## Tech Debt

**Hardcoded Coach Data:**
- Issue: Coach information is manually maintained in `src/lib/coaches-data.ts` with 111 hardcoded entries
- Files: `src/lib/coaches-data.ts`
- Impact: Data becomes outdated quickly, requires manual updates when coaches change teams
- Fix approach: Implement automated coach data fetching from Statorium API once endpoint becomes available, or set up scheduled data refresh jobs

**Large Monolithic Action File:**
- Issue: `statorium.ts` contains 1,604 lines with 27+ server actions handling multiple concerns
- Files: `src/app/actions/statorium.ts`
- Impact: Difficult to maintain, test, and understand; violates single responsibility principle
- Fix approach: Split into domain-specific modules (players, teams, matches, leagues) with clear separation of concerns

**Massive Map Data File:**
- Issue: `europe-map-data.ts` contains 8,785 lines of hardcoded coordinate data
- Files: `src/lib/europe-map-data.ts`
- Impact: Large bundle size, unnecessary loading for pages that don't need map data
- Fix approach: Move to separate chunk with dynamic import, consider external API for map data

**Duplicate Notification Components:**
- Issue: Three versions of notification components exist: `notifications-bell.tsx`, `notifications-bell-new.tsx`, `notifications-bell-optimized.tsx` and corresponding panels
- Files: `src/components/notifications-bell*.tsx`, `src/components/notifications-panel*.tsx`
- Impact: Code duplication, maintenance burden, unclear which version is active
- Fix approach: Consolidate to single implementation, remove unused versions

## Known Bugs

**RSS Feed Parsing Reliability:**
- Symptoms: Polish football RSS feeds marked as unreliable, may fail to fetch or parse
- Files: `src/lib/rss-feeds.ts`
- Trigger: Attempting to fetch news from Polish sources (Meczyki.pl, Weszło, Transfery.info)
- Workaround: System falls back to international sources (Sky Sports, BBC, ESPN)
- Impact: Limited news coverage for Polish football market

**Stadium API Inconsistencies:**
- Symptoms: API responses have nested structures in unpredictable locations (e.g., standings in `data.standings`, `data.season.standings`, or `data.league.standings`)
- Files: `src/lib/statorium/client.ts:74-98`
- Trigger: Fetching standings or match data
- Workaround: Multiple fallback paths to extract data
- Impact: Fragile data extraction, may break with API changes

**Transfermarkt Scraping Fragility:**
- Symptoms: Web scraping depends on HTML structure that may change
- Files: `src/lib/transfermarkt.ts`
- Trigger: Any UI changes to transfermarkt.com
- Workaround: None currently, returns "N/A" on failure
- Impact: Market value data becomes unavailable

## Security Considerations

**API Keys in URL Parameters:**
- Risk: Statorium API key exposed in URL query parameters visible in logs and potentially cached
- Files: `src/app/actions/statorium.ts:1303`, `src/lib/statorium/client.ts:17`
- Current mitigation: None
- Recommendations: Move API key to Authorization header, ensure logs don't contain full URLs with keys

**Client-Side localStorage Without Validation:**
- Risk: User preferences stored in localStorage without schema validation could cause runtime errors if corrupted
- Files: `src/hooks/use-home-team.ts`, `src/lib/custom-theme.ts`
- Current mitigation: Try-catch blocks around JSON.parse
- Recommendations: Implement schema validation (Zod) before using localStorage data

**RSS Feed XSS Risk:**
- Risk: RSS feed content may contain malicious HTML/JavaScript
- Files: `src/lib/rss-feeds.ts:145-150` (regex-based XML parsing)
- Current mitigation: None explicit, regex parsing is fragile
- Recommendations: Use proper XML parser (e.g., fast-xml-parser) with HTML sanitization

**Twitter API Bearer Token Exposure:**
- Risk: NEXT_PUBLIC_TWITTER_BEARER_TOKEN exposed to client if set
- Files: `src/lib/twitter-integration.ts:44`
- Current mitigation: None
- Recommendations: Move Twitter calls to server-side API routes, never use NEXT_PUBLIC_ prefix

**Missing Input Validation:**
- Risk: User inputs from search forms not validated before API calls
- Files: Multiple action files accepting player/league IDs
- Current mitigation: Basic TypeScript typing
- Recommendations: Add Zod validation schemas for all user inputs

## Performance Bottlenecks

**Serial API Requests in Player Fetching:**
- Problem: Fetching all league players makes sequential API calls for each team
- Files: `src/app/actions/statorium.ts:910-949` (fetchAllLeaguePlayersAction)
- Cause: Loop through teams, await each squad fetch
- Improvement path: Use Promise.all() with batching, implement parallel fetching with rate limiting

**Inefficient Client-Side Re-renders:**
- Problem: Large client components (1,177 line watchlist page) cause unnecessary re-renders
- Files: `src/app/(dashboard)/watchlist/page.tsx`, `src/app/(dashboard)/compare/page.tsx`
- Cause: Missing React.memo, improper state management
- Improvement path: Component splitting, memoization, useReducer for complex state

**No Data Pagination:**
- Problem: Fetching entire datasets (all players, all matches) without pagination
- Files: `src/app/actions/statorium.ts:910` (fetchAllLeaguePlayersAction)
- Cause: APIs support but don't enforce pagination
- Improvement path: Implement infinite scroll or virtualized lists, load data on demand

**Large Bundle Size:**
- Problem: 38,317 lines of TypeScript in src/ directory, many client components
- Cause: Too many "use client" directives (80+ files), large static data files
- Improvement path: Code splitting, lazy loading, move static data to API endpoints

**Missing Caching Strategy:**
- Problem: In-memory GLOBAL_CACHE only lasts 10 minutes, no persistent cache
- Files: `src/app/actions/statorium.ts:21-22`
- Cause: Simple Map-based cache without persistence
- Improvement path: Implement Redis or database-backed cache with proper TTL

## Fragile Areas

**External API Dependencies:**
- Files: `src/lib/statorium/client.ts`, `src/lib/transfermarkt.ts`, `src/lib/rss-feeds.ts`, `src/lib/twitter-integration.ts`
- Why fragile: All functionality depends on third-party services with no SLA guarantees
- Safe modification: Add circuit breakers, fallback data, graceful degradation
- Test coverage: Minimal, mostly integration tests missing

**Type Inference with `any` Types:**
- Files: `src/lib/statorium/client.ts:74-98`, `src/app/actions/statorium.ts:873`, `src/app/actions/statorium.ts:913`
- Why fragile: Heavy use of `any` type loses TypeScript benefits, prone to runtime errors
- Safe modification: Define proper interfaces for API responses, remove `as any` casts
- Test coverage: Type checking catches some issues, but runtime validation missing

**console.log in Production:**
- Files: 351 occurrences across 52 files
- Why fragile: Debug logging clutters production, may expose sensitive data, impacts performance
- Safe modification: Replace with proper logging library (winston/pino) with environment-based levels
- Test coverage: None

**Regex-based XML Parsing:**
- Files: `src/lib/rss-feeds.ts:146-150` (itemRegex pattern matching)
- Why fragile: Cannot handle malformed XML, attribute variations, nested structures
- Safe modification: Replace with fast-xml-parser or similar proper XML parser
- Test coverage: Basic tests may pass, but edge cases unhandled

## Scaling Limits

**Stadium API Rate Limiting:**
- Current capacity: Unknown rate limits, appears to be making many sequential calls
- Limit: Likely to hit rate limits with concurrent users
- Scaling path: Implement request queuing, caching, and batch operations

**Client-Side State Management:**
- Current capacity: All state in individual components, no global state management
- Limit: Will cause performance issues with large datasets
- Scaling path: Implement Zustand or Redux for global state, server components for data fetching

**File System Caching:**
- Current capacity: Uses scratch/ directory for file-based caching
- Limit: Doesn't work in serverless environments (Vercel, AWS Lambda)
- Scaling path: Move to database-backed caching or Redis

**Supabase Query Optimization:**
- Current capacity: No visible query optimization or indexing strategy
- Limit: Will degrade with large user bases
- Scaling path: Implement query optimization, database indexes, connection pooling

## Dependencies at Risk

**Cheerio Web Scraping:**
- Risk: Web scraping is brittle, violates terms of service, may be blocked
- Impact: Transfermarkt market values will stop working
- Migration plan: Negotiate API access with Transfermarkt or find alternative data provider

**Three.js and React Three Fiber:**
- Risk: Heavy bundle size (500KB+), complex 3D rendering may cause performance issues
- Impact: Slow load times, poor performance on mobile devices
- Migration plan: Consider lighter alternatives or lazy load only when needed

**Multiple AI SDKs:**
- Risk: Using both @anthropic-ai/sdk and @ai-sdk/openai increases complexity
- Impact: Higher bundle size, potential version conflicts
- Migration plan: Standardize on single AI SDK provider

**Axios with Cheerio:**
- Risk: Combined for scraping, but Axios adds unnecessary weight for simple fetch operations
- Impact: Larger bundle size for functionality that could use native fetch
- Migration plan: Replace Axios with native fetch API where possible

## Missing Critical Features

**Error Boundary Implementation:**
- Problem: No React Error Boundaries to catch component errors
- Blocks: Graceful error handling, user experience when components fail
- Files: Throughout src/components/

**Loading States for Data Fetching:**
- Problem: Inconsistent loading states across components, some missing entirely
- Blocks: Good UX during data loading
- Files: Multiple client components

**Form Validation:**
- Problem: Client-side forms lack comprehensive validation
- Blocks: Data integrity, user feedback on invalid inputs
- Files: `src/components/scout/player-form.tsx`, `src/app/(dashboard)/settings/page.tsx`

**Accessibility Features:**
- Problem: Missing ARIA labels, keyboard navigation support, screen reader optimization
- Blocks: Accessibility compliance, inclusive design
- Files: Throughout UI components

**Test Coverage:**
- Problem: No test files found in src/ directory
- Blocks: Confidence in refactoring, catching regressions
- Files: Entire codebase

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: Business logic, utility functions, data transformations
- Files: All TypeScript/TSX files
- Risk: Refactoring will break functionality, bugs go undetected
- Priority: High - start with utility functions and action files

**No Integration Tests:**
- What's not tested: API integrations, database operations, data flow
- Files: `src/app/actions/*`, `src/lib/*`
- Risk: API changes break application, data corruption possible
- Priority: High - critical for external API dependencies

**No E2E Tests:**
- What's not tested: User workflows, page navigation, form submissions
- Files: All page components
- Risk: Broken user experiences, critical paths failing
- Priority: Medium - start with key user journeys

**No Component Tests:**
- What's not tested: UI rendering, user interactions, component behavior
- Files: All React components
- Risk: UI bugs, broken layouts, accessibility issues
- Priority: Medium - focus on complex components

**No Performance Tests:**
- What's not tested: Load times, rendering performance, bundle size
- Files: Entire application
- Risk: Performance degradation goes unnoticed
- Priority: Low - establish baseline after basic test coverage

---

*Concerns audit: 2026-05-04*