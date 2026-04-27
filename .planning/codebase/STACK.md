# Technology Stack

**Analysis Date:** 2026-04-27

## Languages

**Primary:**
- TypeScript 5.9.3 - All source code, strict mode enabled
- React 19.2.4 - UI component library

**Secondary:**
- JavaScript - Configuration files and build scripts
- CSS - Tailwind CSS utilities and custom styles
- GLSL - Custom shaders for 3D football globe rendering

## Runtime

**Environment:**
- Node.js v25.0.0 - JavaScript runtime
- Next.js 15.1.7 - React framework with App Router

**Package Manager:**
- npm 11.12.1
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 15.1.7 - Full-stack React framework with SSR/SSG
- React 19.2.4 - UI component library
- React DOM 19.2.4 - DOM rendering for React

**Testing:**
- Not detected - No test framework currently configured

**Build/Dev:**
- TypeScript 5.9.3 - Type checking and compilation
- PostCSS 8 - CSS processing
- Tailwind CSS 4.2.1 - Utility-first CSS framework
- ESLint 9.39.4 - Linting and code quality
- Prettier 3.8.1 - Code formatting

## Key Dependencies

**AI & Machine Learning:**
- `@ai-sdk/anthropic` ^3.0.69 - Anthropic AI SDK integration
- `@ai-sdk/openai` ^3.0.53 - OpenAI-compatible API client
- `@ai-sdk/react` ^3.0.162 - React integration for AI SDK
- `@ai-sdk/rsc` ^2.0.160 - React Server Components integration
- `@anthropic-ai/sdk` ^0.89.0 - Direct Anthropic SDK
- `ai` ^6.0.160 - Vercel AI SDK core

**Database & Backend:**
- `@supabase/supabase-js` ^2.103.0 - Supabase client for browser
- `@supabase/ssr` ^0.10.2 - Supabase server-side rendering support

**UI Components & Design:**
- `shadcn` ^4.2.0 - UI component library (Radix Nova style)
- `radix-ui` ^1.4.3 - Accessible component primitives
- `lucide-react` ^1.8.0 - Icon library
- `framer-motion` ^12.38.0 - Animation library
- `cmdk` ^1.1.1 - Command palette component
- `class-variance-authority` ^0.7.1 - Component variant management
- `clsx` ^2.1.1 - Conditional class name utility
- `tailwind-merge` ^3.5.0 - Tailwind class merging

**3D & Visualization:**
- `three` ^0.184.0 - 3D graphics library
- `@react-three/fiber` ^9.6.0 - React renderer for Three.js
- `@react-three/drei` ^10.7.7 - Useful helpers for React Three Fiber
- `three-globe` ^2.45.2 - 3D globe visualization
- `leaflet` ^1.9.4 - Interactive map library
- `react-leaflet` ^5.0.0 - React integration for Leaflet
- `leaflet-curve` ^1.0.0 - Curved lines for Leaflet
- `recharts` ^3.8.0 - Charting library

**Forms & Validation:**
- `react-hook-form` ^7.72.1 - Form state management
- `@hookform/resolvers` ^5.2.2 - Validation resolvers for react-hook-form
- `zod` ^4.3.6 - Schema validation

**Drag & Drop:**
- `@dnd-kit/core` ^6.3.1 - Core drag and drop functionality
- `@dnd-kit/sortable` ^10.0.0 - sortable lists
- `@dnd-kit/utilities` ^3.2.2 - Utility functions for dnd-kit

**Data Fetching & Utilities:**
- `axios` ^1.15.1 - HTTP client
- `cheerio` ^1.2.0 - Server-side jQuery for HTML parsing
- `react-markdown` ^10.1.0 - Markdown rendering
- `html2canvas` ^1.4.1 - HTML to canvas conversion
- `jspdf` ^4.2.1 - PDF generation
- `use-debounce` ^10.1.1 - Debounce hook
- `next-themes` ^0.4.6 - Theme switching (dark/light mode)
- `tw-animate-css` ^1.4.0 - Tailwind CSS animations

**Type Definitions:**
- `@types/node` ^25.5.0 - Node.js type definitions
- `@types/react` ^19.2.14 - React type definitions
- `@types/react-dom` ^19.2.3 - React DOM type definitions
- `@types/leaflet` ^1.9.21 - Leaflet type definitions
- `@types/three` ^0.184.0 - Three.js type definitions

**Development Tools:**
- `tsx` ^4.21.0 - TypeScript execution
- `@tailwindcss/postcss` ^4.2.1 - Tailwind CSS PostCSS plugin
- `prettier-plugin-tailwindcss` ^0.7.2 - Tailwind class sorting for Prettier
- `eslint-config-next` 15.1.7 - Next.js ESLint configuration
- `@eslint/eslintrc` ^3 - ESLint configuration

## Configuration

**Environment:**
- Environment variables: `.env.local` (present, not committed)
- Required vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STATORIUM_API_KEY`, `ANTHROPIC_API_KEY`, `ZAI_API_KEY`

**Build:**
- `next.config.mjs` - Next.js configuration with image domain whitelisting
- `tsconfig.json` - TypeScript configuration with strict mode
- `postcss.config.mjs` - PostCSS configuration with Tailwind
- `eslint.config.mjs` - ESLint configuration using Next.js presets
- `components.json` - shadcn component configuration
- `.prettierrc` - Prettier formatting rules

**Path Aliases:**
- `@/*` → `./src/*` (configured in `tsconfig.json`)

## Platform Requirements

**Development:**
- Node.js 18+ (currently using v25.0.0)
- npm 11.12.1
- Modern browser with ES2022 support
- Git for version control

**Production:**
- Vercel (recommended for Next.js deployment)
- Any Node.js hosting platform with Next.js support
- Supabase for backend services
- Environment variables must be configured

**Browser Support:**
- Modern browsers with ES2022 support
- WebGL support for 3D visualizations
- Canvas support for PDF generation

---

*Stack analysis: 2026-04-27*
