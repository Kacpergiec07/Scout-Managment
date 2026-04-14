# ROADMAP.md

> **Current Phase**: Phase 0: Initialization
> **Milestone**: v1.0 (MVP)

## Must-Haves (from SPEC)
- [ ] Statorium API Integration (96 clubs, players)
- [ ] Score Dopasowania Algorithm (5 categories)
- [ ] AI Scout Assistant (Claude Integration)
- [ ] PDF Report Generator
- [ ] Watchlist (Kanban)

## Phases

### Phase 1: Foundation & Data Integration
**Status**: ✅ Complete
**Objective**: Establish the core architecture and verify data flow from Statorium API.
**Requirements**: REQ-01, REQ-10, REQ-14
- Setup Supabase Auth & Database schema
- Implement Statorium API client and caching layer
- Create Player Profile form with Autocomplete
- Build basic Dashboard shell

### Phase 2: Core Match Engine
**Status**: ⬜ Not Started
**Objective**: Implement the heavy-lifting logic for club-player matching and benchmarking.
**Requirements**: REQ-02, REQ-03, REQ-05
- Implement Score Dopasowania algorithm
- Build the Ranking View with category breakdowns
- Implement Radar Charts and Percentile visualizations
- Create Basic Filter system for rankings

### Phase 3: AI & Management
**Status**: ⬜ Not Started
**Objective**: Inject intelligence and provide management tools for scouts.
**Requirements**: REQ-04, REQ-06, REQ-08
- Integrate Claude API for narrative justifications
- Implement persistent Watchlist (Kanban)
- Add AI Scout Chat side-panel
- Setup automated history tracking for analyses

### Phase 4: Reports & Alerts
**Status**: ⬜ Not Started
**Objective**: Professionalize the output and keep users engaged via notifications.
**Requirements**: REQ-07, REQ-11, REQ-09
- Build PDF Report Generator (SVG to PDF)
- Implement contract expiration alerts and transfer notifications
- Add historical trend charts for players
- Setup Resend for email delivery

### Phase 5: Advanced Analytics & UX
**Status**: ⬜ Not Started
**Objective**: Deliver high-end comparison tools and final polish.
**Requirements**: REQ-12, REQ-13
- Build 1v1 Player Comparison engine
- Implement Advanced Filters (Saved filters, statististical ranges)
- Onboarding tutorial and UX micro-animations
- Final UAT and Performance optimization
