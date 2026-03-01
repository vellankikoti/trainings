# DEVOPS ENGINEERS — Product Requirements Document (Part 1)

## Vision, Mission, Curriculum & Learning Philosophy

**Document Version:** 1.0
**Date:** March 2026
**Author:** Platform Architecture Team
**Status:** Draft
**Repository:** devops-engineers

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Vision](#2-vision)
3. [Mission](#3-mission)
4. [The Problem We Are Solving](#4-the-problem-we-are-solving)
5. [Target Audience](#5-target-audience)
6. [Learning Philosophy](#6-learning-philosophy)
7. [Curriculum Structure](#7-curriculum-structure)
8. [Technology Coverage](#8-technology-coverage)
9. [Content Architecture](#9-content-architecture)
10. [Learning Experience Design](#10-learning-experience-design)

---

## 1. Executive Summary

**DEVOPS ENGINEERS** is an open-source learning platform designed to take 1 million people with zero technical background and transform them into world-class DevOps, Cloud, and Site Reliability Engineers.

This is not another tutorial website. This is the **DevOps Engineering Bible** — a comprehensive, story-driven, hands-on learning system that produces engineers capable of operating production infrastructure at any scale.

The platform combines the depth of Linux Foundation training, the interactivity of KodeKloud, the accessibility of FreeCodeCamp, the polish of A Cloud Guru, and the hands-on approach of Educative — while remaining **open-source friendly and affordable to operate**.

### Key Metrics at Scale

| Metric | Target |
|--------|--------|
| Learners trained | 1,000,000 |
| Technologies covered | 20+ |
| Mini projects | 500–1,000 |
| Tool-level projects | 30–50 |
| Large real-world projects | 5–10 |
| Hands-on exercises | 3,000+ |
| Debugging scenarios | 500+ |
| Interactive quizzes | 2,000+ |
| Learning paths | 6 |
| Estimated total learning hours | 1,500–2,000 |

---

## 2. Vision

**To become the world's most comprehensive, accessible, and practical DevOps engineering education platform — the single resource that can take anyone from zero technical knowledge to production-ready DevOps engineer.**

We envision a world where:

- Financial background does not determine who becomes an engineer
- Every learner has access to a mentor-quality learning experience
- Theory and practice are never separated
- Learning feels like a conversation with an experienced architect, not a textbook
- Graduates walk into production environments with genuine confidence

The platform will be the answer to the question every aspiring DevOps engineer asks:

> "Where do I start, and how do I actually become good enough to work in production?"

---

## 3. Mission

**Train 1 million people with zero technical background and transform them into world-class DevOps, Cloud, and SRE engineers through story-driven learning, hands-on labs, and real-world production experience.**

### Mission Pillars

**Pillar 1: Accessibility**
Open-source content. Free tiers wherever possible. No paywall between a learner and foundational knowledge. Premium features (certificates, advanced labs) fund the platform sustainably.

**Pillar 2: Depth Over Breadth**
We do not skim surfaces. Every technology is taught from history and architecture through to production debugging. A learner who completes a module does not just know commands — they understand *why* systems behave the way they do.

**Pillar 3: Production Readiness**
Every module ends with the learner solving problems that mirror real production incidents. We do not produce engineers who can only follow tutorials — we produce engineers who can troubleshoot at 3 AM when everything is broken.

**Pillar 4: Community**
Learning alone is hard. The platform fosters a global community where learners help each other, share projects, and grow together.

---

## 4. The Problem We Are Solving

### 4.1 The Talent Gap

The DevOps and cloud engineering market faces a massive talent shortage:

- Organizations worldwide are migrating to cloud-native architectures
- The demand for DevOps engineers has grown over 300% in the past 5 years
- Average salaries range from $90,000 to $180,000+ USD
- Most bootcamps and courses teach isolated tools without connecting them
- University programs lag years behind industry practices

### 4.2 The Learning Gap

Current learning resources suffer from critical problems:

| Problem | Impact |
|---------|--------|
| **Fragmented content** | Learners stitch together 20 different tutorials from 20 different sources, each with different assumptions about prior knowledge |
| **Theory without practice** | Courses explain what Kubernetes is but never have learners debug a CrashLoopBackOff in a realistic scenario |
| **No progressive structure** | A learner finishes a Docker tutorial but has no idea what to learn next or how Docker connects to Kubernetes, CI/CD, and monitoring |
| **Boring delivery** | Textbook-style writing causes learner drop-off within the first week |
| **Cost barriers** | Quality platforms charge $30–$50/month, putting them out of reach for learners in developing countries |
| **No production exposure** | Learners deploy hello-world apps but never experience the complexity of real systems |

### 4.3 What We Do Differently

DEVOPS ENGINEERS solves every problem above:

1. **Single source of truth** — One platform, one learning path, zero fragmentation
2. **Every concept has a lab** — You do not just read about Terraform, you provision actual infrastructure
3. **Progressive curriculum** — Each technology builds on the previous one with clear connections
4. **Story-driven delivery** — Every lesson reads like a conversation with a senior architect
5. **Open-source core** — The entire content library and LMS are open-source
6. **Production debugging built in** — Every module includes "things that break in production" scenarios

---

## 5. Target Audience

### 5.1 Primary Personas

#### Persona 1: The Career Switcher — "Priya"

| Attribute | Detail |
|-----------|--------|
| **Background** | 28 years old, working in a non-technical field (accounting, marketing, retail) |
| **Technical knowledge** | Can use a computer for daily tasks, no programming experience |
| **Motivation** | Wants a higher-paying, more fulfilling career in tech |
| **Challenge** | Overwhelmed by the number of tools and doesn't know where to start |
| **Time available** | 2–3 hours per day, evenings and weekends |
| **Goal** | Land a junior DevOps role within 12–18 months |
| **What she needs** | A clear path from zero, no assumed knowledge, encouraging tone |

#### Persona 2: The Developer Moving to DevOps — "Marcus"

| Attribute | Detail |
|-----------|--------|
| **Background** | 32 years old, 5 years as a backend developer |
| **Technical knowledge** | Strong in Python/Java, basic Linux, some Git experience |
| **Motivation** | Wants to move into DevOps/SRE for career growth and higher salary |
| **Challenge** | Knows how to code but doesn't understand infrastructure, CI/CD, or monitoring deeply |
| **Time available** | 1–2 hours per day |
| **Goal** | Transition to a DevOps engineer role within 6–9 months |
| **What he needs** | Skip fundamentals, go deep on Docker, Kubernetes, Terraform, CI/CD |

#### Persona 3: The Junior Sysadmin — "Ahmed"

| Attribute | Detail |
|-----------|--------|
| **Background** | 25 years old, 2 years as a Linux system administrator |
| **Technical knowledge** | Strong Linux skills, basic shell scripting, manual deployments |
| **Motivation** | Wants to automate everything and move from sysadmin to SRE |
| **Challenge** | Understands servers but not containers, orchestration, or infrastructure as code |
| **Time available** | 1–2 hours per day |
| **Goal** | Become an SRE within 6–12 months |
| **What he needs** | Deep dives into automation, Kubernetes, monitoring, and reliability engineering |

#### Persona 4: The Student — "Sofia"

| Attribute | Detail |
|-----------|--------|
| **Background** | 21 years old, computer science student |
| **Technical knowledge** | Basic programming, some Linux from coursework |
| **Motivation** | Wants to build practical skills that university doesn't teach |
| **Challenge** | University teaches theory but no real-world DevOps practices |
| **Time available** | 3–5 hours per day during breaks, 1 hour during semester |
| **Goal** | Graduate with DevOps skills and land a job immediately |
| **What she needs** | Portfolio-worthy projects and real-world exposure |

### 5.2 Secondary Audiences

- **Engineering managers** evaluating training resources for their teams
- **Bootcamp instructors** looking for curriculum material
- **Technical writers** contributing to the open-source content
- **Companies** wanting to upskill their operations teams

### 5.3 Geographic Considerations

The platform must work well for learners globally:

- Content written in clear, simple English (accessible to non-native speakers)
- Labs that work on low-bandwidth connections
- Local Docker-based labs as primary (no mandatory cloud accounts for core learning)
- Time-zone-friendly community features
- Cost-conscious design (free tier must be genuinely useful)

---

## 6. Learning Philosophy

### 6.1 Core Principles

#### Principle 1: Story First, Commands Second

Every technical concept begins with a story. Before a learner types a single command, they understand *why* this technology exists, what problem it solved, and how engineers thought about this problem before the tool existed.

**Example approach:**

> *"It's 2010. You're an engineer at a fast-growing startup. Your team has built a brilliant application, and it works perfectly on every developer's laptop. Then comes deployment day. The application crashes in production. After 14 hours of debugging, you discover the issue: the production server has a different version of a library than the developer's laptop. This exact nightmare is what led to the creation of Docker."*

This story is more memorable than any definition. When the learner later encounters a Docker version conflict in production, they will remember this story — and understand the problem at a fundamental level.

#### Principle 2: Learn by Doing, Not by Reading

For every concept introduced, there must be a corresponding hands-on exercise within the same page. The ratio target is:

| Content Type | Target Ratio |
|--------------|-------------|
| Explanation | 30% |
| Hands-on commands and exercises | 50% |
| Troubleshooting and debugging | 20% |

No page should be purely theoretical. If a concept cannot be practiced immediately, it should be combined with the next concept that can.

#### Principle 3: Progressive Complexity

Learning follows a carefully designed staircase:

```
Level 5: Production Expert     → Debug and optimize at scale
Level 4: Builder               → Build complete systems from scratch
Level 3: Practitioner          → Use tools confidently in daily work
Level 2: Explorer              → Understand concepts and run basic commands
Level 1: Observer              → Understand why this technology exists
```

Every technology module takes the learner through all 5 levels. No level is skipped. The transition between levels is gradual — learners never feel a sudden jump in difficulty.

#### Principle 4: Connect Everything

Technologies are not taught in isolation. Every module explicitly connects to other technologies in the curriculum:

```
Linux ──→ Shell Scripting ──→ Python Automation
  │              │                    │
  ▼              ▼                    ▼
Docker ──→ Kubernetes ──→ Helm/Kustomize
  │              │                    │
  ▼              ▼                    ▼
CI/CD ──→ GitOps (ArgoCD) ──→ Infrastructure as Code
  │              │                    │
  ▼              ▼                    ▼
Monitoring ──→ Observability ──→ SRE Practices
```

At the end of each module, a "Connections" section explicitly maps how the current technology relates to others in the ecosystem.

#### Principle 5: Fail Safely

Learners must encounter failures in a safe environment. Every module includes:

- **Intentional failure exercises** — "Run this command and observe what breaks"
- **Production debugging scenarios** — "Here's a broken system. Find and fix the problem"
- **Common mistakes gallery** — "Here are the 10 most common mistakes engineers make with this tool"

The goal: when something breaks in a real production environment, the learner has already seen a similar failure during training.

#### Principle 6: The Mentor Voice

All content is written in first person, as if an experienced DevOps architect is speaking directly to the learner.

**Do this:**
> "Alright, now that you understand how containers work under the hood, let me show you something that trips up almost every engineer the first time they encounter it..."

**Never this:**
> "The following section describes container networking concepts that the reader should familiarize themselves with."

The writing tone is:

| Attribute | Description |
|-----------|-------------|
| **Friendly** | Like talking to a colleague, not a professor |
| **Encouraging** | Celebrate progress, normalize confusion |
| **Honest** | Acknowledge when something is genuinely complex |
| **Practical** | Always tie theory to real-world use cases |
| **Opinionated** | Share best practices clearly, explain trade-offs |

### 6.2 The Learning Loop

Every single concept in the platform follows this loop:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   1. STORY                                      │
│   "Here's why this matters..."                  │
│                                                 │
│   2. CONCEPT                                    │
│   "Here's how it works..."                      │
│                                                 │
│   3. ARCHITECTURE                               │
│   "Here's what happens under the hood..."       │
│                                                 │
│   4. HANDS-ON                                   │
│   "Now try it yourself..."                      │
│                                                 │
│   5. BREAK IT                                   │
│   "Now let's see what happens when it fails..." │
│                                                 │
│   6. FIX IT                                     │
│   "Here's how engineers debug this..."          │
│                                                 │
│   7. BUILD WITH IT                              │
│   "Now build something real..."                 │
│                                                 │
│   8. CONNECT IT                                 │
│   "Here's how this connects to what's next..."  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 6.3 Anti-Patterns (What We Explicitly Avoid)

| Anti-Pattern | Why It Fails | Our Alternative |
|-------------|-------------|-----------------|
| Wall of text with no commands | Learners lose focus after 2 minutes of reading | Interleave explanation with exercises every 3–5 paragraphs |
| "Just follow these steps" without explanation | Produces copy-paste engineers who can't troubleshoot | Explain the *why* before the *how* |
| Assuming prior knowledge without stating it | Learners feel stupid and drop off | Every prerequisite is explicitly listed and linked |
| Starting with installation without motivation | Learners don't know why they're installing something | Start with the problem the tool solves |
| Teaching the happy path only | Real systems break constantly | Dedicate 20% of every module to failure scenarios |
| Isolated tool tutorials | Real engineering combines multiple tools | Every module has cross-technology projects |
| Outdated content | Tools evolve rapidly | Content versioning system with regular review cycles |

---

## 7. Curriculum Structure

### 7.1 Overview

The curriculum is organized into **6 Learning Paths** that take learners from absolute zero to production-ready engineers. Each path contains multiple **Modules**, and each module contains multiple **Lessons**.

```
Platform
  └── Learning Path (6 total)
        └── Module (40+ total)
              └── Lesson (500+ total)
                    └── Section
                          ├── Story
                          ├── Concept
                          ├── Architecture
                          ├── Hands-on Exercise
                          ├── Troubleshooting Scenario
                          ├── Quiz
                          └── Mini Project
```

### 7.2 Learning Paths

#### Path 1: Foundations (Estimated: 200–300 hours)

**Goal:** Build the foundational skills every engineer needs.

| Module | Technology | Lessons | Mini Projects | Duration |
|--------|-----------|---------|--------------|----------|
| 1.1 | Linux Fundamentals | 30–40 | 30–40 | 50–60 hrs |
| 1.2 | Linux Administration | 25–35 | 25–35 | 40–50 hrs |
| 1.3 | Shell Scripting | 25–35 | 30–40 | 40–50 hrs |
| 1.4 | Networking Fundamentals | 20–25 | 15–20 | 30–40 hrs |
| 1.5 | Git & Version Control | 25–30 | 20–25 | 30–40 hrs |
| 1.6 | Python for Automation | 25–35 | 30–40 | 40–50 hrs |

**Capstone Project:** Build a complete server monitoring and alerting system using Bash scripts and Python that monitors system health, parses logs, sends alerts, and stores historical data — deployed on a Linux server with proper user permissions, cron jobs, and version-controlled with Git.

---

#### Path 2: Containerization & Orchestration (Estimated: 250–350 hours)

**Goal:** Master containers and container orchestration — the backbone of modern infrastructure.

| Module | Technology | Lessons | Mini Projects | Duration |
|--------|-----------|---------|--------------|----------|
| 2.1 | Docker Fundamentals | 30–40 | 30–40 | 50–60 hrs |
| 2.2 | Docker Advanced (Networking, Volumes, Multi-stage) | 25–30 | 20–25 | 40–50 hrs |
| 2.3 | Docker Compose & Multi-container Apps | 15–20 | 15–20 | 25–30 hrs |
| 2.4 | Kubernetes Fundamentals | 35–45 | 30–40 | 60–70 hrs |
| 2.5 | Kubernetes Advanced (Networking, Storage, Security) | 30–35 | 25–30 | 50–60 hrs |
| 2.6 | Helm Charts | 15–20 | 10–15 | 25–30 hrs |
| 2.7 | Kustomize | 10–15 | 8–12 | 15–20 hrs |

**Capstone Project:** Containerize a multi-service application (frontend, backend API, database, cache, message queue), deploy it to Kubernetes with Helm charts, configure ingress, TLS, horizontal pod autoscaling, resource limits, network policies, and persistent storage. Simulate a production traffic surge and observe autoscaling behavior.

---

#### Path 3: CI/CD & GitOps (Estimated: 200–250 hours)

**Goal:** Automate everything from code commit to production deployment.

| Module | Technology | Lessons | Mini Projects | Duration |
|--------|-----------|---------|--------------|----------|
| 3.1 | CI/CD Fundamentals & Principles | 10–15 | 8–10 | 15–20 hrs |
| 3.2 | GitHub Actions | 25–30 | 20–25 | 40–50 hrs |
| 3.3 | Jenkins | 25–30 | 20–25 | 40–50 hrs |
| 3.4 | ArgoCD & GitOps | 20–25 | 15–20 | 35–40 hrs |
| 3.5 | Flux | 15–20 | 10–15 | 25–30 hrs |
| 3.6 | Advanced Pipeline Patterns | 15–20 | 10–15 | 25–30 hrs |

**Capstone Project:** Build a complete CI/CD platform that takes code from commit to production. GitHub Actions runs tests, builds container images, pushes to a registry. ArgoCD watches a GitOps repository and automatically deploys to a Kubernetes cluster. Include rollback strategies, canary deployments, and automated security scanning.

---

#### Path 4: Infrastructure as Code & Cloud (Estimated: 250–300 hours)

**Goal:** Define, provision, and manage infrastructure programmatically at scale.

| Module | Technology | Lessons | Mini Projects | Duration |
|--------|-----------|---------|--------------|----------|
| 4.1 | Cloud Computing Fundamentals | 15–20 | 10–12 | 20–25 hrs |
| 4.2 | AWS Core Services (EC2, VPC, S3, IAM, RDS) | 35–45 | 30–40 | 60–70 hrs |
| 4.3 | AWS Advanced (EKS, Lambda, CloudFront, Route53) | 25–30 | 20–25 | 40–50 hrs |
| 4.4 | Terraform Fundamentals | 25–30 | 20–25 | 40–50 hrs |
| 4.5 | Terraform Advanced (Modules, State, Workspaces) | 20–25 | 15–20 | 35–40 hrs |
| 4.6 | Ansible | 25–30 | 20–25 | 40–50 hrs |

**Capstone Project:** Design and provision a complete AWS production environment using Terraform — VPC with public/private subnets, EKS cluster, RDS database, S3 buckets, CloudFront distribution, Route53 DNS, IAM roles and policies. Configure the servers with Ansible. Implement Terraform remote state, workspace-based environments (dev/staging/prod), and drift detection.

---

#### Path 5: Observability & Reliability (Estimated: 200–250 hours)

**Goal:** Build observable systems and practice the principles of Site Reliability Engineering.

| Module | Technology | Lessons | Mini Projects | Duration |
|--------|-----------|---------|--------------|----------|
| 5.1 | Observability Fundamentals | 10–15 | 8–10 | 15–20 hrs |
| 5.2 | Prometheus | 25–30 | 20–25 | 40–50 hrs |
| 5.3 | Grafana | 20–25 | 15–20 | 30–40 hrs |
| 5.4 | OpenTelemetry | 20–25 | 15–20 | 30–40 hrs |
| 5.5 | Logging (ELK / Loki) | 20–25 | 15–20 | 30–40 hrs |
| 5.6 | Alerting & Incident Management | 15–20 | 10–15 | 20–25 hrs |
| 5.7 | SRE Principles & Practices | 20–25 | 15–20 | 30–40 hrs |

**Capstone Project:** Build a complete observability stack for a microservices application. Deploy Prometheus for metrics, Grafana for dashboards, OpenTelemetry for distributed tracing, and Loki for log aggregation. Create SLOs, error budgets, alerting rules, and runbooks. Simulate production incidents (high latency, memory leaks, cascading failures) and practice incident response.

---

#### Path 6: Platform Engineering & Advanced Topics (Estimated: 150–200 hours)

**Goal:** Think at the platform level — design systems that serve entire engineering organizations.

| Module | Technology | Lessons | Mini Projects | Duration |
|--------|-----------|---------|--------------|----------|
| 6.1 | Platform Engineering Principles | 10–15 | 5–8 | 15–20 hrs |
| 6.2 | Internal Developer Platforms | 15–20 | 10–15 | 25–30 hrs |
| 6.3 | Distributed Systems Fundamentals | 20–25 | 10–15 | 30–40 hrs |
| 6.4 | Security & Compliance (DevSecOps) | 20–25 | 15–20 | 30–40 hrs |
| 6.5 | Cost Optimization & FinOps | 10–15 | 8–10 | 15–20 hrs |
| 6.6 | Career Development & Interview Preparation | 15–20 | 10–15 | 25–30 hrs |

**Capstone Project:** Design and build an Internal Developer Platform. Create a self-service portal where development teams can provision environments, deploy applications, and monitor their services without DevOps intervention. Include golden paths, service templates, automated security scanning, and cost dashboards.

---

### 7.3 Cross-Path Mega Projects

After completing individual paths, learners take on projects that span the entire stack:

| Project | Paths Combined | Description | Duration |
|---------|---------------|-------------|----------|
| **Production Kubernetes Platform** | 1, 2, 3, 4, 5 | Build a complete production Kubernetes platform from bare infrastructure to fully monitored, auto-scaling, GitOps-driven deployments | 40–60 hrs |
| **Startup Infrastructure** | 1, 2, 3, 4, 5, 6 | Design and build the entire infrastructure for a startup — from domain registration to production-ready, cost-optimized, observable platform | 60–80 hrs |
| **Enterprise Migration** | 2, 3, 4, 5 | Take a monolithic application and migrate it to microservices on Kubernetes with full CI/CD, monitoring, and infrastructure as code | 40–60 hrs |
| **Incident Response Simulation** | 1, 2, 5 | A series of increasingly complex production incidents to diagnose and resolve under time pressure — the final exam | 20–30 hrs |
| **Open Source Contribution** | 1, 2, 3 | Fork a real open-source project, understand its architecture, fix bugs, add features, and submit pull requests | 20–30 hrs |

### 7.4 Curriculum Summary

| Metric | Count |
|--------|-------|
| Learning Paths | 6 |
| Modules | 40+ |
| Lessons | 500+ |
| Mini Projects | 500–1,000 |
| Tool-level Capstone Projects | 6 |
| Cross-path Mega Projects | 5 |
| Total Estimated Hours | 1,250–1,650 |

---

## 8. Technology Coverage

### 8.1 Technology Matrix

Each technology is taught at a consistent depth. The table below shows the coverage plan:

| # | Technology | Path | Depth | Lessons | Projects | Priority |
|---|-----------|------|-------|---------|----------|----------|
| 1 | Linux | Foundations | Beginner → Advanced | 55–75 | 55–75 | P0 |
| 2 | Shell Scripting | Foundations | Beginner → Advanced | 25–35 | 30–40 | P0 |
| 3 | Git | Foundations | Beginner → Advanced | 25–30 | 20–25 | P0 |
| 4 | Python Automation | Foundations | Beginner → Intermediate | 25–35 | 30–40 | P0 |
| 5 | Networking | Foundations | Beginner → Intermediate | 20–25 | 15–20 | P0 |
| 6 | Docker | Containerization | Beginner → Advanced | 70–90 | 65–85 | P0 |
| 7 | Kubernetes | Containerization | Beginner → Expert | 65–80 | 55–70 | P0 |
| 8 | Helm | Containerization | Beginner → Advanced | 15–20 | 10–15 | P1 |
| 9 | Kustomize | Containerization | Beginner → Intermediate | 10–15 | 8–12 | P1 |
| 10 | GitHub Actions | CI/CD | Beginner → Advanced | 25–30 | 20–25 | P0 |
| 11 | Jenkins | CI/CD | Beginner → Advanced | 25–30 | 20–25 | P1 |
| 12 | ArgoCD | CI/CD | Beginner → Advanced | 20–25 | 15–20 | P0 |
| 13 | Flux | CI/CD | Beginner → Intermediate | 15–20 | 10–15 | P2 |
| 14 | Terraform | IaC & Cloud | Beginner → Advanced | 45–55 | 35–45 | P0 |
| 15 | AWS | IaC & Cloud | Beginner → Advanced | 60–75 | 50–65 | P0 |
| 16 | Ansible | IaC & Cloud | Beginner → Advanced | 25–30 | 20–25 | P1 |
| 17 | Prometheus | Observability | Beginner → Advanced | 25–30 | 20–25 | P0 |
| 18 | Grafana | Observability | Beginner → Advanced | 20–25 | 15–20 | P0 |
| 19 | OpenTelemetry | Observability | Beginner → Advanced | 20–25 | 15–20 | P1 |
| 20 | SRE Practices | Reliability | Beginner → Advanced | 20–25 | 15–20 | P0 |
| 21 | Distributed Systems | Advanced | Intermediate → Advanced | 20–25 | 10–15 | P1 |
| 22 | Platform Engineering | Advanced | Intermediate → Advanced | 25–35 | 15–23 | P2 |

**Priority Legend:**
- **P0** — Must have for launch. These are foundational technologies.
- **P1** — Important. Build within 3 months of launch.
- **P2** — Nice to have. Build within 6 months of launch.

### 8.2 Per-Technology Learning Structure

Every technology follows this consistent structure:

```
Technology Module
│
├── Chapter 1: The Origin Story
│   ├── The magical history of this technology
│   ├── The problem that existed before it
│   ├── Key people and decisions that shaped it
│   └── Timeline of evolution
│
├── Chapter 2: Architecture Deep Dive
│   ├── How the system works internally
│   ├── Component architecture diagrams
│   ├── Data flow explanations
│   └── Design decisions and trade-offs
│
├── Chapter 3: Installation & Setup
│   ├── Mac installation
│   ├── Windows installation
│   ├── Linux installation
│   │   ├── apt (Debian/Ubuntu)
│   │   ├── yum (CentOS/RHEL 7)
│   │   └── dnf (Fedora/RHEL 8+)
│   ├── Verification steps
│   └── Initial configuration
│
├── Chapter 4–N: Core Concepts (modular)
│   ├── Concept explanation with story
│   ├── Architecture of this concept
│   ├── Hands-on exercises
│   ├── Common mistakes
│   ├── Troubleshooting guide
│   └── Mini project
│
├── Chapter N+1: Production Patterns
│   ├── How this technology is used in production
│   ├── Scaling considerations
│   ├── Security hardening
│   └── Performance tuning
│
├── Chapter N+2: Troubleshooting Masterclass
│   ├── The 10 most common production issues
│   ├── Debugging methodology
│   ├── Log analysis
│   └── Production debugging scenarios
│
└── Chapter N+3: Capstone Project
    ├── Project specification
    ├── Architecture design
    ├── Step-by-step implementation
    ├── Testing and validation
    └── Production readiness checklist
```

### 8.3 Technology Dependency Map

Technologies are taught in an order that respects dependencies:

```
                    ┌──────────────┐
                    │    Linux     │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
      ┌──────────┐  ┌───────────┐  ┌────────┐
      │  Shell    │  │    Git    │  │Networking│
      │Scripting  │  │           │  │         │
      └─────┬────┘  └─────┬─────┘  └────┬────┘
            │              │              │
            ▼              │              │
      ┌──────────┐         │              │
      │  Python   │         │              │
      │Automation │         │              │
      └─────┬────┘         │              │
            │              │              │
            └──────┬───────┘              │
                   ▼                      │
            ┌──────────┐                  │
            │  Docker   │◄────────────────┘
            └─────┬────┘
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
 ┌───────────┐ ┌──────┐ ┌────────────┐
 │Kubernetes │ │CI/CD │ │Docker      │
 │           │ │      │ │Compose     │
 └─────┬─────┘ └──┬───┘ └────────────┘
       │          │
  ┌────┼────┐     │
  ▼    ▼    ▼     ▼
┌────┐┌────┐┌─────────┐  ┌──────────┐
│Helm││Kust││GitHub   │  │  AWS     │
│    ││omiz││Actions  │  │          │
└──┬─┘└──┬─┘│Jenkins  │  └────┬─────┘
   │     │  └────┬────┘       │
   │     │       │            │
   └──┬──┘       │            │
      ▼          ▼            ▼
┌──────────┐ ┌────────┐ ┌──────────┐
│  ArgoCD  │ │  Flux  │ │Terraform │
│  GitOps  │ │        │ │          │
└─────┬────┘ └────────┘ └────┬─────┘
      │                      │
      │                      ▼
      │               ┌──────────┐
      │               │ Ansible  │
      │               └─────┬────┘
      │                     │
      └─────────┬───────────┘
                ▼
      ┌──────────────────┐
      │   Observability  │
      │ Prometheus       │
      │ Grafana          │
      │ OpenTelemetry    │
      └────────┬─────────┘
               │
               ▼
      ┌──────────────────┐
      │       SRE        │
      │ Platform Eng.    │
      │ Distributed Sys. │
      └──────────────────┘
```

---

## 9. Content Architecture

### 9.1 Content Format

All learning content is written in **MDX** (Markdown with JSX components) to enable:

- Standard Markdown readability (works on GitHub, dev.to, Medium)
- Interactive components (tabs, quizzes, code runners)
- Consistent styling through reusable components
- Easy conversion to blog posts and video scripts

### 9.2 Page Structure

Every lesson page follows this structure:

```mdx
---
title: "Lesson Title"
description: "One-sentence description"
module: "Module Name"
path: "Learning Path"
order: 5
duration: "30 minutes"
difficulty: "beginner | intermediate | advanced"
prerequisites:
  - "lesson-slug-1"
  - "lesson-slug-2"
tags:
  - "docker"
  - "containers"
  - "networking"
objectives:
  - "Understand how Docker networking works"
  - "Create custom bridge networks"
  - "Connect containers across networks"
---

# Lesson Title

## The Story
[A compelling narrative that introduces the problem this lesson solves]

## What You Will Learn
[Bullet list of learning objectives]

## Prerequisites
[What the learner should know before starting]

## The Concept
[Clear, story-driven explanation of the concept]

## Architecture
[How this concept works under the hood, with diagrams]

## Hands-On Lab
[Step-by-step exercises with commands to run]

### Exercise 1: [Exercise Title]
[Detailed instructions with expected output]

### Exercise 2: [Exercise Title]
[Building on Exercise 1]

## What Can Go Wrong
[Common failure scenarios and how to debug them]

### Troubleshooting Scenario 1
[A realistic production debugging exercise]

## Mini Project
[A small project that applies the concepts learned]

## Quiz
[3-5 questions to test understanding]

## Key Takeaways
[Bullet list of the most important points]

## What's Next
[Preview of the next lesson and how it connects]
```

### 9.3 Content File Organization

```
content/
├── paths/
│   ├── foundations/
│   │   ├── path.json                    # Path metadata
│   │   ├── linux/
│   │   │   ├── module.json              # Module metadata
│   │   │   ├── 01-the-linux-story/
│   │   │   │   ├── index.mdx            # Lesson content
│   │   │   │   ├── assets/              # Images, diagrams
│   │   │   │   └── exercises/           # Lab files
│   │   │   ├── 02-linux-architecture/
│   │   │   │   ├── index.mdx
│   │   │   │   └── ...
│   │   │   └── ...
│   │   ├── shell-scripting/
│   │   ├── git/
│   │   ├── networking/
│   │   └── python-automation/
│   │
│   ├── containerization/
│   │   ├── docker/
│   │   ├── kubernetes/
│   │   ├── helm/
│   │   └── kustomize/
│   │
│   ├── cicd-gitops/
│   │   ├── cicd-fundamentals/
│   │   ├── github-actions/
│   │   ├── jenkins/
│   │   ├── argocd/
│   │   └── flux/
│   │
│   ├── iac-cloud/
│   │   ├── cloud-fundamentals/
│   │   ├── aws/
│   │   ├── terraform/
│   │   └── ansible/
│   │
│   ├── observability/
│   │   ├── observability-fundamentals/
│   │   ├── prometheus/
│   │   ├── grafana/
│   │   ├── opentelemetry/
│   │   ├── logging/
│   │   ├── alerting/
│   │   └── sre/
│   │
│   └── platform-engineering/
│       ├── platform-principles/
│       ├── internal-developer-platforms/
│       ├── distributed-systems/
│       ├── devsecops/
│       ├── finops/
│       └── career/
│
├── projects/
│   ├── mini/                            # 500-1000 mini projects
│   ├── capstone/                        # 6 path capstone projects
│   └── mega/                            # 5 cross-path mega projects
│
├── quizzes/
│   └── [organized by module]
│
└── assets/
    ├── diagrams/
    ├── images/
    └── templates/
```

### 9.4 Content Metadata System

Every piece of content has metadata that powers the LMS features:

```json
{
  "id": "docker-networking-basics",
  "title": "Docker Networking — How Containers Talk to Each Other",
  "path": "containerization",
  "module": "docker",
  "order": 12,
  "duration_minutes": 45,
  "difficulty": "intermediate",
  "xp_reward": 150,
  "prerequisites": ["docker-containers-basics", "networking-fundamentals"],
  "skills": ["docker-networking", "bridge-networks", "container-communication"],
  "tags": ["docker", "networking", "containers"],
  "has_lab": true,
  "has_quiz": true,
  "has_project": true,
  "review_date": "2026-06-01",
  "version": "1.0"
}
```

### 9.5 Content Versioning

Technology evolves rapidly. The content must stay current:

| Strategy | Details |
|----------|---------|
| **Semantic versioning** | Each lesson has a version number (1.0, 1.1, 2.0) |
| **Review dates** | Every lesson has a scheduled review date (quarterly) |
| **Changelog** | Major content changes are logged |
| **Community contributions** | Open-source contributors can submit updates via pull requests |
| **Deprecation notices** | Outdated content is clearly marked, not silently removed |

---

## 10. Learning Experience Design

### 10.1 First-time User Experience

The first 10 minutes determine whether a learner stays or leaves. The onboarding flow:

```
Step 1: Welcome Screen
  "Welcome to DEVOPS ENGINEERS. We're going to take you from
   wherever you are right now to a confident DevOps engineer."

Step 2: Background Assessment (3 questions)
  - What is your current technical experience?
    □ None — I'm completely new to tech
    □ Some — I can use a computer but haven't programmed
    □ Developer — I write code but don't know infrastructure
    □ Sysadmin — I manage servers but want to learn DevOps

  - How much time can you dedicate per week?
    □ 5-10 hours
    □ 10-20 hours
    □ 20+ hours

  - What is your primary goal?
    □ Get my first tech job
    □ Switch to DevOps from development
    □ Upskill in my current role
    □ Learn for personal projects

Step 3: Personalized Learning Path
  Based on answers, recommend a starting point and estimated timeline.

Step 4: First Win (within 5 minutes)
  Immediately start the learner on their first hands-on exercise.
  They should complete something tangible before they close the browser.
```

### 10.2 Progress Tracking

#### Experience Points (XP) System

Every activity earns XP:

| Activity | XP |
|----------|-----|
| Complete a lesson | 100 |
| Complete a hands-on exercise | 50 |
| Complete a quiz (100% score) | 75 |
| Complete a quiz (passing score) | 50 |
| Complete a mini project | 150 |
| Complete a capstone project | 500 |
| Complete a mega project | 1,000 |
| Solve a debugging scenario | 100 |
| Complete a learning path | 2,000 |
| Daily streak bonus | 25/day |

#### Levels

| Level | Title | XP Required |
|-------|-------|------------|
| 1 | Newcomer | 0 |
| 2 | Explorer | 500 |
| 3 | Apprentice | 1,500 |
| 4 | Practitioner | 3,500 |
| 5 | Builder | 7,000 |
| 6 | Engineer | 12,000 |
| 7 | Senior Engineer | 20,000 |
| 8 | Staff Engineer | 35,000 |
| 9 | Principal Engineer | 55,000 |
| 10 | Distinguished Engineer | 80,000 |

#### Progress Dashboard

The learner's dashboard shows:

- Current learning path and module
- Percentage completion of each path
- Current level and XP
- Streak count
- Skills radar chart
- Recent activity
- Recommended next lesson
- Upcoming milestones

### 10.3 Lab System Overview

Labs are the heart of the platform. Three types of lab environments:

#### Type 1: Browser-based Terminal (Primary)

- Embedded terminal in the lesson page
- Pre-configured Docker containers
- Zero setup required for the learner
- Resets between sessions

**Use case:** Linux, Shell Scripting, Git, Docker basics

#### Type 2: Dev Containers / GitHub Codespaces

- Full VS Code environment in the browser
- Pre-configured development environments
- Persistent workspace
- Supports complex multi-tool scenarios

**Use case:** Kubernetes, Terraform, CI/CD, multi-service applications

#### Type 3: Local Docker Labs

- Docker Compose files provided with each lesson
- Learner runs labs on their own machine
- Full control and persistence
- Works offline

**Use case:** All technologies (alternative to browser-based)

### 10.4 Quiz System Overview

Quizzes serve as knowledge checkpoints, not tests. They reinforce learning:

| Quiz Type | Description | When Used |
|-----------|-------------|-----------|
| **Concept Check** | Multiple choice, 3–5 questions per lesson | End of every lesson |
| **Code Challenge** | Write or fix a command/script | After hands-on exercises |
| **Architecture Quiz** | Diagram-based questions | After architecture lessons |
| **Debugging Challenge** | Given a broken system, identify the fix | After troubleshooting sections |
| **Module Assessment** | Comprehensive, 15–20 questions | End of each module |
| **Path Assessment** | Cumulative, 30–50 questions | End of each learning path |

Quiz features:
- Immediate feedback with detailed explanations
- Unlimited retakes (learning, not gatekeeping)
- Questions randomized from a pool
- Difficulty adapts based on learner performance
- Wrong answers link back to relevant lesson sections

### 10.5 Code Display Standards

All code must feel like a **VS Code editor experience**:

```
┌─────────────────────────────────────────────────┐
│ 📄 deploy.sh                    ▸ Run  📋 Copy  │
├─────────────────────────────────────────────────┤
│  1 │ #!/bin/bash                                │
│  2 │                                            │
│  3 │ # Deploy the application to production     │
│  4 │ # This script builds, tests, and deploys   │
│  5 │                                            │
│  6 │ set -euo pipefail                          │
│  7 │                                            │
│  8 │ echo "Building application..."             │
│  9 │ docker build -t myapp:latest .             │
│ 10 │                                            │
│ 11 │ echo "Running tests..."                    │
│ 12 │ docker run --rm myapp:latest npm test      │
│ 13 │                                            │
│ 14 │ echo "Deploying to production..."          │
│ 15 │ kubectl apply -f k8s/                      │
│ 16 │                                            │
│ 17 │ echo "Deployment complete!"                │
└─────────────────────────────────────────────────┘
```

Code block features:
- Syntax highlighting for all languages (bash, python, yaml, json, hcl, go, etc.)
- Line numbers
- Copy button
- Filename header
- Run button (for lab-enabled exercises)
- Diff view for showing changes
- Collapsible sections for long outputs

### 10.6 Mobile Experience

While labs require a desktop/laptop, the learning content must be readable on mobile:

- Responsive design with readable text at all screen sizes
- Code blocks horizontally scrollable on mobile
- Quizzes fully functional on mobile
- Progress tracking and dashboard accessible on mobile
- Lesson bookmarking for "read on the go, practice later"

---

## What's Next

This document continues in **[PRD Part 2](./prd-part-2.md)** which covers:

- LMS Technical Architecture
- Repository Structure
- Website Structure
- Authentication & User Management
- Database Design
- Lab System Technical Design
- Quiz Engine Architecture
- Progress Tracking Implementation

And in **[PRD Part 3](./prd-part-3.md)** which covers:

- Content Writing Guidelines
- Video Content Pipeline
- SEO Strategy
- Certification System
- Community Features
- Monetization Strategy
- Launch Strategy
- Future Roadmap

---

*DEVOPS ENGINEERS — Training 1 Million Engineers, One Story at a Time.*
