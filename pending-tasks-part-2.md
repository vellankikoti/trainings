# Pending Tasks — Part 2: Post-Launch Roadmap

**Date:** March 4, 2026
**Status:** Phase 1-4 complete, Phase 5+ deferred
**Goal:** Feature roadmap after public launch

---

## Phase 5: Incident Simulation Engine (4-6 weeks)

> **Blocker:** Requires managed K8s cluster (EKS/GKE/AKS), fault injection tooling (Gremlin/LitmusChaos), and real-time WebSocket infrastructure.

### 5.1 Incident Definitions & Orchestration

- [ ] Design incident scenario schema (YAML-based definitions)
- [ ] Build incident orchestration controller
- [ ] Implement fault injection integration (Gremlin or LitmusChaos)
- [ ] Create 10+ incident scenarios (CPU spike, memory leak, network partition, DNS failure, disk full, pod crash loop, certificate expiry, config drift, deployment rollback, cascading failure)
- [ ] Build incident timer and severity escalation system

**Database:** `simulation_definitions`, `simulation_attempts` tables exist (empty)
**Files:** `apps/web/lib/incidents/` (NEW directory)

### 5.2 RCA Scoring Engine

- [ ] Build Root Cause Analysis evaluation engine
- [ ] Define scoring rubrics per incident type
- [ ] Implement partial credit for correct investigation steps
- [ ] Add ML/NLP evaluation for free-text RCA submissions (optional enhancement)
- [ ] Integrate incident scores into skill composite (30% weight already defined)

**Files:** `apps/web/lib/skills/score-calculator.ts` (update weights)

### 5.3 War Room Mode (Multi-User)

- [ ] Design war room session management
- [ ] Build multi-user terminal sharing (extend existing WebSocket infrastructure)
- [ ] Implement real-time command history sync
- [ ] Add role assignment (troubleshooter, observer, facilitator)
- [ ] Build collaborative RCA workspace
- [ ] Add team scoreboard
- [ ] Implement session recording and playback

**Files:** `apps/web/lib/labs/` (extend), `apps/web/components/labs/` (extend)

### 5.4 Kubernetes Lab Infrastructure

- [ ] Provision managed K8s cluster
- [ ] Build pod template definitions for labs
- [ ] Implement persistent storage for lab environments
- [ ] Add networking (service exposure, port forwarding)
- [ ] Configure resource quotas and limits per user
- [ ] Set up container image registry
- [ ] Build K8s-specific validation (check pod logs, events, services)
- [ ] Add monitoring dashboard for lab pods

**Files:** `apps/web/lib/labs/container-manager.ts` (extend to K8s)

### 5.5 Lab Session Persistence

- [ ] Implement container state snapshots
- [ ] Add session recovery on disconnect
- [ ] Build container cleanup scheduler
- [ ] Add long-running lab support (>30 min)

---

## Phase 6: Advanced Analytics & Intelligence (3-4 weeks)

### 6.1 Learner Analytics Dashboard

- [ ] Skill decay tracking (flag skills inactive >90 days)
- [ ] Time-spent analytics (actual vs estimated per lesson)
- [ ] Lab success rate trends (per module, per path)
- [ ] Quiz difficulty distribution assessment
- [ ] Content engagement heatmap (which lessons are most/least completed)
- [ ] Personalized recommendations engine (suggest next lessons based on weak areas)

**Files:** `apps/web/lib/tracking/event-sdk.ts` (extend), `apps/web/components/dashboard/` (new widgets)

### 6.2 Cohort Analytics (Admin/Institute)

- [ ] Cohort comparison against benchmarks
- [ ] Batch performance trends over time
- [ ] Module-level pass rate heatmap (aggregated across all students)
- [ ] At-risk student identification (automated alerts)

### 6.3 Export & Reporting

- [ ] PDF report generation (batch summary, student progress, certificates)
  - Use `jsPDF` or server-side Puppeteer/Playwright
- [ ] CSV export for all data views
- [ ] Scheduled report delivery via email
- [ ] Admin compliance reports (GDPR audit trail)

### 6.4 GDPR Compliance (Full)

- [ ] Per-section privacy toggles (skills, badges, activity, certifications)
- [ ] Organization discovery opt-in enforcement
- [ ] Data download (export all user data as JSON/ZIP)
- [ ] Account deletion workflow (soft delete → hard delete after 30 days)
- [ ] Right to be forgotten implementation
- [ ] Audit logging for all data access

**Files:** `apps/web/app/(platform)/settings/` (extend), `apps/web/app/api/gdpr/` (NEW)

---

## Phase 7: Email Automation & Engagement (2 weeks)

### 7.1 Automated Email Triggers

- [ ] Streak warning emails (when streak at risk — no activity for 20 hours)
- [ ] Weekly learning digest (summary of progress, next recommendations)
- [ ] Course recommendation emails (based on weak skill areas)
- [ ] Certificate issued notification (transactional)
- [ ] Batch communication system (trainer to students — announcements)
- [ ] Welcome sequence (new user onboarding — 3-email drip)
- [ ] Re-engagement campaign (inactive users after 14 days)

**Files:** `apps/web/lib/email-automation.ts` (extend triggers), `apps/web/app/api/cron/emails/` (implement)

### 7.2 Notification Enhancements

- [ ] In-app notification preferences (per notification type)
- [ ] Email notification preferences (digest vs real-time)
- [ ] Push notification support (PWA — future)

---

## Phase 8: External Integrations (2-3 weeks)

### 8.1 Job Board API Integrations

| API | Effort | Notes |
|-----|--------|-------|
| Remotive API | 1-2 days | Free, no API key needed, remote DevOps jobs |
| Arbeitnow API | 1-2 days | Free, no API key needed, EU-focused |
| Adzuna API | 2-3 days | Free tier available, requires API key |
| JSearch (RapidAPI) | 2-3 days | Free tier (500 req/month), requires API key |
| Indeed API | 3-5 days | Partner program, requires approval |

**Implementation per API:**
- [ ] Build API client with retry logic
- [ ] Map external schema to `job_postings` table
- [ ] Implement deduplication via `(source, external_id)` unique index
- [ ] Add to cron job schedule (daily sync)
- [ ] Add job relevance scoring/filtering

**Files:** `apps/web/lib/jobs/` (NEW — one client per API), `apps/web/app/api/cron/jobs/` (NEW)

### 8.2 Discussion Moderation

- [ ] Add flag/report mechanism for discussions
- [ ] Build moderation queue for trainers/admins
- [ ] Implement hide/remove/ban actions
- [ ] Add content review dashboard
- [ ] Auto-flagging for spam patterns

**Files:** `apps/web/lib/discussions.ts` (extend), `apps/web/app/(platform)/admin/moderation/` (NEW)

---

## Phase 9: Quality & Testing (Ongoing)

### 9.1 Test Infrastructure

- [ ] Set up Vitest/Jest for unit tests across all lib files
- [ ] Add Playwright/Cypress for E2E tests (critical user flows)
- [ ] Add CI pipeline (GitHub Actions) with:
  - Type checking (`tsc --noEmit`)
  - Linting (`eslint`)
  - Unit tests
  - Build verification
  - Preview deployments on PRs

### 9.2 Test Coverage Targets

| Area | Current | Target | Priority |
|------|---------|--------|----------|
| XP/Level system | 3 tests | 20+ tests | P1 |
| Progress tracking | 0 tests | 15+ tests | P0 |
| Streak system | 0 tests | 10+ tests | P0 |
| Quiz validation | 1 test | 10+ tests | P1 |
| API routes | 0 tests | 30+ tests | P1 |
| UI components | 0 tests | 20+ tests | P2 |

### 9.3 API Documentation

- [ ] Generate OpenAPI/Swagger spec for all API routes
- [ ] Add API documentation page at `/docs/api`
- [ ] Document webhook payloads (Clerk, Stripe)

---

## Phase 10: Performance & Scalability (Ongoing)

### 10.1 Infrastructure Upgrades (When Needed)

- [ ] Upgrade from Vercel Hobby to Pro (for more cron frequency, bandwidth)
- [ ] Add Redis (Upstash) for:
  - Rate limiting (replace in-memory)
  - Session caching
  - Leaderboard real-time updates
- [ ] Add CDN for content assets
- [ ] Database connection pooling (PgBouncer via Supabase)

### 10.2 Performance Optimizations

- [ ] Implement ISR (Incremental Static Regeneration) for path/module pages
- [ ] Add database query optimization (indexes, query analysis)
- [ ] Implement client-side caching with SWR/React Query
- [ ] Bundle size optimization (dynamic imports, tree shaking audit)

---

## Priority Matrix

| Priority | Items | Timeline |
|----------|-------|----------|
| **P0 — Launch Blockers** | Security headers, rate limiting, health check, env audit | **This session** |
| **P1 — First 2 weeks** | Privacy/terms pages, smoke testing, bug fixes | Week 1-2 |
| **P2 — Month 1** | Email automations, batch exports, discussion moderation | Month 1 |
| **P3 — Quarter 1** | Job API integrations, advanced analytics, GDPR full | Q1 2026 |
| **P4 — Quarter 2+** | Incident simulation engine, K8s labs, war room | Q2 2026+ |

---

## Architecture Decision Records

### ADR-001: No Redis for MVP
**Decision:** Use in-memory rate limiting instead of Redis.
**Rationale:** Vercel serverless functions have short lifetimes; in-memory rate limiting is "best effort" but sufficient for launch. Upgrade to Upstash Redis when traffic justifies it.

### ADR-002: No K8s for MVP
**Decision:** Defer K8s lab infrastructure to Phase 5.
**Rationale:** Docker-based labs work for 80% of curriculum. K8s labs require significant infrastructure investment. Ship Docker labs, validate demand, then invest.

### ADR-003: No ML for MVP
**Decision:** Defer ML-based RCA scoring and personalized recommendations.
**Rationale:** Rule-based scoring works for initial incident scenarios. ML adds complexity without proportional value at low user counts.

### ADR-004: Vercel Hobby Plan
**Decision:** Stay on Vercel Hobby plan for launch.
**Rationale:** Daily cron is sufficient for email/job sync. Upgrade to Pro when monthly bandwidth or build time limits are hit.
