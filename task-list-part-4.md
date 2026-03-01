# DEVOPS ENGINEERS — Implementation Task List (Part 4 of 4)

## Advanced Features, Production Hardening & Launch

**Covers:** Weeks 19–24+ | Tasks 120–160
**Phase:** 4 & 5 — Production Readiness & Launch
**Depends on:** All tasks in Parts 1, 2, and 3 complete
**Goal:** Production-hardened, scalable, monitored platform ready for real users

---

## Sprint 21: Browser Lab Backend (Weeks 19–20)

### TASK-120: Build WebSocket terminal backend

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-049
- **Estimated effort:** XL
- **Files to create/modify:**
  - `apps/web/app/api/labs/session/route.ts`
  - `apps/web/lib/labs/container-manager.ts`
  - `apps/web/lib/labs/websocket-handler.ts`
- **Acceptance criteria:**
  - API creates a Docker container for authenticated user
  - WebSocket connection established between xterm.js and container
  - User gets isolated container (no cross-user access)
  - Container auto-destroyed after 30 minutes of inactivity
  - Container has configurable tool set per lab
  - Max 1 active lab session per user (free tier)
  - Connection survives brief network interruptions (reconnect)
  - Cleanup job removes orphaned containers
- **Notes:**
  - PRD Reference: Section 16.1 (Tier 1: Browser Terminal)
  - For launch, this can run on a single server. Scale later with container orchestration.
  - Consider using a managed service like Railway or Fly.io for the container backend

---

### TASK-121: Implement lab session management

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-120
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/app/api/labs/[sessionId]/route.ts`
  - `apps/web/app/api/labs/[sessionId]/validate/route.ts`
  - `apps/web/hooks/useLab.ts` (update)
- **Acceptance criteria:**
  - `POST /api/labs/session` — creates new lab session, returns sessionId + WebSocket URL
  - `GET /api/labs/[sessionId]` — returns session status (running, stopped, expired)
  - `POST /api/labs/[sessionId]/validate` — runs exercise validation commands in container
  - `DELETE /api/labs/[sessionId]` — stops and removes container
  - Session metadata stored: user, lab type, start time, exercises completed
  - Validation results returned with pass/fail per exercise
  - Frontend shows real-time exercise completion checkmarks
- **Notes:**
  - Premium feature (free users get limited sessions per month)

---

## Sprint 22: Payment & Premium Features (Weeks 20–21)

### TASK-122: Integrate Stripe for payments

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-011
- **Estimated effort:** XL
- **Files to create/modify:**
  - `apps/web/lib/stripe.ts`
  - `apps/web/app/api/webhooks/stripe/route.ts`
  - `apps/web/app/api/checkout/route.ts`
  - `apps/web/app/api/billing/portal/route.ts`
- **Acceptance criteria:**
  - Stripe products created: Premium Monthly ($9), Premium Annual ($79), Team (per-seat)
  - Checkout session creates Stripe subscription
  - Webhook handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
  - User profile updated with subscription status
  - Billing portal link for managing subscription
  - Subscription status cached and checked on premium routes
  - Graceful handling of failed payments (grace period, downgrade)
- **Notes:**
  - PRD Reference: Section 24.3-24.4 (Premium and Team tiers)
  - Stripe free tier covers initial needs

---

### TASK-123: Implement feature gating

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-122
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/lib/subscription.ts`
  - `apps/web/components/premium/PremiumGate.tsx`
  - `apps/web/components/premium/UpgradePrompt.tsx`
  - `apps/web/middleware.ts` (update)
- **Acceptance criteria:**
  - `getSubscription(userId)` returns current plan (free, premium, team)
  - `<PremiumGate>` component wraps premium-only content
  - Free users see: all lessons, local labs, inline quizzes, basic progress
  - Free users blocked from: cloud labs (after 3 sessions/month), certificates, assessments, PDF downloads
  - `<UpgradePrompt>` shown when free user hits premium feature
  - Team users: all premium features + admin dashboard for their team
  - Feature flags cleanly separated (not scattered across codebase)
- **Notes:**
  - Keep the free tier genuinely useful. Never make learning feel paywalled.

---

### TASK-124: Build pricing page with Stripe integration

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-122, TASK-064
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/app/(marketing)/pricing/page.tsx` (update from TASK-064)
- **Acceptance criteria:**
  - "Subscribe" buttons trigger Stripe checkout
  - Annual discount shown prominently
  - If already subscribed, show current plan and "Manage Subscription" button
  - Team tier has "Contact Us" form for custom pricing
  - Loading states during checkout redirect
  - Success/cancel redirect pages
- **Notes:**
  - Annual plan should show savings: "$9/mo vs $6.58/mo (save 27%)"

---

## Sprint 23: Security & Production Hardening (Weeks 21–22)

### TASK-125: Security audit and hardening

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** All feature tasks
- **Estimated effort:** XL
- **Files to create/modify:**
  - Various files
- **Acceptance criteria:**
  - **Authentication:**
    - All API routes verify Clerk session
    - No route accidentally exposed without auth
    - Webhook endpoints verify signatures (Clerk, Stripe)
  - **Authorization:**
    - RLS policies tested on all Supabase tables
    - Users cannot access other users' data
    - Admin routes check admin role
    - Premium features check subscription
  - **Input validation:**
    - All API inputs validated with Zod schemas
    - No SQL injection possible (parameterized queries via Supabase client)
    - XSS prevented (React escapes by default, no dangerouslySetInnerHTML without sanitization)
  - **Headers:**
    - CSP headers configured
    - HSTS enabled
    - X-Frame-Options set
    - X-Content-Type-Options set
  - **Rate limiting:**
    - API routes rate-limited (Vercel edge middleware or upstash/ratelimit)
    - Quiz submission rate-limited (prevent brute-force)
    - Lab creation rate-limited
  - **Secrets:**
    - No secrets in code or Git history
    - Environment variables properly scoped (server-only vs public)
  - **Dependencies:**
    - `pnpm audit` returns 0 critical/high vulnerabilities
    - Dependabot or Renovate configured for security updates
- **Notes:**
  - This is a gate for launch. Do not launch with known security issues.

---

### TASK-126: Implement rate limiting

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-003
- **Estimated effort:** M
- **Files to create/modify:**
  - `apps/web/lib/rate-limit.ts`
  - `apps/web/middleware.ts` (update)
- **Acceptance criteria:**
  - Rate limiter using Upstash Redis or in-memory (for MVP)
  - Limits per endpoint:
    - `/api/quiz/submit`: 10 requests/minute per user
    - `/api/progress/*`: 30 requests/minute per user
    - `/api/labs/session`: 5 requests/hour per user
    - `/api/certificates/generate`: 3 requests/hour per user
    - `/api/checkout`: 5 requests/hour per user
  - Returns 429 Too Many Requests with Retry-After header
  - Logged for monitoring
- **Notes:**
  - Upstash Redis has a generous free tier and works well with Vercel edge

---

### TASK-127: Set up monitoring and alerting

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-073 (Sentry), TASK-074 (Analytics)
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/lib/monitoring.ts`
  - Sentry dashboard configuration
- **Acceptance criteria:**
  - **Error tracking:** Sentry captures all unhandled errors with context
  - **Uptime monitoring:** Vercel or external service pings `/api/health` every 5 minutes
  - **Health endpoint:** `/api/health` checks: app running, database connected, auth working
  - **Alerts configured:**
    - Error rate > 1% → Sentry alert
    - 5xx response rate > 0.5% → alert
    - Database connection failures → alert
    - Build failures → GitHub notification
  - **Dashboard:** Sentry dashboard shows error trends, affected users, release tracking
- **Notes:**
  - For launch, Sentry + Vercel monitoring is sufficient
  - Add Prometheus/Grafana for self-hosted monitoring later if needed

---

### TASK-128: Create health check endpoint

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-013
- **Estimated effort:** S
- **Files to create/modify:**
  - `apps/web/app/api/health/route.ts`
- **Acceptance criteria:**
  - `GET /api/health` returns 200 with JSON:
    ```json
    {
      "status": "healthy",
      "timestamp": "2026-03-01T00:00:00Z",
      "version": "1.0.0",
      "checks": {
        "database": "connected",
        "auth": "configured"
      }
    }
    ```
  - Returns 503 if database is unreachable
  - No authentication required
  - Response time < 500ms
- **Notes:**
  - Used by uptime monitoring and load balancers

---

## Sprint 24: Production Deployment & Launch Prep (Weeks 22–24)

### TASK-129: Set up production environment

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-010
- **Estimated effort:** L
- **Files to create/modify:**
  - Vercel project settings
  - Supabase production project
  - Clerk production instance
  - DNS configuration
- **Acceptance criteria:**
  - **Vercel:** Production deployment from `main` branch
  - **Custom domain:** devops-engineers.com (or chosen domain) configured
  - **SSL:** HTTPS enforced on all routes
  - **Supabase:** Production project (separate from development)
  - **Clerk:** Production instance (separate from development)
  - **Stripe:** Live mode configured (if payments are ready)
  - **Environment variables:** All production values set in Vercel
  - **CDN:** Static assets served from Vercel's edge network
  - **Redirects:** www → non-www (or vice versa)
- **Notes:**
  - Keep development and production completely separate (different Supabase projects, different Clerk instances)

---

### TASK-130: Create database backup strategy

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-129
- **Estimated effort:** M
- **Files to create/modify:**
  - `docs/operations/backup-strategy.md`
- **Acceptance criteria:**
  - Supabase automatic daily backups enabled (included in free tier)
  - Point-in-time recovery documented
  - Backup restoration procedure documented and tested
  - Data export procedure for compliance
  - Backup monitoring: alert if backup fails
- **Notes:**
  - Supabase handles backups automatically. Document the process.

---

### TASK-131: Performance testing

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-129
- **Estimated effort:** L
- **Files to create/modify:**
  - `scripts/load-test.sh` (or k6 script)
  - Performance test results documentation
- **Acceptance criteria:**
  - Test scenarios:
    - Homepage load: < 1s TTFB
    - Lesson page load: < 1.5s TTFB
    - API endpoints: < 200ms p95
    - Concurrent users: 100 simultaneous without degradation
    - Quiz submission: < 500ms
  - Lighthouse CI: All pages score > 95
  - Bundle size: < 200KB per page (first load JS)
  - Image optimization verified: WebP served, lazy loaded
  - No memory leaks in client-side JavaScript
- **Notes:**
  - Use k6 or Artillery for load testing
  - Run against production (low traffic) or staging environment

---

### TASK-132: Create operations runbook

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-127, TASK-129
- **Estimated effort:** L
- **Files to create/modify:**
  - `docs/operations/runbook.md`
  - `docs/operations/incident-response.md`
  - `docs/operations/deployment.md`
- **Acceptance criteria:**
  - **Runbook covers:**
    - How to deploy: push to main, monitor Vercel build
    - How to rollback: Vercel instant rollback procedure
    - How to check health: health endpoint, Sentry dashboard, Vercel analytics
    - How to access logs: Vercel function logs, Supabase logs
    - How to respond to common issues: 503 errors, slow pages, database issues
  - **Incident response:**
    - Severity levels defined (SEV1: platform down, SEV2: feature broken, SEV3: cosmetic)
    - Communication plan: where to update users
    - Post-mortem template
  - **Deployment:**
    - CI/CD flow documented
    - Environment variable management
    - Database migration procedure
    - Feature flag management
- **Notes:**
  - Even a solo developer needs a runbook. It's documentation for your future self.

---

### TASK-133: SEO pre-launch checklist

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-056, TASK-057
- **Estimated effort:** M
- **Files to create/modify:**
  - Various meta tag updates
- **Acceptance criteria:**
  - [ ] Sitemap submitted to Google Search Console
  - [ ] robots.txt verified
  - [ ] All lesson pages have unique title and description
  - [ ] Structured data validates in Google Rich Results Test
  - [ ] Open Graph images work when shared on Twitter/LinkedIn
  - [ ] Canonical URLs set on all pages
  - [ ] Internal linking: every lesson has 5+ links
  - [ ] Page speed: all Core Web Vitals green
  - [ ] Mobile-friendly test passes
  - [ ] No broken links (content validator confirms)
- **Notes:**
  - PRD Reference: Section 21 (SEO Strategy)

---

### TASK-134: Create social media assets and launch content

- **Status:** [x] Complete
- **Priority:** P2
- **Depends on:** TASK-020
- **Estimated effort:** L
- **Files to create/modify:**
  - `public/og/` (Open Graph images)
  - `content/blog/launch-announcement.mdx`
  - Social media posts (external)
- **Acceptance criteria:**
  - Open Graph images for: homepage, each learning path, default fallback
  - Launch blog post: what the platform is, who it's for, what's available
  - README.md polished for GitHub (this drives open-source discovery)
  - Social media post templates for: Twitter, LinkedIn, Reddit, dev.to
  - 3-5 launch day blog posts adapted from lessons (to seed dev.to/Medium)
- **Notes:**
  - PRD Reference: Section 21.6 (External Content Strategy)

---

## Sprint 25: Launch Checklist (Week 24)

### TASK-135: Pre-launch full regression test

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** All previous tasks
- **Estimated effort:** XL
- **Files to create/modify:** None (testing only)
- **Acceptance criteria:**
  - **User journey 1 — New learner:**
    - [ ] Visit homepage → understand platform purpose
    - [ ] Click "Start Learning" → sign up flow works
    - [ ] Complete onboarding → personalized recommendation shown
    - [ ] Navigate to first lesson → content renders correctly
    - [ ] Complete exercises → progress tracked
    - [ ] Take inline quiz → score shown with explanations
    - [ ] Mark lesson complete → XP awarded, progress updated
    - [ ] Navigate to next lesson → previous/next links work
    - [ ] Return to dashboard → progress reflected correctly
  - **User journey 2 — Completing a module:**
    - [ ] Complete all lessons in Linux module
    - [ ] Take module assessment → score calculated
    - [ ] Pass assessment → certificate generated
    - [ ] View certificate → displays correctly
    - [ ] Download PDF → renders properly
    - [ ] Share certificate link → public verification works
  - **User journey 3 — Premium user:**
    - [ ] Subscribe via Stripe → payment processed
    - [ ] Access cloud lab → terminal connects to container
    - [ ] Download lesson PDF → file downloads
    - [ ] Cancel subscription → features downgraded gracefully
  - **Cross-browser:**
    - [ ] Chrome (latest)
    - [ ] Firefox (latest)
    - [ ] Safari (latest)
    - [ ] Edge (latest)
    - [ ] Mobile Safari (iOS)
    - [ ] Chrome Mobile (Android)
  - **Edge cases:**
    - [ ] Slow network simulation → graceful degradation
    - [ ] Auth token expired → redirects to login
    - [ ] 404 pages → custom error page shown
    - [ ] Concurrent tab sessions → no data corruption
- **Notes:**
  - This is the final gate before launch. Block launch on any critical failures.

---

### TASK-136: Create launch monitoring dashboard

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-127
- **Estimated effort:** M
- **Files to create/modify:**
  - Sentry dashboard configuration
  - Vercel analytics dashboard
- **Acceptance criteria:**
  - Dashboard shows real-time:
    - Active users
    - Page views per minute
    - Error rate
    - API response times
    - Sign-up rate
    - First lesson completion rate
  - Alert thresholds set for launch day
  - Team has access to all dashboards
- **Notes:**
  - Watch closely for the first 48 hours after launch

---

### TASK-137: Write CHANGELOG and release notes

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-135
- **Estimated effort:** S
- **Files to create/modify:**
  - `CHANGELOG.md`
- **Acceptance criteria:**
  - Version 1.0.0 release notes covering:
    - Platform overview
    - Foundations learning path (6 modules, 100+ lessons)
    - Docker module (Path 2 start)
    - Features: progress tracking, quizzes, certificates, labs
    - Known limitations
    - Roadmap preview
- **Notes:**
  - Follow Keep a Changelog format

---

## Post-Launch Sprint: Remaining Content Paths (Months 4-14)

### TASK-138: Create Kubernetes module (Path 2 continued)

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-112
- **Estimated effort:** XL (multi-week)
- **Files to create/modify:**
  - 35-40 lesson files under `content/paths/containerization/kubernetes/`
  - Kubernetes labs in `labs/`
  - Quiz files
- **Acceptance criteria:**
  - 35-40 lessons covering: architecture, pods, deployments, services, configmaps/secrets, volumes, networking, RBAC, scheduling, HPA, monitoring
  - Labs using kind or k3d (runs in Docker)
  - Production debugging scenarios: CrashLoopBackOff, ImagePullBackOff, OOMKilled, pending pods
  - Module assessment: 50+ question pool
  - Connects Docker knowledge to Kubernetes concepts explicitly
- **Notes:**
  - PRD Reference: Section 7.2 Path 2 (Containerization)

---

### TASK-139: Create Helm and Kustomize modules

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-138
- **Estimated effort:** XL
- **Files to create/modify:**
  - 15-20 lessons for Helm
  - 10-15 lessons for Kustomize
- **Acceptance criteria:**
  - Helm: charts, values, templates, repositories, chart museum, best practices
  - Kustomize: bases, overlays, patches, generators
  - Comparison lesson: "When to use Helm vs Kustomize"
  - Labs: deploy applications using both tools

---

### TASK-140: Create CI/CD & GitOps path (Path 3)

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-104 (Git module), TASK-138 (Kubernetes)
- **Estimated effort:** XL (multi-week)
- **Files to create/modify:**
  - Full lesson sets for: CI/CD Fundamentals, GitHub Actions, Jenkins, ArgoCD, Flux
- **Acceptance criteria:**
  - GitHub Actions: 25-30 lessons with real workflow files
  - Jenkins: 25-30 lessons with Jenkinsfile examples
  - ArgoCD: 20-25 lessons with GitOps patterns
  - Flux: 15-20 lessons
  - Labs: Full CI/CD pipeline from commit to deployment
  - Path capstone: Complete CI/CD platform
- **Notes:**
  - PRD Reference: Section 7.2 Path 3

---

### TASK-141: Create IaC & Cloud path (Path 4)

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-107 (Python boto3)
- **Estimated effort:** XL (multi-week)
- **Files to create/modify:**
  - Full lesson sets for: Cloud Fundamentals, AWS, Terraform, Ansible
- **Acceptance criteria:**
  - AWS: 60-75 lessons covering core + advanced services
  - Terraform: 45-55 lessons from basics to advanced modules
  - Ansible: 25-30 lessons
  - Labs: Terraform with local provider + AWS free tier exercises
  - Path capstone: Full AWS production environment with Terraform
- **Notes:**
  - PRD Reference: Section 7.2 Path 4
  - AWS lessons should emphasize free-tier services wherever possible

---

### TASK-142: Create Observability & Reliability path (Path 5)

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-138 (Kubernetes)
- **Estimated effort:** XL (multi-week)
- **Files to create/modify:**
  - Full lesson sets for: Observability Fundamentals, Prometheus, Grafana, OpenTelemetry, Logging, Alerting, SRE
- **Acceptance criteria:**
  - Prometheus: 25-30 lessons, PromQL, alerting rules
  - Grafana: 20-25 lessons, dashboard design, data sources
  - OpenTelemetry: 20-25 lessons, tracing, metrics, logs
  - SRE: 20-25 lessons, SLOs, error budgets, incident management
  - Labs: Full observability stack in Docker Compose
  - Path capstone: Observable microservices platform
- **Notes:**
  - PRD Reference: Section 7.2 Path 5

---

### TASK-143: Create Platform Engineering path (Path 6)

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-140, TASK-141, TASK-142
- **Estimated effort:** XL (multi-week)
- **Files to create/modify:**
  - Full lesson sets for: Platform Principles, IDPs, Distributed Systems, DevSecOps, FinOps, Career
- **Acceptance criteria:**
  - Platform Engineering: principles, golden paths, service catalogs
  - Distributed Systems: CAP theorem, consensus, eventual consistency
  - DevSecOps: SAST/DAST, supply chain security, policy as code
  - FinOps: cost optimization, resource tagging, budgets
  - Career: resume building, interview prep, salary negotiation
  - Path capstone: Internal Developer Platform
- **Notes:**
  - PRD Reference: Section 7.2 Path 6

---

### TASK-144: Create mega projects

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-138, TASK-140, TASK-141, TASK-142
- **Estimated effort:** XL
- **Files to create/modify:**
  - `content/projects/mega/production-k8s-platform/`
  - `content/projects/mega/startup-infrastructure/`
  - `content/projects/mega/enterprise-migration/`
  - `content/projects/mega/incident-response-simulation/`
  - `content/projects/mega/open-source-contribution/`
- **Acceptance criteria:**
  - 5 mega projects as defined in PRD Section 7.3
  - Each: requirements, architecture guide, step-by-step implementation, validation criteria
  - Each combines 3+ technologies across paths
  - Lab environments provided
  - Estimated 20-80 hours per project
- **Notes:**
  - PRD Reference: Section 7.3 (Cross-Path Mega Projects)

---

## Platform Maturity Tasks

### TASK-145: Implement in-platform discussion system

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-084
- **Estimated effort:** XL
- **Files to create/modify:**
  - New database tables for discussions
  - Discussion components and API routes
- **Acceptance criteria:**
  - Discussion threads per lesson
  - Comment, reply, upvote functionality
  - Markdown support in comments
  - Moderation tools (flag, delete, ban)
  - Notifications for replies
- **Notes:**
  - PRD Reference: Section 23.1 Phase 2 (In-platform discussions)
  - Only build after reaching 1,000+ active users

---

### TASK-146: Build team dashboard for Team tier

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-122
- **Estimated effort:** XL
- **Files to create/modify:**
  - `apps/web/app/(platform)/team/` (new route group)
  - Team management API routes
- **Acceptance criteria:**
  - Team admin can: invite members, remove members, view progress
  - Team dashboard shows: aggregate progress, individual progress, completion rates
  - Custom learning paths assignable to team
  - Reports exportable as CSV
  - SSO integration (SAML) — can be Phase 5
- **Notes:**
  - PRD Reference: Section 24.4 (Team Tier)

---

### TASK-147: Create email marketing automation

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-079
- **Estimated effort:** L
- **Files to create/modify:**
  - `apps/web/lib/email-automation.ts`
  - Additional email templates
- **Acceptance criteria:**
  - Automated email sequences:
    - Welcome series: day 1, day 3, day 7 (encourage first lesson)
    - Inactive user: 7 days, 14 days, 30 days
    - Module completion celebration
    - Streak milestone (7, 30, 100 days)
    - Monthly progress summary
  - Unsubscribe works for each email type independently
  - Emails personalized with user name and progress
- **Notes:**
  - Critical for retention. Most users who sign up will go inactive without nudges.

---

## Production Operations Tasks

### TASK-148: Set up staging environment

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-129
- **Estimated effort:** M
- **Files to create/modify:**
  - Vercel project settings (staging)
  - `.github/workflows/deploy-staging.yml`
- **Acceptance criteria:**
  - Staging environment at staging.devops-engineers.com
  - Separate Supabase project for staging
  - Separate Clerk instance for staging
  - Deploy from `develop` branch (or from PRs)
  - Reset-able with seed data
  - Used for testing before production deploys
- **Notes:**
  - Essential for catching issues before they reach production

---

### TASK-149: Implement database migrations workflow

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-012
- **Estimated effort:** M
- **Files to create/modify:**
  - `supabase/migrations/` (migration workflow)
  - `docs/operations/database-migrations.md`
- **Acceptance criteria:**
  - Migration files numbered sequentially: `001_initial.sql`, `002_add_field.sql`
  - Migration command: `supabase db push` applies pending migrations
  - Rollback documented for each migration
  - CI checks that migrations are valid SQL
  - Never modify an already-applied migration file
  - Process documented: create migration → test on staging → apply to production
- **Notes:**
  - Supabase CLI handles migrations. Document the workflow clearly.

---

### TASK-150: Set up automated dependency updates

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-009
- **Estimated effort:** S
- **Files to create/modify:**
  - `.github/renovate.json` or `.github/dependabot.yml`
- **Acceptance criteria:**
  - Renovate Bot or Dependabot configured
  - Security updates auto-merged (patch versions)
  - Minor/major updates create PRs for review
  - PR includes changelog summary
  - CI must pass before auto-merge
  - Schedule: weekly for non-security, immediate for security
- **Notes:**
  - Keeps dependencies fresh and secure without manual effort

---

## Final Launch Gate

### TASK-151: Production launch gate — Final checklist

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** All critical tasks
- **Estimated effort:** L
- **Files to create/modify:** None
- **Acceptance criteria:**
  - **Infrastructure:**
    - [ ] Production domain live with SSL
    - [ ] CDN serving static assets globally
    - [ ] Database backed up and monitored
    - [ ] Health check endpoint responding
    - [ ] Error tracking active (Sentry)
    - [ ] Uptime monitoring configured
    - [ ] Rate limiting active
  - **Security:**
    - [ ] Auth working (sign up, sign in, sign out)
    - [ ] RLS tested on all tables
    - [ ] No secrets in Git
    - [ ] CSP headers configured
    - [ ] Webhook signatures verified
    - [ ] `pnpm audit` clean
  - **Content:**
    - [ ] Foundations path: 100+ lessons complete and reviewed
    - [ ] Docker module: 15+ lessons complete
    - [ ] All quizzes functional
    - [ ] All labs functional
    - [ ] Content validator passes on all files
    - [ ] No broken links
  - **Features:**
    - [ ] Progress tracking works end-to-end
    - [ ] XP and level system works
    - [ ] Streak tracking works
    - [ ] Certificates generate and display
    - [ ] Search works
    - [ ] Dashboard shows accurate data
  - **Quality:**
    - [ ] Lighthouse > 95 on all page types
    - [ ] All pages responsive
    - [ ] Dark mode works
    - [ ] Cross-browser tested
    - [ ] Integration test passes
    - [ ] Load test: 100 concurrent users no degradation
  - **Operations:**
    - [ ] Runbook written
    - [ ] Deployment process documented
    - [ ] Rollback process tested
    - [ ] Database backup verified
    - [ ] Monitoring dashboards ready
  - **Launch:**
    - [ ] README polished
    - [ ] Blog post ready
    - [ ] Social media posts drafted
    - [ ] Community channels ready (Discord, GitHub Discussions)

---

## Summary: Task Count by Phase

| Phase | Sprint | Weeks | Tasks | Priority |
|-------|--------|-------|-------|----------|
| **1: Foundation** | 1–4 | 1–4 | TASK-001 to TASK-040 (40 tasks) | Repository, Auth, DB, Content Engine |
| **2: Features** | 5–13 | 5–10 | TASK-041 to TASK-090 (50 tasks) | Quiz, Labs, Certs, Search, Polish |
| **3: Content** | 14–20 | 11–18 | TASK-091 to TASK-119 (29 tasks) | Migrate + Create Foundations Path |
| **4: Production** | 21–25 | 19–24 | TASK-120 to TASK-151 (32 tasks) | Hardening, Payments, Launch |
| **5: Scale** | 26+ | 25+ | TASK-138 to TASK-150 | Remaining Paths, Team Features |

**Total: ~151 tasks**

## Execution Priority Matrix

**Must complete before launch (P0):**
- Repository & infrastructure (TASK-001–010)
- Auth & database (TASK-011–016)
- Layout & navigation (TASK-017–023)
- Content engine & MDX (TASK-024–034)
- Progress tracking (TASK-035–037)
- Quiz engine (TASK-041–043)
- Certificate system (TASK-051–052)
- Foundations path content (TASK-091–110)
- Security hardening (TASK-125–126)
- Production environment (TASK-129–133)
- Launch gate (TASK-135, TASK-151)

**Should complete before launch (P1):**
- Shared configs, CI/CD (TASK-006, 009)
- Content validation (TASK-039)
- Lab CLI tool (TASK-047)
- Dev containers (TASK-048)
- Browser terminal (TASK-049)
- Search (TASK-055)
- SEO (TASK-056–058)
- Public profiles (TASK-060)
- Dark mode (TASK-065)
- Testing (TASK-080–083)
- Performance (TASK-075)
- Accessibility (TASK-076)

**Nice to have for launch (P2–P3):**
- Achievements (TASK-038)
- Matching/debugging quiz types (TASK-045)
- Leaderboard (TASK-061)
- Blog (TASK-062)
- Pricing page with Stripe (TASK-064, 122–124)
- Level-up animations (TASK-069)
- PWA (TASK-078)
- Email automation (TASK-079, 147)
- Admin dashboard (TASK-086)
- Team features (TASK-146)

---

## How to Resume After Context Loss

If starting a new session, follow these steps:

1. **Read this file** to understand the full task list
2. **Check `git log --oneline -20`** to see what was last committed
3. **Search for `[x] Complete`** in all 4 task-list files to see completed tasks
4. **Find the first `[ ] Not Started`** task whose dependencies are met
5. **Read the relevant PRD section** referenced in the task's Notes
6. **Begin implementation** following the acceptance criteria

The task numbers are sequential and dependencies are explicit. You can always determine the next task to work on.

---

*DEVOPS ENGINEERS — Training 1 Million Engineers, One Story at a Time.*
