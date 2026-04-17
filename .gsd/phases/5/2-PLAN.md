---
phase: 5
plan: 2
wave: 1
---

# Plan 5.2: Final Persistence & DB Integration

## Objective
Transition from mock data to real database persistence for the Watchlist and History features using Supabase.

## Context
- lib/supabase/schema.sql
- app/actions/watchlist.ts
- app/actions/analysis.ts

## Tasks

<task type="auto">
  <name>Finalize Watchlist Server Actions</name>
  <files>app/actions/watchlist.ts</files>
  <action>
    1. Implement the real `getWatchlist` action which pulls from the Supabase `watchlist` table.
    2. Implement `updateWatchlistStatus` (the drag-and-drop persist point).
    3. Replace the mock data in `watchlist/page.tsx` with the server-side fetched data.
  </action>
  <verify>Add a player to watchlist, drag them to a new column, refresh, and verify the move is permanent.</verify>
  <done>Kanban board is fully data-driven and persistent.</done>
</task>

<task type="auto">
  <name>Automatic Analysis Snapshots</name>
  <files>app/actions/analysis.ts</files>
  <action>
    1. Update the `getCompatibilityAnalysis` logic to trigger a `saveHistory` event.
    2. Ensure snapshots include the calculated JSONB data to prevent redundant API calls.
  </action>
  <verify>Perform an analysis and check the 'History' tab to see it appear automatically.</verify>
  <done>Every scouting session is archived with 100% data fidelity.</done>
</task>

## Success Criteria
- [ ] Watchlist state is 1:1 with DB.
- [ ] History records are immutable and browsable.
- [ ] All DB operations respect RLS (Row Level Security).
