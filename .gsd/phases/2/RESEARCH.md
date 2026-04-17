# Research: Phase 2 — Core Match Engine

> **Discovery Level**: 2 (Standard Research)
> **Date**: 2026-04-14

## Overview
Phase 2 implements the "Score Dopasowania" (Compatibility Score) algorithm and the visual representation of player suitability across the top 5 European leagues.

## Findings

### 1. Mathematical Logic: Score Dopasowania (0–100)
The score is a weighted sum of five categories. Each category must be normalized to a 0–100 scale before weighting.

| Category | Weight | Logic / Formula |
|----------|--------|-----------------|
| **Tactical** | 30% | `100 - average(|PlayerStyle[i] - ClubDNA[i]|)` where Style params are normalized (0-1). |
| **Positional** | 25% | `baseNeed(pos) + injuryModifier + squadAgeModifier`. Max 100. |
| **Statistics**| 25% | `average(Percentile[i])` for top 5 key metrics per position. |
| **Form** | 12% | `ClubRecentPoints / MaxPossiblePoints` (last 5 games) + Goal Trend. |
| **History** | 8% | `Similarity(Profile, PreviousSuccessfulSignedPlayers)`. |

### 2. Visualizations (Radar Charts)
- **Library:** `Recharts` via `shadcn/ui` Chart components.
- **Radar Points (8-axis):** 
  - Offensive: Goals, xG, Key Pass
  - Defensive: Tackles, Interceptions
  - Technical: Dribbles, Pass Accuracy
  - Physical: Stamina/Stature
- **Styling:** Premium dark mode theme with emerald/zinc accents as per the Scout Pro aesthetic.

### 3. Data Ingestion (Matches & Standings)
- **Endpoint:** Statorium `teams_stats` and `standings`.
- **Benchmarking:** We need a `LeagueBenchmark` utility that calculates the average/median for key stats per league to generate percentiles accurately.

## Technology Choices
- **Charts:** `recharts` + `lucide-react`.
- **Math Utility:** `mathjs` (optional, for complex vector similarity) or simple JS reduce/map.
- **Caching:** In-memory or Redis (if available) for the LeagueBenchmark results as they only update weekly.

## Risks
- **Benchmarking Complexity:** Calculating percentiles across all players in a league can be CPU intensive. We should compute this periodically or on-demand with caching.
- **Data Normalization:** Handling differences between leagues (e.g., EPL vs Serie A averages) to ensure the Score is comparable globally.
