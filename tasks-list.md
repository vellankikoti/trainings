# Tasks List
## Career Transformation Engine — Execution Roadmap (v2.0)

**Version:** 2.0 — Restructured for Execution Mode
**Date:** March 2026
**Companion Docs:** PRD-product.md, PRD-frontend.md, PRD-backend.md

---

## Phase Summary

| Phase | Name | Focus | Status |
|---|---|---|---|
| **Phase 1** | Core Infrastructure | Redis, event pipeline, async processing | NOT STARTED |
| **Phase 2** | Learner Experience Polish | Fix gaps, complete remaining learner features | NOT STARTED |
| **Phase 3** | Trainer Experience | Batch management, student monitoring, reports | NOT STARTED |
| **Phase 4** | Organization & Hiring | Org portal, candidate search, job board | NOT STARTED |
| **Phase 5** | Labs & Simulation | K8s infrastructure, real containers, incident sims | NOT STARTED |
| **Phase 6** | Analytics & Export | Deep analytics, PDF reports, data export | NOT STARTED |
| **Phase 7** | Stabilization & QA | Performance, security, accessibility, mobile | NOT STARTED |

---

## Already DONE (MVP — Completed)

### Frontend (14/14 Done)

- [x] F-001 — Role-based routing and layout system
- [x] F-002 — Learner dashboard (skill overview, stats strip, heatmap)
- [x] F-003 — Skill roadmap component
- [x] F-004 — xterm.js browser terminal integration
- [x] F-005 — Split-pane lab interface
- [x] F-006 — Lab exercise components (guided/challenge/playground)
- [x] F-007 — Active time tracking SDK
- [x] F-008 — Streak system UI
- [x] F-009 — XP system UI (animations, level-up, breakdown)
- [x] F-010 — Public skill profile page (`/u/[username]`)
- [x] F-011 — Onboarding flow
- [x] F-012 — Notification center
- [x] F-013 — Monaco Editor panel for labs
- [x] F-014 — Badge showcase component

### Backend (14/15 Done)

- [x] B-001 — Database schema (7 migrations)
- [x] B-002 — RBAC middleware
- [x] B-003 — Event ingestion API
- [ ] B-004 — Event processing pipeline (needs Redis) → MOVED TO Phase 1
- [x] B-005 — Skill score calculation engine
- [x] B-006 — Lab session API
- [x] B-007 — Active time tracking API
- [x] B-008 — Streak logic
- [x] B-009 — XP reward system
- [x] B-010 — Lab validation engine
- [x] B-011 — Hint system
- [x] B-012 — Public profile API
- [x] B-013 — Badge evaluation engine
- [x] B-014 — Quiz API enhancements
- [x] B-015 — Notification service

### Data Engineering (4/5 Done)

- [x] DE-001 — Events table with partitioning
- [x] DE-002 — Materialized views (daily stats, leaderboards)
- [x] DE-003 — Skill percentile calculation job
- [x] DE-004 — Analytics data export (CSV)
- [ ] DE-005 — Event archival strategy → MOVED TO Phase 6

---

## Phase 1 — Core Infrastructure

**Goal:** Set up Redis, async event processing, and fill infrastructure gaps that block later phases.

### 1.1 Redis & Queue Setup

| # | Task | Priority | Depends On |
|---|---|---|---|
| P1-001 | Set up Redis (Upstash) — connection, env vars, client wrapper | P0 | — |
| P1-002 | Set up BullMQ — queue definitions, worker infrastructure, connection pool | P0 | P1-001 |
| P1-003 | Build event processing pipeline — consume events from queue, trigger XP/badge/streak updates async | P0 | P1-002 |
| P1-004 | Migrate rate limiting to Redis-backed — replace in-memory rate limiter | P1 | P1-001 |
| P1-005 | Build session cache in Redis — cache active user sessions, dashboard data (TTL: 5min) | P1 | P1-001 |

### 1.2 Infrastructure

| # | Task | Priority | Depends On |
|---|---|---|---|
| P1-006 | Set up staging environment on Vercel | P0 | — |
| P1-007 | Configure Sentry for all API routes (if not already complete) | P0 | — |
| P1-008 | Set up automated database migration pipeline | P0 | — |
| P1-009 | Configure Stripe webhook handling verification | P0 | — |
| P1-010 | Set up feature flag system (Vercel Edge Config or env vars) | P1 | — |

### 1.3 Security Baseline

| # | Task | Priority | Depends On |
|---|---|---|---|
| P1-011 | Audit and test RLS policies for all tables | P0 | — |
| P1-012 | Security headers audit — CSP for xterm.js, Monaco, WebSocket | P0 | — |
| P1-013 | Input validation audit — Zod schemas for all POST/PATCH endpoints | P0 | — |

---

## Phase 2 — Learner Experience Polish

**Goal:** Fix remaining gaps in the learner experience, improve UX, and ensure all learner flows are production-ready.

### 2.1 Dashboard & Progress

| # | Task | Priority | Depends On |
|---|---|---|---|
| P2-001 | Polish dashboard data loading — add skeleton screens, error states | P0 | — |
| P2-002 | Fix any dashboard data inconsistencies (stale cache, missing aggregation) | P0 | — |
| P2-003 | Add "recommended next" logic — suggest next lesson/lab/quiz based on progress | P1 | — |
| P2-004 | Build learning streak recovery — allow 1 missed day for premium users | P1 | P1-001 |

### 2.2 Content & Learning Flow

| # | Task | Priority | Depends On |
|---|---|---|---|
| P2-005 | Audit lesson sidebar — ensure all 6 paths render correctly with progress indicators | P0 | — |
| P2-006 | Fix lesson completion flow — ensure sidebar + progress refresh after marking complete | P0 | — |
| P2-007 | Add lesson estimated reading time display | P1 | — |
| P2-008 | Add module completion summary page (recap, badge earned, next module CTA) | P1 | — |

### 2.3 Labs Polish

| # | Task | Priority | Depends On |
|---|---|---|---|
| P2-009 | Test all 9 lab YAML definitions — verify exercises, hints, validation rules | P0 | — |
| P2-010 | Add lab session resume — reconnect to existing session if browser refreshed | P0 | — |
| P2-011 | Add lab completion summary — time taken, exercises completed, XP earned, hints used | P1 | — |
| P2-012 | Add lab error states — connection failed, session expired, container unavailable | P1 | — |

### 2.4 Quiz Polish

| # | Task | Priority | Depends On |
|---|---|---|---|
| P2-013 | Test all quiz definitions across 25 modules | P0 | — |
| P2-014 | Add quiz review mode — review past attempts with correct answers | P1 | — |
| P2-015 | Add quiz retry logic — allow retake with different question subset | P1 | — |

### 2.5 Profile & Settings

| # | Task | Priority | Depends On |
|---|---|---|---|
| P2-016 | Polish public profile page — ensure all widgets render with real data | P0 | — |
| P2-017 | Add profile privacy controls — hide activity, hide skill scores, disable discovery | P1 | — |
| P2-018 | Add settings: notification preferences (email on/off per type) | P1 | — |

---

## Phase 3 — Trainer Experience

**Goal:** Build the trainer dashboard, batch management, and student monitoring.

### 3.1 Database

| # | Task | Priority | Depends On |
|---|---|---|---|
| P3-001 | Create migration: `institutes` table | P0 | — |
| P3-002 | Create migration: `institute_members` table | P0 | P3-001 |
| P3-003 | Create migration: `batches` table | P0 | P3-001 |
| P3-004 | Create migration: `batch_enrollments` table | P0 | P3-003 |
| P3-005 | Add RLS policies for institute/batch/enrollment tables | P0 | P3-004 |

### 3.2 Backend — Institute & Batch API

| # | Task | Priority | Depends On |
|---|---|---|---|
| P3-006 | Build institute CRUD API — create, update, manage plan | P0 | P3-001 |
| P3-007 | Build institute member management — invite trainers, assign roles, revoke | P0 | P3-002 |
| P3-008 | Build batch CRUD API — create, update, archive, assign paths | P0 | P3-003 |
| P3-009 | Build batch enrollment API — add students (email/CSV), manage status | P0 | P3-004 |

### 3.3 Backend — Student Monitoring

| # | Task | Priority | Depends On |
|---|---|---|---|
| P3-010 | Build trainer student monitoring API — per-student metrics aggregation | P0 | P3-009 |
| P3-011 | Build batch analytics API — aggregate completion rates, at-risk detection | P0 | P3-009 |
| P3-012 | Build at-risk detection algorithm — inactive 3+ days, declining scores | P1 | P3-010 |

### 3.4 Backend — Reports

| # | Task | Priority | Depends On |
|---|---|---|---|
| P3-013 | Build individual student report API (PDF/CSV) | P0 | P3-010 |
| P3-014 | Build batch summary report API (PDF/CSV) | P0 | P3-011 |
| P3-015 | Build weekly digest email for trainers (automated) | P1 | P3-011 |

### 3.5 Frontend — Trainer Dashboard

| # | Task | Priority | Depends On |
|---|---|---|---|
| P3-016 | Build trainer dashboard page — batch selector, student grid, aggregate metrics | P0 | P3-010 |
| P3-017 | Build student detail view — individual progress timeline, skill graph | P0 | P3-010 |
| P3-018 | Build batch management UI — create batch, add students, assign paths | P0 | P3-008 |
| P3-019 | Build trainer reporting UI — generate and download reports | P0 | P3-013 |
| P3-020 | Build institute admin dashboard — manage trainers, view batches, billing | P0 | P3-006 |
| P3-021 | Build at-risk student alerts UI | P1 | P3-012 |
| P3-022 | Build batch comparison view | P1 | P3-011 |
| P3-023 | Build module difficulty heatmap | P2 | P3-011 |

### 3.6 Data Engineering

| # | Task | Priority | Depends On |
|---|---|---|---|
| P3-024 | Build trainer materialized views — batch_performance, student_daily_summary | P0 | P3-009 |
| P3-025 | Build cohort comparison queries | P2 | P3-024 |

---

## Phase 4 — Organization & Hiring

**Goal:** Build the organization portal, candidate search, and job board.

### 4.1 Database

| # | Task | Priority | Depends On |
|---|---|---|---|
| P4-001 | Create migration: `organizations` table | P0 | — |
| P4-002 | Create migration: `org_members` table | P0 | P4-001 |
| P4-003 | Create migration: `job_postings` table | P0 | P4-001 |
| P4-004 | Create migration: `job_applications` table | P0 | P4-003 |
| P4-005 | Add RLS policies for org/job tables | P0 | P4-004 |

### 4.2 Backend — Organization API

| # | Task | Priority | Depends On |
|---|---|---|---|
| P4-006 | Build organization CRUD API | P0 | P4-001 |
| P4-007 | Build org member management — invite recruiters, assign roles | P0 | P4-002 |
| P4-008 | Build candidate search API — multi-field filter, skill threshold, pagination | P0 | P4-001 |
| P4-009 | Build job posting CRUD API | P0 | P4-003 |
| P4-010 | Build job search API (learner-facing) — filter by skill/location/remote | P0 | P4-003 |

### 4.3 Backend — Job Aggregation (External APIs)

| # | Task | Priority | Depends On |
|---|---|---|---|
| P4-011 | Build job aggregation service — scheduled fetch from external APIs | P0 | P4-003 |
| P4-012 | Implement Indeed Publisher API integration | P0 | P4-011 |
| P4-013 | Implement JSearch API integration | P0 | P4-011 |
| P4-014 | Build job deduplication logic | P0 | P4-011 |
| P4-015 | Build job-skill matching algorithm | P1 | P4-011 |
| P4-016 | Implement Google Cloud Talent Solution | P1 | P4-011 |
| P4-017 | Implement Adzuna API integration | P1 | P4-011 |

### 4.4 Backend — Interaction & Billing

| # | Task | Priority | Depends On |
|---|---|---|---|
| P4-018 | Build candidate interaction tracking API — views, shortlists, contacts | P1 | P4-008 |
| P4-019 | Build org billing — Stripe integration for org plans | P1 | P4-006 |
| P4-020 | Build candidate contact API — in-platform messaging | P1 | P4-018 |
| P4-021 | Build career profile PDF export for learners | P1 | — |

### 4.5 Frontend — Organization Portal

| # | Task | Priority | Depends On |
|---|---|---|---|
| P4-022 | Build organization registration & profile setup | P0 | P4-006 |
| P4-023 | Build candidate search interface — filters, results, skill cards | P0 | P4-008 |
| P4-024 | Build candidate profile view (org-facing) | P0 | P4-008 |
| P4-025 | Build job posting creation UI | P0 | P4-009 |
| P4-026 | Build learner job board — search, filter, skill match, apply | P0 | P4-010 |
| P4-027 | Build job detail page | P0 | P4-010 |
| P4-028 | Build organization analytics dashboard | P1 | P4-018 |
| P4-029 | Enhance public profile — "Open to opportunities" toggle | P1 | — |
| P4-030 | Build candidate comparison view (side-by-side) | P2 | P4-024 |

### 4.6 Data Engineering

| # | Task | Priority | Depends On |
|---|---|---|---|
| P4-031 | Build skill-to-job-requirement mapping table | P0 | P4-015 |
| P4-032 | Build hiring funnel analytics | P1 | P4-018 |

---

## Phase 5 — Labs & Simulation Infrastructure

**Goal:** Build real container infrastructure and incident simulation engine.

### 5.1 Lab Infrastructure (DevOps)

| # | Task | Priority | Depends On |
|---|---|---|---|
| P5-001 | Provision managed K8s cluster (GKE/EKS/AKS) with autoscaling | P0 | — |
| P5-002 | Build Tier 1 sandbox container images (Ubuntu + common tools) | P0 | P5-001 |
| P5-003 | Deploy Traefik ingress controller — WebSocket support, TLS | P0 | P5-001 |
| P5-004 | Build terminal proxy service — WebSocket bridge xterm.js ↔ container exec | P0 | P5-001 |
| P5-005 | Build sandbox pool manager — pre-warm, allocate, destroy, replenish | P0 | P5-002 |
| P5-006 | Implement network policies — restrict egress, block inter-sandbox | P0 | P5-001 |
| P5-007 | Implement sandbox escape prevention — gVisor, seccomp profiles | P0 | P5-001 |
| P5-008 | Build CI/CD pipeline for sandbox images | P1 | P5-002 |
| P5-009 | Set up Prometheus + Grafana for lab monitoring | P1 | P5-001 |
| P5-010 | Build Tier 2 K3s sandbox images | P1 | P5-001 |
| P5-011 | Build lab session cleanup cron — expire/destroy stale sessions | P1 | P5-005 |
| P5-012 | Implement crypto mining detection — CPU anomaly, auto-kill | P0 | P5-001 |

### 5.2 Incident Simulation Engine

| # | Task | Priority | Depends On |
|---|---|---|---|
| P5-013 | Build simulation definition schema and CRUD API | P0 | P5-001 |
| P5-014 | Build simulation lifecycle API — start, inject fault, validate fix, score | P0 | P5-013 |
| P5-015 | Build fault injection system — scripts for controlled failures | P0 | P5-001 |
| P5-016 | Build simulation validation engine — verify fix resolved issue | P0 | P5-014 |
| P5-017 | Build RCA evaluation engine (rule-based) | P0 | — |
| P5-018 | Build simulation scoring calculator — composite score | P0 | P5-017 |
| P5-019 | Build command relevance classifier (regex-based) | P0 | — |
| P5-020 | Create initial 20 simulation definitions | P0 | P5-015 |
| P5-021 | Build simulation parameter randomization | P1 | P5-013 |
| P5-022 | Integrate simulation scores into skill scoring engine | P1 | P5-018 |
| P5-023 | Build simulation leaderboard | P1 | P5-018 |

### 5.3 Simulation Frontend

| # | Task | Priority | Depends On |
|---|---|---|---|
| P5-024 | Build simulation catalog page | P0 | P5-013 |
| P5-025 | Build simulation briefing screen | P0 | P5-024 |
| P5-026 | Build simulation lab interface — terminal + timer + hint sidebar | P0 | P5-014 |
| P5-027 | Build RCA submission form | P0 | P5-026 |
| P5-028 | Build simulation results/scoring screen | P0 | P5-018 |
| P5-029 | Build simulation history/analytics | P1 | P5-028 |
| P5-030 | Build war-room mode UI (high-pressure visual treatment) | P2 | P5-026 |

---

## Phase 6 — Analytics & Export

**Goal:** Deep analytics, advanced reporting, data management.

### 6.1 Analytics

| # | Task | Priority | Depends On |
|---|---|---|---|
| P6-001 | Build platform-wide analytics dashboard data — MAU, DAU, retention | P1 | Phase 3 |
| P6-002 | Build skill score trend analysis — score changes over time | P1 | — |
| P6-003 | Build placement correlation analysis (if hiring data available) | P2 | Phase 4 |
| P6-004 | Implement event archival strategy — 12+ month events to cold storage | P2 | — |

### 6.2 Export & Reporting

| # | Task | Priority | Depends On |
|---|---|---|---|
| P6-005 | Build trainer batch report PDF with institute branding | P0 | Phase 3 |
| P6-006 | Build learner career profile PDF export | P1 | — |
| P6-007 | Build GDPR data export (all personal data + progress) | P1 | — |
| P6-008 | Build account deletion with cascade | P1 | P6-007 |

### 6.3 Data Pipeline

| # | Task | Priority | Depends On |
|---|---|---|---|
| P6-009 | Optimize materialized view refresh — incremental, low-traffic windows | P1 | — |
| P6-010 | Set up database read replica for analytics queries | P1 | — |
| P6-011 | Implement connection pooling (PgBouncer or Supabase pooling) | P1 | — |

---

## Phase 7 — Stabilization & QA

**Goal:** Performance, security, accessibility, mobile, polish.

### 7.1 Performance

| # | Task | Priority | Depends On |
|---|---|---|---|
| P7-001 | Frontend performance — lazy loading, code splitting, image optimization | P0 | — |
| P7-002 | API performance — query optimization, N+1 elimination | P0 | — |
| P7-003 | Load testing — simulate concurrent lab sessions | P1 | Phase 5 |
| P7-004 | Database query optimization pass (slow query log) | P1 | — |

### 7.2 Security

| # | Task | Priority | Depends On |
|---|---|---|---|
| P7-005 | Penetration testing — sandbox isolation, RBAC, API security | P0 | Phase 5 |
| P7-006 | Implement rate limiting v2 — per-role limits, lab session quotas | P0 | P1-004 |
| P7-007 | Resource abuse prevention — session limits, command rate limiting | P1 | Phase 5 |

### 7.3 Accessibility & UX

| # | Task | Priority | Depends On |
|---|---|---|---|
| P7-008 | Accessibility audit — WCAG 2.1 AA, screen reader, keyboard nav | P0 | — |
| P7-009 | Mobile-responsive design pass — all views optimized for mobile | P0 | — |
| P7-010 | Dark mode polish across all components | P1 | — |
| P7-011 | Settings page enhancements — notification prefs, data export | P1 | — |

### 7.4 Enterprise & Scale

| # | Task | Priority | Depends On |
|---|---|---|---|
| P7-012 | Enterprise SSO (SAML/OIDC) via Clerk | P2 | — |
| P7-013 | Multi-region lab cluster deployment | P2 | Phase 5 |
| P7-014 | Build public API for enterprise — API key management, rate limiting | P2 | — |
| P7-015 | Webhook system for institute/org events | P2 | — |

### 7.5 Admin

| # | Task | Priority | Depends On |
|---|---|---|---|
| P7-016 | Polish admin dashboard — platform analytics, system health | P1 | — |
| P7-017 | Build admin content management CRUD | P1 | — |
| P7-018 | Build admin simulation management | P1 | Phase 5 |

---

## Task Count Summary

| Phase | Tasks | Focus |
|---|---|---|
| Phase 1 | 13 | Infrastructure: Redis, queues, security baseline |
| Phase 2 | 18 | Learner polish: dashboard, labs, quizzes, profile |
| Phase 3 | 25 | Trainer: batches, monitoring, reports |
| Phase 4 | 32 | Organization: hiring, jobs, search |
| Phase 5 | 30 | Labs infra: K8s, simulations |
| Phase 6 | 11 | Analytics, export, data pipeline |
| Phase 7 | 18 | Stabilization, security, performance |
| **Total** | **147** | |

---

## Execution Rules

1. **No phase skipping.** Phase 1 must complete before Phase 2 begins.
2. **No scope expansion.** New features require explicit approval and get added to the NEXT phase, never the current one.
3. **Each task must produce working, tested code.** No placeholders, no mock data, no TODO comments.
4. **Build verification required.** Every task must pass `pnpm build` before marking complete.
5. **One task at a time.** Complete current task fully before starting next.

---

**Document Status:** Locked. This is the execution plan. No redesign.
