# Technology Stack

**Analysis Date:** 2026-04-21

## Languages

**Primary:**
- TypeScript 5.9.3 - Core application logic and components
- JavaScript - Used in configuration files

**Secondary:**
- SQL - Database schema definitions and migrations
- CSS - Tailwind CSS styling with custom extensions

## Runtime

**Environment:**
- Node.js (via TypeScript compilation)
- Target: ES2022

**Package Manager:**
- npm - Package manager
- Lockfile: package-lock.json (present)

## Frameworks

**Core:**
- Next.js 15.1.7 - React framework with App Router and Server Components
- React 19.2.4 - UI library
- React DOM 19.2.4 - React DOM renderer

**AI/ML:**
- ai 6.0.160 - Vercel AI SDK framework
- @ai-sdk/anthropic 3.0.69 - Anthropic Claude integration
- @ai-sdk/openai 3.0.53 - OpenAI-compatible AI SDK
- @ai-sdk/react 3.0.162 - React hooks for AI SDK
- @ai-sdk/rsc 2.0.160 - React Server Components for AI SDK

**Authentication & Database:**
- @supabase/supabase-js 2.103.0 - Supabase client library
- @supabase/ssr 0.10.2 - Server-side rendering support for Supabase

**UI/3D:**
- Three.js 0.184.0 - 3D graphics rendering
- @react-three/fiber 9.6.0 - React renderer for Three.js
- @react-three/drei 10.7.7 - Useful helpers for react-three-fiber
- three-globe 2.45.2 - Globe visualization component

**Data Visualization:**
- recharts 3.8.0 - Charting library
- leaflet 1.9.4 - Interactive maps
- react-leaflet 5.0.0 - React components for Leaflet

**Testing:**
- Not detected - No test framework configured

**Build/Dev:**
- TypeScript 5.9.3 - Type checking and compilation
- Tailwind CSS 4.2.1 - Utility-first CSS framework
- PostCSS 8 - CSS processing
- ESLint 9.39.4 - Linting
- Prettier 3.8.1 - Code formatting
- tsx 4.21.0 - TypeScript execution

## Key Dependencies

**Critical:**
- @supabase/supabase-js + @supabase/ssr - Handles server-side authentication and database sessions
- @ai-sdk/openai + @ai-sdk/anthropic - AI capabilities for player analysis and chat
- next-themes 0.4.6 - Dark mode theming

**Infrastructure:**
- react-hook-form 7.72.1 - Form handling with Zod validation
- zod 4.3.6 - Schema validation
- @dnd-kit/core 6.3.1 - Drag and drop functionality
- html2canvas 1.4.1 - Screenshot generation for reports
- jspdf 4.2.1 - PDF generation

**UI Components:**
- radix-ui 1.4.3 - Unstyled UI components
- lucide-react 1.8.0 - Icon library
- cmdk 1.1.1 - Command palette
- class-variance-authority 0.7.1 - Component variants
- clsx 2.1.1 - Conditional classes
- tailwind-merge 3.5.0 - Tailwind class merging

## Configuration

**Environment:**
- .env.local file present for environment variables
- Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, STATORIUM_API_KEY, ZAI_API_KEY

**Build:**
- next.config.mjs - Next.js configuration with image domains
- tsconfig.json - TypeScript configuration with path aliases (@/*)
- eslint.config.mjs - ESLint configuration using Next.js presets
- postcss.config.mjs - PostCSS configuration for Tailwind CSS

## Platform Requirements

**Development:**
- Node.js with npm
- TypeScript 5.9.3
- Modern browser for development server

**Production:**
- Next.js 15.x compatible hosting (Vercel, Netlify, or Node.js server)
- Supabase PostgreSQL database
- Statorium API access
- AI provider API keys (Anthropic/Z.ai)

---

*Stack analysis: 2026-04-21*