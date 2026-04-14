# Research: Phase 1 — Foundation & Data Integration

> **Discovery Level**: 2 (Standard Research)
> **Date**: 2026-04-14

## Overview
This phase focuses on the technical plumbing: Statorium API integration, Supabase setup, and the basic data flow from player search to profile creation.

## Findings

### 1. Statorium API
- **Endpoint Structure:** `https://api.statorium.com/api/v1/{entity}/{id}/?apikey={key}`
- **Authentication:** Query parameter based (`apikey`).
- **Core Entities:**
  - `players`: Basic info and stats (use `&showstat=true` for full metrics).
  - `teams_stats`: Use for club context (standings, form, goals).
- **Rate Limiting:** Needs to be handled via a server-side proxy to avoid exposing the key and to implement caching where possible.

### 2. Supabase Integration
- **Auth:** Next.js Auth Helpers for seamless integration with App Router.
- **Storage:** Use Supabase Storage for player image uploads (REQ-14).
- **Database:** PostgreSQL for storing:
  - User Watchlists
  - Local cached player profiles
  - Scout notes

### 3. Data Flow (Option A: Server-Side Proxy)
- **Path:** Client -> Next.js Server Action -> Statorium API -> Data Normalization -> Client.
- **Benefit:** Allows us to map Statorium's JSON structure into our internal `ScoutProPlayer` TypeScript interfaces before it hits the frontend.

## Technology Choices
- **API Client:** `fetch` with typed wrappers.
- **State Management:** React Server Actions + `useActionState` (React 19).
- **Validation:** `zod` for API response and form validation.

## Data Mapping Strategy
We need to normalize Statorium's statistics (e.g., `goals_scored`, `assists`, `yellow_cards`) into the categories defined in the "Score Dopasowania" algorithm (Offensive, Defensive, Physical, Tactical).

## Risks
- **Data Completeness:** Statorium might not have all "Physical" parameters (sprint distance) for every league. We should allow for manual input overrides as described in F01.
- **API Availability:** Implementation of a fallback/mock layer for development will be needed.
