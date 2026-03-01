# Contributing to DEVOPS ENGINEERS

Thank you for your interest in contributing to the DEVOPS ENGINEERS platform! Whether you're fixing a typo, adding a new lesson, or building a feature, every contribution helps train the next generation of DevOps engineers.

## Prerequisites

- **Node.js** 22+ (check with `node -v`)
- **pnpm** 9+ (install: `npm install -g pnpm`)
- **Git** 2.30+

Optional (for labs):
- **Docker** 24+ with Docker Compose v2
- **VS Code** with Dev Containers extension

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/vellankikoti/trainings.git
cd trainings

# 2. Run the setup script (installs deps, copies env, verifies build)
bash scripts/setup.sh

# 3. Update environment variables
# Edit apps/web/.env.local with your actual keys (see below)

# 4. Start the development server
pnpm dev

# 5. Open http://localhost:3000
```

## Environment Variables

Copy `.env.example` to `apps/web/.env.local`:

```bash
cp .env.example apps/web/.env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Yes | App URL (`http://localhost:3000` for dev) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | No* | Clerk publishable key from dashboard.clerk.com |
| `CLERK_SECRET_KEY` | No* | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | No* | Clerk webhook signing secret |
| `NEXT_PUBLIC_SUPABASE_URL` | No* | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No* | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | No* | Supabase service role key |

*The app builds and runs without auth/database keys. Auth is bypassed and database features gracefully degrade. This lets you work on content and UI without external service setup.

## Project Structure

```
trainings/
├── apps/
│   └── web/                    # Next.js 14 web application
│       ├── app/                # App Router pages and layouts
│       │   ├── (marketing)/    # Public pages (home, paths, blog, pricing)
│       │   ├── (platform)/     # Authenticated pages (dashboard, settings)
│       │   ├── (auth)/         # Sign in/up pages
│       │   ├── api/            # API routes
│       │   └── learn/          # Lesson pages
│       ├── components/         # React components
│       │   ├── content/        # MDX content components (Callout, Exercise, etc.)
│       │   ├── layout/         # Layout components (Header, Footer, etc.)
│       │   ├── providers/      # Context providers
│       │   ├── quiz/           # Quiz components
│       │   ├── settings/       # Settings form components
│       │   └── ui/             # ShadCN UI primitives
│       ├── lib/                # Utilities and services
│       │   ├── supabase/       # Supabase client configuration
│       │   ├── progress.ts     # Progress tracking logic
│       │   ├── xp.ts           # XP reward constants
│       │   ├── levels.ts       # Level calculation
│       │   ├── streaks.ts      # Streak tracking
│       │   ├── achievements.ts # Achievement system
│       │   ├── quiz.ts         # Quiz loading and scoring
│       │   ├── certificates.ts # Certificate generation
│       │   ├── blog.ts         # Blog post loading
│       │   ├── search.ts       # Search index builder
│       │   └── content.ts      # Content loading from filesystem
│       ├── data/               # Static JSON data
│       └── test/               # Test setup
├── content/
│   ├── paths/                  # Learning path content
│   │   ├── foundations/        # Foundations path
│   │   │   ├── path.json       # Path metadata
│   │   │   └── linux/          # Module directory
│   │   │       ├── module.json # Module metadata
│   │   │       └── the-linux-story/
│   │   │           └── index.mdx  # Lesson content
│   │   ├── containerization/
│   │   ├── cicd-gitops/
│   │   ├── iac-cloud/
│   │   ├── observability/
│   │   └── platform-engineering/
│   ├── quizzes/                # Quiz question banks (JSON)
│   ├── blog/                   # Blog posts (MDX)
│   └── templates/              # Content templates
├── packages/
│   ├── content-validator/      # Content validation tool
│   └── lab-cli/                # Lab management CLI
├── labs/                       # Lab configurations
│   ├── docker-compose/         # Docker Compose labs
│   └── devcontainers/          # Dev container configs
├── scripts/                    # Development scripts
│   ├── setup.sh                # Initial setup
│   ├── new-lesson.sh           # Scaffold a new lesson
│   ├── new-module.sh           # Scaffold a new module
│   └── content-stats.sh        # Content statistics
└── supabase/
    └── migrations/             # Database migrations
```

## Common Commands

```bash
# Development
pnpm dev              # Start dev server (all packages)
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript type checking
pnpm test             # Run all tests

# Web app specific
pnpm --filter @devops-engineers/web dev        # Dev server only
pnpm --filter @devops-engineers/web test       # Run web tests
pnpm --filter @devops-engineers/web test:watch # Tests in watch mode

# Content
bash scripts/new-lesson.sh <path> <module> <lesson-slug>
bash scripts/new-module.sh <path> <module-slug>
bash scripts/content-stats.sh

# Content validation
pnpm --filter @devops-engineers/content-validator start

# Labs
pnpm --filter @devops-engineers/lab-cli start -- list
pnpm --filter @devops-engineers/lab-cli start -- start <lab-id>
pnpm --filter @devops-engineers/lab-cli start -- validate <lab-id>
```

## Types of Contributions

### 1. Content Contributions

**Fixing existing content** — typos, outdated commands, broken links, clarity improvements.

**Adding new content** — new lessons, exercises, lab instructions, or entire modules.

#### Writing a New Lesson

1. Use the scaffolding script:
   ```bash
   bash scripts/new-lesson.sh foundations linux my-new-lesson
   ```

2. Or manually create `content/paths/<path>/<module>/<lesson-slug>/index.mdx`

3. Reference the template at `content/templates/lesson-template.mdx`

4. See `content/templates/component-reference.md` for available MDX components

#### Available MDX Components

| Component | Purpose |
|-----------|---------|
| `<Callout>` | Info, tip, warning, and story callouts |
| `<TabGroup>` / `<Tab>` | Tabbed content (platform-specific instructions) |
| `<Exercise>` | Numbered hands-on exercises |
| `<CollapsibleSolution>` | Expandable solution blocks |
| `<MiniProject>` | Larger guided projects |
| `<Quiz>` / `<QuizQuestion>` | End-of-lesson knowledge checks |
| `<LabEmbed>` | Link to interactive lab environment |

#### Content Guidelines

- Start each lesson with a `<Callout type="story">` for context
- Use `<Exercise>` components for hands-on practice (2-3 per lesson)
- End with Key Takeaways (bullet list) and a `<Quiz>` (3-5 questions)
- Include a "What's Next?" section linking to the next lesson
- Keep code examples commented and practical
- Target 20-40 minutes per lesson
- Write in a mentor voice — friendly, encouraging, and clear
- Use real-world examples over abstract theory
- Test all commands and code snippets before submitting

### 2. Code Contributions

**Bug fixes** — fixing issues in the web platform.

**Features** — implementing new platform functionality.

The web application lives in `apps/web/` and uses Next.js 14 with TypeScript.

## Getting Started with Code Changes

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/trainings.git
   cd trainings
   ```
3. Run the setup script:
   ```bash
   bash scripts/setup.sh
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. Make your changes
6. Verify your changes:
   ```bash
   pnpm lint        # Check for lint errors
   pnpm type-check  # Check for type errors
   pnpm test        # Run tests
   pnpm build       # Ensure production build succeeds
   ```
7. Commit your changes with a clear message:
   ```bash
   git commit -m "feat: add Docker networking lesson"
   ```
8. Push and open a Pull Request

## Testing

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @devops-engineers/web test

# Run tests in watch mode
pnpm --filter @devops-engineers/web test:watch
```

We use:
- **Vitest** as the test runner
- **@testing-library/react** for component testing
- **jsdom** as the test environment

## Architecture Decisions

- **Static content**: Lessons, paths, and modules are stored as JSON/MDX files in the `content/` directory, loaded at build time
- **Auth**: Clerk handles authentication. The app gracefully degrades when Clerk keys are not set
- **Database**: Supabase PostgreSQL stores user progress, profiles, and achievements. Features degrade gracefully without credentials
- **Styling**: Tailwind CSS v4 with ShadCN UI components
- **MDX**: next-mdx-remote for server-side MDX rendering with custom components

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature or content
- `fix:` — bug fix or content correction
- `docs:` — documentation changes
- `style:` — formatting, no code change
- `refactor:` — code restructuring
- `test:` — adding or updating tests
- `chore:` — build process, dependencies, tooling

## Pull Request Process

1. Fill out the PR template completely
2. Ensure all CI checks pass
3. Request review from a maintainer
4. Address review feedback
5. Once approved, a maintainer will merge your PR

## Code Standards

- TypeScript strict mode — no `any` types
- Format with Prettier (runs automatically)
- Follow existing patterns and conventions
- Write meaningful variable and function names
- Keep components focused and composable
- Prefer named exports over default exports (except pages)
- Use absolute imports with `@/` prefix

## Reporting Issues

Use the [GitHub Issues](https://github.com/vellankikoti/trainings/issues) tab with the appropriate template:

- **Bug Report** — something is broken
- **Content Fix** — incorrect or outdated content
- **Content Request** — request a new topic or lesson
- **Feature Request** — suggest a platform feature

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing. We are committed to providing a welcoming and inclusive experience for everyone.

## Questions?

Open a [Discussion](https://github.com/vellankikoti/trainings/discussions) or reach out to the maintainers.

Thank you for helping us train 1 million DevOps engineers!
