---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Premium UX & Interaction Polish

## Objective
Finalize the visual experience to match the "Scout Pro" premium spec, adding micro-animations, loading states, and HUD-style aesthetics.

## Context
- .gsd/ROADMAP.md (REQ-14)
- app/globals.css
- components/theme-provider.tsx

## Tasks

<task type="auto">
  <name>Implement HUD-style HUD & Glassmorphism</name>
  <files>app/globals.css, components/sidebar.tsx</files>
  <action>
    1. Apply the previously created `glass-panel` and `emerald-gradient` classes to the Sidebar, Cards, and Nav.
    2. Add a global "scanline" or subtle animated gradient header to give it a tech-forward scouting HUD feel.
    3. Finalize dark-mode colors to ensure high contrast and professional sports-broadcast aesthetics.
  </action>
  <verify>Visually inspect the dashboard and verify it feels "Premium" and unified.</verify>
  <done>The application matches the luxury sports-tech aesthetic described in the SPEC.</done>
</task>

<task type="auto">
  <name>Global Micro-animations & Transitions</name>
  <files>app/layout.tsx, components/ui/*.tsx</files>
  <action>
    1. Add page transitions using Framer Motion or standard CSS view transitions.
    2. Implement hover scales and glowing effects for key CTA buttons (Analyze, Export).
    3. Add "staggered" entry animations for ranking lists and kanban boards.
  </action>
  <verify>Navigate between dashboard/search/history and verify smooth interaction flow.</verify>
  <done>User interactions feel fluid, responsive, and alive.</done>
</task>

## Success Criteria
- [ ] No generic colors (plain red/blue); all colors match the emerald/zinc palette.
- [ ] Page components animate in smoothly without flickering.
- [ ] Dashboard feels "premium" (HUD-inspired).
