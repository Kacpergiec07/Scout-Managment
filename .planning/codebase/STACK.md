# Technology Stack

**Analysis Date:** 2026-05-05

## Languages

**Primary:**
- TypeScript 5.9.3 - Used throughout the application for type safety

**Secondary:**
- JavaScript - Some legacy/utility code
- SQL - Database schemas and migrations (Supabase/PostgreSQL)

## Runtime

**Environment:**
- Node.js - JavaScript runtime (via Next.js)

**Package Manager:**
- npm (implied from package.json structure)
- Lockfile: package-lock.json (present based on node_modules existence)

## Frameworks

**Core:**
- Next.js 15.1.7 - React framework with App Router
- React 19.2.4 - UI library
- React DOM 19.2.4 - React DOM renderer

**Testing:**
- Not detected (no test runner configuration found)

**Build/Dev:**
- TypeScript 5.9.3 - Type checking
- Tailwind CSS 4.2.1 - Utility-first CSS framework
- PostCSS 8 - CSS post-processing
- ESLint 9.39.4 - Code linting
- Prettier 3.8.1 - Code formatting

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.103.0 - Database and authentication client
- @supabase/ssr 0.10.2 - Server-side Supabase integration
- ai 6.0.160 - AI/LLM integration framework
- @ai-sdk/openai 3.0.53 - OpenAI SDK wrapper
- @ai-sdk/anthropic 3.0.69 - Anthropic SDK wrapper
- @anthropic-ai/sdk 0.89.0 - Direct Anthropic SDK
- next-themes 0.4.6 - Theme management
- zod 4.3.6 - Schema validation

**Infrastructure:**
- axios 1.15.1 - HTTP client library
- use-debounce 10.1.1 - Debounce utility
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.5.0 - Tailwind class merging

**Data Fetching:**
- cheerio 1.2.0 - HTML parsing for RSS feeds/web scraping

**File Generation:**
- html2canvas 1.4.1 - Canvas from HTML
- jspdf 4.2.1 - PDF generation

**Animation:**
- framer-motion 12.38.0 - Animation library
- canvas-confetti 1.9.4 - Confetti effects

**3D & Visualization:**
- three 0.184.0 - 3D graphics library
- @react-three/fiber 9.6.0 - React renderer for Three.js
- @react-three/drei 10.7.7 - Three.js helpers for React
- three-globe 2.45.2 - Globe visualization
- recharts 3.8.0 - Chart library

**Maps & Geolocation:**
- leaflet 1.9.4 - Interactive maps
- react-leaflet 5.0.0 - React bindings for Leaflet
- leaflet-curve 1.0.0 - Curved paths on maps

**UI Components:**
- @dnd-kit/core 6.3.1 - Drag and drop
- @dnd-kit/sortable 10.0.0 - Sortable drag and drop
- @dnd-kit/utilities 3.2.2 - DnD kit utilities
- react-hook-form 7.72.1 - Form management
- @hookform/resolvers 5.2.2 - Form validation resolvers
- radix-ui 1.4.3 - Headless UI components
- sonner 2.0.7 - Toast notifications
- cmdk 1.1.1 - Command palette
- lucide-react 1.8.0 - Icon library
- react-markdown 10.1.0 - Markdown rendering

**Styling:**
- class-variance-authority 0.7.1 - Component variant management
- tw-animate-css 1.4.0 - Tailwind animation utilities

## Configuration

**Environment:**
- Environment variables configured in `.env.local`
- `.env.example` provides template for required variables
- Key configs required: STATORIUM_API_KEY, ZAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

**Build:**
- next.config.mjs - Next.js configuration with image optimization
- tsconfig.json - TypeScript configuration with strict mode
- postcss.config.mjs - PostCSS with Tailwind CSS plugin
- eslint.config.mjs - ESLint with Next.js recommended rules
- .prettierrc - Prettier configuration with Tailwind plugin

## Platform Requirements

**Development:**
- Node.js environment
- npm package manager
- Environment variables set for API keys

**Production:**
- Vercel or Next.js-compatible hosting platform
- Supabase project (database + auth)
- External API access (Statorium, AI providers)
- Image optimization configured for external domains

---

*Stack analysis: 2026-05-05*
