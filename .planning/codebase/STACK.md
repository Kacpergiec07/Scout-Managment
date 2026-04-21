# Technology Stack

**Analysis Date:** 2026-04-21

## Languages

**Primary:**
- TypeScript 5.9.3 - Primary language for all source code (96 TypeScript files)
- JavaScript (ES2022 target) - Used where dynamic typing is acceptable

**Secondary:**
- SQL - Database schema definitions and migrations
- CSS - Tailwind CSS imports and custom styling

## Runtime

**Environment:**
- Node.js 18+ - Required runtime environment
- Next.js 15.1.7 - React framework with App Router

**Package Manager:**
- npm - Primary package manager
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 15.1.7 - Full-stack React framework with SSR/SSG capabilities
- React 19.2.4 - UI component library with concurrent features

**Testing:**
- None configured - No test framework detected

**Build/Dev:**
- Tailwind CSS 4.2.1 - Utility-first CSS framework with PostCSS integration
- PostCSS 8 - CSS preprocessing pipeline
- TypeScript 5.9.3 - Static type checking and compilation
- ESLint 9.39.4 - Code linting with Next.js configuration
- Prettier 3.8.1 - Code formatting with Tailwind plugin

## Key Dependencies

**Critical:**
- @supabase/ssr 0.10.2 - Server-side rendering integration for Supabase auth
- @supabase/supabase-js 2.103.0 - Supabase client for database operations
- @ai-sdk/anthropic 3.0.69 - Anthropic AI SDK integration
- @ai-sdk/openai 3.0.53 - OpenAI SDK for alternative AI models
- @ai-sdk/react 3.0.162 - React components for AI streaming responses
- @ai-sdk/rsc 2.0.160 - React Server Components integration
- ai 6.0.160 - Vercel AI SDK core

**Infrastructure:**
- axios 1.15.1 - HTTP client for external API requests
- cheerio 1.2.0 - Web scraping for Transfermarkt market value data
- zod 4.3.6 - Schema validation and type inference
- react-hook-form 7.72.1 - Form state management and validation
- @hookform/resolvers 5.2.2 - Integration between react-hook-form and Zod

**UI Components:**
- shadcn 4.2.0 - Radix UI component system
- @dnd-kit/core 6.3.1 - Drag and drop functionality
- @dnd-kit/sortable 10.0.0 - Sortable list components
- @dnd-kit/utilities 3.2.2 - Utilities for DnD operations
- lucide-react 1.8.0 - Icon library
- framer-motion 12.38.0 - Animation library
- cmdk 1.1.1 - Command palette component

**Visualization:**
- recharts 3.8.0 - Charting and data visualization
- @react-three/fiber 9.6.0 - React renderer for Three.js
- @react-three/drei 10.7.7 - Helper components for Three.js
- three 0.184.0 - 3D graphics library
- three-globe 2.45.2 - Interactive 3D globe visualization
- react-leaflet 5.0.0 - Leaflet map integration for React
- leaflet 1.9.4 - Interactive map library
- leaflet-curve 1.0.0 - Curve drawing for Leaflet

**Utilities:**
- jspdf 4.2.1 - PDF generation
- html2canvas 1.4.1 - HTML to canvas conversion
- react-markdown 10.1.0 - Markdown rendering
- next-themes 0.4.6 - Theme switching (dark/light mode)
- use-debounce 10.1.1 - Debouncing hook
- clsx 2.1.1 - Conditional class name utility
- class-variance-authority 0.7.1 - Component variant management
- tailwind-merge 3.5.0 - Tailwind class merging utility
- tw-animate-css 1.4.0 - Tailwind animation utilities

## Configuration

**Environment:**
- Environment variables configured via `.env.local`
- Key configs required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STATORIUM_API_KEY`, `ANTHROPIC_API_KEY`, `ZAI_API_KEY`

**Build:**
- `next.config.mjs` - Next.js configuration with image optimization
- `tsconfig.json` - TypeScript compilation settings
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS
- `eslint.config.mjs` - ESLint configuration with Next.js presets
- `.prettierrc` - Prettier formatting rules with Tailwind plugin
- `components.json` - shadcn/radix UI component configuration

## Platform Requirements

**Development:**
- Node.js 18+ runtime environment
- npm package manager
- Modern web browser with ES2022 support

**Production:**
- Vercel-compatible deployment target (Next.js optimized)
- Supabase cloud infrastructure for database and auth
- External API access: Statorium API, Anthropic AI, Z.ai, Transfermarkt web scraping

---

*Stack analysis: 2026-04-21*
