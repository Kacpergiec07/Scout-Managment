# Research: Phase 3 — AI & Management

> **Discovery Level**: 2 (Standard Research)
> **Date**: 2026-04-14

## Overview
Phase 3 integrates the "AI Scout Assistant" (Claude) and establishes the management hub for scouts (Watchlist/Kanban).

## Findings

### 1. AI Assistant (Claude API)
- **Model:** Claude 3.5 Sonnet (via Amazon Bedrock or Anthropic Direct) for high-quality reasoning.
- **Prompt Engineering:** The assistant needs a system prompt containing the "Scout Pro DNA":
  - Full player profile
  - Calculated compatibility score and breakdown
  - Target club's tactical profile
- **Functionality:** Narrative justification, role analysis ("How would he fit in 4-3-3?"), and alternative comparisons.

### 2. Watchlist Kanban (`@dnd-kit`)
- **Structure:** 4 Columns (Observe, Priority, Analyzing, Done).
- **State Management:** Optimistic updates on the client, followed by Supabase persistence.
- **Persistence:** A `watchlist` table in PostgreSQL with `player_id`, `status`, and `notes`.

### 3. Database Schema Updates
- **Table: `watchlist`**
  - `id` (uuid)
  - `user_id` (uuid, fk to auth.users)
  - `player_id` (uuid, fk to players)
  - `status` (enum: following, priority, analyzing, complete)
  - `notes` (text)
  - `updated_at` (timestamptz)

- **Table: `analysis_history`**
  - `id` (uuid)
  - `user_id` (uuid)
  - `player_id` (uuid)
  - `results` (jsonb)
  - `created_at` (timestamptz)

## Technology Choices
- **AI:** Claude SDK.
- **Drag-and-Drop:** `@dnd-kit/core` and `@dnd-kit/sortable`.
- **Database:** Supabase PostgreSQL.

## Risks
- **AI Latency:** Use streaming (Server Sent Events) for a snappy "typed" response experience (F03).
- **Concurrent Edits:** Watchlist notes need auto-save (F05) using debounced Supabase updates.
