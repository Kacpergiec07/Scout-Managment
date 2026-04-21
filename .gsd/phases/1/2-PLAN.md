---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Statorium API Client & Server Actions

## Objective
Implement a robust, typed server-side client for the Statorium API to fetch player and club data while ensuring API keys are never exposed to the client.

## Context
- .gsd/SPEC.md
- .gsd/phases/1/RESEARCH.md
- lib/statorium/types.ts
- lib/statorium/client.ts

## Tasks

<task type="auto">
  <name>Define Statorium Types and Internal Schemas</name>
  <files>lib/statorium/types.ts, lib/types/player.ts</files>
  <action>
    1. Define TypeScript interfaces for Statorium API responses (Teams, TeamStats, Players).
    2. Define the core `ScoutProPlayer` internal interface that will be used across the app, mapping Statorium fields to our category-based structure.
  </action>
  <verify>Run `tsc` to verify no type conflicts in the newly defined interfaces.</verify>
  <done>Comprehensive types defined for all major Statorium entities used in Phase 1.</done>
</task>

<task type="auto">
  <name>Implement Server-Side Statorium Client</name>
  <files>lib/statorium/client.ts, app/actions/statorium.ts</files>
  <action>
    1. Create a `StatoriumClient` class/object in `lib/statorium/client.ts` that includes methods for `searchPlayers(query)`, `getPlayerStats(id)`, and `getTeamStats(teamId)`.
    2. Implement Next.js Server Actions in `app/actions/statorium.ts` as a secure proxy layer.
    3. Add basic error handling for API rate limits and invalid keys.
  </action>
  <verify>Create a temporary test script in `scratch/test-statorium.ts` to log an API response (with a dummy key if necessary) or verify syntax.</verify>
  <done>Server Actions established to securely bridge the browser to the Statorium API.</done>
</task>

## Success Criteria
- [ ] Statorium API responses are fully typed.
- [ ] Server Actions can successfully proxy requests to the Statorium backend.
- [ ] `STATORIUM_API_KEY` remains strictly server-side.
