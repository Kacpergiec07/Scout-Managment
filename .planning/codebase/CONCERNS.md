# Codebase Concerns

**Analysis Date:** 2026-05-05

## Tech Debt

**Hardcoded Coach Data:**
- Issue: Coach information is manually maintained in `src/lib/coaches-data.ts` and `src/lib/statorium-data.ts` instead of being fetched from API
- Files: `src/lib/coaches-data.ts`, `src/lib/statorium-data.ts`
- Impact: Data becomes stale quickly, requires manual updates when managers change
- Fix approach: Monitor Statorium API for coach endpoint availability or implement automated data refresh from reliable sources

**Backup Files in Source:**
- Issue: Backup files committed to repository instead of being removed
- Files: `src/components/notifications-panel-optimized.tsx.backup`
- Impact: Clutters repository, may confuse developers about which file is current
- Fix approach: Remove backup files and use git history for file recovery

**Multiple Notification Panel Variants:**
- Issue: Three versions of notifications panel exist (notifications-panel.tsx, notifications-panel-optimized.tsx, notifications-panel-final.tsx)
- Files: `src/components/notifications-panel.tsx`, `src/components/notifications-panel-optimized.tsx`, `src/components/notifications-panel-final.tsx`
- Impact: Code duplication, unclear which version is the canonical implementation
- Fix approach: Consolidate to single implementation, remove unused variants

**Extensive Console Logging:**
- Issue: Large amount of console.log statements left in production code for debugging
- Files: Multiple files, especially `src/app/(dashboard)/compare/page.tsx` (30+ console statements), `src/lib/statorium/client.ts`
- Impact: Performance overhead, information leakage in production, console pollution
- Fix approach: Implement proper logging framework, remove debug logs from production builds

## Known Bugs

**Incomplete Error Handling:**
- Symptoms: Many catch blocks use console.error/warn without proper error recovery or user feedback
- Files: `src/app/actions/statorium.ts`, `src/lib/league-utils.ts`, `src/hooks/use-market-value.ts`
- Trigger: API failures, network errors, data parsing issues
- Workaround: Errors logged but may leave UI in inconsistent state

**Image Loading Fallbacks:**
- Symptoms: Some player photos fail to load, falling back to placeholders frequently
- Files: `src/components/PlayerPhotoPlaceholder.tsx`, `src/components/PlayerAvatar.tsx`
- Trigger: Invalid or missing photo URLs from Statorium API
- Workaround: Fallback system in place, but may indicate API data quality issues

**Type Safety Gaps:**
- Symptoms: Extensive use of `any` type in complex data structures
- Files: `src/app/(dashboard)/compare/page.tsx`, `src/lib/statorium/client.ts`, `src/lib/stadium-data.ts`
- Trigger: API responses with dynamic structure
- Workaround: Runtime type checking not implemented

## Security Considerations

**Environment Variable Exposure:**
- Risk: Environment variables accessed without validation, potential for runtime errors if missing
- Files: `src/lib/statorium/client.ts`, `src/app/actions/statorium.ts`, `src/lib/twitter-integration.ts`
- Current mitigation: Error throwing when keys missing, but no graceful degradation
- Recommendations: Implement validation layer, provide fallback behaviors, use environment variable schema validation

**Dangerously Set HTML:**
- Risk: One instance of dangerouslySetInnerHTML used for dynamic styles
- Files: `src/components/ui/chart.tsx` (line 95)
- Current mitigation: Controlled content generation, but no sanitization
- Recommendations: Validate content, consider CSS-in-JS alternative, implement CSP headers

**Twitter API Bearer Token:**
- Risk: Bearer token exposed in public environment variable (NEXT_PUBLIC_TWITTER_BEARER_TOKEN)
- Files: `src/lib/twitter-integration.ts`
- Current mitigation: Token required for functionality, no access control on client-side
- Recommendations: Move to server-side proxy, implement token rotation, add rate limiting

**Supabase RPC Execution:**
- Risk: Direct SQL execution via exec_sql RPC without input validation
- Files: `src/app/actions/migrate-watchlist.ts`, `src/app/api/migrate-watchlist/route.ts`
- Current mitigation: Limited to specific migration scripts
- Recommendations: Implement SQL injection prevention, whitelist allowed operations, add audit logging

## Performance Bottlenecks

**Excessive API Calls:**
- Problem: Multiple parallel requests without request batching or caching strategy
- Files: `src/app/actions/statorium.ts` (Promise.all without limits), `src/app/(dashboard)/watchlist/page.tsx`
- Cause: Loading data for multiple players simultaneously without rate limiting
- Improvement path: Implement request queuing, add request batching, optimize cache strategy

**Large File Sizes:**
- Problem: Several files exceed 1000 lines, indicating high complexity
- Files: `src/lib/europe-map-data.ts` (8785 lines), `src/lib/statorium-data.ts` (1748 lines), `src/app/actions/statorium.ts` (1676 lines), `src/app/(dashboard)/compare/page.tsx` (1426 lines)
- Cause: Mixed concerns, large data structures, complex business logic
- Improvement path: Split into smaller modules, extract data files, implement lazy loading

**Inefficient Caching:**
- Problem: In-memory cache without size limits or eviction policy
- Files: `src/app/actions/statorium.ts` (GLOBAL_CACHE Map), cache TTL hardcoded to 10 minutes
- Cause: Simple caching implementation without memory management
- Improvement path: Implement LRU cache, add cache size limits, consider Redis for distributed caching

**RSS Feed Timeout Issues:**
- Problem: RSS feeds have 15-second timeout but no retry mechanism
- Files: `src/lib/trending-news.ts` (line 297-301)
- Cause: Single timeout promise without fallback strategies
- Improvement path: Implement exponential backoff, add multiple fallback sources, improve timeout handling

## Fragile Areas

**Statorium API Integration:**
- Files: `src/lib/statorium/client.ts`, `src/app/actions/statorium.ts`
- Why fragile: Tight coupling to specific API structure, extensive type casting to `any`, manual data transformation
- Safe modification: Wrap in adapter layer, implement comprehensive error handling, add API version management
- Test coverage: No tests for API client or data transformation logic

**Compare Page Data Extraction:**
- Files: `src/app/(dashboard)/compare/page.tsx`
- Why fragile: Complex nested data structure parsing, multiple fallback paths, extensive debug logging
- Safe modification: Extract parsing logic to separate module, add comprehensive test cases, implement schema validation
- Test coverage: No unit tests for stat extraction logic

**News Aggregation:**
- Files: `src/lib/trending-news.ts`, `src/lib/rss-feeds.ts`, `src/lib/twitter-integration.ts`
- Why fragile: Multiple external dependencies, fallback chain with mock data, no error recovery
- Safe modification: Implement circuit breaker pattern, add comprehensive logging, create separate service layer
- Test coverage: No integration tests for news aggregation

**Form Handling:**
- Files: Multiple components using react-hook-form without consistent validation patterns
- Why fragile: Mixed validation approaches, inconsistent error handling
- Safe modification: Standardize on zod schema validation, create reusable form components
- Test coverage: No form validation tests

## Scaling Limits

**Memory Usage:**
- Current capacity: In-memory caches (GLOBAL_CACHE, formationCache) grow without bounds
- Limit: Server memory exhaustion under heavy load, no eviction policy
- Scaling path: Implement LRU cache, migrate to Redis, add memory monitoring

**API Rate Limits:**
- Current capacity: No rate limiting implemented for Statorium API calls
- Limit: API throttling or blocking under concurrent requests
- Scaling path: Implement request queue, add rate limiting middleware, use connection pooling

**Database Queries:**
- Current capacity: Direct Supabase queries without optimization
- Limit: N+1 query problem in watchlist and player data loading
- Scaling path: Implement query optimization, add database indexes, use materialized views

**Client-Side State:**
- Current capacity: Multiple useState hooks without state management
- Limit: Performance degradation with large datasets, prop drilling complexity
- Scaling path: Implement Zustand or Redux, use React Query for server state, optimize re-renders

## Dependencies at Risk

**Outdated Dependencies:**
- Risk: 19 packages have available updates, some with potential security implications
- Impact: `@anthropic-ai/sdk` (0.89.0 → 0.93.0), `eslint` (9.39.4 → 10.3.0), `next` (15.5.15 → 16.2.4), `eslint-config-next` (15.1.7 → 16.2.4)
- Migration plan: Test each update in staging environment, prioritize security updates, review breaking changes

**External API Dependencies:**
- Risk: Statorium API single point of failure, no fallback for core data
- Impact: Application becomes unusable if Statorium API is down or changes
- Migration plan: Implement API abstraction layer, add multiple data sources, create offline mode

**Twitter API Integration:**
- Risk: Twitter API changes could break news aggregation
- Impact: Reduced news coverage if Twitter integration fails
- Migration plan: Strengthen RSS feed integration, implement news aggregation from multiple sources

**React 19.2.4:**
- Risk: Using latest React version with potential stability issues
- Impact: May encounter bugs or performance issues in edge cases
- Migration plan: Monitor React issues, implement feature detection, consider downgrading if critical bugs found

## Missing Critical Features

**No Test Coverage:**
- Problem: Zero test files found in entire codebase
- Blocks: Confidence in refactoring, regression prevention, CI/CD quality gates
- Impact: High risk of breaking changes, difficult to maintain code quality
- Recommendations: Set up Jest/Vitest, write unit tests for business logic, add E2E tests with Playwright

**No Error Boundary:**
- Problem: No React Error Boundary to catch component errors
- Blocks: Graceful error handling, user experience during failures
- Impact: White screen of death on component errors, poor UX
- Recommendations: Implement global error boundary, add error reporting, create fallback UIs

**No Performance Monitoring:**
- Problem: No APM or performance monitoring implemented
- Blocks: Identification of slow operations, performance regression detection
- Impact: Difficult to optimize, unaware of performance issues
- Recommendations: Add Vercel Analytics, implement custom performance tracking, set up alerting

**No API Rate Limiting:**
- Problem: No rate limiting on external API calls
- Blocks: Protection against API abuse, cost control
- Impact: Potential API blocking, unexpected costs
- Recommendations: Implement rate limiting middleware, add request queuing, monitor API usage

## Test Coverage Gaps

**Zero Test Coverage:**
- What's not tested: Entire codebase has no automated tests
- Files: All source files
- Risk: Any change can break functionality, no regression prevention
- Priority: Critical - implement testing framework and write tests for core functionality

**No API Client Tests:**
- What's not tested: Statorium API client, data transformation, error handling
- Files: `src/lib/statorium/client.ts`, `src/app/actions/statorium.ts`
- Risk: API changes break application silently, data corruption
- Priority: High - test API integration and data parsing

**No Component Tests:**
- What's not tested: React components, user interactions, state management
- Files: All component files
- Risk: UI bugs, broken user flows, accessibility issues
- Priority: Medium - test critical user paths and complex components

**No Integration Tests:**
- What's not tested: End-to-end user flows, database operations, authentication
- Files: All application code
- Risk: System failures, broken integrations, data loss
- Priority: High - test critical business processes

## Code Quality Issues

**Inconsistent Error Handling:**
- Pattern: Some functions throw errors, others return null/undefined, some log errors
- Impact: Unpredictable error propagation, difficult debugging
- Recommendation: Standardize error handling pattern, implement error types

**Magic Numbers and Strings:**
- Pattern: Hardcoded values like cache TTL (10 minutes), timeout (15000ms)
- Files: `src/app/actions/statorium.ts`, `src/lib/trending-news.ts`
- Impact: Difficult to maintain, no central configuration
- Recommendation: Extract to configuration constants, use environment variables

**Duplicate Code:**
- Pattern: Position mapping logic duplicated in multiple files
- Files: `src/app/actions/statorium.ts`, `src/lib/statorium-data.ts`, `src/app/(dashboard)/compare/page.tsx`
- Impact: Maintenance burden, inconsistency risk
- Recommendation: Extract to shared utility, create single source of truth

**Large Component Files:**
- Pattern: Components over 500 lines with mixed concerns
- Files: `src/components/scout-jobs/scout-jobs-client.tsx` (1157 lines)
- Impact: Difficult to understand, test, and maintain
- Recommendation: Split into smaller components, extract custom hooks

## Configuration Issues

**Environment Variable Validation:**
- Problem: No validation that required environment variables are set at startup
- Files: `.env.example` incomplete, missing STATORIUM_API_KEY and ZAI_API_KEY
- Impact: Runtime errors when accessing missing variables, poor developer experience
- Recommendation: Implement environment variable validation at startup, create validation schema

**TypeScript Configuration:**
- Problem: `skipLibCheck: true` masks potential type errors in dependencies
- Files: `tsconfig.json`
- Impact: Hidden type safety issues, potential runtime errors
- Recommendation: Review and fix type errors, remove skipLibCheck if possible

**ESLint Configuration:**
- Problem: Minimal ESLint configuration, missing custom rules
- Files: `eslint.config.mjs`
- Impact: Code quality inconsistencies, missed linting opportunities
- Recommendation: Add custom rules for project-specific patterns, enable stricter rules

**No TypeScript Strict Mode Enforcement:**
- Problem: `strict: true` set but extensive use of `any` type undermines type safety
- Files: Multiple TypeScript files
- Impact: False sense of type safety, runtime type errors
- Recommendation: Enable noImplicitAny, refactor to proper types

## Documentation Gaps

**Missing API Documentation:**
- Problem: No documentation for Statorium API integration, data structures, or error handling
- Files: `src/lib/statorium/client.ts`, `src/app/actions/statorium.ts`
- Impact: Difficult for new developers to understand API integration
- Recommendation: Add JSDoc comments, create API integration guide, document data models

**No Component Documentation:**
- Problem: Components lack prop descriptions, usage examples, or behavior documentation
- Files: All component files
- Impact: Difficult to reuse components, unclear component intent
- Recommendation: Add JSDoc to components, create Storybook stories, document component APIs

**Missing Architecture Documentation:**
- Problem: No documentation explaining data flow, layer separation, or architectural decisions
- Impact: Difficult to understand system design, makes refactoring risky
- Recommendation: Create architecture diagrams, document key patterns, explain design decisions

**No Setup Documentation:**
- Problem: Limited documentation on environment setup, configuration, and local development
- Files: README.md (if exists)
- Impact: High onboarding friction for new developers
- Recommendation: Create comprehensive setup guide, document common issues, add troubleshooting section

## Deployment Concerns

**No Database Migration Strategy:**
- Problem: SQL migrations scattered across multiple files, no automated migration system
- Files: `src/app/actions/migrate-watchlist.ts`, multiple SQL files in `src/lib/supabase/`
- Impact: Manual database updates required, risk of schema drift
- Recommendation: Implement database migration tool (Prisma/Supabase migrations), automate deployment

**No Health Checks:**
- Problem: No health check endpoints for API status, database connectivity
- Impact: Difficult to monitor system health, delayed detection of issues
- Recommendation: Add health check endpoints, implement uptime monitoring, set up alerting

**No Rollback Strategy:**
- Problem: No documented rollback procedure for failed deployments
- Impact: Extended downtime during deployment failures
- Recommendation: Implement blue-green deployment, document rollback procedures, test rollback process

**No Configuration Management:**
- Problem: Environment-specific configuration not clearly separated
- Impact: Risk of production configuration issues, difficult to manage environments
- Recommendation: Use configuration management tool, implement feature flags, separate config per environment

---

*Concerns audit: 2026-05-05*
