---
phase: 3
plan: 3
wave: 2
---

# Plan 3.3: Analysis History & Persistence

## Objective
Implement tracking of all scouting analyses performed by the user to facilitate history browsing and PDF generation in Phase 4.

## Context
- .gsd/ROADMAP.md (REQ-08)
- app/(dashboard)/history/page.tsx
- app/actions/analysis.ts

## Tasks

<task type="auto">
  <name>Implementation of Analysis History Table</name>
  <files>lib/supabase/schema.sql, app/actions/analysis.ts</files>
  <action>
    1. Create the `analysis_history` table in Supabase.
    2. Update the `getCompatibilityAnalysis` action to optionally save result snapshots to the history table.
    3. Include JSONB snapshot of all calculated scores and the AI narrative.
  </action>
  <verify>Perform an analysis and check the Supabase dashboard to see if a record was created.</verify>
  <done>Every analysis is automatically archived for future reference.</done>
</task>

<task type="auto">
  <name>Build History Browser UI</name>
  <files>app/(dashboard)/history/page.tsx, components/scout/history-table.tsx</files>
  <action>
    1. Build a searchable/filterable table showing past analyses.
    2. Columns: Date, Player, Target League, High Score, AI Summary snippet.
    3. Add a "Re-view" button that restores the specific snapshot without re-calculating (avoiding API cost).
  </action>
  <verify>Open /history and verify past searches are listed and clickable.</verify>
  <done>Scouts can quickly access past work and see the evolution of their searches.</done>
</task>

## Success Criteria
- [ ] Analysis snapshots are stored as JSONB for stability.
- [ ] History is paginated and filterable by player name.
- [ ] Viewing history does not hit the Statorium API (using stored snapshot).
