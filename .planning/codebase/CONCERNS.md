# Codebase Concerns

**Analysis Date:** 2026-04-20

## Tech Debt

**Hardcoded coach data:**
- Issue: Coach information maintained in manual `lib/coaches-data.ts` file with 100+ entries
- Files: `lib/coaches-data.ts`, `app/actions/statorium.ts:287`
- Impact: Manual updates required when managers change, data can become stale
- Fix approach: Migrate to API-provided coach data when available, implement update notifications for manager changes

**Mock market value data:**
- Issue: Player market values generated using `Math.random()` instead of real transfer data
- Files: `app/(dashboard)/watchlist/page.tsx:271`, `app/(dashboard)/transfers/page.tsx:197`, `app/(dashboard)/transfers/intelligence/page.tsx:197`, `app/actions/statorium.ts:596`
- Impact: Inaccurate valuation metrics, misleading transfer intelligence
- Fix approach: Integrate with transfer market API (Transfermarkt, Capology) for real market values

**Silent error handling:**
- Issue: Empty catch blocks suppress errors without logging or user feedback
- Files: `app/actions/statorium.ts:176`, `app/actions/statorium.ts:182`, `app/actions/statorium.ts:186`
- Impact: Failures go undetected, difficult debugging, silent data loss
- Fix approach: Add proper error logging with context, implement error boundaries, user-facing error messages

## Known Bugs

**Console pollution in production:**
- Symptoms: 121 console.log statements scattered throughout codebase
- Files: `app/(dashboard)/compare/page.tsx` (40+ logs), `app/actions/statorium.ts` (20+ logs), various other files
- Trigger: All API calls, state updates, and data processing operations
- Workaround: None - affects performance and console readability
- Fix approach: Remove debug logs, implement proper logging service for production

**Timeout handling inconsistency:**
- Symptoms: API timeouts implemented in `getPlayerDataAction` but not in other actions
- Files: `app/actions/statorium.ts:677-780` (has timeout), `app/actions/statorium.ts:160-300` (no timeout)
- Trigger: Slow API responses or network issues
- Workaround: No graceful degradation for most actions
- Fix approach: Implement consistent timeout pattern across all API actions, add retry logic with exponential backoff

**Cache busting conflicts:**
- Symptoms: `revalidate: 3600` and cache busting via timestamp used simultaneously
- Files: `app/actions/statorium.ts:649`, `app/actions/statorium.ts:681`
- Trigger: User requests fresh data within cache window
- Workaround: None - wastes API quota
- Fix approach: Implement proper cache invalidation strategy, use SWR or React Query for client-side caching

## Security Considerations

**API key fallback values:**
- Risk: Hardcoded API keys used as fallback when environment variables missing
- Files: `app/actions/statorium.ts:642`, `app/actions/statorium.ts:684` (`d35d1fc1aabe0671e1e80ee5a6296bef`)
- Current mitigation: None - keys exposed in source code
- Recommendations: Remove all hardcoded keys, implement proper environment variable validation at startup, use secret management in production

**Missing input validation:**
- Risk: User input not sanitized before API calls
- Files: `app/actions/statorium.ts:304` (searchPlayersAction), `app/actions/statorium.ts:161` (getTeamDetailsAction)
- Current mitigation: Basic length checks only
- Recommendations: Implement input validation library (Zod), parameter sanitization, rate limiting per user

**Supabase client configuration:**
- Risk: No RLS policies enforcement in code, client initialization without error handling
- Files: `lib/supabase/server.ts`, `app/auth/callback/route.ts`
- Current mitigation: Relies on database-level RLS only
- Recommendations: Implement client-side validation, add comprehensive error handling for auth flows, audit RLS policies

## Performance Bottlenecks

**Oversized component files:**
- Problem: `app/(dashboard)/compare/page.tsx` is 1,252 lines, mixing logic and presentation
- Files: `app/(dashboard)/compare/page.tsx:1252`, `app/(dashboard)/transfers/page.tsx:822`, `app/(dashboard)/transfers/intelligence/page.tsx:820`
- Cause: Monolithic components with multiple responsibilities
- Improvement path: Extract custom hooks, separate business logic from UI, component decomposition

**Sequential API calls in loops:**
- Problem: Multiple API calls made sequentially instead of parallel
- Files: `app/actions/statorium.ts:503-543` (getAllTop5PlayersAction)
- Cause: For loop structure with awaits inside
- Improvement path: Use Promise.all for parallel requests, batch API calls, implement request deduplication

**Inefficient player photo resolution:**
- Problem: Complex name normalization and photo lookup performed on every render
- Files: `app/actions/statorium.ts:19-64` (resolvePlayerPhoto function)
- Cause: No caching of resolved photo URLs, regex operations on every call
- Improvement path: Implement photo URL cache with TTL, pre-process photo mappings at build time

**Console logging in hot paths:**
- Problem: Console.log calls inside frequently executed functions
- Files: `app/actions/statorium.ts:30`, `app/(dashboard)/compare/page.tsx:40-100`
- Cause: Debug logging left in production code
- Improvement path: Remove all console.log statements, implement conditional logging based on environment

## Fragile Areas

**Client component state management:**
- Files: `app/(dashboard)/compare/page.tsx:120-484`, `app/(dashboard)/watchlist/page.tsx:1-767`
- Why fragile: No state management library, complex useEffect dependencies, manual state synchronization
- Safe modification: Extract state to Zustand or React Context, implement proper state persistence
- Test coverage: No tests for state transitions or error scenarios

**API response parsing:**
- Files: `app/actions/statorium.ts:72-111` (getStandingsAction), `app/actions/statorium.ts:15-118` (extractSeasonStats)
- Why fragile: Multiple optional chaining operations, type assumptions, fallback logic spread throughout
- Safe modification: Create response validators with Zod, implement typed response parsers, add schema validation
- Test coverage: No integration tests for API responses

**Transfer intelligence calculations:**
- Files: `app/(dashboard)/transfers/intelligence/page.tsx:242-450`
- Why fragile: Complex scoring logic using mock data, multiple dependent calculations
- Safe modification: Extract to pure functions, add unit tests for scoring algorithms, mock external dependencies
- Test coverage: No tests for transfer intelligence algorithms

## Scaling Limits

**API rate limits:**
- Current capacity: No rate limiting implemented, unlimited concurrent requests
- Limit: Statorium API will throttle when exceeded (unknown threshold)
- Scaling path: Implement request queuing, add rate limit tracking, use Redis for distributed rate limiting

**Client-side rendering bundle size:**
- Current capacity: No bundle size monitoring, all components client-rendered
- Limit: 9 client components with heavy dependencies (lucide-react, recharts, etc.)
- Scaling path: Implement code splitting, convert to server components where possible, analyze bundle size with Next.js analyzer

**Data fetching patterns:**
- Current capacity: No caching strategy beyond Next.js revalidate
- Limit: Repeated API calls for same data, no request deduplication
- Scaling path: Implement SWR or React Query, add server-side caching layer, use CDN for static assets

## Dependencies at Risk

**Zai AI integration:**
- Risk: Custom AI integration using undocumented API endpoint
- Impact: AI features break if Zai API changes or deprecates endpoint
- Files: `app/actions/ai.ts`, `app/api/chat/route.ts`
- Migration plan: Standardize on OpenAI SDK or Anthropic SDK, implement provider abstraction layer

**Stadium API client:**
- Risk: Custom client implementation with no version pinning
- Impact: Breaking API changes break entire application
- Files: `lib/statorium/client.ts`
- Migration plan: Add API versioning, implement request/response interceptors, create mock API for development

**Supabase SSR integration:**
- Risk: Complex cookie handling for SSR, multiple client creation paths
- Impact: Authentication failures, session management issues
- Files: `lib/supabase/server.ts`, `lib/supabase/middleware.ts`
- Migration plan: Simplify to single client creation pattern, add comprehensive auth error handling

## Missing Critical Features

**Error boundaries:**
- Problem: No React error boundaries to catch runtime errors
- Blocks: Graceful error handling, user-friendly error messages
- Impact: Entire app crashes on component errors, poor UX

**Loading states:**
- Problem: Inconsistent loading state handling across components
- Blocks: Proper user feedback during data fetching
- Impact: Poor user experience, confusion about app state

**Form validation:**
- Problem: No client-side form validation, relies on server-side only
- Blocks: Immediate user feedback, reduced API calls
- Impact: Poor UX, unnecessary network requests

**Retry mechanism:**
- Problem: No automatic retry for failed API calls
- Blocks: Resilient application behavior
- Impact: User frustration with transient failures

## Test Coverage Gaps

**Untested area: API actions**
- What's not tested: All server actions (`app/actions/statorium.ts`, `app/actions/analysis.ts`, `app/actions/watchlist.ts`)
- Files: `app/actions/*.ts` (9 action files)
- Risk: API changes break production without detection
- Priority: High

**Untested area: Component logic**
- What's not tested: Complex business logic in components (compare page calculations, transfer intelligence)
- Files: `app/(dashboard)/compare/page.tsx:486-664` (calculateScore), `app/(dashboard)/transfers/intelligence/page.tsx:242-450`
- Risk: Logic bugs in critical features, regression issues
- Priority: High

**Untested area: Authentication flows**
- What's not tested: Auth callback, session management, protected routes
- Files: `app/auth/callback/route.ts`, `lib/supabase/server.ts`
- Risk: Authentication failures, security vulnerabilities
- Priority: Medium

**Untested area: Data transformations**
- What's not tested: Photo resolution, season stats extraction, team logo mapping
- Files: `app/actions/statorium.ts:19-64` (photo resolution), `app/(dashboard)/compare/page.tsx:15-118` (stats extraction)
- Risk: Data display issues, broken user experience
- Priority: Medium

**Untested area: Error scenarios**
- What's not tested: API failures, network timeouts, invalid responses
- Files: All API integration points
- Risk: Poor error handling, cascading failures
- Priority: High

---

*Concerns audit: 2026-04-20*