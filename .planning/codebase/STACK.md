# Technology Stack

**Analysis Date:** 2026-04-20

## Languages

**Primary:**
- TypeScript 5.9.3 - Core application logic and components
- JavaScript - Used in configuration files

**Secondary:**
- SQL - Database schema definitions
- CSS - Tailwind CSS styling with custom extensions

## Runtime

**Environment:**
- Node.js (via TypeScript compilation)
- Target: ES2022

**Package Manager:**
- npm (inferred from package.json)
- Lockfile: Not detected

## Frameworks

**Core:**
- Next.js 16.1.7 - React framework with App Router
- React 19.2.4 - UI library
- React DOM 19.2.4 - React DOM renderer

**Testing:**
- Not detected - No test framework configured

**Build/Dev:**
- Turbopack (via Next.js) - Fast bundler for dev mode
- TypeScript 5.9.3 - Type checking and compilation
- PostCSS 8 - CSS processing

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.103.0 - Database and authentication client
- @supabase/ssr 0.10.2 - Server-side rendering utilities for Supabase
- @ai-sdk/anthropic 3.0.69 - Anthropic AI SDK for Claude integration
- @ai-sdk/openai 3.0.53 - OpenAI-compatible AI SDK
- ai 6.0.160 - AI SDK core functionality
- next-themes 0.4.6 - Theme management (dark/light mode)

**Infrastructure:**
- zod 4.3.6 - Schema validation
- react-hook-form 7.72.1 - Form handling with validation
- @hookform/resolvers 5.2.2 - Form validation integration with Zod
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.5.0 - Tailwind CSS class merging

**UI Components:**
- @dnd-kit/core 6.3.1 - Drag and drop functionality
- @dnd-kit/sortable 10.0.0 - Sortable lists
- @dnd-kit/utilities 3.2.2 - DnD utilities
- radix-ui 1.4.3 - Unstyled UI primitives
- framer-motion 12.38.0 - Animation library
- lucide-react 1.8.0 - Icon library
- recharts 3.8.0 - Charting library

**3D & Visualization:**
- three 0.184.0 - 3D graphics library
- @react-three/fiber 9.6.0 - React renderer for Three.js
- @react-three/drei 10.7.7 - Three.js helpers for React
- three-globe 2.45.2 - Globe visualization
- leaflet 1.9.4 - Interactive maps
- react-leaflet 5.0.0 - React wrapper for Leaflet

**Utilities:**
- html2canvas 1.4.1 - HTML to canvas conversion
- jspdf 4.2.1 - PDF generation
- cmdk 1.1.1 - Command palette component
- use-debounce 10.1.1 - Debouncing hook
- class-variance-authority 0.7.1 - Component variant management
- tw-animate-css 1.4.0 - Tailwind CSS animations
- shadcn 4.2.0 - UI component library CLI

## Configuration

**Environment:**
- .env.local file present - Contains API keys and configuration
- Environment variables used for:
  - STATORIUM_API_KEY - Sports data API authentication
  - NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase anonymous access key
  - ZAI_API_KEY - AI service authentication
  - ZAI_BASE_URL - AI service endpoint
  - ZAI_MODEL - AI model selection
  - ANTHROPIC_API_KEY - Anthropic Claude API key

**Build:**
- next.config.mjs - Next.js configuration with image domains and transpilation
- tsconfig.json - TypeScript compiler configuration
- postcss.config.mjs - PostCSS configuration
- eslint.config.mjs - ESLint configuration extending Next.js rules
- prettier config via package.json - Code formatting rules

## Platform Requirements

**Development:**
- Node.js with npm
- TypeScript 5.9.3
- Modern browser for development server

**Production:**
- Next.js 16.x compatible hosting (Vercel, Netlify, or Node.js server)
- Supabase project with PostgreSQL database
- API access keys for external services

---

*Stack analysis: 2026-04-20*
