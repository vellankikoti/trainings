# DEVOPS ENGINEERS — Implementation Task List (Part 3 of 4)

## Content Creation, Migration & First Complete Learning Path

**Covers:** Weeks 11–18 | Tasks 091–130
**Phase:** 3 — Content Production
**Depends on:** All tasks in Part 1 and Part 2 complete
**Goal:** Migrate existing content + create new content for a fully usable Foundations path

---

## Content Production Strategy

Content is the product. The platform is the delivery mechanism.

**Priority order for content production:**
1. Migrate and restructure existing Linux + Git + Shell Scripting content
2. Create new content for Networking and Python Automation
3. Complete Foundations Path (Path 1) end-to-end
4. Begin Docker content (Path 2 start)

**Per-lesson production target:** Each lesson takes approximately 4-8 hours to produce (research, write, add exercises, create quiz, create lab, test).

---

## Sprint 14: Linux Content Migration (Weeks 11–12)

### TASK-091: Migrate Linux content — Plan lesson breakdown

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-070
- **Estimated effort:** M
- **Files to create/modify:**
  - `content/paths/foundations/linux/module.json` (update with lesson list)
- **Acceptance criteria:**
  - Existing 3 Linux files mapped to 30-35 individual lessons:
    - `linux_administration.md` (17 chapters) → ~17 lessons
    - `linux-administration-handson.md` (Chapters 1-4) → integrated into relevant lessons
    - `linux-mastering-handson.md` → exercises integrated into relevant lessons
  - Lesson slugs defined and numbered: `01-the-linux-story`, `02-linux-architecture`, etc.
  - `module.json` updated with complete lesson list and metadata
  - Each lesson has clear scope (one concept per lesson)
- **Notes:**
  - PRD Reference: Section 29.2 (Content migration mapping)
  - Existing content has 13,658 lines. Break into digestible 200-400 line lessons.

---

### TASK-092: Create Linux Lesson 01 — The Linux Story

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-091, TASK-034 (sample lesson validates components work)
- **Estimated effort:** L
- **Files to create/modify:**
  - `content/paths/foundations/linux/01-the-linux-story/index.mdx`
- **Acceptance criteria:**
  - Full frontmatter with all required fields
  - Story: Linus Torvalds origin story, Unix history, open-source movement
  - Concept: What is an operating system, what makes Linux different
  - Architecture: Linux layer diagram (hardware → kernel → shell → applications)
  - Hands-on: 2 exercises (check Linux version, explore /proc)
  - TabGroup: Installation overview (Mac terminal, Windows WSL, Linux native)
  - Callouts: info, tip, story types used
  - Troubleshooting: Common "command not found" issues
  - Mini project: Create a "system information report" script
  - Quiz: 5 questions about Linux history and architecture
  - All MDX components render correctly
  - Writing follows platform voice guidelines
- **Notes:**
  - This is the very first lesson any learner sees. Make it excellent.
  - Draw from existing content in `linux_administration.md` Chapter 1

---

### TASK-093: Create Linux Lessons 02-05 — Architecture & Boot Process

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-092
- **Estimated effort:** XL
- **Files to create/modify:**
  - `content/paths/foundations/linux/02-linux-architecture/index.mdx`
  - `content/paths/foundations/linux/03-boot-process/index.mdx`
  - `content/paths/foundations/linux/04-installing-linux/index.mdx`
  - `content/paths/foundations/linux/05-terminal-mastery/index.mdx`
- **Acceptance criteria:**
  - Lesson 02: Kernel, shell, filesystem hierarchy, distributions explained
  - Lesson 03: BIOS/UEFI → bootloader → kernel → init → services
  - Lesson 04: VirtualBox install, WSL setup, dual boot (tabbed for Mac/Win/Linux)
  - Lesson 05: Terminal basics, bash/zsh, SSH, tmux
  - Each lesson: story, exercises, troubleshooting, mini project, quiz
  - Content draws from existing files but rewritten in platform voice
  - All 4 lessons render and navigate correctly
- **Notes:**
  - Source content: `linux_administration.md` Chapters 1-4, `linux-administration-handson.md` Chapters 1-4

---

### TASK-094: Create Linux Lessons 06-10 — File System & Permissions

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-093
- **Estimated effort:** XL
- **Files to create/modify:**
  - `content/paths/foundations/linux/06-filesystem-navigation/index.mdx`
  - `content/paths/foundations/linux/07-file-operations/index.mdx`
  - `content/paths/foundations/linux/08-users-and-groups/index.mdx`
  - `content/paths/foundations/linux/09-permissions-deep-dive/index.mdx`
  - `content/paths/foundations/linux/10-special-permissions/index.mdx`
- **Acceptance criteria:**
  - Lesson 06: cd, ls, pwd, find, locate, tree — navigating the filesystem
  - Lesson 07: cp, mv, rm, mkdir, touch, ln — file manipulation
  - Lesson 08: useradd, groupadd, /etc/passwd, /etc/shadow, sudo
  - Lesson 09: rwx, chmod, chown, chgrp, numeric and symbolic notation
  - Lesson 10: SUID, SGID, sticky bit, ACLs, umask
  - Each lesson has 3+ hands-on exercises with expected output
  - Troubleshooting: "Permission denied" debugging scenarios
  - Mini projects: File organizer script, user audit script
- **Notes:**
  - Source content: `linux_administration.md` Chapters 4-6

---

### TASK-095: Create Linux Lessons 11-15 — Package Mgmt, Processes, Services

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-094
- **Estimated effort:** XL
- **Files to create/modify:**
  - `content/paths/foundations/linux/11-package-management/index.mdx`
  - `content/paths/foundations/linux/12-process-management/index.mdx`
  - `content/paths/foundations/linux/13-service-management/index.mdx`
  - `content/paths/foundations/linux/14-system-monitoring/index.mdx`
  - `content/paths/foundations/linux/15-logs-and-journald/index.mdx`
- **Acceptance criteria:**
  - Lesson 11: apt, yum, dnf (tabbed), dpkg, rpm, repositories
  - Lesson 12: ps, top, htop, kill, nice, nohup, background/foreground
  - Lesson 13: systemctl, systemd units, enabling/disabling services
  - Lesson 14: top, vmstat, iostat, df, du, free, uptime
  - Lesson 15: /var/log, journalctl, syslog, log rotation
  - Debugging scenarios: "service won't start", "disk full", "high CPU process"
  - Mini projects: Process monitor script, log analyzer
- **Notes:**
  - Source content: `linux_administration.md` Chapters 7-10

---

### TASK-096: Create Linux Lessons 16-20 — Networking, Storage, Security

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-095
- **Estimated effort:** XL
- **Files to create/modify:**
  - `content/paths/foundations/linux/16-storage-and-mounting/index.mdx`
  - `content/paths/foundations/linux/17-networking-essentials/index.mdx`
  - `content/paths/foundations/linux/18-firewall-and-security/index.mdx`
  - `content/paths/foundations/linux/19-text-processing/index.mdx`
  - `content/paths/foundations/linux/20-automation-cron-jobs/index.mdx`
- **Acceptance criteria:**
  - Lesson 16: mount, fstab, LVM, disk partitioning, RAID overview
  - Lesson 17: ip, ss, netstat, ping, traceroute, DNS, /etc/hosts
  - Lesson 18: iptables, firewalld, ufw, SSH hardening, fail2ban
  - Lesson 19: grep, sed, awk, cut, sort, uniq, wc, xargs
  - Lesson 20: crontab, at, systemd timers, automation patterns
  - Each lesson has production debugging scenario
  - Mini projects: Firewall setup script, log parsing pipeline, backup cron job
- **Notes:**
  - Source content: `linux_administration.md` Chapters 11-17

---

### TASK-097: Create Linux module assessment quiz

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-096
- **Estimated effort:** L
- **Files to create/modify:**
  - `content/quizzes/assessments/foundations-linux.json`
- **Acceptance criteria:**
  - 40+ question pool covering all 20 lessons
  - Assessment selects 20 random questions per attempt
  - Question types: multiple_choice, true_false, code_completion
  - 80% passing score
  - Questions tagged by lesson for feedback linking
  - Explanations for every answer
- **Notes:**
  - This is required for the Linux module certificate

---

### TASK-098: Create Linux Docker lab configurations

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-046, TASK-092
- **Estimated effort:** L
- **Files to create/modify:**
  - `labs/docker-compose/linux-basics/docker-compose.yml`
  - `labs/docker-compose/linux-basics/lab.yaml`
  - `labs/docker-compose/linux-admin/docker-compose.yml`
  - `labs/docker-compose/linux-admin/lab.yaml`
  - `labs/docker-compose/linux-networking/docker-compose.yml`
  - `labs/docker-compose/linux-networking/lab.yaml`
- **Acceptance criteria:**
  - `linux-basics` lab: Ubuntu container with basic tools, exercises for lessons 01-10
  - `linux-admin` lab: Ubuntu container with systemd (or mock), exercises for lessons 11-15
  - `linux-networking` lab: Two networked containers, exercises for lessons 16-18
  - Each lab has validated exercises matching lesson content
  - `devops-lab start linux-basics` works
  - `devops-lab validate` passes when exercises are completed correctly
- **Notes:**
  - PRD Reference: Section 16.4 (Lab Technology Requirements)

---

## Sprint 15: Shell Scripting Content Migration (Weeks 13–14)

### TASK-099: Migrate Shell Scripting content — Plan lesson breakdown

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-070
- **Estimated effort:** M
- **Files to create/modify:**
  - `content/paths/foundations/shell-scripting/module.json` (update)
- **Acceptance criteria:**
  - `shell-scripting-handson.md` (7,483 lines) mapped to 25-30 lessons
  - Lesson slugs defined and numbered
  - Clear scope per lesson (variables, conditionals, loops, functions, etc.)
- **Notes:**
  - Existing content is strong on exercises. Add stories, architecture, troubleshooting, quizzes.

---

### TASK-100: Create Shell Scripting Lessons 01-08 — Fundamentals

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-099
- **Estimated effort:** XL
- **Files to create/modify:**
  - `content/paths/foundations/shell-scripting/01-why-shell-scripting/index.mdx`
  - `content/paths/foundations/shell-scripting/02-first-script/index.mdx`
  - `content/paths/foundations/shell-scripting/03-variables/index.mdx`
  - `content/paths/foundations/shell-scripting/04-user-input/index.mdx`
  - `content/paths/foundations/shell-scripting/05-conditionals/index.mdx`
  - `content/paths/foundations/shell-scripting/06-loops/index.mdx`
  - `content/paths/foundations/shell-scripting/07-functions/index.mdx`
  - `content/paths/foundations/shell-scripting/08-arrays-strings/index.mdx`
- **Acceptance criteria:**
  - Each lesson follows the full lesson template
  - Story introductions (not just "here's how variables work")
  - All commands tested and showing expected output
  - Mini project per lesson (e.g., calculator, file renamer, log parser)
  - Quiz per lesson (3-5 questions)
  - Migrated and enhanced from existing content
- **Notes:**
  - Source: `shell-scripting-handson.md` Part 1

---

### TASK-101: Create Shell Scripting Lessons 09-16 — Advanced

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-100
- **Estimated effort:** XL
- **Files to create/modify:**
  - `content/paths/foundations/shell-scripting/09-file-operations/index.mdx`
  - `content/paths/foundations/shell-scripting/10-text-processing/index.mdx`
  - `content/paths/foundations/shell-scripting/11-error-handling/index.mdx`
  - `content/paths/foundations/shell-scripting/12-debugging-scripts/index.mdx`
  - `content/paths/foundations/shell-scripting/13-process-management/index.mdx`
  - `content/paths/foundations/shell-scripting/14-advanced-patterns/index.mdx`
  - `content/paths/foundations/shell-scripting/15-real-world-scripts/index.mdx`
  - `content/paths/foundations/shell-scripting/16-production-scripting/index.mdx`
- **Acceptance criteria:**
  - Topics: file I/O, sed/awk in scripts, set -e, trap, debugging with -x, subshells, here docs
  - Production patterns: logging functions, config files, argument parsing with getopts
  - Real-world scripts: deployment script, backup script, health check script
  - Troubleshooting: "script works on my machine" debugging
  - Module assessment quiz: 30+ question pool
- **Notes:**
  - Source: `shell-scripting-handson.md` remaining parts

---

## Sprint 16: Git Content Migration (Weeks 14–15)

### TASK-102: Migrate Git content — Plan lesson breakdown

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-070
- **Estimated effort:** M
- **Files to create/modify:**
  - `content/paths/foundations/git/module.json` (update)
- **Acceptance criteria:**
  - 6 existing Git files mapped to 25-28 individual lessons
  - Lessons organized: fundamentals → remotes → branching → advanced → enterprise
  - Each lesson scope clearly defined
- **Notes:**
  - Existing Git content is the most complete (10,435 lines across 6 files)

---

### TASK-103: Create Git Lessons 01-10 — Fundamentals

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-102
- **Estimated effort:** XL
- **Files to create/modify:**
  - `content/paths/foundations/git/01-the-git-story/index.mdx`
  - `content/paths/foundations/git/02-how-git-works/index.mdx`
  - `content/paths/foundations/git/03-installation-and-setup/index.mdx`
  - `content/paths/foundations/git/04-first-repository/index.mdx`
  - `content/paths/foundations/git/05-staging-and-committing/index.mdx`
  - `content/paths/foundations/git/06-viewing-history/index.mdx`
  - `content/paths/foundations/git/07-branching-basics/index.mdx`
  - `content/paths/foundations/git/08-merging/index.mdx`
  - `content/paths/foundations/git/09-conflict-resolution/index.mdx`
  - `content/paths/foundations/git/10-undoing-changes/index.mdx`
- **Acceptance criteria:**
  - Source: `git.md` Parts 1-3, `git_fundamentals_day_1.md`
  - Each lesson: story, concept, hands-on (3+ exercises), troubleshooting, quiz
  - Installation lesson: tabbed for Mac (Homebrew), Windows (Git for Windows), Linux (apt/yum/dnf)
  - Architecture lesson: Git object model (blobs, trees, commits) with diagrams
  - Conflict resolution: realistic multi-person scenario
- **Notes:**
  - The Git origin story (Linus creating Git in 2 weeks for Linux kernel) is fascinating. Tell it well.

---

### TASK-104: Create Git Lessons 11-20 — Remotes & Advanced

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-103
- **Estimated effort:** XL
- **Files to create/modify:**
  - `content/paths/foundations/git/11-remote-repositories/index.mdx`
  - `content/paths/foundations/git/12-github-collaboration/index.mdx`
  - `content/paths/foundations/git/13-pull-requests/index.mdx`
  - `content/paths/foundations/git/14-forking-open-source/index.mdx`
  - `content/paths/foundations/git/15-interactive-rebase/index.mdx`
  - `content/paths/foundations/git/16-cherry-pick/index.mdx`
  - `content/paths/foundations/git/17-stashing-worktrees/index.mdx`
  - `content/paths/foundations/git/18-git-bisect/index.mdx`
  - `content/paths/foundations/git/19-enterprise-branching/index.mdx`
  - `content/paths/foundations/git/20-git-in-production/index.mdx`
- **Acceptance criteria:**
  - Source: `github_remote_repo_day_2.md`, `advanced_git_operations_day_3.md`, `enterprise_branching_day_4.md`
  - Pull requests lesson: full PR workflow with code review
  - Enterprise branching: GitFlow, GitHub Flow, GitLab Flow comparison (from existing content)
  - Production lesson: hooks, CI/CD integration, branch protection, signed commits
  - Module assessment quiz: 40+ question pool
- **Notes:**
  - Existing enterprise branching content is excellent. Preserve the comparison tables.

---

## Sprint 17: New Content — Networking (Weeks 15–16)

### TASK-105: Create Networking module — All lessons

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-096 (Linux networking lesson provides foundation)
- **Estimated effort:** XL (multi-session)
- **Files to create/modify:**
  - `content/paths/foundations/networking/module.json`
  - `content/paths/foundations/networking/01-how-the-internet-works/index.mdx`
  - `content/paths/foundations/networking/02-osi-and-tcp-ip/index.mdx`
  - `content/paths/foundations/networking/03-ip-addressing-subnets/index.mdx`
  - `content/paths/foundations/networking/04-dns-deep-dive/index.mdx`
  - `content/paths/foundations/networking/05-http-and-https/index.mdx`
  - `content/paths/foundations/networking/06-tcp-vs-udp/index.mdx`
  - `content/paths/foundations/networking/07-firewalls-and-load-balancers/index.mdx`
  - `content/paths/foundations/networking/08-network-troubleshooting/index.mdx`
  - `content/paths/foundations/networking/09-vpns-and-tunnels/index.mdx`
  - `content/paths/foundations/networking/10-networking-for-containers/index.mdx`
  - (+ additional lessons as needed, 15-20 total)
- **Acceptance criteria:**
  - No existing content to migrate — all new
  - Story-driven: "What happens when you type google.com" is lesson 1
  - OSI model taught with real-world analogies (postal system, phone calls)
  - IP addressing with subnetting exercises (binary math made approachable)
  - DNS: recursive resolution, dig/nslookup exercises
  - HTTP/HTTPS: request/response cycle, TLS handshake explained
  - Troubleshooting: ping, traceroute, tcpdump, netstat/ss exercises
  - Container networking lesson bridges to Docker module
  - Labs: Multi-container Docker lab for networking exercises
  - Module assessment: 30+ question pool
- **Notes:**
  - Networking is critical for understanding Docker networking, Kubernetes networking, and AWS VPCs later
  - Must be accessible to complete beginners

---

## Sprint 18: New Content — Python Automation (Weeks 16–18)

### TASK-106: Create Python Automation module — Fundamentals (Lessons 01-12)

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-101 (shell scripting provides foundation)
- **Estimated effort:** XL (multi-session)
- **Files to create/modify:**
  - `content/paths/foundations/python-automation/module.json`
  - `content/paths/foundations/python-automation/01-why-python-for-devops/index.mdx`
  - `content/paths/foundations/python-automation/02-installation-and-setup/index.mdx`
  - `content/paths/foundations/python-automation/03-python-basics/index.mdx`
  - `content/paths/foundations/python-automation/04-data-structures/index.mdx`
  - `content/paths/foundations/python-automation/05-control-flow/index.mdx`
  - `content/paths/foundations/python-automation/06-functions-and-modules/index.mdx`
  - `content/paths/foundations/python-automation/07-file-operations/index.mdx`
  - `content/paths/foundations/python-automation/08-working-with-json-yaml/index.mdx`
  - `content/paths/foundations/python-automation/09-os-and-subprocess/index.mdx`
  - `content/paths/foundations/python-automation/10-http-requests/index.mdx`
  - `content/paths/foundations/python-automation/11-error-handling-logging/index.mdx`
  - `content/paths/foundations/python-automation/12-regex-text-processing/index.mdx`
- **Acceptance criteria:**
  - No existing content — all new
  - Story: "Why every DevOps engineer needs Python" — compare bash vs python for complex tasks
  - Installation: tabbed (Mac/Windows/Linux), pyenv, virtual environments
  - Focused on automation, not general programming
  - Every lesson has DevOps-relevant examples (parse logs, API calls, config management)
  - Mini projects: log parser, API health checker, config file generator
  - Not a full Python course — just what DevOps engineers need
- **Notes:**
  - This module bridges the gap between shell scripting and infrastructure automation
  - Keep focused: subprocess, requests, json/yaml, os module, pathlib

---

### TASK-107: Create Python Automation — Advanced Lessons (13-20)

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-106
- **Estimated effort:** XL
- **Files to create/modify:**
  - `content/paths/foundations/python-automation/13-boto3-aws-basics/index.mdx`
  - `content/paths/foundations/python-automation/14-paramiko-ssh/index.mdx`
  - `content/paths/foundations/python-automation/15-docker-sdk/index.mdx`
  - `content/paths/foundations/python-automation/16-kubernetes-client/index.mdx`
  - `content/paths/foundations/python-automation/17-click-cli-tools/index.mdx`
  - `content/paths/foundations/python-automation/18-testing-automation/index.mdx`
  - `content/paths/foundations/python-automation/19-monitoring-scripts/index.mdx`
  - `content/paths/foundations/python-automation/20-production-automation/index.mdx`
- **Acceptance criteria:**
  - boto3 basics (list EC2, create S3 bucket — prep for AWS module)
  - Paramiko for SSH automation
  - Docker SDK for Python
  - Kubernetes Python client basics
  - CLI tool development with Click
  - Testing: pytest for automation scripts
  - Production patterns: retry logic, graceful degradation, structured logging
  - Module assessment: 30+ question pool
  - Capstone: Build a multi-cloud infrastructure audit tool
- **Notes:**
  - These advanced lessons create direct connections to later modules (Docker, K8s, AWS, Terraform)

---

## Sprint 19: Foundations Path Completion (Week 18)

### TASK-108: Create Foundations Path capstone project

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-097, TASK-101, TASK-104, TASK-105, TASK-107
- **Estimated effort:** XL
- **Files to create/modify:**
  - `content/projects/capstone/foundations-capstone/index.mdx`
  - `content/projects/capstone/foundations-capstone/requirements.md`
  - `content/projects/capstone/foundations-capstone/starter-code/`
  - `labs/docker-compose/foundations-capstone/docker-compose.yml`
- **Acceptance criteria:**
  - Project: "Build a Server Monitoring and Alerting System"
  - Combines: Linux, Shell Scripting, Git, Python, Networking
  - Requirements clearly defined with rubric
  - Starter code provided (skeleton files)
  - Step-by-step guided implementation
  - Lab environment with multiple containers (monitored servers + monitoring server)
  - Tests learner on: shell scripts, Python automation, git workflow, networking, cron jobs
  - Completion criteria: all features working, code in Git repo, documentation written
- **Notes:**
  - PRD Reference: Section 7.2 Path 1 Capstone Project description

---

### TASK-109: Create Foundations Path assessment

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-097, TASK-101, TASK-104, TASK-105, TASK-107
- **Estimated effort:** L
- **Files to create/modify:**
  - `content/quizzes/assessments/foundations-path.json`
- **Acceptance criteria:**
  - 80+ question pool spanning all 6 Foundations modules
  - Assessment selects 40 random questions
  - Covers: Linux, Shell Scripting, Git, Networking, Python
  - 80% passing score
  - 60-minute time limit
  - Questions tagged by module for feedback
- **Notes:**
  - Passing this assessment + completing capstone = Foundations Path certificate

---

### TASK-110: Verify complete Foundations Path flow

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-108, TASK-109
- **Estimated effort:** L
- **Files to create/modify:** None (verification only)
- **Acceptance criteria:**
  - [ ] All 6 modules have complete lesson sets (100+ lessons total)
  - [ ] Every lesson renders correctly with all MDX components
  - [ ] Navigation works: Previous → Next through entire path
  - [ ] Every lesson has: story, exercises, troubleshooting, mini project, quiz
  - [ ] All module assessments work (start, take, score, save)
  - [ ] Path assessment works
  - [ ] Capstone project page renders with instructions
  - [ ] Progress tracking works through entire path
  - [ ] Path completion triggers certificate generation
  - [ ] Certificate displays and downloads correctly
  - [ ] Labs work for Linux, Shell Scripting, Networking
  - [ ] Total content: 100+ lessons, 100+ mini projects, 6 module quizzes, 1 path assessment
- **Notes:**
  - This is the launch milestone. If this works, the platform can go live.

---

## Sprint 20: Docker Content — Beginning Path 2 (Weeks 18+)

### TASK-111: Create Docker module — Fundamentals (Lessons 01-15)

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** TASK-110 (Foundations complete)
- **Estimated effort:** XL (multi-session)
- **Files to create/modify:**
  - `content/paths/containerization/docker/module.json`
  - `content/paths/containerization/docker/01-the-docker-story/index.mdx`
  - `content/paths/containerization/docker/02-containers-vs-vms/index.mdx`
  - `content/paths/containerization/docker/03-docker-architecture/index.mdx`
  - `content/paths/containerization/docker/04-installation/index.mdx`
  - `content/paths/containerization/docker/05-your-first-container/index.mdx`
  - `content/paths/containerization/docker/06-docker-images/index.mdx`
  - `content/paths/containerization/docker/07-writing-dockerfiles/index.mdx`
  - `content/paths/containerization/docker/08-multi-stage-builds/index.mdx`
  - `content/paths/containerization/docker/09-docker-volumes/index.mdx`
  - `content/paths/containerization/docker/10-docker-networking/index.mdx`
  - `content/paths/containerization/docker/11-docker-compose/index.mdx`
  - `content/paths/containerization/docker/12-environment-variables/index.mdx`
  - `content/paths/containerization/docker/13-container-logging/index.mdx`
  - `content/paths/containerization/docker/14-docker-security/index.mdx`
  - `content/paths/containerization/docker/15-docker-in-production/index.mdx`
- **Acceptance criteria:**
  - Origin story: "The deployment nightmare that created Docker" (Solomon Hykes, dotCloud)
  - Architecture: Docker daemon, client, registry, images, containers, layers
  - Hands-on from first lesson: `docker run hello-world` within 5 minutes
  - Dockerfile best practices: layer caching, multi-stage builds, minimal images
  - Networking: bridge, host, overlay, custom networks
  - Compose: multi-service applications
  - Security: rootless containers, image scanning, secrets management
  - Production: health checks, restart policies, resource limits
  - Labs: Docker-in-Docker environment for all exercises
- **Notes:**
  - Docker is the gateway to containerization. Make it thorough and practical.

---

### TASK-112: Create Docker Advanced lessons (16-30)

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-111
- **Estimated effort:** XL (multi-session)
- **Files to create/modify:**
  - 15 additional lesson directories under `content/paths/containerization/docker/`
- **Acceptance criteria:**
  - Advanced networking: overlay networks, DNS resolution, service discovery
  - Advanced storage: volume drivers, bind mounts, tmpfs
  - Docker registry: running private registry, image tagging strategy
  - Docker debugging: `docker logs`, `docker exec`, `docker inspect`, `docker stats`
  - CI/CD with Docker: building in CI, image caching, security scanning
  - Docker Compose advanced: depends_on, healthchecks, profiles, extensions
  - Production debugging scenarios: container won't start, OOM kills, networking issues
  - Module assessment: 50+ question pool
  - 15+ mini projects
- **Notes:**
  - Connect to Kubernetes: "everything you learn about Docker networking translates to Kubernetes"

---

## Content Quality Tasks

### TASK-113: Create quiz question pools for all migrated modules

- **Status:** [x] Complete
- **Priority:** P0
- **Depends on:** TASK-100, TASK-104
- **Estimated effort:** L
- **Files to create/modify:**
  - `content/quizzes/foundations/shell-scripting/*.json`
  - `content/quizzes/foundations/git/*.json`
  - `content/quizzes/assessments/foundations-shell-scripting.json`
  - `content/quizzes/assessments/foundations-git.json`
- **Acceptance criteria:**
  - Shell Scripting: 5 questions per lesson (80+), 30+ assessment pool
  - Git: 5 questions per lesson (100+), 40+ assessment pool
  - All questions have explanations
  - Questions reference back to lessons
  - Mix of types: multiple_choice, true_false, code_completion
- **Notes:**
  - Quiz quality directly impacts learning outcomes

---

### TASK-114: Create lab configurations for Shell Scripting and Git

- **Status:** [x] Complete
- **Priority:** P1
- **Depends on:** TASK-046, TASK-100, TASK-104
- **Estimated effort:** L
- **Files to create/modify:**
  - `labs/docker-compose/shell-scripting/docker-compose.yml`
  - `labs/docker-compose/shell-scripting/lab.yaml`
  - `labs/docker-compose/git-basics/docker-compose.yml`
  - `labs/docker-compose/git-basics/lab.yaml`
  - `labs/docker-compose/git-collaboration/docker-compose.yml`
  - `labs/docker-compose/git-collaboration/lab.yaml`
- **Acceptance criteria:**
  - Shell scripting lab: Ubuntu with bash, vim, common tools
  - Git basics lab: Pre-configured git user, sample repository
  - Git collaboration lab: Simulated remote (bare repo), two user configs
  - All labs have validated exercises
- **Notes:**
  - Git collaboration lab should simulate team workflows

---

### TASK-115: Cross-link all Foundations lessons

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-096, TASK-101, TASK-104, TASK-105, TASK-107
- **Estimated effort:** L
- **Files to create/modify:**
  - All lesson files in `content/paths/foundations/` (update "What's Next" and inline links)
- **Acceptance criteria:**
  - Every lesson has 5+ internal links to other lessons
  - "Prerequisites" section links to actual lesson URLs
  - "What's Next" section links to the next lesson
  - Cross-module references: e.g., Linux permissions lesson links to Git permissions
  - "Connections" section at end of each module links to related content in other modules
- **Notes:**
  - PRD Reference: Section 21.5 (Internal Linking Strategy)
  - Important for both learning experience and SEO

---

### TASK-116: Create cheat sheets for Foundations modules

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-096, TASK-101, TASK-104
- **Estimated effort:** L
- **Files to create/modify:**
  - `content/shared/cheat-sheets/linux-commands.mdx`
  - `content/shared/cheat-sheets/shell-scripting.mdx`
  - `content/shared/cheat-sheets/git-commands.mdx`
  - `content/shared/cheat-sheets/networking.mdx`
  - `content/shared/cheat-sheets/python-automation.mdx`
- **Acceptance criteria:**
  - Each cheat sheet: 1-2 pages of most important commands
  - Organized by category
  - Printable format
  - Accessible from module page and dashboard
  - PDF downloadable version
- **Notes:**
  - High SEO value (people search for "[tool] cheat sheet")

---

## Batch Tasks: Maintaining Quality at Scale

### TASK-117: Run content quality audit on all lessons

- **Status:** [ ] Not Started
- **Priority:** P1
- **Depends on:** TASK-110
- **Estimated effort:** XL
- **Files to create/modify:**
  - Various content files (fixes)
- **Acceptance criteria:**
  - Content validator (TASK-039) runs clean on all files
  - All frontmatter complete and accurate
  - All internal links valid
  - All code blocks have language identifiers
  - All commands tested and showing correct expected output
  - No spelling errors
  - Writing tone consistent across modules
- **Notes:**
  - Run this before launch. Broken content on day 1 kills credibility.

---

### TASK-118: Create glossary

- **Status:** [ ] Not Started
- **Priority:** P2
- **Depends on:** TASK-110
- **Estimated effort:** M
- **Files to create/modify:**
  - `content/shared/glossary.json`
  - `apps/web/app/(marketing)/glossary/page.tsx`
- **Acceptance criteria:**
  - 200+ terms defined (all technologies + concepts)
  - Each term: definition, related lessons, tags
  - Glossary page searchable
  - Terms auto-linked in lesson content (optional feature)
  - SEO-friendly individual term pages
- **Notes:**
  - Good for SEO and for beginners encountering new terms

---

### TASK-119: Part 3 completion checkpoint

- **Status:** [ ] Not Started
- **Priority:** P0
- **Depends on:** All tasks 091–118
- **Estimated effort:** L
- **Files to create/modify:** None (verification only)
- **Acceptance criteria:**
  - [ ] **Foundations Path complete:** 100+ lessons across 6 modules
  - [ ] **Linux module:** 20 lessons, assessment, labs, cheat sheet
  - [ ] **Shell Scripting module:** 16 lessons, assessment, labs, cheat sheet
  - [ ] **Git module:** 20 lessons, assessment, labs, cheat sheet
  - [ ] **Networking module:** 10-15 lessons, assessment, labs, cheat sheet
  - [ ] **Python module:** 20 lessons, assessment, labs, cheat sheet
  - [ ] **Path assessment:** 80+ question pool, 40-question exam
  - [ ] **Capstone project:** Complete with starter code and lab
  - [ ] **Docker module started:** 15+ lessons
  - [ ] **All content validates:** No errors from content validator
  - [ ] **All quizzes functional:** Take and score correctly
  - [ ] **All labs functional:** Start, validate, reset
  - [ ] **Cross-linking complete:** 5+ internal links per lesson
  - [ ] **Build succeeds:** `pnpm build` with all content

---

**Previous:** [task-list-part-2.md](./task-list-part-2.md) — Core Platform Features
**Next:** [task-list-part-4.md](./task-list-part-4.md) — Advanced Features & Production Deployment
