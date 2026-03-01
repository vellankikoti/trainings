# DEVOPS ENGINEERS — Product Requirements Document (Part 2)

## LMS Architecture, Repository Structure & Technical Systems

**Document Version:** 1.0
**Date:** March 2026
**Continues from:** [PRD Part 1](./prd-part-1.md)

---

## Table of Contents

11. [LMS Technical Architecture](#11-lms-technical-architecture)
12. [Repository Structure](#12-repository-structure)
13. [Website Structure](#13-website-structure)
14. [Authentication & User Management](#14-authentication--user-management)
15. [Database Design](#15-database-design)
16. [Lab System Technical Design](#16-lab-system-technical-design)
17. [Quiz Engine Architecture](#17-quiz-engine-architecture)
18. [Progress Tracking Implementation](#18-progress-tracking-implementation)

---

## 11. LMS Technical Architecture

### 11.1 Architecture Principles

| Principle | Rationale |
|-----------|-----------|
| **Open-source first** | Every component should be open-source or have a generous free tier |
| **Serverless where possible** | Minimize operational overhead and cost |
| **Content as code** | All learning content lives in the Git repository as MDX files |
| **Static generation** | Lesson pages are statically generated for performance and SEO |
| **Progressive enhancement** | Core content works without JavaScript; interactive features enhance |
| **API-first** | All dynamic features exposed via APIs for extensibility |
| **Edge-optimized** | Content served from the edge globally for fast load times |

### 11.2 Technology Stack

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                                                              │
│  Next.js 14+ (App Router)                                    │
│  ├── Tailwind CSS (styling)                                  │
│  ├── ShadCN UI (component library)                           │
│  ├── MDX (content rendering)                                 │
│  ├── next-mdx-remote (dynamic MDX loading)                   │
│  ├── Shiki (syntax highlighting)                             │
│  ├── Framer Motion (animations)                              │
│  └── Zustand (client state management)                       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                     AUTHENTICATION                           │
│                                                              │
│  Clerk                                                       │
│  ├── Social login (GitHub, Google)                           │
│  ├── Email/password                                          │
│  ├── Session management                                      │
│  └── User metadata storage                                   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                       DATABASE                               │
│                                                              │
│  Supabase (PostgreSQL)                                       │
│  ├── User profiles and preferences                           │
│  ├── Progress tracking                                       │
│  ├── Quiz responses and scores                               │
│  ├── Lab session data                                        │
│  ├── Certificates                                            │
│  ├── Row Level Security (RLS)                                │
│  └── Real-time subscriptions (progress updates)              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                       HOSTING                                │
│                                                              │
│  Vercel                                                      │
│  ├── Edge network (global CDN)                               │
│  ├── Serverless functions (API routes)                       │
│  ├── ISR (Incremental Static Regeneration)                   │
│  ├── Image optimization                                      │
│  └── Analytics                                               │
│                                                              │
│  Alternative: Cloudflare Pages + Workers                     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                     LAB SYSTEM                               │
│                                                              │
│  Tier 1: Browser Terminal                                    │
│  ├── xterm.js (terminal emulator)                            │
│  └── WebSocket → container backend                           │
│                                                              │
│  Tier 2: GitHub Codespaces / Dev Containers                  │
│  ├── Pre-built devcontainer.json configs                     │
│  └── VS Code in browser                                      │
│                                                              │
│  Tier 3: Local Docker                                        │
│  ├── Docker Compose files per lab                            │
│  └── CLI tool for lab management                             │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                   CONTENT PIPELINE                           │
│                                                              │
│  Git Repository (source of truth)                            │
│  ├── MDX files → Next.js build                               │
│  ├── Content validation (CI/CD)                              │
│  ├── Link checking                                           │
│  ├── Spell checking                                          │
│  └── Screenshot/diagram generation                           │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                   ADDITIONAL SERVICES                        │
│                                                              │
│  Search: Algolia (free tier) or Pagefind (self-hosted)       │
│  Analytics: Vercel Analytics + Plausible (privacy-friendly)  │
│  Email: Resend (transactional emails)                        │
│  Storage: Supabase Storage or Cloudflare R2                  │
│  Monitoring: Sentry (error tracking, free tier)              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 11.3 System Architecture Diagram

```
                                   ┌─────────────┐
                                   │   Learner    │
                                   │   Browser    │
                                   └──────┬───────┘
                                          │
                                   ┌──────▼───────┐
                                   │   Vercel     │
                                   │   Edge CDN   │
                                   └──────┬───────┘
                                          │
                          ┌───────────────┼───────────────┐
                          │               │               │
                   ┌──────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
                   │  Static     │ │  API Routes │ │  Serverless│
                   │  Pages      │ │  (Next.js)  │ │  Functions │
                   │  (MDX→HTML) │ │             │ │            │
                   └─────────────┘ └──────┬──────┘ └─────┬──────┘
                                          │              │
                              ┌───────────┼──────────────┤
                              │           │              │
                       ┌──────▼──────┐ ┌──▼──────┐ ┌────▼─────┐
                       │   Clerk     │ │Supabase │ │ Lab      │
                       │   Auth      │ │ (DB)    │ │ Backend  │
                       └─────────────┘ └─────────┘ └──────────┘
```

### 11.4 Data Flow

**Content Publishing Flow:**

```
Author writes MDX
       │
       ▼
Git commit & push
       │
       ▼
CI/CD Pipeline
├── Lint MDX
├── Validate frontmatter
├── Check links
├── Run spell check
├── Build preview
└── Deploy to staging
       │
       ▼
Review & approve PR
       │
       ▼
Merge to main
       │
       ▼
Vercel auto-deploys
       │
       ▼
Content live on platform
```

**Learner Progress Flow:**

```
Learner opens lesson
       │
       ▼
Frontend loads MDX content (static)
       │
       ▼
Clerk verifies auth (client-side)
       │
       ▼
Fetch progress from Supabase
       │
       ▼
Render lesson with progress state
       │
       ▼
Learner completes activity
       │
       ▼
API route updates Supabase
├── Mark lesson complete
├── Award XP
├── Update streak
├── Check achievements
└── Recalculate level
       │
       ▼
Real-time dashboard update
```

### 11.5 Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.0s |
| Largest Contentful Paint (LCP) | < 2.0s |
| Time to Interactive (TTI) | < 3.0s |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Core Web Vitals | All green |
| Lighthouse Score | > 95 |
| Page size (lesson page) | < 200KB (excluding images) |
| Global availability | 99.9% uptime |
| API response time | < 200ms (p95) |

### 11.6 Cost Optimization

The platform is designed to operate within free tiers for early growth:

| Service | Free Tier | Paid Trigger |
|---------|-----------|-------------|
| Vercel | 100GB bandwidth/month | ~50,000+ daily active users |
| Supabase | 500MB database, 1GB storage | ~10,000+ registered users |
| Clerk | 10,000 MAU | ~10,000+ monthly active users |
| Algolia | 10,000 records, 10,000 searches/month | ~500+ lessons indexed with heavy search |
| Sentry | 5,000 errors/month | Significant user scale |
| Resend | 3,000 emails/month | Monthly certificate/notification volume |

**Estimated monthly cost at various scales:**

| Scale | Monthly Active Users | Estimated Cost |
|-------|---------------------|---------------|
| Early | 0–1,000 | $0 (free tiers) |
| Growing | 1,000–10,000 | $50–$150/month |
| Scaling | 10,000–50,000 | $200–$500/month |
| Large | 50,000–100,000 | $500–$2,000/month |

---

## 12. Repository Structure

### 12.1 Monorepo Layout

The entire platform lives in a single repository for simplicity:

```
devops-engineers/
│
├── README.md                          # Project overview and quick start
├── CONTRIBUTING.md                    # How to contribute content and code
├── LICENSE                            # MIT License
├── CODE_OF_CONDUCT.md                 # Community guidelines
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                     # Lint, test, build
│   │   ├── content-validation.yml     # Validate MDX content
│   │   ├── deploy-preview.yml         # Deploy PR previews
│   │   └── deploy-production.yml      # Deploy to production
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── content_request.md
│   │   ├── content_fix.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── apps/
│   └── web/                           # Next.js application
│       ├── package.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       ├── app/                        # Next.js App Router
│       │   ├── layout.tsx             # Root layout
│       │   ├── page.tsx               # Homepage
│       │   ├── (auth)/
│       │   │   ├── sign-in/
│       │   │   └── sign-up/
│       │   ├── (marketing)/
│       │   │   ├── about/
│       │   │   ├── pricing/
│       │   │   └── blog/
│       │   ├── (platform)/
│       │   │   ├── dashboard/          # Learner dashboard
│       │   │   ├── paths/              # Learning paths
│       │   │   ├── learn/              # Lesson viewer
│       │   │   ├── labs/               # Lab environment
│       │   │   ├── projects/           # Project workspace
│       │   │   ├── certificates/       # Certificate viewer
│       │   │   └── profile/            # User profile
│       │   └── api/
│       │       ├── progress/
│       │       ├── quiz/
│       │       ├── labs/
│       │       ├── certificates/
│       │       └── webhooks/
│       ├── components/
│       │   ├── ui/                     # ShadCN components
│       │   ├── layout/                 # Header, footer, sidebar
│       │   ├── content/                # MDX components
│       │   │   ├── CodeBlock.tsx       # Enhanced code display
│       │   │   ├── Terminal.tsx        # Terminal component
│       │   │   ├── Quiz.tsx           # Quiz component
│       │   │   ├── TabGroup.tsx       # OS/distro tabs
│       │   │   ├── Callout.tsx        # Info/warning/tip boxes
│       │   │   ├── Exercise.tsx       # Hands-on exercise wrapper
│       │   │   ├── Architecture.tsx   # Architecture diagram
│       │   │   ├── ProgressCheck.tsx  # Progress checkpoint
│       │   │   └── MiniProject.tsx    # Mini project wrapper
│       │   ├── dashboard/
│       │   │   ├── ProgressChart.tsx
│       │   │   ├── SkillsRadar.tsx
│       │   │   ├── StreakCounter.tsx
│       │   │   └── LevelBadge.tsx
│       │   └── labs/
│       │       ├── TerminalEmbed.tsx
│       │       └── LabEnvironment.tsx
│       ├── lib/
│       │   ├── supabase.ts            # Database client
│       │   ├── content.ts             # Content loading utilities
│       │   ├── progress.ts            # Progress tracking logic
│       │   ├── xp.ts                  # XP calculation
│       │   └── utils.ts               # Shared utilities
│       ├── hooks/
│       │   ├── useProgress.ts
│       │   ├── useQuiz.ts
│       │   └── useLab.ts
│       └── styles/
│           └── globals.css
│
├── content/                           # All learning content
│   ├── paths/
│   │   ├── foundations/
│   │   │   ├── path.json
│   │   │   ├── linux/
│   │   │   │   ├── module.json
│   │   │   │   ├── 01-the-linux-story/
│   │   │   │   │   ├── index.mdx
│   │   │   │   │   └── assets/
│   │   │   │   ├── 02-linux-architecture/
│   │   │   │   └── ...
│   │   │   ├── shell-scripting/
│   │   │   ├── git/
│   │   │   ├── networking/
│   │   │   └── python-automation/
│   │   ├── containerization/
│   │   │   ├── docker/
│   │   │   ├── kubernetes/
│   │   │   ├── helm/
│   │   │   └── kustomize/
│   │   ├── cicd-gitops/
│   │   ├── iac-cloud/
│   │   ├── observability/
│   │   └── platform-engineering/
│   │
│   ├── projects/
│   │   ├── mini/
│   │   ├── capstone/
│   │   └── mega/
│   │
│   └── shared/
│       ├── glossary.json              # Technical glossary
│       ├── commands-reference/         # Quick reference cards
│       └── cheat-sheets/              # Printable cheat sheets
│
├── labs/                              # Lab configurations
│   ├── docker-compose/                # Docker Compose lab files
│   │   ├── linux-basics/
│   │   ├── docker-intro/
│   │   ├── kubernetes-local/
│   │   └── ...
│   ├── devcontainers/                 # Dev container configurations
│   │   ├── foundations/
│   │   ├── containerization/
│   │   └── ...
│   └── scripts/
│       ├── lab-setup.sh               # Lab initialization
│       ├── lab-validate.sh            # Lab validation
│       └── lab-cleanup.sh             # Lab cleanup
│
├── packages/
│   ├── config/                        # Shared configuration
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   ├── content-validator/             # MDX validation tool
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── validate-frontmatter.ts
│   │   │   ├── validate-links.ts
│   │   │   ├── validate-exercises.ts
│   │   │   └── validate-structure.ts
│   │   └── tests/
│   └── lab-cli/                       # CLI for local lab management
│       ├── package.json
│       └── src/
│           ├── commands/
│           │   ├── start.ts
│           │   ├── stop.ts
│           │   ├── reset.ts
│           │   └── validate.ts
│           └── index.ts
│
├── docs/                              # Platform documentation
│   ├── prd/
│   │   ├── prd-part-1.md
│   │   ├── prd-part-2.md
│   │   └── prd-part-3.md
│   ├── architecture/
│   │   ├── system-overview.md
│   │   └── decisions/                 # Architecture Decision Records
│   ├── content-guide/
│   │   ├── writing-style.md
│   │   ├── mdx-components.md
│   │   └── content-template.md
│   └── contributing/
│       ├── getting-started.md
│       ├── content-contribution.md
│       └── code-contribution.md
│
├── scripts/
│   ├── setup.sh                       # Initial dev setup
│   ├── new-lesson.sh                  # Scaffold new lesson
│   ├── new-module.sh                  # Scaffold new module
│   └── content-stats.sh               # Content statistics
│
├── supabase/
│   ├── migrations/                    # Database migrations
│   ├── seed.sql                       # Seed data
│   └── config.toml                    # Supabase config
│
├── package.json                       # Root package.json (workspaces)
├── pnpm-workspace.yaml               # PNPM workspace config
├── turbo.json                         # Turborepo config
└── .env.example                       # Environment variables template
```

### 12.2 Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo vs polyrepo | **Monorepo** | Content and code evolve together. Changes to MDX components require coordinated content updates. |
| Package manager | **pnpm** | Fastest, most disk-efficient, native workspace support |
| Build system | **Turborepo** | Incremental builds, caching, parallel execution |
| Content location | **`/content` directory** | Separates content from code. Non-developers can contribute content without touching application code. |
| Lab configs | **`/labs` directory** | Lab environments are independent of the web application. Can be used standalone. |

---

## 13. Website Structure

### 13.1 Information Architecture

```
devops-engineers.com
│
├── / (Homepage)
│   ├── Hero: "From Zero to DevOps Engineer"
│   ├── Learning paths overview
│   ├── Platform stats (learners, lessons, projects)
│   ├── Testimonials
│   ├── Technology showcase
│   └── CTA: Start learning
│
├── /paths (Learning Paths)
│   ├── /paths/foundations
│   ├── /paths/containerization
│   ├── /paths/cicd-gitops
│   ├── /paths/iac-cloud
│   ├── /paths/observability
│   └── /paths/platform-engineering
│
├── /learn/[path]/[module]/[lesson] (Lesson Viewer)
│   ├── Breadcrumb navigation
│   ├── Lesson content (MDX rendered)
│   ├── Table of contents (sidebar)
│   ├── Progress indicator
│   ├── Previous / Next navigation
│   └── Related lessons
│
├── /projects
│   ├── /projects/mini
│   ├── /projects/capstone
│   └── /projects/mega
│
├── /dashboard (Authenticated)
│   ├── Progress overview
│   ├── Current learning path
│   ├── Achievements
│   ├── Streak tracker
│   ├── Recommended next steps
│   └── Certificate gallery
│
├── /profile/[username] (Public Profile)
│   ├── Completed paths
│   ├── Skills
│   ├── Certificates
│   ├── Projects completed
│   └── Activity timeline
│
├── /certificates/[id] (Public Certificate)
│   ├── Certificate display
│   ├── Verification details
│   └── Shareable link
│
├── /blog
│   ├── Platform updates
│   ├── Learning tips
│   └── Community stories
│
├── /about
├── /pricing
└── /community
```

### 13.2 Page Layouts

#### Homepage Layout

```
┌──────────────────────────────────────────────────┐
│  Logo    Paths    Projects    Blog    [Sign In]   │
├──────────────────────────────────────────────────┤
│                                                  │
│         From Zero to DevOps Engineer             │
│                                                  │
│   The open-source platform that transforms       │
│   anyone into a production-ready DevOps          │
│   engineer through story-driven learning.        │
│                                                  │
│         [Start Learning — It's Free]             │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  6 Learning Paths    500+ Lessons    1000+ Labs  │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ Found-  │  │Container│  │  CI/CD  │          │
│  │ ations  │  │ization  │  │ GitOps  │          │
│  └─────────┘  └─────────┘  └─────────┘         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │  IaC &  │  │Observa- │  │Platform │          │
│  │  Cloud  │  │ bility  │  │  Eng.   │          │
│  └─────────┘  └─────────┘  └─────────┘         │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  "This platform taught me more in 3 months       │
│   than my CS degree taught me in 4 years."       │
│                                                  │
├──────────────────────────────────────────────────┤
│  Technologies: Linux Docker K8s Terraform AWS... │
├──────────────────────────────────────────────────┤
│  Footer: Links | GitHub | Community | License    │
└──────────────────────────────────────────────────┘
```

#### Lesson Page Layout

```
┌──────────────────────────────────────────────────┐
│  Logo    Paths    Dashboard          [Profile]    │
├──────────────────────────────────────────────────┤
│  Foundations > Linux > Lesson 5                   │
├────────────┬─────────────────────────────────────┤
│            │                                     │
│  TABLE OF  │  # Docker Networking Basics         │
│  CONTENTS  │                                     │
│            │  ## The Story                        │
│  ○ Story   │  It's 2015, and your team has       │
│  ○ Concept │  successfully containerized their    │
│  ● Hands-on│  application. Everything works on    │
│  ○ Debug   │  a single machine. Then your boss    │
│  ○ Project │  says, "We need to scale this        │
│  ○ Quiz    │  across 50 servers." ...             │
│            │                                     │
│  ──────    │  ## Hands-On Lab                     │
│            │                                     │
│  PROGRESS  │  ```bash                             │
│  ████░░ 60%│  docker network create my-net        │
│            │  docker run -d --network my-net \    │
│  XP: 2,450 │    --name web nginx                  │
│  Level: 3  │  ```                                 │
│            │  [▶ Run in Terminal]                  │
│            │                                     │
│            │  ┌──────────────────────────────┐    │
│            │  │ $ _                          │    │
│            │  │                              │    │
│            │  │                              │    │
│            │  └──────────────────────────────┘    │
│            │                                     │
├────────────┴─────────────────────────────────────┤
│  [← Previous: Container Volumes]    [Next: →]    │
└──────────────────────────────────────────────────┘
```

### 13.3 URL Structure

Clean, human-readable URLs:

| Page | URL Pattern | Example |
|------|-------------|---------|
| Learning path | `/paths/{path}` | `/paths/foundations` |
| Module overview | `/paths/{path}/{module}` | `/paths/foundations/linux` |
| Lesson | `/learn/{path}/{module}/{lesson}` | `/learn/foundations/linux/the-linux-story` |
| Mini project | `/projects/mini/{project}` | `/projects/mini/build-log-parser` |
| Capstone project | `/projects/capstone/{project}` | `/projects/capstone/k8s-production-stack` |
| Dashboard | `/dashboard` | `/dashboard` |
| Profile | `/profile/{username}` | `/profile/priya-dev` |
| Certificate | `/certificates/{id}` | `/certificates/abc123` |

---

## 14. Authentication & User Management

### 14.1 Authentication Flow

**Provider:** Clerk

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Sign Up    │────▶│   Clerk      │────▶│  Supabase    │
│              │     │   Auth       │     │  User Record │
│ • GitHub     │     │              │     │              │
│ • Google     │     │ • Verify     │     │ • Profile    │
│ • Email      │     │ • Session    │     │ • Progress   │
│              │     │ • JWT        │     │ • Prefs      │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 14.2 User Roles

| Role | Permissions |
|------|------------|
| **Learner** | Access content, complete exercises, take quizzes, earn certificates |
| **Contributor** | All learner permissions + submit content PRs, review content |
| **Moderator** | All contributor permissions + manage community, moderate discussions |
| **Admin** | Full platform access, manage users, view analytics, manage content |

### 14.3 User Profile Data

```typescript
interface UserProfile {
  // Identity (from Clerk)
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  github_username?: string;

  // Onboarding
  experience_level: 'none' | 'some' | 'developer' | 'sysadmin';
  weekly_hours: '5-10' | '10-20' | '20+';
  primary_goal: 'first-job' | 'switch-devops' | 'upskill' | 'personal';
  recommended_path: string;

  // Progress
  current_level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  lessons_completed: number;
  projects_completed: number;
  certificates_earned: number;

  // Preferences
  theme: 'light' | 'dark' | 'system';
  email_notifications: boolean;
  public_profile: boolean;

  // Timestamps
  created_at: timestamp;
  last_active_at: timestamp;
}
```

### 14.4 Guest vs Authenticated Experience

| Feature | Guest | Authenticated |
|---------|-------|--------------|
| Browse learning paths | Yes | Yes |
| Read lesson content | Yes (first 3 per module) | Yes (all) |
| Run hands-on exercises | No | Yes |
| Take quizzes | No | Yes |
| Track progress | No | Yes |
| Earn certificates | No | Yes |
| Access labs | No | Yes |
| Public profile | No | Yes |

---

## 15. Database Design

### 15.1 Schema Overview

**Provider:** Supabase (PostgreSQL)

```sql
-- =============================================
-- USER PROFILES
-- =============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  github_username TEXT,
  experience_level TEXT,
  weekly_hours TEXT,
  primary_goal TEXT,
  recommended_path TEXT,
  current_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  theme TEXT DEFAULT 'system',
  email_notifications BOOLEAN DEFAULT true,
  public_profile BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PROGRESS TRACKING
-- =============================================

CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_slug TEXT NOT NULL,
  path_slug TEXT NOT NULL,
  module_slug TEXT NOT NULL,
  status TEXT DEFAULT 'not_started',
    -- 'not_started', 'in_progress', 'completed'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, lesson_slug)
);

CREATE TABLE exercise_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_slug TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  UNIQUE(user_id, lesson_slug, exercise_id)
);

CREATE TABLE module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  path_slug TEXT NOT NULL,
  module_slug TEXT NOT NULL,
  lessons_total INTEGER NOT NULL,
  lessons_completed INTEGER DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0.00,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, path_slug, module_slug)
);

CREATE TABLE path_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  path_slug TEXT NOT NULL,
  modules_total INTEGER NOT NULL,
  modules_completed INTEGER DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0.00,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, path_slug)
);

-- =============================================
-- QUIZ SYSTEM
-- =============================================

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  lesson_slug TEXT,
  module_slug TEXT,
  score DECIMAL(5,2) NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_spent_seconds INTEGER,
  passed BOOLEAN NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_answer TEXT,
  correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER
);

-- =============================================
-- PROJECTS
-- =============================================

CREATE TABLE project_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_slug TEXT NOT NULL,
  project_type TEXT NOT NULL,
    -- 'mini', 'capstone', 'mega'
  status TEXT DEFAULT 'not_started',
    -- 'not_started', 'in_progress', 'completed'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  repository_url TEXT,
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, project_slug)
);

-- =============================================
-- CERTIFICATES
-- =============================================

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL,
    -- 'module', 'path', 'platform'
  title TEXT NOT NULL,
  description TEXT,
  path_slug TEXT,
  module_slug TEXT,
  issued_at TIMESTAMPTZ DEFAULT now(),
  verification_code TEXT UNIQUE NOT NULL,
  public_url TEXT
);

-- =============================================
-- ACHIEVEMENTS
-- =============================================

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- =============================================
-- STREAKS
-- =============================================

CREATE TABLE daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  lessons_completed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE(user_id, activity_date)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_slug);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_project_progress_user ON project_progress(user_id);
CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_verification ON certificates(verification_code);
CREATE INDEX idx_daily_activity_user_date ON daily_activity(user_id, activity_date);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own data
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (clerk_id = auth.jwt()->>'sub');

-- Public profiles are visible to everyone
CREATE POLICY "Public profiles are viewable"
  ON profiles FOR SELECT
  USING (public_profile = true);

-- Progress is private to the user
CREATE POLICY "Users can manage own progress"
  ON lesson_progress FOR ALL
  USING (user_id = (
    SELECT id FROM profiles
    WHERE clerk_id = auth.jwt()->>'sub'
  ));
```

### 15.2 Data Relationships

```
profiles
  ├── lesson_progress (1:N)
  ├── exercise_progress (1:N)
  ├── module_progress (1:N)
  ├── path_progress (1:N)
  ├── quiz_attempts (1:N)
  │     └── quiz_responses (1:N)
  ├── project_progress (1:N)
  ├── certificates (1:N)
  ├── user_achievements (1:N)
  └── daily_activity (1:N)
```

---

## 16. Lab System Technical Design

### 16.1 Lab Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LAB SYSTEM                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Tier 1: Browser Terminal                            │    │
│  │                                                     │    │
│  │  Lesson Page                                        │    │
│  │  ┌──────────┐    WebSocket    ┌──────────────┐     │    │
│  │  │ xterm.js │ ──────────────▶ │ Container    │     │    │
│  │  │ (browser)│ ◀────────────── │ Backend      │     │    │
│  │  └──────────┘                 │ (Docker)     │     │    │
│  │                               └──────────────┘     │    │
│  │  Best for: Linux, Git, Shell Scripting basics      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Tier 2: GitHub Codespaces                           │    │
│  │                                                     │    │
│  │  devcontainer.json per lab environment               │    │
│  │  ┌──────────────────────────────────┐               │    │
│  │  │ VS Code (browser)               │               │    │
│  │  │ ├── Pre-installed tools          │               │    │
│  │  │ ├── Lab files ready              │               │    │
│  │  │ ├── Port forwarding              │               │    │
│  │  │ └── Persistent workspace         │               │    │
│  │  └──────────────────────────────────┘               │    │
│  │  Best for: Kubernetes, Terraform, multi-tool labs   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Tier 3: Local Docker Labs                           │    │
│  │                                                     │    │
│  │  docker-compose.yml per lab                          │    │
│  │  ┌──────────────────────────────────┐               │    │
│  │  │ Learner's machine               │               │    │
│  │  │ ├── Docker Desktop / Engine      │               │    │
│  │  │ ├── Lab CLI tool                 │               │    │
│  │  │ │   $ devops-lab start k8s-101   │               │    │
│  │  │ │   $ devops-lab validate        │               │    │
│  │  │ │   $ devops-lab reset           │               │    │
│  │  │ └── Full offline support         │               │    │
│  │  └──────────────────────────────────┘               │    │
│  │  Best for: All technologies, offline learning       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 16.2 Lab Definition Format

Each lab is defined by a configuration file:

```yaml
# labs/docker-compose/docker-networking-101/lab.yaml

name: docker-networking-101
title: "Docker Networking Basics"
lesson: containerization/docker/12-networking-basics
difficulty: intermediate
duration_minutes: 30

environment:
  type: docker-compose
  compose_file: docker-compose.yml

  services:
    - name: lab
      image: devops-engineers/lab-docker:latest
      ports:
        - "8080:80"
      tools:
        - docker
        - curl
        - ping

setup:
  - description: "Pull required images"
    command: "docker pull nginx:alpine && docker pull redis:alpine"

exercises:
  - id: ex1
    title: "Create a custom bridge network"
    instructions: "Create a Docker network named 'my-app-network'"
    validation:
      type: command
      command: "docker network ls | grep my-app-network"
      expected: "my-app-network"
    hints:
      - "Use the 'docker network create' command"
      - "The full command is: docker network create my-app-network"

  - id: ex2
    title: "Connect containers to the network"
    instructions: "Run an nginx container on your custom network"
    validation:
      type: command
      command: "docker inspect my-app-network --format '{{range .Containers}}{{.Name}}{{end}}'"
      expected: "web"
    hints:
      - "Use the --network flag when running the container"

cleanup:
  - "docker network prune -f"
  - "docker container prune -f"
```

### 16.3 Lab Validation System

Every lab exercise has automated validation:

```
Learner completes exercise
         │
         ▼
Lab CLI runs validation command
         │
         ▼
    ┌────┴────┐
    │         │
  Pass      Fail
    │         │
    ▼         ▼
Mark as    Show hint
complete   (progressive)
    │         │
    ▼         ▼
Award XP   Hint 1 → Hint 2 → Solution
```

### 16.4 Lab Technology Requirements by Module

| Module | Docker | K8s Cluster | Cloud Account | Special |
|--------|--------|------------|---------------|---------|
| Linux | Yes | No | No | - |
| Shell Scripting | Yes | No | No | - |
| Git | Yes | No | No | GitHub account |
| Python | Yes | No | No | - |
| Networking | Yes | No | No | - |
| Docker | Yes | No | No | Docker-in-Docker |
| Kubernetes | Yes | Yes (kind/k3d) | No | 4GB+ RAM |
| Helm | Yes | Yes | No | - |
| Kustomize | Yes | Yes | No | - |
| GitHub Actions | No | No | No | GitHub account |
| Jenkins | Yes | No | No | 2GB+ RAM |
| ArgoCD | Yes | Yes | No | 4GB+ RAM |
| Terraform | Yes | No | Optional (AWS Free Tier) | - |
| AWS | No | No | Yes (Free Tier) | Credit card required |
| Ansible | Yes | No | No | Multiple containers |
| Prometheus | Yes | Yes (optional) | No | - |
| Grafana | Yes | No | No | - |
| OpenTelemetry | Yes | Yes (optional) | No | Multi-service app |

---

## 17. Quiz Engine Architecture

### 17.1 Quiz Types

#### Type 1: Multiple Choice

```json
{
  "type": "multiple_choice",
  "question": "Which Docker command creates a new network?",
  "options": [
    "docker network start mynet",
    "docker network create mynet",
    "docker create network mynet",
    "docker net create mynet"
  ],
  "correct": 1,
  "explanation": "The correct command is 'docker network create mynet'. Docker follows the pattern: docker <object> <action> <name>.",
  "reference_lesson": "containerization/docker/12-networking-basics"
}
```

#### Type 2: Code Completion

```json
{
  "type": "code_completion",
  "question": "Complete the Dockerfile to expose port 8080:",
  "code_template": "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\n_____ 8080\nCMD [\"node\", \"server.js\"]",
  "correct": "EXPOSE",
  "explanation": "The EXPOSE instruction informs Docker that the container listens on the specified network port at runtime."
}
```

#### Type 3: True/False with Explanation

```json
{
  "type": "true_false",
  "question": "In Kubernetes, a Pod can contain multiple containers.",
  "correct": true,
  "explanation": "True. A Pod is the smallest deployable unit in Kubernetes and can contain one or more containers that share the same network namespace and storage volumes. This is commonly used for sidecar patterns."
}
```

#### Type 4: Match the Concepts

```json
{
  "type": "matching",
  "question": "Match each Kubernetes object to its purpose:",
  "pairs": [
    { "left": "Deployment", "right": "Manage stateless application replicas" },
    { "left": "Service", "right": "Expose pods via stable network endpoint" },
    { "left": "ConfigMap", "right": "Store non-confidential configuration" },
    { "left": "Secret", "right": "Store sensitive data like passwords" }
  ]
}
```

#### Type 5: Debugging Challenge

```json
{
  "type": "debugging",
  "question": "A pod is stuck in CrashLoopBackOff. The logs show 'Error: Cannot find module /app/server.js'. What is the most likely cause?",
  "options": [
    "The container is out of memory",
    "The WORKDIR or COPY path in the Dockerfile is incorrect",
    "The Kubernetes cluster is overloaded",
    "The pod has no network access"
  ],
  "correct": 1,
  "explanation": "When a container cannot find its entrypoint file, it usually means the Dockerfile's WORKDIR or COPY instruction has an incorrect path, so the application file doesn't exist where the CMD expects it.",
  "follow_up": "How would you verify this? Run: kubectl exec -it <pod> -- ls /app/"
}
```

### 17.2 Quiz Configuration

```json
{
  "quiz_id": "docker-networking-basics-quiz",
  "lesson_slug": "containerization/docker/12-networking-basics",
  "title": "Docker Networking Basics Quiz",
  "description": "Test your understanding of Docker networking concepts",
  "passing_score": 70,
  "time_limit_minutes": null,
  "questions_per_attempt": 5,
  "question_pool_size": 15,
  "randomize_questions": true,
  "randomize_options": true,
  "show_explanations": "after_submission",
  "max_attempts": null,
  "xp_first_pass": 75,
  "xp_perfect_score": 100,
  "xp_subsequent_pass": 25
}
```

### 17.3 Quiz Data Flow

```
Learner starts quiz
       │
       ▼
Frontend requests questions
       │
       ▼
API selects N random questions from pool
       │
       ▼
Frontend renders quiz (timer optional)
       │
       ▼
Learner submits answers
       │
       ▼
API scores responses
       │
       ▼
Store attempt in quiz_attempts table
Store responses in quiz_responses table
       │
       ▼
Calculate XP earned
       │
       ▼
Update user profile (XP, level)
       │
       ▼
Return results with explanations
```

---

## 18. Progress Tracking Implementation

### 18.1 Progress Calculation

Progress is tracked at 4 levels:

```
Platform Level
  └── Path Level
        └── Module Level
              └── Lesson Level
                    ├── Content read
                    ├── Exercises completed
                    ├── Quiz passed
                    └── Mini project done
```

**Lesson completion criteria:**

A lesson is marked complete when ALL of the following are true:
- The learner has scrolled through the entire lesson content
- All mandatory exercises are completed (validated)
- The lesson quiz is passed (70%+ score)

**Module completion criteria:**

A module is complete when:
- All lessons in the module are completed
- The module assessment quiz is passed

**Path completion criteria:**

A path is complete when:
- All modules in the path are completed
- The path capstone project is submitted
- The path assessment is passed

### 18.2 XP and Level System Implementation

```typescript
// lib/xp.ts

const XP_REWARDS = {
  lesson_complete: 100,
  exercise_complete: 50,
  quiz_pass: 50,
  quiz_perfect: 75,
  mini_project: 150,
  capstone_project: 500,
  mega_project: 1000,
  debugging_scenario: 100,
  path_complete: 2000,
  daily_streak: 25,
} as const;

const LEVELS = [
  { level: 1, title: 'Newcomer', xp_required: 0 },
  { level: 2, title: 'Explorer', xp_required: 500 },
  { level: 3, title: 'Apprentice', xp_required: 1500 },
  { level: 4, title: 'Practitioner', xp_required: 3500 },
  { level: 5, title: 'Builder', xp_required: 7000 },
  { level: 6, title: 'Engineer', xp_required: 12000 },
  { level: 7, title: 'Senior Engineer', xp_required: 20000 },
  { level: 8, title: 'Staff Engineer', xp_required: 35000 },
  { level: 9, title: 'Principal Engineer', xp_required: 55000 },
  { level: 10, title: 'Distinguished Engineer', xp_required: 80000 },
] as const;

function calculateLevel(totalXP: number): Level {
  return LEVELS.reduce((current, level) =>
    totalXP >= level.xp_required ? level : current
  );
}

function xpToNextLevel(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
  return nextLevel ? nextLevel.xp_required - totalXP : 0;
}
```

### 18.3 Streak System

```typescript
// lib/streaks.ts

async function updateStreak(userId: string): Promise<StreakResult> {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = getYesterday().toISOString().split('T')[0];

  // Check if already active today
  const todayActivity = await getActivity(userId, today);
  if (todayActivity) {
    return { streak: todayActivity.current_streak, isNew: false };
  }

  // Check yesterday's activity
  const yesterdayActivity = await getActivity(userId, yesterday);

  const newStreak = yesterdayActivity
    ? yesterdayActivity.current_streak + 1
    : 1; // Reset streak

  // Record today's activity
  await recordActivity(userId, today, newStreak);

  // Update longest streak if needed
  await updateLongestStreak(userId, newStreak);

  // Award streak XP
  await awardXP(userId, XP_REWARDS.daily_streak);

  return { streak: newStreak, isNew: true };
}
```

### 18.4 Achievement System

Achievements reward milestones and encourage exploration:

| Category | Achievement | Criteria | XP Bonus |
|----------|------------|----------|----------|
| **Getting Started** | First Steps | Complete first lesson | 50 |
| **Getting Started** | Hello Terminal | Run first command in a lab | 50 |
| **Streaks** | Week Warrior | 7-day streak | 100 |
| **Streaks** | Month of Mastery | 30-day streak | 500 |
| **Streaks** | Century | 100-day streak | 2,000 |
| **Completion** | Path Pioneer | Complete first learning path | 1,000 |
| **Completion** | Full Stack Ops | Complete all 6 learning paths | 10,000 |
| **Projects** | Builder | Complete 10 mini projects | 500 |
| **Projects** | Architect | Complete 50 mini projects | 2,000 |
| **Projects** | Mega Mind | Complete a mega project | 1,000 |
| **Quizzes** | Perfect Score | 100% on any quiz | 100 |
| **Quizzes** | Quiz Master | 100% on 10 quizzes | 500 |
| **Debugging** | Bug Hunter | Solve 10 debugging scenarios | 500 |
| **Debugging** | SRE Material | Solve 50 debugging scenarios | 2,000 |
| **Community** | Contributor | Submit accepted content PR | 500 |
| **Community** | Teacher | Help 10 learners in discussions | 500 |
| **Speed** | Speed Runner | Complete a lesson in under 15 min | 100 |
| **Exploration** | Explorer | Start all 6 learning paths | 200 |

### 18.5 Progress API Endpoints

```
POST   /api/progress/lesson          # Mark lesson progress
GET    /api/progress/lesson/:slug    # Get lesson progress
POST   /api/progress/exercise        # Mark exercise complete
GET    /api/progress/module/:slug    # Get module progress
GET    /api/progress/path/:slug      # Get path progress
GET    /api/progress/dashboard       # Get full dashboard data
POST   /api/progress/streak          # Update streak
GET    /api/progress/achievements    # Get user achievements
POST   /api/quiz/submit              # Submit quiz attempt
GET    /api/quiz/history/:quizId     # Get quiz attempt history
POST   /api/projects/submit          # Submit project completion
GET    /api/certificates             # Get user certificates
GET    /api/certificates/:id         # Get specific certificate
GET    /api/leaderboard              # Get leaderboard
```

---

## What's Next

This document continues in **[PRD Part 3](./prd-part-3.md)** which covers:

- Content Writing Guidelines (detailed style guide)
- Video Content Pipeline
- SEO Strategy
- Certification System Design
- Community Features
- Monetization Strategy
- Launch Strategy & Phases
- Future Roadmap
- Success Metrics & KPIs

---

*DEVOPS ENGINEERS — Training 1 Million Engineers, One Story at a Time.*
