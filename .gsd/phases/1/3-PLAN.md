---
phase: 1
plan: 3
wave: 2
---

# Plan 1.3: Player Profile Ingestion & Shell

## Objective
Create the initial user interface for player search and data entry, enabling the foundation of the scouting workflow.

## Context
- .gsd/SPEC.md
- lib/statorium/types.ts
- components/scout/player-search.tsx
- components/scout/player-form.tsx

## Tasks

<task type="auto">
  <name>Build Autocomplete Player Search</name>
  <files>components/scout/player-search.tsx, app/(dashboard)/players/new/page.tsx</files>
  <action>
    1. Implement a search input with debounced fetching from `searchPlayers` Server Action.
    2. Display search results in a command-style dropdown (using Shadcn `Command` component).
    3. Selecting a player redirects to the profile form with pre-filled ID.
  </action>
  <verify>Verify component renders and calls the search action on input change.</verify>
  <done>Scouts can search for real players from Statorium via an autocomplete interface.</done>
</task>

<task type="auto">
  <name>Implementation of Player Profile Form</name>
  <files>components/scout/player-form.tsx, app/(dashboard)/players/[id]/edit/page.tsx</files>
  <action>
    1. Create a multi-section form (Basic, Offensive, Defensive, Physical) as per F01.
    2. Implement "Statorium Sync": If an ID is provided, automatically fetch and fill the form fields.
    3. Allow manual overrides for all fields to support "Manual Mode".
    4. Save the profile to Supabase `players` table on submission.
  </action>
  <verify>Submit a form and verify data is saved in Supabase (or log the object if DB not ready).</verify>
  <done>Full player profile data can be captured and persisted in the local database.</done>
</task>

## Success Criteria
- [ ] Working autocomplete search for players.
- [ ] Comprehensive form supporting both API-sync and manual data entry.
- [ ] Persisting player profiles to the regional PostgreSQL database.
