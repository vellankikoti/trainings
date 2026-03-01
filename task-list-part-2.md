# DEVOPS ENGINEERS — Implementation Task List (Part 2 of 4)

## Core Platform Features: Quiz Engine, Lab System, Certificates, Search

**Covers:** Weeks 5–10 | Tasks 041–090
**Phase:** 2 — Core Content & Features
**Depends on:** All tasks in Part 1 complete
**Goal:** Full-featured LMS with quizzes, labs, certificates, and search

---

## Sprint 5: Quiz Engine (Weeks 5–6)

### TASK-041: Create quiz data schema and storage

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-012, TASK-024
- **Estimated effort:** M
- **Files to create/modify:**
  - `content/quizzes/schema.json` (JSON schema for quiz files)
  - `content/quizzes/foundations/linux/01-the-linux-story.json` (sample)
  - `apps/web/lib/quiz.ts` (quiz loading and scoring)
- **Acceptance criteria:**
  - JSON schema defines quiz structure: id, lesson_slug, questions array, passing_score, xp_rewards
  - Question types supported: `multiple_choice`, `true_false`, `code_completion`
  - Each question has: id, type, question text, options, correct answer index, explanation, reference_lesson
  - Quiz loader reads JSON files from content/quizzes/
  - Sample quiz has 5+ questions for the Linux story lesson
- **Notes:**
  - PRD Reference: Section 17.1 (Quiz Types)
  - Start with multiple_choice and true_false. Add code_completion and debugging later.

---

### TASK-042: Build quiz submission API

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-041, TASK-036
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/app/api/quiz/start/route.ts`
  - `apps/web/app/api/quiz/submit/route.ts`
  - `apps/web/app/api/quiz/history/[quizId]/route.ts`
- **Acceptance criteria:**
  - `POST /api/quiz/start` — returns randomized question subset from pool
  - `POST /api/quiz/submit` — scores answers, saves attempt to `quiz_attempts` and `quiz_responses`
  - Awards XP based on score: 75 XP for perfect, 50 XP for passing, 25 XP for subsequent passes
  - `GET /api/quiz/history/[quizId]` — returns past attempts for this quiz
  - Passing score configurable per quiz (default 70%)
  - Returns explanations for all questions after submission
  - Wrong answers include link back to relevant lesson section
- **Notes:**
  - PRD Reference: Section 17.2 (Quiz Configuration), Section 17.3 (Quiz Data Flow)

---

### TASK-043: Build standalone quiz page

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-042
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/app/(platform)/quiz/[quizId]/page.tsx`
  - `apps/web/components/quiz/QuizContainer.tsx`
  - `apps/web/components/quiz/QuestionCard.tsx`
  - `apps/web/components/quiz/QuizTimer.tsx`
  - `apps/web/components/quiz/QuizResults.tsx`
  - `apps/web/components/quiz/QuizExplanation.tsx`
- **Acceptance criteria:**
  - Full-page quiz experience (no distractions)
  - Question displayed one at a time with navigation (prev/next)
  - Progress indicator (Question 3 of 10)
  - Optional timer (configurable per quiz)
  - Submit button only enabled when all questions answered
  - Results page shows: score, pass/fail, XP earned, per-question breakdown
  - Each question shows explanation and correct answer after submission
  - "Retake Quiz" button available
  - "Return to Lesson" button links back
- **Notes:**
  - This is for module/path assessments. Inline quiz component (TASK-031) is for in-lesson quizzes.

---

### TASK-044: Build module assessment quiz page

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-043
- **Estimated effort:** M
- **Files to create/modify:**
  - `content/quizzes/assessments/foundations-linux.json` (sample module assessment)
  - `apps/web/app/(platform)/assess/[moduleSlug]/page.tsx`
- **Acceptance criteria:**
  - Module assessment loads 15-20 questions from larger pool
  - Questions randomized per attempt
  - 80% passing score required for module completion
  - Timer set (configurable, default 30 minutes)
  - Results saved separately as assessment type
  - Passing unlocks module certificate
  - Cannot retake within 24 hours of a failed attempt
- **Notes:**
  - PRD Reference: Section 22.1 (Certificate Requirements)

---

### TASK-045: Build quiz question types: matching and debugging

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-043
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/components/quiz/MatchingQuestion.tsx`
  - `apps/web/components/quiz/DebuggingQuestion.tsx`
  - `apps/web/lib/quiz.ts` (update scoring logic)
- **Acceptance criteria:**
  - **Matching:** Drag-and-drop or dropdown to match left items to right items
  - **Debugging:** Shows error output/logs, asks learner to identify root cause
  - Both types score correctly
  - Both types show explanations after submission
  - Question type renderer dispatches to correct component
- **Notes:**
  - PRD Reference: Section 17.1 (Type 4: Matching, Type 5: Debugging)

---

## Sprint 6: Lab System (Weeks 6–7)

### TASK-046: Create lab configuration schema

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-024
- **Estimated effort:** M
- **Files to create/modify:**
  - `labs/schema.yaml` (lab definition schema)
  - `labs/docker-compose/linux-basics/lab.yaml`
  - `labs/docker-compose/linux-basics/docker-compose.yml`
- **Acceptance criteria:**
  - YAML schema defines: name, title, lesson ref, difficulty, duration, environment config, exercises with validation
  - Exercise validation types: `command` (run command, check output), `file` (check file exists/contents), `service` (check port/HTTP response)
  - Sample lab for Linux basics with 3 validated exercises
  - docker-compose.yml starts a clean Ubuntu container with required tools
- **Notes:**
  - PRD Reference: Section 16.2 (Lab Definition Format)

---

### TASK-047: Build local Docker lab CLI tool

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-046
- **Estimated effort:** XL
- **Files to create/modify:**
  - `packages/lab-cli/package.json`
  - `packages/lab-cli/tsconfig.json`
  - `packages/lab-cli/src/index.ts`
  - `packages/lab-cli/src/commands/start.ts`
  - `packages/lab-cli/src/commands/stop.ts`
  - `packages/lab-cli/src/commands/reset.ts`
  - `packages/lab-cli/src/commands/validate.ts`
  - `packages/lab-cli/src/commands/list.ts`
- **Acceptance criteria:**
  - CLI installable via `pnpm --filter lab-cli build`
  - `devops-lab list` — shows available labs
  - `devops-lab start linux-basics` — starts Docker Compose environment
  - `devops-lab validate` — runs exercise validations, shows pass/fail for each
  - `devops-lab reset` — stops and removes containers, restarts fresh
  - `devops-lab stop` — stops all lab containers
  - Clear error messages if Docker is not installed/running
  - Progress bar for container pulls
- **Notes:**
  - PRD Reference: Section 16.1 (Tier 3: Local Docker Labs)
  - Use `commander` or `yargs` for CLI framework

---

### TASK-048: Create dev container configurations

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-046
- **Estimated effort:** L
- **Files to create/modify:**
  - `labs/devcontainers/foundations/.devcontainer/devcontainer.json`
  - `labs/devcontainers/foundations/.devcontainer/Dockerfile`
  - `labs/devcontainers/containerization/.devcontainer/devcontainer.json`
  - `labs/devcontainers/containerization/.devcontainer/Dockerfile`
- **Acceptance criteria:**
  - Foundations devcontainer includes: git, bash, python3, vim, curl, wget, net-tools
  - Containerization devcontainer includes: docker-in-docker, kubectl, kind, helm
  - Both open in GitHub Codespaces
  - Both open in VS Code with Dev Containers extension
  - README in each directory explains how to start
  - Extensions pre-installed: GitLens, Docker, Kubernetes
- **Notes:**
  - PRD Reference: Section 16.1 (Tier 2: Dev Containers / GitHub Codespaces)

---

### TASK-049: Build browser-based terminal component (basic)

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-033
- **Estimated effort:** XL
- **Files to create/modify:**
  - `apps/web/components/labs/TerminalEmbed.tsx`
  - `apps/web/components/labs/LabEnvironment.tsx`
  - `apps/web/hooks/useLab.ts`
- **Acceptance criteria:**
  - xterm.js terminal renders in lesson page
  - Terminal connects via WebSocket to a backend (or mock for now)
  - Terminal supports basic input/output
  - Terminal has copy/paste support
  - Terminal resizes responsively
  - Font: JetBrains Mono, size configurable
  - Dark theme by default
  - "Reset Terminal" button clears state
  - Lab environment wrapper shows: lab title, exercise instructions, validation status
- **Notes:**
  - PRD Reference: Section 16.1 (Tier 1: Browser Terminal)
  - For MVP, this can connect to a local Docker backend or be a simulated terminal
  - Full WebSocket-to-container backend is a Phase 3 feature (TASK-131)

---

### TASK-050: Create lab integration in lesson pages

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-049
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/components/content/LabEmbed.tsx` (MDX component)
  - `apps/web/lib/mdx-components.ts` (update registry)
- **Acceptance criteria:**
  - `<LabEmbed labId="linux-basics" />` renders terminal + lab instructions in lesson
  - Shows which exercises are complete (checkmarks)
  - "Open in Codespaces" button links to devcontainer config
  - "Run Locally" section shows docker-compose commands
  - Graceful fallback if lab service is unavailable
- **Notes:**
  - Lab component should work even if terminal backend isn't running (shows instructions only)

---

## Sprint 7: Certificate System (Weeks 7–8)

### TASK-051: Build certificate generation service

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-012, TASK-035
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/lib/certificates.ts`
  - `apps/web/app/api/certificates/generate/route.ts`
- **Acceptance criteria:**
  - `generateCertificate()` creates a certificate record in database with:
    - Unique 8-character verification code
    - Certificate type (module, path, platform)
    - User reference
    - Issue date
    - Public URL
  - Only generates if completion requirements are met (all lessons, assessment passed)
  - Returns existing certificate if already earned (no duplicates)
  - Verification code is URL-safe and collision-resistant
- **Notes:**
  - PRD Reference: Section 22 (Certification System)

---

### TASK-052: Build certificate display page

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-051
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/app/certificates/[code]/page.tsx`
  - `apps/web/components/certificates/CertificateDisplay.tsx`
  - `apps/web/components/certificates/CertificateCard.tsx`
- **Acceptance criteria:**
  - Public page at `/certificates/[code]` — no auth required
  - Shows: learner name, certificate title, path/module, issue date, verification code
  - Shows: completion stats (lessons, projects, labs, assessment score)
  - Shows: skills validated (tags from completed lessons)
  - "Verified" badge clearly visible
  - Social sharing buttons (LinkedIn, Twitter)
  - "Download PDF" button
  - 404 page for invalid verification codes
  - Open Graph meta tags for rich link previews when shared
- **Notes:**
  - PRD Reference: Section 22.4 (Verification Page)

---

### TASK-053: Build certificate PDF generation

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-052
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/lib/pdf-certificate.ts`
  - `apps/web/app/api/certificates/[code]/pdf/route.ts`
- **Acceptance criteria:**
  - PDF generated server-side using `@react-pdf/renderer` or `puppeteer`
  - Certificate design matches PRD Section 22.2 layout
  - Includes: platform name, learner name, certificate title, date, verification code, QR code
  - QR code links to verification URL
  - PDF is letter/A4 size, high resolution
  - Cached after first generation
  - Returns PDF with correct content-type headers
- **Notes:**
  - Consider using a pre-designed HTML template + puppeteer for PDF. Simpler than react-pdf.

---

### TASK-054: Build certificate gallery in dashboard

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-052
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/app/(platform)/certificates/page.tsx`
  - `apps/web/components/certificates/CertificateGallery.tsx`
- **Acceptance criteria:**
  - Page at `/certificates` (authenticated) shows all earned certificates
  - Grid of certificate cards with: title, date, verification link
  - Click opens full certificate display
  - Empty state: "Complete a learning path to earn your first certificate"
  - Share button per certificate
- **Notes:**
  - Also accessible from dashboard sidebar

---

## Sprint 8: Search & Navigation (Week 8)

### TASK-055: Implement search with Pagefind

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-025, TASK-033
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/lib/search.ts`
  - `apps/web/components/layout/SearchDialog.tsx`
  - `apps/web/components/layout/SearchResults.tsx`
  - `apps/web/next.config.js` (update)
- **Acceptance criteria:**
  - Pagefind indexes all lesson content at build time
  - Search dialog opens with Cmd+K / Ctrl+K keyboard shortcut
  - Search input with instant results as you type
  - Results show: lesson title, path, module, snippet with highlighted match
  - Click result navigates to lesson page
  - Empty state: "No results found"
  - Search works offline (Pagefind is client-side)
  - Index size < 5MB for good performance
- **Notes:**
  - Pagefind is free and self-hosted (no external service needed)
  - Alternative: Algolia DocSearch (free for open-source) if Pagefind proves insufficient
  - PRD Reference: Section 11.2 (Search: Pagefind)

---

### TASK-056: Generate sitemap

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-025
- **Estimated effort:** S
- **Files to create/modify:**
  - `apps/web/app/sitemap.ts`
- **Acceptance criteria:**
  - Sitemap generated dynamically from content directory
  - Includes all: lesson pages, path pages, module pages, blog pages
  - Excludes: API routes, auth pages, dashboard
  - `lastModified` set from file modification date
  - `changeFrequency` set appropriately (lessons: monthly, paths: weekly)
  - Accessible at `/sitemap.xml`
  - Submittable to Google Search Console
- **Notes:**
  - PRD Reference: Section 21.3 (Technical SEO)
  - Next.js has built-in sitemap generation support

---

### TASK-057: Implement SEO meta tags and structured data

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-033
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/app/learn/[path]/[module]/[lesson]/page.tsx` (update metadata)
  - `apps/web/lib/seo.ts`
  - `apps/web/app/robots.ts`
- **Acceptance criteria:**
  - Every lesson page has: title, description, Open Graph image, canonical URL
  - Title format: `[Lesson Title] | DEVOPS ENGINEERS`
  - Description auto-generated from first paragraph (max 155 chars)
  - JSON-LD structured data for Course schema on lesson pages
  - robots.txt: allow content pages, disallow API and auth
  - Open Graph images generated or default per learning path
  - Twitter card meta tags
- **Notes:**
  - PRD Reference: Section 21.3, 21.4 (Technical SEO, Content SEO)

---

### TASK-058: Create breadcrumb navigation component

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-033
- **Estimated effort:** S
- **Files to create/modify:**
  - `apps/web/components/layout/Breadcrumb.tsx` (update if exists)
- **Acceptance criteria:**
  - Renders breadcrumb trail: Home > Path > Module > Lesson
  - Each segment is a clickable link
  - Current page (last segment) is not a link
  - Uses JSON-LD BreadcrumbList structured data
  - Responsive: collapses on mobile (shows ... for middle items)
- **Notes:**
  - Good for both UX and SEO

---

## Sprint 9: User Profile & Public Profiles (Weeks 8–9)

### TASK-059: Build user settings page

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-015, TASK-019
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/app/(platform)/settings/page.tsx`
  - `apps/web/components/settings/ProfileForm.tsx`
  - `apps/web/components/settings/PreferencesForm.tsx`
  - `apps/web/components/settings/NotificationSettings.tsx`
- **Acceptance criteria:**
  - Edit display name, bio, username
  - Toggle public profile on/off
  - Theme preference (light/dark/system)
  - Email notification preferences
  - Delete account option (with confirmation)
  - Form validation with error messages
  - Success toast on save
- **Notes:**
  - Username must be unique and URL-safe

---

### TASK-060: Build public profile page

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-059
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/app/profile/[username]/page.tsx`
  - `apps/web/components/profile/ProfileHeader.tsx`
  - `apps/web/components/profile/SkillsRadar.tsx`
  - `apps/web/components/profile/CompletedPaths.tsx`
  - `apps/web/components/profile/ActivityTimeline.tsx`
  - `apps/web/components/profile/CertificateBadges.tsx`
- **Acceptance criteria:**
  - Public page at `/profile/[username]` — no auth required
  - Profile header: avatar, name, bio, level, join date
  - Skills radar chart (based on completed lesson tags)
  - Completed paths with progress bars
  - Certificates earned as badges
  - Recent activity timeline
  - 404 if user not found or profile is private
  - Open Graph tags for sharing
- **Notes:**
  - PRD Reference: Section 13.1 (URL: /profile/{username})

---

### TASK-061: Build leaderboard page

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-036
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/app/(platform)/leaderboard/page.tsx`
  - `apps/web/components/leaderboard/LeaderboardTable.tsx`
  - `apps/web/components/leaderboard/LeaderboardFilters.tsx`
  - `apps/web/app/api/leaderboard/route.ts`
- **Acceptance criteria:**
  - Table shows: rank, username, avatar, level, XP, streak, paths completed
  - Filters: Global, This Week, This Month, By Path
  - Top 100 shown by default
  - Current user highlighted in the list
  - Opt-in only (users must have public profile enabled)
  - API endpoint paginates results
- **Notes:**
  - PRD Reference: Section 23.3 (Leaderboard)

---

## Sprint 10: Blog, About Pages & Polish (Weeks 9–10)

### TASK-062: Build blog system

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-025
- **Estimated effort:** L
- **Files to create/modify:**
  - `content/blog/` (directory)
  - `apps/web/app/(marketing)/blog/page.tsx`
  - `apps/web/app/(marketing)/blog/[slug]/page.tsx`
  - `apps/web/components/blog/BlogCard.tsx`
  - `apps/web/components/blog/BlogPost.tsx`
  - `apps/web/lib/blog.ts`
- **Acceptance criteria:**
  - Blog posts stored as MDX in `content/blog/`
  - Blog index page shows posts sorted by date
  - Each post: title, date, author, reading time, cover image, tags
  - Blog post page renders MDX with same components as lessons
  - RSS feed at `/blog/feed.xml`
  - Pagination (10 posts per page)
- **Notes:**
  - PRD Reference: Section 13.1 (/blog route)

---

### TASK-063: Build About page

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-017
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/app/(marketing)/about/page.tsx`
- **Acceptance criteria:**
  - Mission statement
  - The problem we're solving
  - Platform stats
  - Technology coverage
  - Open-source commitment
  - How to contribute
  - Team/community section
- **Notes:**
  - Content can come directly from PRD Sections 2-4

---

### TASK-064: Build Pricing page

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-017
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/app/(marketing)/pricing/page.tsx`
  - `apps/web/components/pricing/PricingCard.tsx`
  - `apps/web/components/pricing/FeatureComparison.tsx`
- **Acceptance criteria:**
  - 3 tiers displayed: Free, Premium ($9/mo), Team ($29/user/mo)
  - Feature comparison table
  - "Start Free" CTA for free tier
  - "Coming Soon" badge on Premium and Team for launch
  - FAQ section addressing common questions
- **Notes:**
  - PRD Reference: Section 24.2-24.4 (Monetization tiers)
  - Payment integration is a future task. This page is informational for now.

---

### TASK-065: Implement dark mode

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-004, TASK-017
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/components/layout/ThemeProvider.tsx`
  - `apps/web/components/layout/ThemeToggle.tsx`
  - `apps/web/app/layout.tsx` (update)
  - `apps/web/app/globals.css` (update)
- **Acceptance criteria:**
  - Three modes: light, dark, system
  - Toggle persists across sessions (cookie)
  - No flash of wrong theme on page load
  - All components support dark mode
  - Code blocks use appropriate dark/light themes
  - High contrast ratios (WCAG AA minimum)
- **Notes:**
  - Use `next-themes` package for SSR-safe theming
  - Tailwind's `dark:` variant handles styling

---

### TASK-066: Add loading states and skeletons

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-023, TASK-033, TASK-043
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/app/(platform)/dashboard/loading.tsx`
  - `apps/web/app/learn/[path]/[module]/[lesson]/loading.tsx`
  - `apps/web/components/ui/Skeleton.tsx`
  - `apps/web/components/ui/LoadingSpinner.tsx`
- **Acceptance criteria:**
  - Dashboard shows skeleton cards while data loads
  - Lesson page shows skeleton content while MDX compiles
  - Quiz pages show loading spinner
  - No layout shift when content loads (CLS < 0.1)
  - Loading states match final content layout
- **Notes:**
  - Next.js loading.tsx convention handles route-level loading automatically

---

### TASK-067: Add error boundaries and error pages

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-003
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/app/error.tsx`
  - `apps/web/app/not-found.tsx`
  - `apps/web/app/learn/[path]/[module]/[lesson]/not-found.tsx`
  - `apps/web/components/error/ErrorBoundary.tsx`
- **Acceptance criteria:**
  - Custom 404 page: "Page not found" with search and popular paths
  - Custom 500 page: "Something went wrong" with retry button
  - Lesson 404: "This lesson doesn't exist yet" with link to available lessons
  - Error boundaries catch React rendering errors gracefully
  - Errors reported to Sentry (if configured)
- **Notes:**
  - Good error handling significantly improves user experience

---

### TASK-068: Implement toast notifications

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-005
- **Estimated effort:** S
- **Files to create/modify:**
  - `apps/web/components/ui/Toaster.tsx`
  - `apps/web/lib/toast.ts`
  - `apps/web/app/layout.tsx` (add Toaster)
- **Acceptance criteria:**
  - Toast appears for: lesson completed, XP earned, level up, achievement unlocked, quiz passed, errors
  - Toast types: success (green), error (red), info (blue), warning (yellow)
  - Auto-dismiss after 5 seconds
  - Dismissable by clicking
  - Stacks multiple toasts
  - Accessible (announced to screen readers)
- **Notes:**
  - Use ShadCN toast component or `sonner` library

---

### TASK-069: Add level-up celebration animation

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-036, TASK-068
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/components/gamification/LevelUpModal.tsx`
  - `apps/web/components/gamification/XPAnimation.tsx`
  - `apps/web/components/gamification/AchievementPopup.tsx`
- **Acceptance criteria:**
  - When user levels up: full-screen modal with confetti animation, new level title, XP summary
  - When XP is earned: floating "+100 XP" text animation near the action
  - When achievement unlocked: toast notification with achievement icon and title
  - Animations use Framer Motion or CSS animations (no heavy libraries)
  - Can be disabled in user preferences
- **Notes:**
  - These micro-celebrations significantly improve engagement and retention

---

## Sprint 11: Content Migration Prep & Quality (Week 10)

### TASK-070: Create content migration plan for existing files

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-024, TASK-025
- **Estimated effort:** M
- **Files to create/modify:**
  - `docs/content-guide/migration-plan.md`
- **Acceptance criteria:**
  - Document maps every existing file to new content structure:
    - `Git/git.md` → which lessons in `content/paths/foundations/git/`
    - `Linux-Shell_Scripting/*.md` → which lessons in `content/paths/foundations/linux/` and `shell-scripting/`
  - Each mapping includes: source sections, target lesson slugs, what to add (quizzes, projects, troubleshooting)
  - Priority order for migration (most complete content first)
  - Estimated effort per file
  - Style changes needed (add stories, add exercises, add MDX components)
- **Notes:**
  - PRD Reference: Section 29 (Existing Content Audit)
  - This plan guides TASK-091 through TASK-110 in Part 3

---

### TASK-071: Create lesson template MDX file

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-032
- **Estimated effort:** S
- **Files to create/modify:**
  - `content/templates/lesson-template.mdx`
  - `content/templates/module-template.json`
  - `content/templates/path-template.json`
- **Acceptance criteria:**
  - Lesson template has all sections from PRD Section 19.2 with placeholder text
  - Template includes examples of every MDX component (Callout, TabGroup, Exercise, Quiz, etc.)
  - Module and path JSON templates have all required fields
  - Templates serve as reference for content contributors
- **Notes:**
  - PRD Reference: Section 19.2 (Content Structure Standards)

---

### TASK-072: Create content writing style guide page

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-008
- **Estimated effort:** M
- **Files to create/modify:**
  - `docs/content-guide/writing-style.md`
  - `docs/content-guide/mdx-components.md`
  - `docs/content-guide/content-checklist.md`
- **Acceptance criteria:**
  - Writing style guide covers: voice, tone, dos/don'ts (from PRD Section 19.1)
  - MDX components guide: usage examples for every component
  - Content checklist: copy of PRD Section 19.7 as a usable checklist
  - All three documents are clear enough for a first-time contributor
- **Notes:**
  - These docs go in CONTRIBUTING.md references

---

### TASK-073: Set up Sentry error tracking

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-003
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/sentry.client.config.ts`
  - `apps/web/sentry.server.config.ts`
  - `apps/web/sentry.edge.config.ts`
  - `apps/web/next.config.js` (update with Sentry plugin)
- **Acceptance criteria:**
  - Sentry SDK installed and initialized
  - Client-side errors captured automatically
  - Server-side errors captured in API routes
  - Source maps uploaded for readable stack traces
  - User context attached (Clerk user ID)
  - Environment tagged (development, preview, production)
  - Free tier: 5,000 errors/month
- **Notes:**
  - Use `@sentry/nextjs` package
  - Essential for monitoring production issues

---

### TASK-074: Set up analytics

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-003
- **Estimated effort:** S
- **Files to create/modify:**
  - `apps/web/components/analytics/Analytics.tsx`
  - `apps/web/app/layout.tsx` (update)
- **Acceptance criteria:**
  - Vercel Analytics enabled (free with Vercel hosting)
  - Web Vitals tracking (LCP, FID, CLS)
  - Page views tracked
  - Optional: Plausible analytics script (privacy-friendly alternative)
  - No personal data sent to analytics
  - GDPR-friendly (no cookies for analytics)
- **Notes:**
  - PRD Reference: Section 11.2 (Analytics: Vercel Analytics + Plausible)

---

### TASK-075: Performance optimization pass

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-033, TASK-020
- **Estimated effort:** L
- **Files to create/modify:**
  - Various files as needed
- **Acceptance criteria:**
  - All pages achieve Lighthouse score > 95
  - FCP < 1.0s on lesson pages
  - LCP < 2.0s on lesson pages
  - CLS < 0.1 on all pages
  - Images use Next.js Image component with lazy loading
  - Fonts preloaded
  - Unused JavaScript eliminated (bundle analysis)
  - MDX content statically generated at build time
  - API routes respond in < 200ms (p95)
- **Notes:**
  - PRD Reference: Section 11.5 (Performance Targets)
  - Run `next build --analyze` to identify large bundles

---

## Sprint 12: Accessibility & Responsive Design (Week 10)

### TASK-076: Accessibility audit and fixes

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** All UI tasks
- **Estimated effort:** L
- **Files to create/modify:**
  - Various component files
- **Acceptance criteria:**
  - All interactive elements keyboard accessible
  - Tab order logical on all pages
  - Skip-to-content link on every page
  - All images have alt text
  - Color contrast meets WCAG AA (4.5:1 for text)
  - Form inputs have labels
  - Error messages programmatically associated with inputs
  - Screen reader tested with VoiceOver or NVDA
  - No accessibility errors in axe-core audit
- **Notes:**
  - ShadCN components are built on Radix UI which handles a lot of a11y
  - Focus on: lesson pages, quizzes, navigation, forms

---

### TASK-077: Responsive design audit

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** All UI tasks
- **Estimated effort:** M
- **Files to create/modify:**
  - Various component files
- **Acceptance criteria:**
  - All pages tested at: 320px, 375px, 768px, 1024px, 1440px
  - Code blocks horizontally scrollable on mobile (not broken layout)
  - Tables horizontally scrollable on mobile
  - Navigation works on all sizes (hamburger menu on mobile)
  - Lesson sidebar becomes top toggle on mobile
  - Quiz questions readable on mobile
  - Dashboard cards stack vertically on mobile
  - No horizontal overflow on any page
- **Notes:**
  - PRD Reference: Section 10.6 (Mobile Experience)

---

### TASK-078: Add PWA support (basic)

- **Status:** [ ] Not Started
- **Priority:** P3
- **Depends on:** TASK-003
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/public/manifest.json`
  - `apps/web/public/icons/` (various sizes)
  - `apps/web/app/layout.tsx` (manifest link)
- **Acceptance criteria:**
  - Web app manifest with: name, short_name, icons, theme_color, background_color
  - App installable on mobile (Add to Home Screen)
  - Icons for all required sizes (192x192, 512x512)
  - Splash screen on iOS
  - Offline page shows "You're offline" message
- **Notes:**
  - Full PWA with service worker caching is a future enhancement. Basic install support only.

---

## Sprint 12 Continued: Email & Notifications

### TASK-079: Set up transactional email with Resend

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-007
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/lib/email.ts`
  - `apps/web/emails/welcome.tsx`
  - `apps/web/emails/certificate-earned.tsx`
  - `apps/web/emails/streak-reminder.tsx`
- **Acceptance criteria:**
  - Resend client configured with API key
  - Welcome email sent on user creation (via Clerk webhook)
  - Certificate earned email sent when certificate generated
  - Streak reminder email sent if streak about to break (3-day inactive)
  - Emails use React Email for templating
  - Emails render correctly in Gmail, Outlook, Apple Mail
  - Unsubscribe link in all emails
  - Free tier: 3,000 emails/month
- **Notes:**
  - PRD Reference: Section 11.2 (Email: Resend)

---

## Sprint 12 Continued: Testing

### TASK-080: Set up testing infrastructure

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-003
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/jest.config.ts` (or `vitest.config.ts`)
  - `apps/web/__tests__/` directory
  - `packages/content-validator/__tests__/`
- **Acceptance criteria:**
  - Test runner configured (Vitest recommended for speed)
  - React Testing Library installed for component tests
  - Test script in package.json: `pnpm test`
  - CI pipeline runs tests
  - Coverage reporting enabled
  - At least 1 test passing to verify setup
- **Notes:**
  - Vitest is faster than Jest and works well with Next.js

---

### TASK-081: Write tests for core libraries

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-080, TASK-036, TASK-037, TASK-025
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/__tests__/lib/xp.test.ts`
  - `apps/web/__tests__/lib/levels.test.ts`
  - `apps/web/__tests__/lib/streaks.test.ts`
  - `apps/web/__tests__/lib/content.test.ts`
  - `apps/web/__tests__/lib/quiz.test.ts`
- **Acceptance criteria:**
  - XP calculations tested: all reward types, edge cases
  - Level calculations tested: all thresholds, boundary values
  - Streak logic tested: consecutive days, gaps, reset, longest streak
  - Content loading tested: valid MDX parsing, missing files, invalid frontmatter
  - Quiz scoring tested: all question types, passing/failing scores
  - All tests pass with > 80% coverage for tested files
- **Notes:**
  - These are the most critical business logic files. Test them thoroughly.

---

### TASK-082: Write tests for API routes

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-080, TASK-035, TASK-042
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/__tests__/api/progress.test.ts`
  - `apps/web/__tests__/api/quiz.test.ts`
  - `apps/web/__tests__/api/certificates.test.ts`
  - `apps/web/__tests__/api/profile.test.ts`
- **Acceptance criteria:**
  - Progress API: mark complete, award XP, calculate module/path progress
  - Quiz API: start quiz, submit answers, score correctly
  - Certificate API: generate certificate, verify code
  - Profile API: get profile, update profile
  - Auth tested: 401 for unauthenticated requests
  - Edge cases: duplicate submissions, invalid data
- **Notes:**
  - Mock Clerk auth and Supabase client for unit tests

---

### TASK-083: Write component tests for MDX components

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-080, TASK-032
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/__tests__/components/CodeBlock.test.tsx`
  - `apps/web/__tests__/components/TabGroup.test.tsx`
  - `apps/web/__tests__/components/Callout.test.tsx`
  - `apps/web/__tests__/components/Quiz.test.tsx`
  - `apps/web/__tests__/components/Exercise.test.tsx`
- **Acceptance criteria:**
  - CodeBlock: renders with syntax highlighting, copy button works
  - TabGroup: tab switching, keyboard navigation, nested tabs
  - Callout: all types render with correct styles
  - Quiz: question rendering, answer selection, submission, score display
  - Exercise: renders instructions, completion checkbox
  - All tests use React Testing Library
- **Notes:**
  - Focus on user interactions, not implementation details

---

## Sprint 13: Discussion System & Community Basics (Week 10)

### TASK-084: Set up GitHub Discussions integration

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-008
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/components/content/DiscussionLink.tsx`
  - GitHub repository settings (enable Discussions)
- **Acceptance criteria:**
  - GitHub Discussions enabled on repository with categories per learning path
  - Each lesson page has "Discuss this lesson" link at bottom
  - Link opens GitHub Discussion pre-filtered to relevant category
  - Discussion template provided for questions vs solutions
- **Notes:**
  - PRD Reference: Section 23.1 (Phase 1: GitHub Discussions)
  - Full in-platform discussions is a Phase 2 feature

---

### TASK-085: Create Discord community setup guide

- **Status:** [ ] Not Started
- **Priority:** P3
- **Depends on:** Nothing
- **Estimated effort:** S
- **Files to create/modify:**
  - `docs/community/discord-setup.md`
- **Acceptance criteria:**
  - Discord server structure documented: channels per learning path, general, help, showcase
  - Moderation roles defined
  - Bot recommendations (MEE6 or similar for welcome messages)
  - Community guidelines adapted for Discord
  - Invite link strategy (on website, in emails, in lessons)
- **Notes:**
  - PRD Reference: Section 23.1 (Phase 1: Discord server)

---

## Sprint 13 Continued: Admin & Content Management

### TASK-086: Create admin dashboard (basic)

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-015, TASK-035
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/app/(admin)/admin/page.tsx`
  - `apps/web/app/(admin)/admin/layout.tsx`
  - `apps/web/app/(admin)/admin/users/page.tsx`
  - `apps/web/app/(admin)/admin/content/page.tsx`
  - `apps/web/middleware.ts` (update for admin role check)
- **Acceptance criteria:**
  - Admin layout with navigation: Overview, Users, Content, Analytics
  - Overview: total users, daily signups chart, active users, total lessons
  - Users: searchable list, view profiles, activity data
  - Content: list of all lessons with last updated date, word count
  - Access restricted to admin role (Clerk metadata check)
  - 403 for non-admin users
- **Notes:**
  - Admin role set via Clerk user metadata (manual for now)

---

### TASK-087: Create content statistics dashboard

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-086
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/app/(admin)/admin/content/stats/page.tsx`
  - `apps/web/lib/content-stats.ts`
- **Acceptance criteria:**
  - Total content: paths, modules, lessons, word count
  - Per-path breakdown: modules, lessons, completion status
  - Content gaps identified (modules with 0 lessons)
  - Most popular lessons (by completion count)
  - Lessons needing review (review_date passed)
  - Quiz statistics: pass rates, average scores per module
- **Notes:**
  - Useful for tracking content production progress

---

## Meta Tasks

### TASK-088: Write integration test: full learner journey

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-081, TASK-082
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/__tests__/integration/learner-journey.test.ts`
- **Acceptance criteria:**
  - Test simulates: sign up → onboarding → open lesson → complete exercises → take quiz → mark lesson complete → check XP → check level → check progress
  - All steps pass
  - Database state is correct at each step
  - This is the canary test — if this passes, the core platform works
- **Notes:**
  - Use test database or mock Supabase

---

### TASK-089: Create development setup documentation

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-040
- **Estimated effort:** M
- **Files to create/modify:**
  - `docs/contributing/getting-started.md`
  - `docs/contributing/code-contribution.md`
  - `docs/contributing/content-contribution.md`
- **Acceptance criteria:**
  - Getting started: prerequisites, clone, install, env vars, dev server
  - Code contribution: architecture overview, folder structure, PR process
  - Content contribution: how to write a lesson, MDX components reference, quality checklist
  - All steps verified by following them on a clean machine
- **Notes:**
  - Good documentation is essential for open-source contributions

---

### TASK-090: Part 2 completion checkpoint

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** All tasks 041–089
- **Estimated effort:** M
- **Files to create/modify:** None (verification only)
- **Acceptance criteria:**
  - [ ] Quiz engine works: create quiz, take quiz, score answers, save results
  - [ ] Lab CLI tool works: start lab, validate exercises, stop lab
  - [ ] Dev containers open in Codespaces
  - [ ] Certificate generation works: earn certificate, view certificate, download PDF
  - [ ] Search works: Cmd+K opens dialog, results link to lessons
  - [ ] Public profiles visible at /profile/[username]
  - [ ] Leaderboard shows ranked users
  - [ ] Dark mode works without flash
  - [ ] All pages responsive on mobile
  - [ ] Lighthouse score > 95 on all page types
  - [ ] Sentry captures errors
  - [ ] All tests pass
  - [ ] CI/CD pipeline is green
  - [ ] Production deployment works

---

**Previous:** [task-list-part-1.md](./task-list-part-1.md) — Repository Setup & Infrastructure
**Next:** [task-list-part-3.md](./task-list-part-3.md) — Content Creation & Migration
