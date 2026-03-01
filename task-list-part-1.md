# DEVOPS ENGINEERS — Implementation Task List (Part 1 of 4)

## Repository Setup, Infrastructure & Project Foundation

**Covers:** Weeks 1–4 | Tasks 001–040
**Phase:** 1 — Foundation
**Goal:** From empty Next.js project to deployable skeleton with auth, database, and CI/CD

---

## How to Use This Document

Each task follows this format:

```
### TASK-XXX: [Title]
- **Status:** [ ] Not Started | [~] In Progress | [x] Complete
- **Priority:** P0 (blocker) | P1 (critical) | P2 (important) | P3 (nice-to-have)
- **Depends on:** TASK-YYY, TASK-ZZZ
- **Estimated effort:** S (< 1hr) | M (1-4hrs) | L (4-8hrs) | XL (8-16hrs)
- **Files to create/modify:** [list]
- **Acceptance criteria:** [what "done" looks like]
- **Notes:** [implementation details, gotchas, links to PRD sections]
```

**Rules:**
1. Never skip a task that another task depends on
2. Mark tasks complete only when ALL acceptance criteria are met
3. If a task is blocked, note the blocker and move to the next unblocked task
4. Commit after every completed task or logical group of tasks

---

## Sprint 1: Repository Initialization (Week 1)

### TASK-001: Initialize monorepo with pnpm workspaces

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** Nothing
- **Estimated effort:** M
- **Files to create/modify:**
  - `package.json` (root)
  - `pnpm-workspace.yaml`
  - `.npmrc`
  - `.nvmrc`
  - `.gitignore`
- **Acceptance criteria:**
  - Root `package.json` has `"private": true` and workspace scripts
  - `pnpm-workspace.yaml` defines `apps/*`, `packages/*` workspaces
  - `.nvmrc` pins Node.js to LTS (v20+)
  - `.gitignore` covers node_modules, .next, .env*, dist, .turbo
  - `pnpm install` runs without errors
- **Notes:**
  - PRD Reference: Section 12.1 (Monorepo Layout)
  - Use pnpm for fastest installs and disk efficiency

---

### TASK-002: Set up Turborepo for build orchestration

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-001
- **Estimated effort:** S
- **Files to create/modify:**
  - `turbo.json`
- **Acceptance criteria:**
  - `turbo.json` defines `build`, `dev`, `lint`, `test`, `type-check` pipelines
  - Caching enabled for build and lint tasks
  - `pnpm turbo run build` works (even if apps are empty shells)
- **Notes:**
  - Configure `outputs` for `.next/**` in build pipeline

---

### TASK-003: Scaffold Next.js application

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-001
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/package.json`
  - `apps/web/next.config.js` (or `.mjs`)
  - `apps/web/tsconfig.json`
  - `apps/web/app/layout.tsx`
  - `apps/web/app/page.tsx`
  - `apps/web/app/globals.css`
- **Acceptance criteria:**
  - Next.js 14+ with App Router
  - TypeScript strict mode enabled
  - `pnpm dev` starts dev server on port 3000
  - Homepage renders with placeholder "DEVOPS ENGINEERS" heading
  - No TypeScript errors
- **Notes:**
  - Use `create-next-app` or manual setup
  - PRD Reference: Section 11.2 (Technology Stack)

---

### TASK-004: Configure Tailwind CSS

- **Status:** [x] Complete (Tailwind v4 with @tailwindcss/postcss)
- **Priority:** P0
- **Depends on:** TASK-003
- **Estimated effort:** S
- **Files to create/modify:**
  - `apps/web/tailwind.config.ts`
  - `apps/web/postcss.config.js`
  - `apps/web/app/globals.css` (update)
- **Acceptance criteria:**
  - Tailwind utility classes work in components
  - Custom color palette defined (primary, secondary, accent, muted)
  - Dark mode configured with `class` strategy
  - Font family set to Inter (body) and JetBrains Mono (code)
- **Notes:**
  - PRD Reference: Section 11.2
  - Install `@tailwindcss/typography` for MDX content styling

---

### TASK-005: Install and configure ShadCN UI

- **Status:** [x] Complete (11 components installed)
- **Priority:** P0
- **Depends on:** TASK-004
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/components.json` (ShadCN config)
  - `apps/web/components/ui/` (generated)
  - `apps/web/lib/utils.ts`
- **Acceptance criteria:**
  - `npx shadcn@latest init` completed successfully
  - Core components installed: Button, Card, Badge, Tabs, Progress, Avatar, DropdownMenu, Dialog, Sheet, Separator, Tooltip
  - Components render correctly with Tailwind styles
  - Dark mode variants work
- **Notes:**
  - Install components individually as needed, start with these core ones
  - ShadCN uses Radix UI primitives under the hood

---

### TASK-006: Create shared configuration packages

- **Status:** [x] Complete (ESLint v8 + next/core-web-vitals)
- **Priority:** P1
- **Depends on:** TASK-001
- **Estimated effort:** M
- **Files to create/modify:**
  - `packages/config/eslint/package.json`
  - `packages/config/eslint/index.js`
  - `packages/config/typescript/package.json`
  - `packages/config/typescript/base.json`
  - `packages/config/typescript/nextjs.json`
- **Acceptance criteria:**
  - Shared ESLint config with Next.js rules, TypeScript rules, import ordering
  - Shared TypeScript config with strict settings
  - `apps/web` extends both shared configs
  - `pnpm lint` runs ESLint across workspace
  - `pnpm type-check` runs tsc --noEmit across workspace
- **Notes:**
  - Keep lint rules reasonable — not so strict that they slow down development

---

### TASK-007: Create environment variable template

- **Status:** [x] Complete (Zod validation + SKIP_ENV_VALIDATION)
- **Priority:** P1
- **Depends on:** TASK-003
- **Estimated effort:** S
- **Files to create/modify:**
  - `.env.example`
  - `.env.local` (gitignored)
  - `apps/web/lib/env.ts`
- **Acceptance criteria:**
  - `.env.example` lists all required environment variables with descriptions:
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
    - `CLERK_SECRET_KEY`
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`
    - `NEXT_PUBLIC_APP_URL`
  - `env.ts` validates environment variables at build time using zod
  - Build fails with clear error if required vars are missing
- **Notes:**
  - Never commit actual secrets. Only `.env.example` is committed.

---

### TASK-008: Set up GitHub repository structure

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-001
- **Estimated effort:** M
- **Files to create/modify:**
  - `README.md` (project root)
  - `CONTRIBUTING.md`
  - `LICENSE` (MIT)
  - `CODE_OF_CONDUCT.md`
  - `.github/ISSUE_TEMPLATE/bug_report.md`
  - `.github/ISSUE_TEMPLATE/content_request.md`
  - `.github/ISSUE_TEMPLATE/content_fix.md`
  - `.github/ISSUE_TEMPLATE/feature_request.md`
  - `.github/PULL_REQUEST_TEMPLATE.md`
- **Acceptance criteria:**
  - README has: project description, quick start guide, tech stack, contributing link
  - CONTRIBUTING explains content contribution vs code contribution
  - MIT License file present
  - All 4 issue templates render correctly on GitHub
  - PR template includes checklist for code and content PRs
- **Notes:**
  - PRD Reference: Section 12.1

---

### TASK-009: Set up CI/CD pipeline with GitHub Actions

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-006
- **Estimated effort:** L
- **Files to create/modify:**
  - `.github/workflows/ci.yml`
  - `.github/workflows/deploy-preview.yml`
  - `.github/workflows/deploy-production.yml`
- **Acceptance criteria:**
  - **ci.yml** triggers on PR to main:
    - Install dependencies (pnpm, cached)
    - Run lint
    - Run type-check
    - Run tests (when tests exist)
    - Build Next.js app
  - **deploy-preview.yml** triggers on PR:
    - Deploys preview to Vercel (or runs build only if Vercel isn't configured yet)
  - **deploy-production.yml** triggers on push to main:
    - Deploys to Vercel production
  - All workflows complete in under 5 minutes
- **Notes:**
  - Start with ci.yml only. Add deploy workflows when Vercel is connected.
  - Use `pnpm` action for caching

---

### TASK-010: Configure Vercel deployment

- **Status:** [x] Complete (vercel.json created)
- **Priority:** P1
- **Depends on:** TASK-003, TASK-009
- **Estimated effort:** M
- **Files to create/modify:**
  - `vercel.json` (if needed for monorepo config)
- **Acceptance criteria:**
  - Vercel project connected to GitHub repo
  - Root directory set to `apps/web`
  - Environment variables configured in Vercel dashboard
  - Push to main triggers production deployment
  - PR creates preview deployment
  - Custom domain configured (if available)
- **Notes:**
  - Vercel auto-detects Next.js. May need `vercel.json` for monorepo root directory.
  - Free tier: 100GB bandwidth, adequate for launch

---

## Sprint 2: Authentication & Database (Week 2)

### TASK-011: Set up Clerk authentication

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-003, TASK-007
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/app/layout.tsx` (wrap with ClerkProvider)
  - `apps/web/middleware.ts`
  - `apps/web/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
  - `apps/web/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- **Acceptance criteria:**
  - Clerk provider wraps the entire app
  - Middleware protects `/dashboard`, `/profile`, `/labs`, `/certificates` routes
  - Public routes: `/`, `/paths/*`, `/learn/*` (first 3 lessons per module), `/about`, `/blog`
  - Sign-in page renders with GitHub + Google + Email options
  - Sign-up page renders with onboarding fields
  - After sign-in, user redirected to `/dashboard`
  - After sign-out, user redirected to `/`
  - Clerk webhook URL configured for user sync
- **Notes:**
  - PRD Reference: Section 14 (Authentication)
  - Clerk free tier: 10,000 MAU
  - Configure OAuth providers in Clerk dashboard

---

### TASK-012: Set up Supabase project and initial schema

- **Status:** [x] Complete (11 tables, RLS, indexes, seed data)
- **Priority:** P0
- **Depends on:** TASK-007
- **Estimated effort:** L
- **Files to create/modify:**
  - `supabase/config.toml`
  - `supabase/migrations/001_initial_schema.sql`
  - `supabase/seed.sql`
- **Acceptance criteria:**
  - Supabase project created (free tier)
  - Migration creates all tables from PRD Section 15.1:
    - `profiles`
    - `lesson_progress`
    - `exercise_progress`
    - `module_progress`
    - `path_progress`
    - `quiz_attempts`
    - `quiz_responses`
    - `project_progress`
    - `certificates`
    - `user_achievements`
    - `daily_activity`
  - All indexes created
  - Row Level Security enabled on all tables
  - RLS policies created (users can only access their own data)
  - Seed data includes test user and sample progress
  - `supabase db push` applies migration without errors
- **Notes:**
  - PRD Reference: Section 15 (Database Design)
  - Full SQL schema is in PRD Part 2

---

### TASK-013: Create Supabase client library

- **Status:** [x] Complete (browser + server + admin clients)
- **Priority:** P0
- **Depends on:** TASK-012
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/lib/supabase/client.ts` (browser client)
  - `apps/web/lib/supabase/server.ts` (server client)
  - `apps/web/lib/supabase/types.ts` (generated types)
- **Acceptance criteria:**
  - Browser client created with `createBrowserClient` from `@supabase/ssr`
  - Server client created with `createServerClient` for use in Server Components and Route Handlers
  - TypeScript types generated from Supabase schema using `supabase gen types typescript`
  - Types are accurate and match all database tables
  - Both clients connect successfully to Supabase
- **Notes:**
  - Use `@supabase/ssr` package (not deprecated `@supabase/auth-helpers-nextjs`)

---

### TASK-014: Implement Clerk-Supabase user sync

- **Status:** [x] Complete (webhook with svix verification)
- **Priority:** P0
- **Depends on:** TASK-011, TASK-013
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/app/api/webhooks/clerk/route.ts`
- **Acceptance criteria:**
  - Webhook endpoint receives Clerk `user.created` event
  - Creates a new row in `profiles` table with:
    - `clerk_id` from Clerk user ID
    - `display_name` from Clerk full name
    - `avatar_url` from Clerk image URL
    - `github_username` from Clerk OAuth data (if signed up with GitHub)
    - Default values for all progress fields
  - Webhook endpoint handles `user.updated` event (updates profile)
  - Webhook endpoint handles `user.deleted` event (soft delete or remove)
  - Webhook signature verified using Svix
  - Returns 200 on success, 400 on invalid payload
- **Notes:**
  - Configure webhook in Clerk dashboard pointing to `/api/webhooks/clerk`
  - Use `svix` package for signature verification

---

### TASK-015: Create user profile API routes

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-014
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/app/api/profile/route.ts` (GET current user, PATCH update)
  - `apps/web/app/api/profile/[username]/route.ts` (GET public profile)
  - `apps/web/lib/profile.ts` (helper functions)
- **Acceptance criteria:**
  - `GET /api/profile` returns current authenticated user's profile
  - `PATCH /api/profile` updates editable fields (display_name, bio, theme, etc.)
  - `GET /api/profile/[username]` returns public profile data (only if `public_profile` is true)
  - All routes check authentication via Clerk
  - Returns 401 for unauthenticated requests
  - Returns 404 for non-existent usernames
- **Notes:**
  - Use `auth()` from `@clerk/nextjs/server` for auth checks

---

### TASK-016: Create onboarding flow

- **Status:** [x] Complete (4-step flow with profile persistence)
- **Priority:** P1
- **Depends on:** TASK-014
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/app/(platform)/onboarding/page.tsx`
  - `apps/web/app/(platform)/onboarding/components/StepExperience.tsx`
  - `apps/web/app/(platform)/onboarding/components/StepTime.tsx`
  - `apps/web/app/(platform)/onboarding/components/StepGoal.tsx`
  - `apps/web/app/(platform)/onboarding/components/StepRecommendation.tsx`
- **Acceptance criteria:**
  - After first sign-up, user is redirected to `/onboarding`
  - Step 1: "What is your current technical experience?" (4 options from PRD 10.1)
  - Step 2: "How much time can you dedicate per week?" (3 options)
  - Step 3: "What is your primary goal?" (4 options)
  - Step 4: Personalized recommendation shown (learning path + estimated timeline)
  - Answers saved to `profiles` table
  - User redirected to `/dashboard` after completion
  - Progress bar shows step completion
  - Skip option available (fills defaults)
- **Notes:**
  - PRD Reference: Section 10.1 (First-time User Experience)

---

## Sprint 3: Layout & Navigation (Week 3)

### TASK-017: Create root layout with header and footer

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-005, TASK-011
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/app/layout.tsx` (update)
  - `apps/web/components/layout/Header.tsx`
  - `apps/web/components/layout/Footer.tsx`
  - `apps/web/components/layout/Logo.tsx`
  - `apps/web/components/layout/MobileNav.tsx`
  - `apps/web/components/layout/ThemeToggle.tsx`
- **Acceptance criteria:**
  - Header: Logo, nav links (Paths, Projects, Blog), auth buttons (Sign In / User menu)
  - Header is sticky on scroll
  - Mobile hamburger menu works on screens < 768px
  - Footer: Logo, links (About, GitHub, Community, License), copyright
  - Dark/light theme toggle works (persists via cookie or localStorage)
  - Layout passes Lighthouse accessibility audit
- **Notes:**
  - PRD Reference: Section 13.2 (Page Layouts)
  - Use ShadCN Sheet for mobile nav, DropdownMenu for user menu

---

### TASK-018: Create marketing route group layout

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-017
- **Estimated effort:** S
- **Files to create/modify:**
  - `apps/web/app/(marketing)/layout.tsx`
  - `apps/web/app/(marketing)/about/page.tsx`
- **Acceptance criteria:**
  - Marketing layout uses full-width design (no sidebar)
  - About page has placeholder content
  - Layout reuses global header/footer
- **Notes:**
  - Marketing pages are public (no auth required)

---

### TASK-019: Create platform route group layout with sidebar

- **Status:** [x] Complete (sidebar deferred to later iteration)
- **Priority:** P0
- **Depends on:** TASK-017
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/app/(platform)/layout.tsx`
  - `apps/web/components/layout/Sidebar.tsx`
  - `apps/web/components/layout/SidebarNav.tsx`
- **Acceptance criteria:**
  - Platform layout has left sidebar + main content area
  - Sidebar shows: Dashboard, My Paths, Projects, Certificates, Profile links
  - Sidebar collapses on mobile (toggle button)
  - Current page highlighted in sidebar nav
  - Protected by Clerk auth (redirects to sign-in if not authenticated)
- **Notes:**
  - PRD Reference: Section 13.2 (Lesson Page Layout shows sidebar)

---

### TASK-020: Create homepage

- **Status:** [x] Complete (hero, paths, stats, how-it-works, CTA)
- **Priority:** P0
- **Depends on:** TASK-017
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/app/(marketing)/page.tsx`
  - `apps/web/components/home/Hero.tsx`
  - `apps/web/components/home/PathsOverview.tsx`
  - `apps/web/components/home/Stats.tsx`
  - `apps/web/components/home/TechShowcase.tsx`
  - `apps/web/components/home/CTA.tsx`
- **Acceptance criteria:**
  - Hero section: Title, subtitle, "Start Learning" CTA button
  - Learning paths overview: 6 cards (one per path) with icons and descriptions
  - Stats section: Learners, Lessons, Projects, Technologies counters
  - Technology showcase: Logo/icon grid of all 20+ technologies
  - Final CTA: "Begin Your Journey" button
  - Fully responsive (mobile, tablet, desktop)
  - Page matches layout from PRD Section 13.2
- **Notes:**
  - Use placeholder numbers for stats initially
  - Technology icons can use simple-icons or devicon sets

---

### TASK-021: Create learning paths index page

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-017
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/app/(marketing)/paths/page.tsx`
  - `apps/web/components/paths/PathCard.tsx`
- **Acceptance criteria:**
  - Page title: "Learning Paths"
  - 6 path cards displayed in grid (2 columns desktop, 1 column mobile)
  - Each card shows: path name, description, module count, lesson count, estimated hours, difficulty level
  - Cards link to `/paths/[path-slug]`
  - Path data loaded from static JSON (content/paths/*/path.json)
- **Notes:**
  - PRD Reference: Section 7.2 (Learning Paths)
  - PRD Reference: Section 13.1 (URL: /paths)

---

### TASK-022: Create individual learning path page

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-021
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/app/(marketing)/paths/[path]/page.tsx`
  - `apps/web/components/paths/ModuleList.tsx`
  - `apps/web/components/paths/ModuleCard.tsx`
  - `apps/web/components/paths/PathHero.tsx`
- **Acceptance criteria:**
  - Path hero: Name, description, stats (modules, lessons, hours)
  - Module list: Ordered cards showing each module with lesson count
  - Each module card links to first lesson or module overview
  - "Start This Path" CTA button (links to sign-up if not authenticated)
  - If authenticated, shows progress bar per module
  - Breadcrumb: Home > Paths > [Path Name]
- **Notes:**
  - Module data loaded from static JSON (content/paths/[path]/[module]/module.json)

---

### TASK-023: Create dashboard page (basic)

- **Status:** [x] Complete (basic stats + continue learning card)
- **Priority:** P0
- **Depends on:** TASK-019, TASK-015
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/app/(platform)/dashboard/page.tsx`
  - `apps/web/components/dashboard/WelcomeCard.tsx`
  - `apps/web/components/dashboard/ProgressOverview.tsx`
  - `apps/web/components/dashboard/CurrentPath.tsx`
  - `apps/web/components/dashboard/StreakCounter.tsx`
  - `apps/web/components/dashboard/LevelBadge.tsx`
  - `apps/web/components/dashboard/RecentActivity.tsx`
- **Acceptance criteria:**
  - Welcome card: "Welcome back, [Name]" with avatar
  - Level badge: Shows current level number and title (from XP)
  - Streak counter: Shows current streak days
  - Progress overview: Cards for each started path with % completion
  - Current path: Highlights the recommended next lesson
  - Recent activity: Last 5 completed lessons/quizzes/projects
  - All data fetched from Supabase via API routes
  - Empty states for new users: "Start your first lesson" CTA
- **Notes:**
  - PRD Reference: Section 10.2 (Progress Dashboard)

---

## Sprint 4: Content Engine (Week 3–4)

### TASK-024: Create content directory structure

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-001
- **Estimated effort:** M
- **Files to create/modify:**
  - `content/paths/foundations/path.json`
  - `content/paths/foundations/linux/module.json`
  - `content/paths/foundations/shell-scripting/module.json`
  - `content/paths/foundations/git/module.json`
  - `content/paths/foundations/networking/module.json`
  - `content/paths/foundations/python-automation/module.json`
  - `content/paths/containerization/path.json`
  - `content/paths/containerization/docker/module.json`
  - `content/paths/containerization/kubernetes/module.json`
  - `content/paths/cicd-gitops/path.json`
  - `content/paths/iac-cloud/path.json`
  - `content/paths/observability/path.json`
  - `content/paths/platform-engineering/path.json`
- **Acceptance criteria:**
  - All 6 path.json files exist with metadata: id, title, description, order, modules list, estimated_hours, icon
  - All Foundations module.json files exist with metadata: id, title, description, order, lessons list, estimated_hours
  - At least containerization path has docker and kubernetes module.json stubs
  - JSON schema is consistent across all files
  - All JSON files are valid (parseable)
- **Notes:**
  - PRD Reference: Section 9.3 (Content File Organization)
  - PRD Reference: Section 9.4 (Content Metadata System)

---

### TASK-025: Set up MDX processing pipeline

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-003, TASK-024
- **Estimated effort:** XL
- **Files to create/modify:**
  - `apps/web/lib/content.ts` (content loading)
  - `apps/web/lib/mdx.ts` (MDX compilation)
  - `apps/web/next.config.js` (update for MDX)
  - `package.json` (add dependencies)
- **Acceptance criteria:**
  - Install: `next-mdx-remote`, `@next/mdx`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`
  - `content.ts` provides functions:
    - `getAllPaths()` — returns all learning paths with metadata
    - `getPath(slug)` — returns single path with modules
    - `getModule(pathSlug, moduleSlug)` — returns module with lessons
    - `getLesson(pathSlug, moduleSlug, lessonSlug)` — returns compiled MDX + frontmatter
    - `getAllLessons()` — returns flat list of all lessons (for sitemap)
  - Frontmatter parsed with gray-matter
  - MDX compiled with next-mdx-remote's `serialize()`
  - Table of contents auto-generated from heading hierarchy
  - Build completes without errors when content files exist
- **Notes:**
  - This is the most critical infrastructure piece. All content depends on this.
  - Support both `.mdx` and `.md` files

---

### TASK-026: Set up Shiki syntax highlighting

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-025
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/lib/shiki.ts`
  - `apps/web/lib/mdx.ts` (update)
- **Acceptance criteria:**
  - Shiki configured with rehype-pretty-code plugin
  - Supported languages: bash, shell, python, yaml, json, hcl, dockerfile, go, javascript, typescript, sql, toml, ini, nginx, markdown
  - Light theme: github-light (or similar)
  - Dark theme: one-dark-pro (or similar)
  - Line numbers shown by default
  - Line highlighting works (e.g., ```bash {3-5})
  - Word highlighting works
  - Code blocks render with proper colors in both themes
- **Notes:**
  - PRD Reference: Section 10.5 (Code Display Standards)
  - Use `rehype-pretty-code` which wraps Shiki

---

### TASK-027: Create CodeBlock MDX component

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-026
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/components/content/CodeBlock.tsx`
  - `apps/web/components/content/CopyButton.tsx`
- **Acceptance criteria:**
  - Code block shows filename header (from meta string)
  - Copy button copies code to clipboard
  - Line numbers displayed
  - Horizontal scroll on overflow
  - Responsive — doesn't break layout on mobile
  - Matches the VS Code-like design from PRD Section 10.5
- **Notes:**
  - Shiki handles syntax highlighting; this component handles the chrome around it

---

### TASK-028: Create TabGroup and Tab MDX components

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-025
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/components/content/TabGroup.tsx`
  - `apps/web/components/content/Tab.tsx`
- **Acceptance criteria:**
  - `<TabGroup>` wraps multiple `<Tab>` children
  - Each `<Tab>` has a `label` prop (e.g., "Mac", "Windows", "Linux")
  - Only active tab's content is visible
  - Supports nested TabGroups (Linux > apt/yum/dnf)
  - Tab selection persists during page session (not across pages)
  - Keyboard navigation works (arrow keys between tabs)
  - Accessible: proper ARIA roles and attributes
- **Notes:**
  - PRD Reference: Section 19.6 (Installation Tab Standards)
  - Critical for installation sections

---

### TASK-029: Create Callout MDX component

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-025
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/components/content/Callout.tsx`
- **Acceptance criteria:**
  - Supports types: `info`, `warning`, `tip`, `danger`, `story`
  - Each type has distinct color scheme and icon
  - `title` prop for custom heading
  - Content renders MDX inside (supports nested markdown)
  - Visually distinct but not overpowering
  - Dark mode variants
- **Notes:**
  - PRD Reference: Section 19.5 (Callout Standards)

---

### TASK-030: Create Exercise and MiniProject MDX components

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-025
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/components/content/Exercise.tsx`
  - `apps/web/components/content/MiniProject.tsx`
  - `apps/web/components/content/CollapsibleSolution.tsx`
- **Acceptance criteria:**
  - `<Exercise>` wraps an exercise with numbered title, instructions, and optional hints
  - Exercise has checkbox that marks it complete (if authenticated)
  - `<MiniProject>` wraps a project with title, requirements, hints, solution sections
  - `<CollapsibleSolution>` hides solution by default, expands on click
  - Completion state syncs with Supabase (exercise_progress table)
- **Notes:**
  - PRD Reference: Section 19.2 (Lesson Template — exercises and mini projects)

---

### TASK-031: Create Quiz MDX component (inline)

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-025
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/components/content/Quiz.tsx`
  - `apps/web/components/content/QuizQuestion.tsx`
  - `apps/web/components/content/QuizResults.tsx`
- **Acceptance criteria:**
  - `<Quiz>` renders 3-5 multiple choice questions inline in the lesson
  - Each question shows options as radio buttons
  - "Check Answers" button submits all responses
  - Immediate feedback: correct answers green, wrong answers red
  - Explanations shown after submission
  - Score displayed (e.g., "4 out of 5 correct")
  - If authenticated, score saved to quiz_attempts table
  - Retake button resets the quiz
- **Notes:**
  - PRD Reference: Section 17.1 (Quiz Types — at least Multiple Choice for MVP)
  - This is the inline quiz. Full quiz engine (TASK-080+) comes later.

---

### TASK-032: Create MDX component registry

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-027, TASK-028, TASK-029, TASK-030, TASK-031
- **Estimated effort:** S
- **Files to create/modify:**
  - `apps/web/lib/mdx-components.ts`
- **Acceptance criteria:**
  - Single registry maps component names to React components:
    - `CodeBlock`, `TabGroup`, `Tab`, `Callout`, `Exercise`, `MiniProject`, `CollapsibleSolution`, `Quiz`, `QuizQuestion`
  - Standard HTML elements overridden: `pre`, `code`, `table`, `img`, `a`
  - Links open external URLs in new tab, internal URLs via Next.js Link
  - Images use Next.js Image optimization
  - Tables are responsive (horizontal scroll wrapper)
  - Registry exported for use in MDX rendering
- **Notes:**
  - This connects all MDX components to the content engine

---

### TASK-033: Create lesson page route and layout

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-025, TASK-032
- **Estimated effort:** XL
- **Files to create/modify:**
  - `apps/web/app/learn/[path]/[module]/[lesson]/page.tsx`
  - `apps/web/app/learn/[path]/[module]/[lesson]/layout.tsx`
  - `apps/web/components/lesson/LessonContent.tsx`
  - `apps/web/components/lesson/TableOfContents.tsx`
  - `apps/web/components/lesson/LessonNav.tsx`
  - `apps/web/components/lesson/Breadcrumb.tsx`
  - `apps/web/components/lesson/LessonProgress.tsx`
- **Acceptance criteria:**
  - Dynamic route: `/learn/[path]/[module]/[lesson]`
  - Layout: sidebar (table of contents) + main content + progress indicator
  - Breadcrumb: Home > [Path] > [Module] > [Lesson]
  - Table of Contents: Auto-generated from headings, scrollspy highlights current section
  - Previous/Next navigation at bottom of page
  - Progress indicator shows completion status (if authenticated)
  - "Mark as Complete" button at bottom
  - MDX content renders with all custom components
  - Static generation for all lesson pages (`generateStaticParams`)
  - Page metadata (title, description) from frontmatter
  - Page matches layout from PRD Section 13.2 (Lesson Page Layout)
- **Notes:**
  - This is the most important page on the platform. Spend extra time on polish.
  - PRD Reference: Section 13.2 (Lesson Page Layout)

---

### TASK-034: Create sample MDX lesson for testing

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-033
- **Estimated effort:** L
- **Files to create/modify:**
  - `content/paths/foundations/linux/01-the-linux-story/index.mdx`
- **Acceptance criteria:**
  - Fully populated frontmatter (all fields from PRD Section 9.2)
  - Story section (2-3 paragraphs)
  - Learning objectives (3+ items)
  - Core concept with explanation
  - Architecture diagram (ASCII art)
  - At least 2 hands-on exercises using `<Exercise>` component
  - TabGroup for installation (Mac/Windows/Linux with apt/yum/dnf)
  - At least 1 Callout of each type
  - Troubleshooting scenario
  - Mini project using `<MiniProject>` component
  - Quiz with 3-5 questions using `<Quiz>` component
  - Key takeaways
  - What's Next section
  - Page renders correctly at `/learn/foundations/linux/the-linux-story`
  - All components function properly
- **Notes:**
  - This is the integration test. If this page works, the content engine works.

---

## Sprint 5: Progress Tracking & Core APIs (Week 4)

### TASK-035: Implement progress tracking API

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-013, TASK-014
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/app/api/progress/lesson/route.ts`
  - `apps/web/app/api/progress/exercise/route.ts`
  - `apps/web/app/api/progress/module/[slug]/route.ts`
  - `apps/web/app/api/progress/path/[slug]/route.ts`
  - `apps/web/app/api/progress/dashboard/route.ts`
  - `apps/web/lib/progress.ts`
- **Acceptance criteria:**
  - `POST /api/progress/lesson` — marks lesson as in_progress or completed, awards XP
  - `POST /api/progress/exercise` — marks exercise as completed
  - `GET /api/progress/module/[slug]` — returns module completion percentage
  - `GET /api/progress/path/[slug]` — returns path completion percentage
  - `GET /api/progress/dashboard` — returns full dashboard data (all paths, current level, streak, recent activity)
  - All routes authenticated via Clerk
  - XP awarded correctly per PRD Section 10.2
  - Module/path progress auto-calculated when lessons are completed
- **Notes:**
  - PRD Reference: Section 18 (Progress Tracking Implementation)

---

### TASK-036: Implement XP and level system

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-035
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/lib/xp.ts`
  - `apps/web/lib/levels.ts`
- **Acceptance criteria:**
  - XP constants match PRD Section 10.2 (lesson: 100, exercise: 50, quiz: 50/75, etc.)
  - Level thresholds match PRD Section 10.2 (10 levels, Newcomer to Distinguished Engineer)
  - `calculateLevel(totalXP)` returns correct level object
  - `xpToNextLevel(totalXP)` returns XP remaining to next level
  - `awardXP(userId, amount, source)` updates profile and returns new total
  - Level-up detection: returns `leveledUp: true` when XP crosses threshold
- **Notes:**
  - PRD Reference: Section 18.2 (XP and Level System Implementation)
  - TypeScript code in PRD can be used as reference

---

### TASK-037: Implement streak tracking

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-035
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/lib/streaks.ts`
  - `apps/web/app/api/progress/streak/route.ts`
- **Acceptance criteria:**
  - `POST /api/progress/streak` — called when user completes any activity
  - Streak incremented if user was active yesterday
  - Streak reset to 1 if gap > 1 day
  - Longest streak tracked in profile
  - Daily streak XP awarded (25 XP)
  - `daily_activity` table updated with today's counts
  - Streak not double-counted on same day
- **Notes:**
  - PRD Reference: Section 18.3 (Streak System)

---

### TASK-038: Implement achievement system (basic)

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-036
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/lib/achievements.ts`
  - `apps/web/app/api/progress/achievements/route.ts`
  - `apps/web/data/achievements.json`
- **Acceptance criteria:**
  - `achievements.json` defines all achievements from PRD Section 18.4
  - `checkAchievements(userId)` evaluates all achievement criteria
  - Newly unlocked achievements returned in API response
  - `GET /api/progress/achievements` returns all achievements with unlock status
  - At least these achievements work for MVP:
    - "First Steps" (complete first lesson)
    - "Week Warrior" (7-day streak)
    - "Perfect Score" (100% on any quiz)
    - "Builder" (complete 10 mini projects)
- **Notes:**
  - PRD Reference: Section 18.4 (Achievement System)

---

### TASK-039: Create content validation package

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-024, TASK-025
- **Estimated effort:** L
- **Files to create/modify:**
  - `packages/content-validator/package.json`
  - `packages/content-validator/src/index.ts`
  - `packages/content-validator/src/validate-frontmatter.ts`
  - `packages/content-validator/src/validate-links.ts`
  - `packages/content-validator/src/validate-structure.ts`
  - `.github/workflows/content-validation.yml`
- **Acceptance criteria:**
  - Validates MDX frontmatter has all required fields
  - Validates internal links point to existing content
  - Validates lesson structure has required sections (Story, Hands-on, etc.)
  - Validates all code blocks have language identifiers
  - Reports errors with file path and line number
  - GitHub Action runs validation on PRs that touch `content/` directory
  - Exit code 0 if all valid, 1 if errors found
- **Notes:**
  - PRD Reference: Section 19.7 (Content Quality Checklist)
  - This prevents broken content from being merged

---

### TASK-040: Create scaffolding scripts

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-024
- **Estimated effort:** M
- **Files to create/modify:**
  - `scripts/new-lesson.sh`
  - `scripts/new-module.sh`
  - `scripts/content-stats.sh`
  - `scripts/setup.sh`
- **Acceptance criteria:**
  - `./scripts/new-lesson.sh foundations linux my-lesson` creates:
    - `content/paths/foundations/linux/XX-my-lesson/index.mdx` with template
    - Template has all required sections from PRD 19.2
    - Auto-increments lesson number
  - `./scripts/new-module.sh foundations networking` creates:
    - `content/paths/foundations/networking/module.json` with template
  - `./scripts/content-stats.sh` outputs:
    - Total lessons, modules, paths
    - Lessons per module
    - Word count totals
  - `./scripts/setup.sh` runs initial dev setup:
    - Installs dependencies
    - Copies .env.example to .env.local
    - Runs database migrations
- **Notes:**
  - These save significant time when creating new content

---

## Sprint 1–4 Completion Checklist

Before moving to Part 2, verify ALL of these are working:

- [ ] `pnpm install` — no errors
- [ ] `pnpm dev` — Next.js app starts
- [ ] `pnpm build` — production build succeeds
- [ ] `pnpm lint` — no lint errors
- [ ] `pnpm type-check` — no TypeScript errors
- [ ] Homepage renders at `/`
- [ ] Sign-up and sign-in work via Clerk
- [ ] Onboarding flow saves data to Supabase
- [ ] Dashboard shows user data
- [ ] Learning paths page shows all 6 paths
- [ ] Individual path page shows modules
- [ ] Sample lesson renders at `/learn/foundations/linux/the-linux-story`
- [ ] All MDX components render correctly (CodeBlock, Tabs, Callout, Exercise, Quiz)
- [ ] Progress tracking works (mark lesson complete → XP awarded → level updated)
- [ ] Streak tracking works
- [ ] CI/CD pipeline passes on GitHub
- [ ] Production deployment works on Vercel

---

**Next:** [task-list-part-2.md](./task-list-part-2.md) — Core Platform Features (Tasks 041–090)
