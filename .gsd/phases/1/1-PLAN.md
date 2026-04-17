---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Environment & Auth Foundation

## Objective
Establish the project's infrastructure by setting up environment variables, local Supabase configuration, and a functional authentication layer using Next.js 16 and Supabase.

## Context
- .gsd/SPEC.md
- .gsd/STACK.md
- .gsd/ARCHITECTURE.md
- .gsd/phases/1/RESEARCH.md

## Tasks

<task type="auto">
  <name>Initialize Environment and Supabase Client</name>
  <files>.env.local, lib/supabase/server.ts, lib/supabase/client.ts, lib/supabase/middleware.ts</files>
  <action>
    1. Create `.env.local` template with placeholders for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `STATORIUM_API_KEY`.
    2. Implement Supabase server and client factories using `@supabase/ssr` as per Next.js App Router best practices.
    3. Implement `middleware.ts` to refresh the session and protect future `/dashboard` routes.
  </action>
  <verify>Check for file existence and run `npm run typecheck` to ensure no environment variable type errors.</verify>
  <done>Supabase client files created and middleware correctly identifies session presence.</done>
</task>

<task type="auto">
  <name>Implementation of Auth Pages & Dashboard Shell</name>
  <files>app/login/page.tsx, app/auth/callback/route.ts, app/auth/actions.ts, app/(dashboard)/layout.tsx</files>
  <action>
    1. Create a modern, dark-themed login page using Shadcn `Button` and `Input` components.
    2. Implement Next.js Server Actions for `login`, `signup`, and `signOut` in `app/auth/actions.ts`.
    3. Implement the `auth/callback` route for PKCE flow (necessary for Supabase SSR).
    4. Create `app/(dashboard)/layout.tsx` with a sidebar navigation placeholder for "Search", "Watchlist", and "History".
  </action>
  <verify>Navigate to /login and verify form renders. Access /dashboard/any and check if sidebar appears.</verify>
  <done>Auth pages are functional and the primary dashboard shell is established.</done>
</task>

## Success Criteria
- [ ] Environment variables configured in `.env.local`.
- [ ] Supabase Auth middleware protecting routes.
- [ ] Users can navigate to a styled Login page.
