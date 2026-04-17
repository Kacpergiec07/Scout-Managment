---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: The Compatibility Engine

## Objective
Implement the mathematical logic for the "Score Dopasowania" and statistical benchmarking system that powers the entire application.

## Context
- .gsd/SPEC.md
- .gsd/phases/2/RESEARCH.md
- lib/engine/scoring.ts
- lib/engine/benchmark.ts

## Tasks

<task type="auto">
  <name>Implement Statistical Benchmark Utility</name>
  <files>lib/engine/benchmark.ts</files>
  <action>
    1. Implement logic to calculate league-wide medians and percentiles for player statistics.
    2. Input: Array of player stats from Statorium. Output: Percentile rank (0-100) for a given value relative to the cohort.
    3. Add a basic caching mechanism to avoid re-calculating benchmarks for the same league/position in a single session.
  </action>
  <verify>Write a test script in `scratch/test-benchmark.ts` that takes an array of dummy values and confirms correct percentile math.</verify>
  <done>Benchmarking utility reliably converts raw stats into percentiles.</done>
</task>

<task type="auto">
  <name>Implement Score Dopasowania Logic</name>
  <files>lib/engine/scoring.ts</files>
  <action>
    1. Implement the 5-category weighted algorithm: Tactical (30%), Positional (25%), Stats (25%), Form (12%), History (8%).
    2. Normalize all category inputs to a 0-100 scale before applying weights.
    3. Input: `ScoutProPlayer` object and a `ClubContext` object. Output: Final integer Score 0-100 and a detailed category breakdown.
  </action>
  <verify>Run a test against a sample player and club profile and verify the output score matches expected weighted math.</verify>
  <done>Core scoring engine correctly calculates compatibility scores with decimal precision, returned as integers.</done>
</task>

## Success Criteria
- [ ] Scoring logic matches SPEC weighted distribution exactly.
- [ ] Percentile math is validated against known data samples.
- [ ] Engine code is fully typed and ready for UI consumption.
