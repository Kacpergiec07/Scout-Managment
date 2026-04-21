---
phase: 3
plan: 2
wave: 1
---

# Plan 3.2: Watchlist & Kanban Management

## Objective
Implement the persistent Watchlist features (REQ-06) allowing scouts to track players through a Kanban-style pipeline.

## Context
- .gsd/SPEC.md
- components/scout/kanban-board.tsx
- app/(dashboard)/watchlist/page.tsx
- lib/supabase/schema.sql

## Tasks

<task type="auto">
  <name>Implementation of Kanban Watchlist</name>
  <files>components/scout/kanban-board.tsx, components/scout/kanban-card.tsx</files>
  <action>
    1. Setup `@dnd-kit/core` and `@dnd-kit/sortable`.
    2. Create 4 status columns: Following, Priority, Analyzing, Complete.
    3. Build a `KanbanCard` displaying player basic details and compatibility score.
    4. Implement drag-and-drop logic between columns with optimistic UI updates.
  </action>
  <verify>Drag a player from 'Following' to 'Priority' and verify state updates correctly.</verify>
  <done>Functional Kanban board for player management in the scout's dashboard.</done>
</task>

<task type="auto">
  <name>Supabase Integration for Watchlist</name>
  <files>app/actions/watchlist.ts, lib/supabase/server.ts</files>
  <action>
    1. Create the `watchlist` table in Supabase (PostgreSQL).
    2. Implement `addToWatchlist`, `updateWatchlistStatus`, and `getWatchlist` Server Actions.
    3. Ensure user-level isolation (RLS) so scouts only see their own watchlist.
  </action>
  <verify>Persist a drag event to the database and refresh the page to confirm the position is saved.</verify>
  <done>Watchlist data is persistently stored and synced across sessions.</done>
</task>

## Success Criteria
- [ ] Drag-and-drop works smoothly without layout shifts.
- [ ] Status changes are saved to Supabase (RLS verified).
- [ ] Kanban cards link directly to the detailed analysis page.
