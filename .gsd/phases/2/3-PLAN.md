---
phase: 2
plan: 3
wave: 1
---

# Plan 2.3: Data Ingestion for Match Engine

## Objective
Ensure the Match Engine has all necessary data (Clubs, Standings, Player Stats) from Statorium to perform accurate calculations.

## Context
- lib/statorium/client.ts
- app/actions/analysis.ts
- .gsd/DECISIONS.md

## Tasks

<task type="auto">
  <name>Extend Statorium Client for Match Data</name>
  <files>lib/statorium/client.ts, lib/statorium/types.ts</files>
  <action>
    1. Add `getStandings(leagueId)` and `getTeamRecentForm(teamId)` to the Statorium client.
    2. Add `getAllPlayersInLeague(leagueId)` to facilitate benchmark calculation.
  </action>
  <verify>Run a scratch script to fetch standings for one of the top 5 leagues and verify valid JSON structure.</verify>
  <done>Client supports all data points required by the weighted scoring algorithm.</done>
</task>

<task type="auto">
  <name>Implementation of Analysis Server Action</name>
  <files>app/actions/analysis.ts</files>
  <action>
    1. Create a `getCompatibilityAnalysis(playerId)` Server Action.
    2. Workflow: Fetch Player -> Fetch Benchmarks -> Fetch All Clubs (Top 5 Ligas) -> Run Scoring Engine for each club -> Return Results.
    3. Ensure caching of "All Clubs" and "Benchmarking" data to respect Statorium limits.
  </action>
  <verify>Call the action in a test route and verify it returns a list of clubs with scores for a valid player.</verify>
  <done>A single unified action provides all data needed to render the Ranking and Radar views.</done>
</task>

## Success Criteria
- [ ] End-to-end data flow: Raw Statorium Data -> Benchmarks -> Weighted Score -> UI.
- [ ] Analysis action returns correctly formatted data for 5+ leagues.
