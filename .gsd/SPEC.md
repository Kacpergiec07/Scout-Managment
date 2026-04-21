# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Scout Pro is a professional-grade football scouting and data analysis platform that replaces manual, intuition-based scouting with a data-driven "Score Dopasowania" engine. It bridges the gap between raw player statistics and complex club context (tactics, squad needs, history), enhanced by AI-driven narrative justifications and automated professional reporting.

## Goals
1. **Automated Matching:** Calculate a weighted 0–100 score for player-club compatibility across 96 clubs in 5 top European leagues.
2. **AI-Driven Insights:** Integrate Claude API to provide strategic role analysis, scout justifications, and "scout-lite" chat interactions.
3. **Workflow Efficiency:** Automate the creation of professional PDF scouting reports and provide a Kanban-style Watchlist for player management.
4. **Data Centralization:** Aggregate live data from Statorium API for match stats, squad availability, and club style benchmarks.

## Non-Goals (Out of Scope)
- Analysis of leagues beyond the "Big Five" (at least for MVP).
- Real-time match video streaming or highlights.
- Financial management (actual transfer negotiations or agent fee processing).
- Fan-facing features or social media integrations.

## Users
Professional football scouts, sports data analysts, and club recruitment departments looking for rapid, data-backed talent identification.

## Constraints
- **Data Source:** Statorium API (Players, Stats, Club Context).
- **AI Backend:** Claude API for narrative analysis.
- **Frontend:** Next.js 16 (App Router), Tailwind CSS 4, Shadcn UI.
- **Backend:** Supabase (Auth, PostgreSQL, Storage).
- **Communication:** Resend (Email notifications and PDF sharing).

## Success Criteria
- [ ] Functional "Score Dopasowania" algorithm correctly weighting the 5 defined categories.
- [ ] Integration with Statorium API retrieving live data for all 96 clubs.
- [ ] AI-generated PDF reports with accurate percentiles and radar charts.
- [ ] Active Watchlist with Kanban functionality and persistence.
