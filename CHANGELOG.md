# Changelog

All notable changes to the DevOps Engineers platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-01

### Added

#### Platform Foundation
- Monorepo setup with pnpm workspaces and Turborepo
- Next.js 14 application with App Router
- Tailwind CSS v4 with custom design system and dark mode
- ShadCN UI component library (11 components)
- Clerk authentication with GitHub and Google OAuth
- Supabase PostgreSQL database with Row Level Security
- Sentry error tracking and performance monitoring

#### Learning Content
- **Foundations Learning Path** with 5 complete modules:
  - Linux (20 lessons): From architecture to production administration
  - Shell Scripting (16 lessons): Fundamentals through production patterns
  - Git (20 lessons): Basics to enterprise workflows
  - Networking (15 lessons): Internet fundamentals to container networking
  - Python for DevOps (20 lessons): Basics to production automation tools
- **Docker Modules** (30 lessons):
  - Docker Fundamentals (15 lessons): Containers, images, Dockerfiles, Compose
  - Docker Advanced (15 lessons): Deep networking, CI/CD, production patterns
- 248-term glossary across 12 DevOps categories
- 6 downloadable cheat sheets (Linux, Shell, Git, Networking, Python, Docker)
- Foundations capstone project (server monitoring system)

#### Content Engine
- MDX processing pipeline with syntax highlighting (Shiki)
- 9 custom MDX components: CodeBlock, TabGroup, Callout, Exercise, MiniProject, CollapsibleSolution, Quiz, LabEmbed
- Table of contents with scroll-spy
- Previous/Next lesson navigation
- Breadcrumb navigation

#### Gamification
- XP system: 100 XP per lesson, 50 XP per exercise, 50-75 XP per quiz
- 10-level progression from Newcomer to Distinguished Engineer
- Daily streak tracking with activity calendar
- 10+ achievement badges with unlock conditions
- Level-up animations with confetti effects

#### Quiz Engine
- 450+ questions across 8 assessments
- Question types: multiple choice, true/false, code completion
- Answer explanations for every question
- XP rewards for passing (75 for perfect, 50 for passing)
- Quiz history and retry support

#### Certificate System
- Certificate generation on module/path completion
- PDF export with QR verification code
- Public verification page at `/certificates/[code]`
- Certificate gallery in user dashboard
- Social sharing (LinkedIn, Twitter)

#### User Features
- User profiles with avatar, bio, level display
- Personalized dashboard with progress overview
- Public profiles at `/profile/[username]`
- Leaderboard with weekly/monthly/all-time filters
- 4-step onboarding flow with personalized recommendations
- User settings management

#### Search & Navigation
- Cmd+K search (Pagefind integration)
- Instant search with lesson snippets
- Responsive header with mobile hamburger menu
- Sidebar navigation for platform pages
- SEO optimization (sitemap, robots.txt, Open Graph, structured data)

#### Labs Infrastructure
- 10 Docker-based lab environments
- 2 GitHub Codespaces dev containers (Foundations, Containerization)
- Exercise validation scripts
- Lab configuration system

#### Quality & Polish
- Dark mode with system preference detection
- Loading skeletons for all pages
- Error boundaries and custom error pages (404, 500)
- Toast notifications (Sonner)
- Full responsive design (mobile, tablet, desktop)
- Accessibility audit compliance
- Blog system with RSS feed

#### Production Hardening
- Health check endpoint (`GET /api/health`)
- Rate limiting on all API routes (quiz, progress, certificates)
- Security headers: CSP, HSTS, X-Frame-Options, Permissions-Policy
- Zod input validation on all API endpoints
- Monitoring utilities with Sentry integration
- Dependabot for automated dependency updates
- Operations documentation (runbook, incident response, deployment guide)
- Database backup strategy documentation
- Database migrations workflow

### Known Limitations
- Browser-based labs require Docker setup (cloud labs not yet available)
- Payment/premium features not yet implemented
- Kubernetes module is a stub (content in development)
- In-memory rate limiter resets on deployment (upgrade to Redis planned)

### Roadmap
- Kubernetes module (35-40 lessons)
- Stripe payment integration for premium features
- Cloud-based lab environments (WebSocket terminal)
- CI/CD & GitOps learning path
- Infrastructure as Code & Cloud path
- Observability & Reliability path
- Platform Engineering path
- Team dashboard for enterprise users
- In-platform discussion system
