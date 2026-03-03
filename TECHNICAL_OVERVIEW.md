# DevOps Engineers — Technical Overview

> A comprehensive technical document for investors, technical reviewers, and engineering leadership.

---

## 1. Executive Summary

**DevOps Engineers** is a production-grade, open-source Learning Management System (LMS) purpose-built to train 1 million engineers in DevOps, cloud infrastructure, and platform engineering.

| Metric | Value |
|---|---|
| Learning Paths | 6 structured paths |
| Courses (Modules) | 40+ |
| Lessons | 500+ |
| Technologies Covered | 20+ (Linux, Git, Docker, Kubernetes, Terraform, AWS, Jenkins, ArgoCD, etc.) |
| API Endpoints | 28 |
| Database Tables | 11 |
| License | MIT (open-source) |

**Key Differentiators:**
- **Story-driven learning** — Every lesson follows a narrative arc, not dry documentation
- **Full gamification engine** — XP, levels, streaks, achievements, leaderboards
- **Content-as-Code** — All learning content lives in MDX files under version control, enabling community contributions via pull requests
- **Production-grade architecture** — Type-safe full-stack TypeScript, managed infrastructure, CI/CD, security headers, rate limiting

---

## 2. Architecture Overview

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VERCEL (Edge + Serverless)                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Next.js 14 (App Router)                   │   │
│  │                                                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐    │   │
│  │  │   Server     │  │   Client    │  │    API Routes    │    │   │
│  │  │  Components  │  │  Components │  │   (28 endpoints) │    │   │
│  │  │  (RSC)       │  │  (React 18) │  │                  │    │   │
│  │  └──────┬───────┘  └──────┬──────┘  └────────┬─────────┘    │   │
│  │         │                 │                   │              │   │
│  │         └─────────────────┼───────────────────┘              │   │
│  └──────────────────────────┬┼──────────────────────────────────┘   │
│                              ││                                     │
│  ┌──────────────┐  ┌────────┘└────────┐  ┌──────────────────┐      │
│  │  Middleware   │  │   Clerk Auth     │  │  Cron Jobs       │      │
│  │  (Route      │  │   (JWT + SSO)    │  │  (Health, Email) │      │
│  │   Protection)│  │                  │  │                  │      │
│  └──────────────┘  └─────────────────┘  └──────────────────┘      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
┌──────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│   Supabase       │  │    Stripe       │  │    Resend        │
│   (PostgreSQL)   │  │   (Payments)    │  │   (Email)        │
│                  │  │                 │  │                  │
│  • 11 tables     │  │  • Checkout     │  │  • Welcome       │
│  • RLS policies  │  │  • Subscriptions│  │  • Streak remind │
│  • Real-time     │  │  • Webhooks     │  │  • Progress      │
│  • Storage (CDN) │  │  • Portal       │  │  • Milestones    │
└──────────────────┘  └─────────────────┘  └──────────────────┘

┌──────────────────┐  ┌─────────────────┐
│    Sentry        │  │  Content (MDX)  │
│   (Monitoring)   │  │                 │
│                  │  │  • 6 paths      │
│  • Error track   │  │  • 40+ modules  │
│  • Performance   │  │  • 500+ lessons │
│  • Alerts        │  │  • Version ctrl │
└──────────────────┘  └─────────────────┘
```

### Monorepo Structure

```
trainings/
├── apps/
│   └── web/                         # Next.js 14 application
│       ├── app/                     # App Router (routes)
│       │   ├── (marketing)/         # Public pages (/, /paths, /about, /pricing)
│       │   ├── (platform)/          # Auth-protected pages (/dashboard, /settings)
│       │   ├── learn/               # Learning mode (courses, lessons)
│       │   └── api/                 # 28 API endpoints
│       ├── components/              # 75+ React components
│       └── lib/                     # Business logic, utilities, DB clients
│
├── packages/
│   ├── config/                      # Shared ESLint & TypeScript configs
│   ├── content-validator/           # MDX content validation CLI
│   └── lab-cli/                     # Lab environment management CLI
│
├── content/
│   └── paths/                       # 6 learning paths (MDX content)
│       ├── foundations/             # Linux, Git, Networking, Bash, Python, Security
│       ├── containerization/        # Docker, Kubernetes, Helm, Kustomize
│       ├── cicd-gitops/            # CI/CD, GitHub Actions, Jenkins, ArgoCD
│       ├── iac-cloud/              # AWS, Terraform, Ansible
│       ├── observability/          # Monitoring, Logging, Tracing
│       └── platform-engineering/   # Platforms, Security, FinOps, Career
│
├── labs/                            # Docker-based lab environments
├── docs/                            # Internal documentation
└── .github/workflows/               # 5 CI/CD pipelines
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **Server-First (RSC)** | Server Components fetch data directly from Supabase — no client-side waterfalls, secrets stay server-side, smaller JS bundles |
| **Content-as-Code** | MDX files in Git enable version-controlled content, community PRs, and offline development — no CMS dependency |
| **JIT Profile Creation** | Auto-creates Supabase profile on first API call if Clerk webhook missed — zero user-facing errors |
| **Course-Scoped Navigation** | Layout isolation at `[module]/layout.tsx` — entering a course shows only that course's lessons, not the entire path |
| **Auth-Aware Homepage** | Logged-in users redirect to `/dashboard` — marketing homepage is optimized for acquisition only |

---

## 3. Tech Stack

### Core Framework

| Layer | Technology | Version |
|---|---|---|
| **Runtime** | Node.js | 22 LTS |
| **Framework** | Next.js (App Router) | 14.2 |
| **Language** | TypeScript | 5.8 |
| **UI Library** | React | 18.3 |
| **Package Manager** | pnpm (workspaces) | 10.x |
| **Build Orchestration** | Turborepo | 2.8 |

### Frontend

| Technology | Purpose |
|---|---|
| **TailwindCSS 4** | Utility-first CSS with CSS-native `@theme` blocks |
| **shadcn/ui** | 15+ accessible UI components (New York style) |
| **Radix UI** | Headless accessible primitives (Dialog, Sheet, Tabs, etc.) |
| **Lucide React** | Icon library |
| **next-themes** | Dark/light/system theme switching |
| **Sonner** | Toast notification system |
| **cmdk** | Command palette (search) |
| **@react-pdf/renderer** | PDF certificate generation |
| **@xterm/xterm** | Browser-based terminal emulator for labs |

### Backend & Services

| Service | Technology | Purpose |
|---|---|---|
| **Database** | Supabase (PostgreSQL) | Primary data store with RLS |
| **Authentication** | Clerk | Managed auth, SSO, user management |
| **Payments** | Stripe | Subscriptions, checkout, billing portal |
| **Email** | Resend | Transactional + automated email sequences |
| **Monitoring** | Sentry | Error tracking, performance monitoring |
| **Webhooks** | Svix | Webhook signature verification |
| **Hosting** | Vercel | Serverless deployment, edge network, cron |

### Content Pipeline

| Technology | Purpose |
|---|---|
| **MDX** | Rich content format (Markdown + React components) |
| **next-mdx-remote** | Server-side MDX compilation |
| **gray-matter** | Frontmatter parsing (YAML metadata) |
| **Shiki** | Syntax highlighting (VS Code themes) |
| **rehype-pretty-code** | Code block rendering |
| **remark-gfm** | GitHub-flavored Markdown support |
| **rehype-slug + autolink-headings** | Auto-generated heading anchors |

### Testing & Quality

| Technology | Purpose |
|---|---|
| **Vitest** | Unit & integration testing |
| **React Testing Library** | Component testing |
| **ESLint** | Code linting (Next.js config) |
| **TypeScript strict mode** | Full type safety |
| **Zod** | Runtime schema validation for all API inputs |

---

## 4. Data Architecture

### Database Schema (11 Tables)

```
┌─────────────────────────────────────────────────────────────────┐
│                        PROFILES                                 │
│  Core user identity + gamification state                        │
├─────────────────────────────────────────────────────────────────┤
│  id (uuid PK)           │ clerk_id (unique)                    │
│  username (unique)      │ display_name, avatar_url, bio        │
│  github_username        │ experience_level, weekly_hours       │
│  primary_goal           │ recommended_path                     │
│  ─── Gamification ───   │                                      │
│  current_level (int)    │ total_xp (int)                       │
│  current_streak (int)   │ longest_streak (int)                 │
│  last_activity_date     │                                      │
│  ─── Preferences ───    │                                      │
│  theme                  │ email_notifications (bool)           │
│  public_profile (bool)  │ created_at, updated_at               │
└─────────────┬───────────────────────────────────────────────────┘
              │
              │ user_id (FK)
              ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────────┐
│  LESSON_PROGRESS    │  │  MODULE_PROGRESS    │  │  PATH_PROGRESS   │
│  Per-lesson tracking│  │  Aggregated metrics │  │  Path-level agg  │
├─────────────────────┤  ├─────────────────────┤  ├──────────────────┤
│  user_id (FK)       │  │  user_id (FK)       │  │  user_id (FK)    │
│  path_slug          │  │  path_slug          │  │  path_slug       │
│  module_slug        │  │  module_slug        │  │  modules_total   │
│  lesson_slug        │  │  lessons_total      │  │  modules_done    │
│  status             │  │  lessons_completed  │  │  percentage      │
│  xp_earned          │  │  percentage         │  │  started_at      │
│  started_at         │  │  started_at         │  │  completed_at    │
│  completed_at       │  │  completed_at       │  │                  │
│  time_spent_seconds │  │                     │  │                  │
└─────────────────────┘  └─────────────────────┘  └──────────────────┘

┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────────┐
│  EXERCISE_PROGRESS  │  │  QUIZ_ATTEMPTS      │  │  QUIZ_RESPONSES  │
│  Exercise tracking  │  │  Quiz performance   │  │  Per-question    │
├─────────────────────┤  ├─────────────────────┤  ├──────────────────┤
│  user_id (FK)       │  │  user_id (FK)       │  │  attempt_id (FK) │
│  lesson_slug        │  │  quiz_id            │  │  question_id     │
│  exercise_id        │  │  score, passed      │  │  selected_answer │
│  completed (bool)   │  │  correct_answers    │  │  correct (bool)  │
│  attempts (int)     │  │  total_questions    │  │  time_spent      │
│  completed_at       │  │  xp_earned          │  │                  │
└─────────────────────┘  │  attempted_at       │  └──────────────────┘
                         └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────────┐
│  CERTIFICATES       │  │  USER_ACHIEVEMENTS  │  │  DAILY_ACTIVITY  │
│  Issued certs       │  │  Achievement unlocks│  │  Per-day metrics │
├─────────────────────┤  ├─────────────────────┤  ├──────────────────┤
│  user_id (FK)       │  │  user_id (FK)       │  │  user_id (FK)    │
│  certificate_type   │  │  achievement_id     │  │  activity_date   │
│  title, description │  │  unlocked_at        │  │  lessons_done    │
│  path_slug          │  │                     │  │  exercises_done  │
│  module_slug        │  │                     │  │  quizzes_done    │
│  verification_code  │  │                     │  │  xp_earned       │
│  public_url         │  │                     │  │  time_spent      │
│  issued_at          │  │                     │  │                  │
└─────────────────────┘  └─────────────────────┘  └──────────────────┘
```

### Data Flow: Lesson Completion

When a user marks a lesson as complete, a cascade of updates fires:

```
User clicks "Mark Lesson as Complete"
    │
    ▼
POST /api/progress/lesson
    │
    ├─ 1. Authenticate (Clerk JWT)
    ├─ 2. Rate limit check (30 req/min)
    ├─ 3. Validate request body (Zod)
    ├─ 4. Ensure profile exists (JIT creation if needed)
    │
    ▼
updateLessonProgress()
    │
    ├─ 5. Insert/update lesson_progress row
    ├─ 6. Award XP (100 XP for lesson completion)
    │      └─ calculateLevel() → detect level-up
    │
    ├─ 7. recalculateModuleProgress()
    │      ├─ Count completed lessons in this module
    │      ├─ Update module_progress percentage
    │      └─ If module 100% complete:
    │           ├─ Award 200 XP bonus
    │           └─ recalculatePathProgress()
    │                ├─ Count completed modules in this path
    │                ├─ Update path_progress percentage
    │                └─ If path 100% complete:
    │                     └─ Award 500 XP bonus
    │
    └─ 8. Return { xpAwarded, leveledUp }
         └─ Frontend shows XP animation + optional level-up modal
```

### Profile Auto-Creation (ensureProfile)

Handles the case where the Clerk webhook missed creating a Supabase profile:

```
ensureProfile(clerkId)
    │
    ├─ 1. Try getProfileId(clerkId) → fast path if profile exists
    │
    ├─ 2. If null → fetch currentUser() from Clerk
    │
    ├─ 3. Insert new profile row with Clerk data
    │      (display_name, avatar, username, github_username)
    │
    ├─ 4. Handle race condition (unique constraint → retry lookup)
    │
    └─ 5. Return profile ID
```

---

## 5. Gamification & Progression Engine

### XP Reward System

| Action | XP Awarded |
|---|---|
| Lesson Completed | 100 XP |
| Exercise Completed | 50 XP |
| Quiz Passed | 50 XP |
| Quiz Perfect Score | 75 XP |
| Mini Project Completed | 150 XP |
| Module Completed (all lessons) | 200 XP bonus |
| Path Completed (all modules) | 500 XP bonus |
| Daily Streak (first activity/day) | 25 XP |
| Capstone Project | 1,000 XP |

### 10-Level Progression System

| Level | Title | XP Required |
|---|---|---|
| 1 | Newcomer | 0 |
| 2 | Apprentice | 500 |
| 3 | Explorer | 1,500 |
| 4 | Practitioner | 3,500 |
| 5 | Engineer | 6,500 |
| 6 | Senior Engineer | 11,000 |
| 7 | Staff Engineer | 17,500 |
| 8 | Principal Engineer | 27,500 |
| 9 | Architect | 42,500 |
| 10 | Distinguished Engineer | 65,000 |

### Streak System

- Tracks consecutive days of learning activity
- Records `current_streak` and `longest_streak` on the profile
- Awards 25 XP for the first activity each day
- Resets to 0 if the user misses a day
- Streak milestones (7-day, 30-day) unlock achievements

### Achievement System (12 Achievements)

| Achievement | Criteria | XP Bonus |
|---|---|---|
| First Steps | Complete 1 lesson | 50 |
| Getting Started | Complete 5 lessons | 100 |
| Dedicated Learner | Complete 25 lessons | 250 |
| Century Club | Complete 100 lessons | 500 |
| Week Warrior | 7-day streak | 100 |
| Month Master | 30-day streak | 500 |
| Perfect Score | 100% on a quiz | 75 |
| Quiz Master | 100% on 10 quizzes | 250 |
| Builder | Complete 10 projects | 300 |
| Module Master | Complete 1 module | 150 |
| Path Pioneer | Complete 1 path | 500 |
| Exercise Enthusiast | Complete 50 exercises | 200 |

Achievements are evaluated automatically after each progress update. Newly unlocked achievements trigger a popup notification on the frontend.

---

## 6. Content System

### MDX Processing Pipeline

```
content/paths/{path}/{module}/{lesson}/index.mdx
    │
    ├─ 1. gray-matter → Extract YAML frontmatter
    │      (title, description, xpReward, objectives, key_takeaways, etc.)
    │
    ├─ 2. next-mdx-remote → Compile MDX to React
    │      │
    │      ├─ remark-gfm → Tables, strikethrough, autolinks
    │      ├─ rehype-slug → Add IDs to headings
    │      ├─ rehype-autolink-headings → Heading anchor links
    │      └─ rehype-pretty-code (Shiki) → Syntax highlighting
    │           ├─ Light theme: github-light
    │           └─ Dark theme: one-dark-pro
    │
    ├─ 3. Extract headings (H2-H4) → Table of Contents
    │
    └─ 4. Render with custom MDX components
           ├─ Callout (info, warning, tip, danger)
           ├─ Exercise (interactive exercises)
           ├─ DiscussionLink (lesson discussions)
           └─ Terminal (browser-based terminal)
```

### Learning Path Structure

| # | Path | Modules | Difficulty | Est. Hours |
|---|---|---|---|---|
| 1 | **Foundations** | 9 | Beginner | ~160h |
| 2 | **Containerization** | 5 | Intermediate | ~120h |
| 3 | **CI/CD & GitOps** | 6 | Intermediate | ~225h |
| 4 | **Infrastructure as Code & Cloud** | 6 | Intermediate | ~200h |
| 5 | **Observability** | 3 | Advanced | ~100h |
| 6 | **Platform Engineering** | 6 | Advanced | ~180h |

### Lesson Frontmatter Schema

```yaml
title: "Installation and Setup"
description: "Install Git on any platform and configure your environment"
order: 3
xpReward: 75
estimatedMinutes: 25
prerequisites:
  - 02-how-git-works
objectives:
  - Install Git on Linux, Mac, and Windows
  - Configure user identity and default editor
  - Set up SSH keys for GitHub
tags:
  - git
  - setup
key_takeaways:
  - Git is available on all major platforms
  - SSH keys are more secure than HTTPS for GitHub
reflection_prompt: "Which Git workflow will you adopt for your projects?"
```

### Content Metadata Files

Each path has a `path.json` defining its metadata, module order, and capstone project. Each module has a `module.json` defining its lessons, order, and estimated hours. This hierarchical metadata is loaded at build time and runtime by `lib/content.ts`.

---

## 7. Security & Compliance

### HTTP Security Headers

All responses include production-grade security headers:

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `X-DNS-Prefetch-Control` | `on` | Performance optimization |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unused APIs |
| `Content-Security-Policy` | Strict allowlist | Prevent XSS, injection |

### Content Security Policy

The CSP allowlist is tightly scoped:
- **Scripts**: Self + Clerk.js + Cloudflare (challenges) + Vercel (analytics)
- **Styles**: Self + Google Fonts
- **Images**: Self + Clerk avatars + Supabase storage + Gravatar
- **Connections**: Self + Supabase + Clerk APIs
- **Frames**: Clerk + Cloudflare challenges only
- **Objects**: None (blocked)

### Authentication Flow

```
Request → Clerk Middleware
    │
    ├─ Public routes (/paths, /about, /pricing) → Pass through
    │
    ├─ Protected routes (/dashboard, /learn, /settings)
    │   └─ No valid JWT → Redirect to /sign-in
    │
    └─ API routes (/api/progress/*, /api/quiz/*)
        └─ auth() → Extract clerkId from JWT
            └─ ensureProfile(clerkId) → Resolve to Supabase profile ID
```

### API Security

| Mechanism | Implementation |
|---|---|
| **Authentication** | Clerk JWT verification on all protected endpoints |
| **Rate Limiting** | Per-user, per-endpoint limits (30 req/min for progress, 5/hr for labs) |
| **Input Validation** | Zod schemas validate every request body before processing |
| **Row-Level Security** | Supabase RLS policies ensure users can only access their own data |
| **Webhook Verification** | Svix signature verification for Clerk and Stripe webhooks |
| **Admin Isolation** | Server-side operations use `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) |

---

## 8. Infrastructure & DevOps

### CI/CD Pipelines (5 GitHub Actions Workflows)

| Workflow | Trigger | Actions |
|---|---|---|
| **CI** | Push/PR to `main` | Lint → Type-check → Build → Test |
| **Content Validation** | PR modifying `content/**` | Validate MDX frontmatter & structure |
| **Deploy Preview** | PR to `main` | Deploy to Vercel preview URL, comment on PR |
| **Deploy Staging** | Push to `develop` | Deploy to staging environment |
| **Deploy Production** | Push to `main` | Deploy to production via Vercel CLI |

### Docker Support (Multi-Stage Build)

```dockerfile
# Stage 1: Dependencies (node:22-alpine + pnpm)
# Stage 2: Builder (NEXT_OUTPUT_MODE=standalone)
# Stage 3: Runner (minimal alpine, non-root user, port 3000)
```

The standalone build includes the `content/` directory for server-side MDX rendering. Final image is optimized for container orchestration (Kubernetes, ECS, etc.).

### Vercel Configuration

```json
{
  "crons": [
    { "path": "/api/health",       "schedule": "0 0 * * *"  },
    { "path": "/api/cron/emails",  "schedule": "0 9 * * *"  }
  ]
}
```

- **Daily health check** at midnight UTC
- **Email automation** at 9 AM UTC (welcome sequences, streak reminders, progress reports)

### Environment Configuration

| Variable | Service | Required |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | App | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | Yes |
| `CLERK_SECRET_KEY` | Clerk | Yes |
| `CLERK_WEBHOOK_SECRET` | Clerk | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Yes |
| `STRIPE_SECRET_KEY` | Stripe | Optional |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Optional |
| `RESEND_API_KEY` | Resend | Optional |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry | Optional |

---

## 9. Business Model & Monetization

### Pricing Tiers

| Feature | Free | Premium ($9/mo) | Team ($29/seat/mo) |
|---|---|---|---|
| All lessons & content | Yes | Yes | Yes |
| Progress tracking & XP | Yes | Yes | Yes |
| Quizzes | Yes | Yes | Yes |
| Community discussions | Yes | Yes | Yes |
| Browser-based labs | 3/month | Unlimited | Unlimited |
| Completion certificates | — | Yes | Yes |
| Module assessments | — | Yes | Yes |
| PDF downloads | — | Yes | Yes |
| Priority support | — | Yes | Yes |
| Team dashboard | — | — | Yes |
| Team analytics | — | — | Yes |
| SSO integration | — | — | Yes |
| Admin controls | — | — | Yes |

**Annual pricing**: Premium $79/year (save $29), Team $279/seat/year (save $69)

### Revenue Streams

1. **Individual Premium subscriptions** — Core revenue from serious learners
2. **Team/Enterprise plans** — Per-seat pricing for organizations training DevOps teams
3. **Certification partnerships** — Co-branded certificates with cloud providers (future)
4. **Corporate training** — White-label or custom learning paths for enterprises (future)
5. **Job board / Hiring** — Connect trained engineers with employers (future)

### Stripe Integration

- **Checkout**: Server-side session creation with price IDs
- **Billing Portal**: Self-service subscription management
- **Webhooks**: Real-time subscription lifecycle events (created, updated, canceled)
- **Price IDs**: Separate monthly/annual variants for Premium and Team tiers

---

## 10. API Surface (28 Endpoints)

### Progress & Learning (7 endpoints)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/progress/lesson` | Mark lesson started/completed (rate-limited) |
| `POST` | `/api/progress/exercise` | Mark exercise completed |
| `GET` | `/api/progress/dashboard` | Full dashboard metrics |
| `POST` | `/api/progress/streak` | Update daily streak |
| `GET` | `/api/progress/achievements` | List achievements + newly unlocked |
| `GET` | `/api/progress/module/[slug]` | Module progress details |
| `GET` | `/api/progress/path/[slug]` | Path progress details |
| `GET` | `/api/progress/path-summary` | Path progress summary (for marketing overlay) |

### Quiz System (3 endpoints)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/quiz/start` | Start quiz session (randomized questions) |
| `POST` | `/api/quiz/submit` | Submit answers, auto-grade, award XP |
| `GET` | `/api/quiz/history/[quizId]` | Quiz attempt history |

### Labs (3 endpoints)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/labs/session` | Create browser-based lab session |
| `GET` | `/api/labs/[sessionId]` | Get lab session details |
| `POST` | `/api/labs/[sessionId]/validate` | Validate lab exercise completion |

### User & Profile (3 endpoints)

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/profile` | Get current user profile (auto-creates if missing) |
| `PATCH` | `/api/profile` | Update profile (filtered to safe fields) |
| `GET` | `/api/profile/[username]` | Public profile view |

### Certificates (2 endpoints)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/certificates/generate` | Generate completion certificate |
| `GET` | `/api/certificates/[code]/pdf` | Download certificate as PDF |

### Discussions (3 endpoints)

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/discussions` | List lesson discussions |
| `POST` | `/api/discussions` | Create discussion or reply |
| `PATCH/DELETE` | `/api/discussions/[id]` | Update or delete discussion |

### Billing & Webhooks (5 endpoints)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/checkout` | Create Stripe checkout session |
| `GET` | `/api/billing/portal` | Redirect to Stripe billing portal |
| `POST` | `/api/webhooks/clerk` | Clerk user lifecycle webhook |
| `POST` | `/api/webhooks/stripe` | Stripe subscription webhook |
| `GET` | `/api/cron/emails` | Automated email sequences |

### Utility (2 endpoints)

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/search` | Full-text content search index |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/team` | Team management data |

---

## 11. Email Automation

Automated email sequences powered by Resend, triggered via daily cron job:

| Sequence | Trigger | Purpose |
|---|---|---|
| **Welcome Series** | Day 1, 3, 7 after signup | Onboard new users, guide first steps |
| **Inactivity Reminders** | 7, 14, 30 days inactive | Re-engage dormant users |
| **Module Completion** | Module finished | Celebrate progress, suggest next course |
| **Streak Milestones** | 7, 30, 100-day streaks | Reinforce habit formation |
| **Monthly Summary** | Monthly | Progress digest with XP, lessons, achievements |

---

## 12. Frontend Feature Map

### Page Architecture (20+ routes)

| Route Group | Routes | Auth Required |
|---|---|---|
| **(marketing)** | `/`, `/paths`, `/paths/[path]`, `/courses`, `/about`, `/pricing`, `/blog`, `/blog/[slug]` | No |
| **(auth)** | `/sign-in`, `/sign-up` | No |
| **(platform)** | `/dashboard`, `/settings`, `/certificates`, `/leaderboard`, `/team`, `/onboarding` | Yes |
| **learn** | `/learn/[path]`, `/learn/[path]/[module]`, `/learn/[path]/[module]/[lesson]` | Yes |
| **assess** | `/assess/[moduleSlug]` | Yes |
| **quiz** | `/quiz/[quizId]` | Yes |
| **admin** | `/admin`, `/admin/users`, `/admin/content`, `/admin/content/stats` | Admin only |
| **public** | `/profile/[username]`, `/certificates/[code]` | No |

### Component Library (75+ components)

| Category | Components | Purpose |
|---|---|---|
| **ui/** | Button, Card, Dialog, Sheet, Tabs, Badge, Avatar, Tooltip, Skeleton, Progress, Command | Core UI primitives (shadcn/ui) |
| **layout/** | Header, Footer, MobileNav, Breadcrumb, SearchDialog, ThemeToggle | Navigation & chrome |
| **learn/** | CourseShell, CourseHeader, CourseSidebar | Learning mode shell |
| **lesson/** | LessonContent, LessonCompletion, KeyTakeaways, CompletionReflectionModal, TableOfContents | Lesson page |
| **dashboard/** | ContinueLearning, StatsStrip, MyCourses, PathProgress | Dashboard widgets |
| **gamification/** | AchievementPopup, LevelUpModal, XPAnimation | Gamification feedback |
| **quiz/** | QuizContainer, QuestionCard, QuizResults, DebuggingQuestion, MatchingQuestion | Quiz system |
| **paths/** | PathCard, PathCatalog, PathProgressOverlay | Path browsing |
| **courses/** | CourseCatalog | Course discovery |
| **content/** | Callout, Exercise, DiscussionLink, Terminal | Custom MDX components |
| **premium/** | PremiumGate, UpgradePrompt | Paywall components |
| **settings/** | ProfileForm, PreferencesForm | User settings |

---

## 13. SEO & Performance

### SEO

- **Dynamic sitemap** (`/sitemap.xml`) — All paths, modules, lessons, blog posts
- **Robots.txt** — Allows public content, blocks API routes and private pages
- **Metadata** — Per-page titles, descriptions, Open Graph tags
- **Static generation** — Marketing pages pre-rendered at build time (SSG)
- **Dynamic rendering** — Learning pages rendered on demand (SSR)

### Performance Optimizations

| Optimization | Implementation |
|---|---|
| **Image formats** | AVIF + WebP with Next.js Image component |
| **Package tree-shaking** | `optimizePackageImports` for Clerk, Lucide, Sonner, cmdk |
| **Font caching** | `Cache-Control: public, max-age=31536000, immutable` |
| **Code splitting** | Automatic per-route splitting via Next.js |
| **Server Components** | Default RSC — client JS only where needed |
| **Standalone build** | Optimized for serverless/container deployment |
| **Turbo cache** | Build artifact caching across CI runs |

---

## 14. Development Experience

### Local Setup

```bash
make setup          # Install deps, create .env, build
make start          # Start dev server
make test           # Run test suite
make lint           # Lint + type-check
make db-start       # Start local Supabase (port 54321-54323)
```

### Dependency Management

- **Dependabot** configured for weekly updates
- Grouped updates: React, Next.js, Clerk, Supabase, Tailwind, Testing, Sentry, MDX
- Auto-merge for patch-level updates
- Max 10 open PRs per directory

### Code Quality Gates

Every PR must pass:
1. ESLint (Next.js rules)
2. TypeScript type-check (`tsc --noEmit`)
3. Production build (`next build`)
4. Test suite (Vitest)
5. Content validation (for content changes)

---

## 15. Scalability Considerations

| Dimension | Current | Scale Path |
|---|---|---|
| **Database** | Supabase (managed PostgreSQL) | Supabase Pro → dedicated instances → read replicas |
| **Compute** | Vercel Serverless | Auto-scales with traffic. Standalone build enables Kubernetes migration |
| **Content** | File-based MDX (~500 lessons) | Scales to 10,000+ with no performance impact (file I/O) |
| **CDN** | Vercel Edge Network | Global edge caching for static assets |
| **Auth** | Clerk (managed) | Scales to millions of users |
| **Labs** | Docker containers | Kubernetes-based lab orchestration |
| **Search** | In-memory index | Migration to Algolia/Meilisearch for full-text search |
| **Real-time** | Not implemented | Supabase Realtime for notifications/chat |

---

## 16. Roadmap Considerations

### Near-Term

- AI-powered code review in labs
- Real-time collaboration (pair programming labs)
- Mobile-responsive lesson experience improvements
- Advanced analytics dashboard for teams

### Mid-Term

- Native mobile app (React Native)
- AI tutor (contextual hints during lessons)
- Integration with cloud provider sandboxes (AWS, GCP, Azure)
- Certification marketplace (industry-recognized credentials)

### Long-Term

- Enterprise white-labeling
- Multi-language content support
- Instructor marketplace (community-created paths)
- Job matching platform (trained engineers → hiring companies)

---

## Appendix: Version Matrix

| Component | Version | Release Cycle |
|---|---|---|
| Node.js | 22 LTS | Even-year LTS |
| Next.js | 14.2 | Canary → Stable |
| React | 18.3 | Stable |
| TypeScript | 5.8 | Quarterly |
| TailwindCSS | 4.2 | Stable |
| Supabase JS | 2.98 | Rolling |
| Clerk | 6.39 | Rolling |
| Stripe | 17.7 | Rolling |
| Sentry | 10.40 | Rolling |
| pnpm | 10.x | Rolling |
| Turborepo | 2.8 | Rolling |

---

*Document generated from codebase analysis. Last updated: March 2026.*
