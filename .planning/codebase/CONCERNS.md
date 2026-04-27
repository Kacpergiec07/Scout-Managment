# Codebase Concerns

**Analysis Date:** 2026-04-27

## Tech Debt

**Hardcoded Coach Data:**
- Issue: Coach information is manually maintained in hardcoded maps
- Files: `src/lib/coaches-data.ts`, `src/lib/statorium-data.ts`
- Impact: Data becomes stale quickly, requires manual updates when managers change
- Fix approach: Implement automated coach data fetching from Statorium API once available, or create a scheduled sync job

**Large Monolithic Data File:**
- Issue: 1754-line file containing hardcoded player photos and league data
- Files: `src/lib/statorium-data.ts`
- Impact: Difficult to maintain, version control issues, memory bloat
- Fix approach: Move to database storage or split into smaller, manageable modules

**Mock Data Fallback in Production:**
- Issue: Statorium API client falls back to hardcoded mock data on failures
- Files: `src/lib/statorium/client.ts` (lines 55-100)
- Impact: Inconsistent user experience, stale data presented as current
- Fix approach: Implement proper error handling with user-facing notifications and data staleness indicators

**Duplicate Data Structures:**
- Issue: Position maps and coach maps duplicated across multiple files
- Files: `src/lib/statorium-data.ts`, `src/app/actions/statorium.ts`
- Impact: Maintenance overhead, potential for inconsistencies
- Fix approach: Create single source of truth, export from one location

## Known Bugs

**Profile Schema Mismatches:**
- Symptoms: Profile loading failures requiring multiple auto-fix pages
- Files: `src/app/(dashboard)/profile/page.tsx`, `src/app/(dashboard)/settings/page.tsx`
- Trigger: Database schema changes not synced with application code
- Workaround: Multiple fix pages created (`fix-profile-schema`, `fix-my-profile`, `diagnose-profile-issue`)
- Fix approach: Implement database migrations and proper schema versioning

**League Galaxy Placement Fallback:**
- Symptoms: Club placement algorithm may place clubs in suboptimal positions after 500 attempts
- Files: `src/components/scout/league-galaxy.tsx` (lines 148-153)
- Trigger: When collision detection can't find perfect placement
- Workaround: Random placement as fallback
- Fix approach: Improve placement algorithm or implement spiral pattern fallback

## Security Considerations

**Hardcoded API Key Fallback:**
- Risk: Statorium API key has hardcoded fallback value
- Files: `src/app/actions/statorium.ts` (lines 907, 949)
- Current mitigation: Environment variable checked first, but fallback exists
- Recommendations: Remove hardcoded fallback, fail securely, implement proper API key rotation

**Environment Variable Access Pattern:**
- Risk: Direct process.env access without validation or type safety
- Files: Multiple files using `process.env.NEXT_PUBLIC_*` with non-null assertions
- Current mitigation: TypeScript non-null assertions (!)
- Recommendations: Create typed environment configuration with validation at startup

**Client-Side Storage of Sensitive Data:**
- Risk: User preferences and team selection stored in localStorage
- Files: `src/hooks/use-home-team.ts`
- Current mitigation: No encryption or validation
- Recommendations: Move to server-side storage or implement encryption for sensitive preferences

**API Key Exposure in Client Code:**
- Risk: Some API keys use NEXT_PUBLIC_ prefix, exposed to client
- Files: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- Current mitigation: Supabase anon key design, but still exposed
- Recommendations: Review which keys truly need client access, use server-side proxy for sensitive operations

**AI API Key Management:**
- Risk: Anthropic API key accessed directly in API routes without rate limiting
- Files: `src/app/api/valuation/route.ts`, `src/app/api/chat/route.ts`
- Current mitigation: Basic error handling
- Recommendations: Implement rate limiting, request quotas, and cost monitoring

## Performance Bottlenecks

**Excessive Console Logging:**
- Problem: Extensive console.log statements in production code
- Files: Throughout codebase (30+ instances in actions/components)
- Cause: Debug logging left in production
- Improvement path: Implement proper logging framework with environment-based log levels

**Inefficient Data Fetching:**
- Problem: Multiple sequential API calls without caching strategy
- Files: `src/app/actions/statorium.ts` (1046 lines), `src/app/(dashboard)/leagues/[id]/league-details-client.tsx` (1025 lines)
- Cause: No centralized caching, data fetched on every request
- Improvement path: Implement React Query or SWR for client-side caching, leverage Next.js revalidate for server-side

**Large Component Files:**
- Problem: Several components exceed 400 lines, causing maintenance issues
- Files: `src/app/(dashboard)/watchlist/page.tsx` (1067 lines), `src/app/(dashboard)/compare/page.tsx` (949 lines)
- Cause: Multiple responsibilities in single components
- Improvement path: Break down into smaller, focused components with proper separation of concerns

**Unoptimized Re-renders:**
- Problem: Complex components without proper memoization
- Files: `src/components/scout/league-galaxy.tsx`, `src/components/scout/transfer-flow.tsx`
- Cause: Heavy computations in render cycles
- Improvement path: Implement React.memo, useMemo, useCallback strategically

**N+1 Query Problem:**
- Problem: Loop-based API calls for individual player/team data
- Files: `src/app/actions/statorium.ts`, `src/app/actions/sync.ts`
- Cause: No batch fetching capabilities
- Improvement path: Implement batch API calls or data prefetching strategies

## Fragile Areas

**Profile Management System:**
- Files: `src/app/actions/profile.ts`, `src/app/(dashboard)/profile/page.tsx`, `src/app/(dashboard)/settings/page.tsx`
- Why fragile: Multiple auto-fix pages suggest unstable schema, extensive error handling
- Safe modification: Implement proper database migrations, add schema validation middleware
- Test coverage: Gaps - no tests for profile update flows, error handling untested

**Statorium API Integration:**
- Files: `src/lib/statorium/client.ts`, `src/app/actions/statorium.ts`
- Why fragile: Single point of failure for all data, extensive null returns, fallback to mock data
- Safe modification: Implement circuit breaker pattern, add comprehensive error handling, create data layer abstraction
- Test coverage: Minimal - API integration not mocked, failure scenarios untested

**State Management Across Components:**
- Files: Multiple large page components with local state
- Why fragile: No global state management, prop drilling, inconsistent data flow
- Safe modification: Implement Zustand or Context API for shared state, create custom hooks for complex logic
- Test coverage: Untested - component interactions and state transitions not covered

**3D Visualization Components:**
- Files: `src/components/ui/3d-globe.tsx`, `src/components/ui/football-globe.tsx`
- Why fragile: Complex WebGL logic, memory management issues, browser compatibility
- Safe modification: Implement proper cleanup, add loading states, handle webgl context loss
- Test coverage: None - visual components not tested

## Scaling Limits

**Client-Side Data Processing:**
- Current capacity: Processing ~100 clubs in League Galaxy with collision detection (500 attempts per club)
- Limit: Performance degrades with >200 clubs, mobile devices struggle
- Scaling path: Move collision detection to Web Worker, implement server-side positioning, use spatial indexing

**Supabase RLS Performance:**
- Current capacity: Small user base, simple queries
- Limit: Row-level security may slow down with complex multi-tenant queries
- Scaling path: Implement query optimization, consider read replicas, add database indexes

**API Rate Limits:**
- Current capacity: Statorium API usage within free tier limits
- Limit: No rate limiting implementation, could hit API limits with increased traffic
- Scaling path: Implement request queuing, caching layer, upgrade to paid tier or alternative data sources

**Image Optimization:**
- Current capacity: Loading player photos from external URLs
- Limit: No image optimization, slow loading on poor connections
- Scaling path: Implement Next.js Image optimization, set up CDN, consider local image caching

**Real-time Features:**
- Current capacity: No real-time features implemented
- Limit: Notification system is mock-based, no live updates
- Scaling path: Implement Supabase Realtime or WebSocket connections for live data

## Dependencies at Risk

**Outdated Dependencies:**
- Risk: Multiple packages have newer versions available (19 outdated packages)
- Impact: Potential security vulnerabilities, missing features, compatibility issues
- Migration plan: Run `npm update`, test thoroughly, incrementally upgrade major versions

**Next.js Version Mismatch:**
- Risk: Using Next.js 15.5.15 but latest is 16.2.4
- Impact: Missing performance improvements, potential breaking changes in future
- Migration plan: Review Next.js 16 changelog, test in development environment, upgrade incrementally

**AI SDK Dependencies:**
- Risk: Multiple AI SDK packages with version inconsistencies
- Files: `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/react`, `@ai-sdk/rsc`
- Impact: Potential API incompatibilities, increased bundle size
- Migration plan: Consolidate to single AI provider, remove unused SDKs

**React 19 Adoption:**
- Risk: Early adoption of React 19 with ecosystem not fully updated
- Impact: Compatibility issues with third-party libraries
- Migration plan: Monitor library updates, provide fallbacks for incompatible features

**Tailwind CSS 4 Beta:**
- Risk: Using Tailwind CSS 4 (beta version)
- Impact: Potential breaking changes, limited ecosystem support
- Migration plan: Track Tailwind 4 release notes, have migration plan to stable version

## Missing Critical Features

**Error Boundary Implementation:**
- Problem: No React Error Boundaries to catch component errors
- Blocks: Graceful error handling, user experience during failures
- Impact: Application crashes show blank screens instead of error UI

**Comprehensive Testing:**
- Problem: No test files found in src/ directory (only in node_modules)
- Blocks: Confidence in refactoring, catching regressions
- Impact: High risk of introducing bugs during development

**Database Migrations:**
- Problem: No migration system for schema changes
- Blocks: Safe database updates, team development
- Impact: Manual schema changes, potential data loss

**Monitoring and Analytics:**
- Problem: No error tracking, performance monitoring, or user analytics
- Blocks: Understanding production issues, user behavior insights
- Impact: Reactive debugging instead of proactive monitoring

**API Rate Limiting:**
- Problem: No rate limiting on API routes
- Blocks: Protection against abuse, cost control
- Impact: Potential API bill spikes, service degradation

**Data Validation Layer:**
- Problem: Inconsistent validation across the application
- Blocks: Data integrity, security
- Impact: Invalid data in database, potential security vulnerabilities

## Test Coverage Gaps

**Untested Areas:**

**Authentication Flows:**
- What's not tested: Login, logout, session management, profile creation
- Files: `src/app/auth/actions.ts`, `src/app/auth/callback/route.ts`
- Risk: Authentication failures could lock users out
- Priority: High

**Data Synchronization:**
- What's not tested: Statorium API integration, data caching, error recovery
- Files: `src/app/actions/sync.ts`, `src/app/actions/statorium.ts`
- Risk: Data inconsistencies, stale information
- Priority: High

**AI Integration:**
- What's not tested: AI valuation, chat responses, prompt handling
- Files: `src/app/api/valuation/route.ts`, `src/app/api/chat/route.ts`
- Risk: AI failures causing poor user experience
- Priority: Medium

**Watchlist Management:**
- What's not tested: Add/remove players, status updates, history tracking
- Files: `src/app/actions/watchlist.ts`
- Risk: Data loss, incorrect watchlist state
- Priority: Medium

**Complex UI Components:**
- What's not tested: League Galaxy, Transfer Flow, Comparison engine
- Files: `src/components/scout/league-galaxy.tsx`, `src/components/scout/transfer-flow.tsx`
- Risk: Visual regressions, interaction failures
- Priority: Low

**Profile Operations:**
- What's not tested: Profile updates, notification preferences, schema migrations
- Files: `src/app/actions/profile.ts`
- Risk: Profile corruption, user data loss
- Priority: High

## Code Quality Issues

**Excessive Use of `any` Type:**
- Problem: Widespread use of `any` type defeats TypeScript's purpose
- Files: Throughout codebase, especially in data handling
- Impact: Loss of type safety, increased runtime errors
- Fix approach: Define proper interfaces, use `unknown` with type guards

**Inconsistent Error Handling:**
- Problem: Mix of throwing errors, returning null/empty arrays, console.logging
- Files: Multiple action files and components
- Impact: Unpredictable error behavior, poor user experience
- Fix approach: Implement standardized error handling pattern with proper error types

**Magic Numbers and Strings:**
- Problem: Hardcoded values without named constants
- Files: `src/components/scout/league-galaxy.tsx` (collision distances, attempts), `src/app/actions/analysis.ts` (DNA values)
- Impact: Difficult to tune, unclear intent
- Fix approach: Extract to named constants with documentation

**Missing Type Definitions:**
- Problem: External API responses not fully typed
- Files: `src/lib/statorium/types.ts`, `src/lib/types/player.ts`
- Impact: Runtime type errors, poor IDE support
- Fix approach: Create comprehensive type definitions based on API documentation

**Unused Code:**
- Problem: Dead code, commented-out sections, unused imports
- Files: Multiple files throughout codebase
- Impact: Code bloat, confusion for developers
- Fix approach: Run linting tools, remove unused code, clean up imports

---

*Concerns audit: 2026-04-27*
