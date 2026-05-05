# Technology Stack

**Analysis Date:** 2026-05-05

## Languages

**Primary:**
- TypeScript [5.9.3] - Full type safety across entire codebase with strict mode enabled
- JavaScript [ES2022] - Runtime target configuration

**Secondary:**
- SQL [PostgreSQL dialect] - Database schemas and migrations in `src/lib/supabase/*.sql`

## Runtime

**Environment:**
- Node.js [18+ required] - Next.js 15 runtime environment

**Package Manager:**
- npm - Package management
- Lockfile: package-lock.json [present, 582KB]

## Frameworks

**Core:**
- Next.js [15.1.7] - Full-stack React framework with App Router
  - Server Components for performance
  - Route Handlers for API endpoints
  - Middleware for auth
  - Server Actions for mutations
- React [19.2.4] - UI library
- React DOM [19.2.4] - DOM rendering

**AI/ML:**
- Vercel AI SDK [6.0.160] - AI integration framework
  - @ai-sdk/react [3.0.162] - React components for AI
  - @ai-sdk/rsc [2.0.160] - React Server Components for AI
  - @ai-sdk/anthropic [3.0.69] - Anthropic Claude integration
  - @ai-sdk/openai [3.0.53] - OpenAI-compatible API integration
- Anthropic SDK [0.89.0] - Direct Claude API access

**UI/Visualization:**
- Tailwind CSS [4.2.1] - Utility-first CSS framework
  - @tailwindcss/postcss [4.2.1] - PostCSS integration
- Framer Motion [12.38.0] - Animation library
- Recharts [3.8.0] - Charting and data visualization
- Three.js [0.184.0] - 3D graphics rendering
  - @react-three/fiber [9.6.0] - React renderer for Three.js
  - @react-three/drei [10.7.7] - Three.js helpers
  - three-globe [2.45.2] - Globe visualization component

**Maps & Geospatial:**
- Leaflet [1.9.4] - Interactive maps
- React Leaflet [5.0.0] - React components for Leaflet
- Leaflet Curve [1.0.0] - Curved line drawing on maps

**State Management:**
- React Hook Form [7.72.1] - Form state management
  - @hookform/resolvers [5.2.2] - Schema validation
- Zod [4.3.6] - Schema validation
- Server Actions (Next.js) - Server-side mutations
- React Context - Theme management (next-themes)

**Drag & Drop:**
- @dnd-kit/core [6.3.1] - Drag and drop core
- @dnd-kit/sortable [10.0.0] - Sortable lists
- @dnd-kit/utilities [3.2.2] - DnD utilities

**Authentication & Database:**
- Supabase JS [2.103.0] - Database and auth client
  - @supabase/ssr [0.10.2] - Server-side rendering support

**Testing:**
- No formal testing framework detected (no test files found)

**Build/Dev:**
- TypeScript [5.9.3] - Type checking and compilation
- ESLint [9.39.4] - Code linting
  - eslint-config-next [15.1.7] - Next.js ESLint config
- Prettier [3.8.1] - Code formatting
  - prettier-plugin-tailwindcss [0.7.2] - Tailwind class sorting
- PostCSS [8] - CSS processing
- tsx [4.21.0] - TypeScript execution

## Key Dependencies

**Critical:**
- axios [1.15.1] - HTTP client for external API calls
- cheerio [1.2.0] - HTML parsing for web scraping (Transfermarkt)
- clsx [2.1.1] - Conditional className utility
- tailwind-merge [3.5.0] - Tailwind class merging
- use-debounce [10.1.1] - Debouncing utilities

**Infrastructure:**
- next-themes [0.4.6] - Theme switching
- lucide-react [1.8.0] - Icon library
- cmdk [1.1.1] - Command palette component
- sonner [2.0.7] - Toast notifications
- react-markdown [10.1.0] - Markdown rendering
- html2canvas [1.4.1] - HTML to canvas conversion
- jspdf [4.2.1] - PDF generation
- confetti [3.0.4] - Celebration effects
- canvas-confetti [1.9.4] - Canvas-based confetti
- class-variance-authority [0.7.1] - Component variant management
- tw-animate-css [1.4.0] - Tailwind animations

**UI Components:**
- shadcn [4.2.0] - UI component library (based on Radix UI)
- radix-ui [1.4.3] - Accessible component primitives
  - Dialog, Dropdown Menu, Popover, Command, Avatar, Badge, Button, Checkbox, Input, Label

## Configuration

**Environment:**
- Next.js environment variables (.env.local)
- Required vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, STATORIUM_API_KEY, ZAI_API_KEY, ZAI_BASE_URL, ZAI_MODEL, ANTHROPIC_API_KEY
- Optional vars: NEXT_PUBLIC_TWITTER_BEARER_TOKEN, NEXT_PUBLIC_CORS_PROXY_URL, NEXT_PUBLIC_ENABLE_MOCK_DATA, NEXT_PUBLIC_NEWS_REFRESH_INTERVAL, NEXT_PUBLIC_APP_URL

**Build:**
- next.config.mjs - Next.js configuration (image domains, optimization)
- tsconfig.json - TypeScript configuration (path aliases, strict mode, @/* alias)
- postcss.config.mjs - PostCSS configuration (Tailwind)
- eslint.config.mjs - ESLint configuration
- .prettierrc - Prettier configuration (Tailwind plugin integration)
- components.json - shadcn/ui configuration

## Platform Requirements

**Development:**
- Node.js 18+ (for Next.js 15)
- npm or compatible package manager
- Git for version control
- Supabase account for database/auth

**Production:**
- Vercel (recommended for Next.js)
- Supabase (hosted PostgreSQL)
- Any Node.js 18+ hosting platform

---

*Stack analysis: 2026-05-05*
