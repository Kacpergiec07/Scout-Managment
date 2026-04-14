# Architecture Decisions (ADR)

| ID | Decision | Date | Status |
|----|----------|------|--------|
| ADR-01 | Use Next.js 16 App Router | 2026-04-14 | ACCEPTED |
| ADR-02 | Statorium API as primary data source | 2026-04-14 | ACCEPTED |
| ADR-03 | Tailwind CSS 4 for all styling | 2026-04-14 | ACCEPTED |
| ADR-04 | Claude API for AI features | 2026-04-14 | ACCEPTED |

## Phase 1 Decisions

**Date:** 2026-04-14

### Scope
- **Statorium Integration:** Focus on establishing the Server Action proxy layer for secure data retrieval.
- **Project Structure:** Initialize a fresh Supabase project for Auth and DB storage.

### Approach
- **Chose:** Option A (Server-Side Proxy)
- **Reason:** Ensuring API keys remain secret and allowing for server-side normalization of Statorium data before it reaches the frontend.

### Constraints
- **Statorium API:** Use the user-provided API key stored in `.env`.
