# Technology Stack

**Analysis Date:** 2026-05-04

## Languages

**Primary:**
- TypeScript 5.9.3 - All source code (`.ts`, `.tsx` files)

**Secondary:**
- SQL - Database schemas and migrations in `src/lib/supabase/*.sql`

## Runtime

**Environment:**
- Node.js (18+ required) - JavaScript runtime
- Next.js 15.1.7 - React framework with App Router

**Package Manager:**
- npm - Node package manager
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 15.1.7 - React framework with Server Components, App Router, and SSR
- React 19.2.4 - UI library
- React DOM 19.2.4 - DOM rendering

**UI Component Libraries:**
- Radix UI 1.4.3 - Unstyled, accessible UI components
- Shadcn UI 4.2.0 - Component library built on Radix UI
- Lucide React 1.8.0 - Icon library
- Sonner 2.0.7 - Toast notifications

**Testing:**
- Not detected - No testing framework configured in package.json

**Build/Dev:**
- Tailwind CSS 4.2.1 - Utility-first CSS framework
- PostCSS 8 - CSS transformation
- ESLint 9.39.4 - Code linting
- Prettier 3.8.1 - Code formatting
- TypeScript 5.9.3 - Type checking

## Key Dependencies

**AI & ML:**
- @ai-sdk/openai 3.0.53 - OpenAI-compatible AI SDK
- @ai-sdk/anthropic 3.0.69 - Anthropic AI SDK
- @ai-sdk/react 3.0.162 - React integration for AI SDK
- @ai-sdk/rsc 2.0.160 - React Server Components AI integration
- ai 6.0.160 - Core AI SDK
- @anthropic-ai/sdk 0.89.0 - Anthropic Claude SDK

**Data & State:**
- @supabase/supabase-js 2.103.0 - Supabase client
- @supabase/ssr 0.10.2 - Supabase SSR support
- axios 1.15.1 - HTTP client
- zod 4.3.6 - Schema validation
- react-hook-form 7.72.1 - Form management
- @hookform/resolvers 5.2.2 - Form validation resolvers

**3D & Visualization:**
- three 0.184.0 - 3D graphics library
- @react-three/fiber 9.6.0 - React renderer for Three.js
- @react-three/drei 10.7.7 - Useful helpers for react-three-fiber
- three-globe 2.45.2 - 3D globe visualization
- recharts 3.8.0 - Chart library

**Maps & Location:**
- leaflet 1.9.4 - Interactive maps
- react-leaflet 5.0.0 - React Leaflet components
- leaflet-curve 1.0.0 - Leaflet curve extensions

**Drag & Drop:**
- @dnd-kit/core 6.3.1 - Drag and drop core
- @dnd-kit/sortable 10.0.0 - Sortable drag and drop
- @dnd-kit/utilities 3.2.2 - Drag and drop utilities

**Animation & UI:**
- framer-motion 12.38.0 - Animation library
- class-variance-authority 0.7.1 - Component variant management
- clsx 2.1.1 - Conditional class names
- tailwind-merge 3.5.0 - Tailwind class merging

**Document Generation:**
- jspdf 4.2.1 - PDF generation
- html2canvas 1.4.1 - HTML to canvas conversion

**Web Scraping:**
- cheerio 1.2.0 - jQuery-like HTML parser
- use-debounce 10.1.1 - Debounce hook

**Other:**
- cmdk 1.1.1 - Command palette component
- react-markdown 10.1.0 - Markdown rendering
- next-themes 0.4.6 - Theme management
- tw-animate-css 1.4.0 - Tailwind CSS animations

**Infrastructure:**
- @tailwindcss/postcss 4.2.1 - Tailwind PostCSS plugin
- prettier-plugin-tailwindcss 0.7.2 - Prettier Tailwind plugin
- tsx 4.21.0 - TypeScript execution

## Configuration

**Environment:**
- Environment variables: `.env.local` (git-ignored), `.env.example` as template
- Key configs required: Supabase URL, Supabase anon key, API keys

**Build:**
- `next.config.mjs` - Next.js configuration with image optimization
- `tsconfig.json` - TypeScript configuration with path aliases (`@/*` → `./src/*`)
- `postcss.config.mjs` - PostCSS with Tailwind CSS plugin
- `eslint.config.mjs` - ESLint configuration
- `.prettierrc` - Prettier configuration with Tailwind integration
- `components.json` - Shadcn UI configuration

## Platform Requirements

**Development:**
- Node.js 18+ (implied by Next.js 15 requirements)
- npm package manager
- Git for version control

**Production:**
- Deployment target: Vercel (implied by Next.js usage)
- Requires: Supabase project, API keys for Statorium and AI services

---

*Stack analysis: 2026-05-04*
