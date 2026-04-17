---
phase: 4
plan: 2
wave: 1
---

# Plan 4.2: Alerts & Notifications System

## Objective
Keep scouts informed about significant changes to their watchlisted players, such as transfers or major score shifts.

## Context
- .gsd/SPEC.md
- components/notifications-bell.tsx
- app/actions/notifications.ts

## Tasks

<task type="auto">
  <name>Implementation of Notifications Dropdown</name>
  <files>components/notifications-bell.tsx, components/sidebar.tsx</files>
  <action>
    1. Create a `NotificationsBell` component with a red dot for unread alerts.
    2. Build a dropdown list showing recent notifications (e.g., "Haaland score increased by 5%", "Onana moved to Aston Villa").
    3. Integrate the bell into the Sidebar or Header.
  </action>
  <verify>Manually trigger a mock notification and verify the UI updates correctly.</verify>
  <done>User-facing notification hub for real-time (or near real-time) scouting updates.</done>
</task>

<task type="auto">
  <name>Basic Alert Generation Logic</name>
  <files>app/actions/notifications.ts, lib/supabase/schema.sql</files>
  <action>
    1. Create a `notifications` table in Supabase.
    2. Implement a `checkWatchlistAlerts` action that compares current player data vs stored analysis history snapshots.
    3. Generate alert records if significant differences are found (>5% score change).
  </action>
  <verify>Run the alert checker and confirm a notification is generated for a player with changed stats.</verify>
  <done>Backend system for detecting and storing scout alerts based on watchlist data.</done>
</task>

## Success Criteria
- [ ] Notifications are stored in DB and persist across sessions.
- [ ] UI provides clear visual feedback for new alerts.
- [ ] Notifications link directly to the relevant player analysis page.
