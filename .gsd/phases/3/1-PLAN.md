---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: AI Scout Assistant (Claude Integration)

## Objective
Integrate the Claude API to provide intelligent narrative justifications for player compatibility and strategic scout recommendations.

## Context
- .gsd/SPEC.md
- .gsd/phases/3/RESEARCH.md
- app/actions/ai.ts
- components/scout/ai-narrative.tsx

## Tasks

<task type="auto">
  <name>Setup AI Server Action with Claude</name>
  <files>app/actions/ai.ts, .env.local</files>
  <action>
    1. Setup the Claude API client (using Anthropic SDK or Amazon Bedrock).
    2. Implement a `generateScoutNarrative` Server Action.
    3. The action must receive Player Stats and Club Context, then prompt Claude to generate a 2-3 paragraph professional scout report.
    4. Implement streaming for the AI response to enhance UX (token-by-token).
  </action>
  <verify>Run a scratch script to query the action and verify it returns coherent, football-focused text based on provided stats.</verify>
  <done>Claude can produce detailed scout justifications based on engine data.</done>
</task>

<task type="auto">
  <name>Implementation of AI Narrative Component</name>
  <files>components/scout/ai-narrative.tsx, components/ui/skeleton.tsx</files>
  <action>
    1. Create a "Scout Insights" component using Shadcn `Card`.
    2. Use a loading skeleton while the AI is generating.
    3. Render the streamed markdown text smoothly.
    4. Add a "Copy to Report" button for future PDF generation.
  </action>
  <verify>Trigger an analysis and verify the AI Narrative section appears and fills with text.</verify>
  <done>Scouts can see "AI Reasoning" alongside the raw compatibility scores.</done>
</task>

## Success Criteria
- [ ] Claude API successfully generates text based on calculated scores.
- [ ] Responses are streamed to avoid long loading states.
- [ ] Prompt template includes tactical terminology (e.g., "progressive passes", "pressing intensity").
