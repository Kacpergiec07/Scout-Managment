---
phase: 2
plan: 2
wave: 2
---

# Plan 2.2: Visualization & Ranking UI

## Objective
Build the professional-grade UI components for displaying compatibility rankings and player statistical breakdowns (Radar Charts).

## Context
- .gsd/SPEC.md
- components/scout/radar-chart.tsx
- components/scout/ranking-list.tsx
- app/(dashboard)/players/[id]/analysis/page.tsx

## Tasks

<task type="auto">
  <name>Implementation of Radar Chart Component</name>
  <files>components/scout/radar-chart.tsx, components/ui/chart.tsx</files>
  <action>
    1. Setup `shadcn/ui` charts and `recharts` dependencies.
    2. Create a `PlayerRadarChart` component that visualizes 8 key stats (Offensive, Defensive, Physical, Tactical).
    3. Use emerald-themed gradients and professional dark mode aesthetics.
    4. Support overlapping multiple players for future "Comparison" features.
  </action>
  <verify>Render the chart with mock data and verify SVG geometry is correct.</verify>
  <done>Interactive, stylized Radar Chart component is available for profile views.</done>
</task>

<task type="auto">
  <name>Implementation of Compatibility Ranking View</name>
  <files>components/scout/ranking-list.tsx, components/scout/club-card.tsx</files>
  <action>
    1. Create a `RankingList` that displays clubs sorted by Score Dopasowania.
    2. Build a detailed `ClubCard` showing: Herb, Name, Liga, Score 0-100, and a "Top 3 Reasons" badge.
    3. Implement simple filtering by league or score threshold.
  </action>
  <verify>Search for a player, view analysis, and verify clubs are sorted by compatibility score.</verify>
  <done>Professional ranking interface integrated into the scouting dashboard.</done>
</task>

## Success Criteria
- [ ] Radar charts correctly visualize normalized player data.
- [ ] Rankings are sorted DESC by score.
- [ ] UI matches the "Scout Pro" premium aesthetic (emerald/zinc/transparent surfaces).
