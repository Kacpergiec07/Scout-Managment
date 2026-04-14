# Scout Pro 🏟️

Scout Pro is a professional football scouting application that leverages AI and advanced data analytics to match players with European clubs.

## Features
- **Data-Driven Matching:** 5-category weighted scoring algorithm.
- **AI Scout Intelligence:** Claude-powered narrative justifications for every match.
- **Pipeline Management:** Persistence Kanban-style watchlist for tracking talent.
- **Professional Exports:** Branded PDF report generation for club directors.
- **Dashboard HUD:** Premium glassmorphism interface with radar chart visualizations.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4, Shadcn UI
- **Database/Auth:** Supabase SSR
- **AI Engine:** Claude 3.5 Sonnet
- **Charts:** Recharts

## Setup
1. Clone the repository.
2. `npm install`
3. Create `.env.local` based on `.env.local.example`.
4. Run `npm run dev`.

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STATORIUM_API_KEY`
- `ANTHROPIC_API_KEY`

---
*Built with Antigravity AI Coding Assistant.*
