# Content Migration Plan

## Overview

This document maps every existing training file to the new platform content structure. The repository contains **107,000+ words** across 10 files that need to be migrated into the MDX-based lesson format.

**Total existing content:**
- Git Training: 6 files, ~35,200 words, 303 code blocks, 50 exercises
- Linux & Shell Scripting: 4 files, ~72,200 words, 446 code blocks, 52+ exercises

## Migration Priority

| Priority | Source File | Target Path | Effort | Reason |
|----------|------------|-------------|--------|--------|
| 1 | `Git/git_fundamentals_day_1.md` | `foundations/git/` | M | Most structured, has exercises |
| 2 | `Linux-Shell_Scripting/linux-mastering-handson.md` | `foundations/linux/` | L | 52 exercises, well-structured |
| 3 | `Git/github_remote_repo_day_2.md` | `foundations/git/` | M | 20 exercises, builds on Day 1 |
| 4 | `Linux-Shell_Scripting/shell-scripting-handson.md` | `foundations/shell-scripting/` | XL | 21,700 words needs splitting |
| 5 | `Git/advanced_git_operations_day_3.md` | `foundations/git/` | M | 20 exercises, advanced topics |
| 6 | `Linux-Shell_Scripting/linux-administration-handson.md` | `foundations/linux-admin/` | XL | 21,300 words needs splitting |
| 7 | `Git/enterprise_branching_day_4.md` | `foundations/git/` | M | Strategic content, no exercises |
| 8 | `Git/git.md` | `foundations/git/` (reference) | XL | 18,400 words, comprehensive ref |
| 9 | `Linux-Shell_Scripting/linux_administration.md` | `foundations/linux-admin/` | L | Reference material |
| 10 | `Git/git-course-overview.md` | N/A (absorbed into path.json) | S | 349 words, syllabus only |

## Detailed Migration Mappings

### 1. Git Fundamentals (Day 1) → `content/paths/foundations/git/`

**Source:** `Git/git_fundamentals_day_1.md` (2,023 words, 14 code blocks, 10 exercises)

| Source Section | Target Lesson | MDX Components to Add |
|---------------|--------------|----------------------|
| The Mental Model: Git as a Time Machine | `git-mental-model/index.mdx` | `<Callout type="story">`, `<Exercise>` |
| The Four Dimensions of Git | (part of mental model lesson) | `<TabGroup>` for dimensions |
| Essential Git Architecture Deep Dive | `git-architecture/index.mdx` | `<MiniProject>` |
| Exercises 1-10 | Distribute across lessons | `<Exercise>`, `<CollapsibleSolution>` |

**What to add:**
- Story callouts for each lesson
- Quiz questions (3-5 per lesson)
- Key Takeaways sections
- "What's Next?" links

---

### 2. Linux Mastery Hands-On → `content/paths/foundations/linux/`

**Source:** `Linux-Shell_Scripting/linux-mastering-handson.md` (17,803 words, 139 code blocks, 52 exercises)

| Source Section | Target Lesson | Estimated Words |
|---------------|--------------|----------------|
| Chapter 1: Linux OS & Administration | `linux-distributions/index.mdx` | ~2,000 |
| File System Hierarchy | `file-system/index.mdx` | ~2,500 |
| User & Permission Management | `users-permissions/index.mdx` | ~2,000 |
| Package Management | `package-management/index.mdx` | ~1,500 |
| Process Management | `process-management/index.mdx` | ~2,000 |
| Network Configuration | `networking-basics/index.mdx` | ~2,000 |
| System Monitoring | `system-monitoring/index.mdx` | ~1,500 |
| Shell Scripting Introduction | `shell-scripting-intro/index.mdx` | ~2,000 |
| Real-World Projects | `linux-real-world-project/index.mdx` | ~2,300 |

**What to add:**
- Story callouts connecting concepts to real DevOps scenarios
- `<Terminal>` components for interactive examples
- `<LabEmbed>` linking to linux-basics lab
- Quiz questions for each lesson
- Tab groups for Ubuntu vs CentOS commands

---

### 3. GitHub & Remote Repos (Day 2) → `content/paths/foundations/git/`

**Source:** `Git/github_remote_repo_day_2.md` (4,166 words, 28 code blocks, 20 exercises)

| Source Section | Target Lesson | MDX Components to Add |
|---------------|--------------|----------------------|
| Understanding Remote Repositories | `remote-repos/index.mdx` | `<Callout type="info">` |
| Core Workflow | `git-workflow/index.mdx` | `<MiniProject>` |
| Fork & PR Workflow | `pull-requests/index.mdx` | `<Exercise>` |
| Collaboration Patterns | `git-collaboration/index.mdx` | `<TabGroup>` |

---

### 4. Shell Scripting Hands-On → `content/paths/foundations/shell-scripting/`

**Source:** `Linux-Shell_Scripting/shell-scripting-handson.md` (21,747 words, 85 code blocks)

**Split into lessons:**

| Source Section | Target Lesson | Estimated Words |
|---------------|--------------|----------------|
| Introduction to Shells | `shells-intro/index.mdx` | ~1,500 |
| Writing Your First Bash Script | `first-script/index.mdx` | ~2,000 |
| Script Permissions and Execution | `permissions-execution/index.mdx` | ~1,500 |
| Variables and User Input | `variables-input/index.mdx` | ~2,500 |
| Conditional Statements | `conditionals/index.mdx` | ~2,500 |
| Loops | `loops/index.mdx` | ~2,500 |
| Functions | `functions/index.mdx` | ~2,000 |
| Arrays and String Operations | `arrays-strings/index.mdx` | ~2,000 |
| File I/O and Text Processing | `file-processing/index.mdx` | ~2,500 |
| Error Handling and Debugging | `error-handling/index.mdx` | ~1,500 |
| Real-World Scripts | `real-world-scripts/index.mdx` | ~1,500 |

---

### 5. Advanced Git Operations (Day 3) → `content/paths/foundations/git/`

**Source:** `Git/advanced_git_operations_day_3.md` (5,824 words, 23 code blocks, 20 exercises)

| Source Section | Target Lesson |
|---------------|--------------|
| Interactive Rebase | `interactive-rebase/index.mdx` |
| Git Bisect | `git-bisect/index.mdx` |
| Git Stash | `git-stash/index.mdx` |
| Cherry Pick | `cherry-pick/index.mdx` |

---

### 6. Linux Administration Hands-On → `content/paths/foundations/linux-admin/`

**Source:** `Linux-Shell_Scripting/linux-administration-handson.md` (21,365 words, 129 code blocks)

**Split into lessons:**

| Source Section | Target Lesson | Estimated Words |
|---------------|--------------|----------------|
| Linux Distributions | `distros-deep-dive/index.mdx` | ~2,500 |
| Boot Process & Architecture | `boot-process/index.mdx` | ~2,000 |
| Installing Linux | `linux-installation/index.mdx` | ~2,000 |
| Terminal, SSH, TTY Access | `terminal-access/index.mdx` | ~2,500 |
| File System Deep Dive | `filesystem-deep-dive/index.mdx` | ~3,000 |
| Service Management (systemd) | `systemd-services/index.mdx` | ~2,500 |
| Log Management | `log-management/index.mdx` | ~2,000 |
| Storage Management | `storage-management/index.mdx` | ~2,500 |
| Network Administration | `network-admin/index.mdx` | ~2,500 |

---

### 7. Enterprise Branching (Day 4) → `content/paths/foundations/git/`

**Source:** `Git/enterprise_branching_day_4.md` (4,400 words, 33 code blocks, 0 exercises)

| Source Section | Target Lesson |
|---------------|--------------|
| Branching Strategy Selection Matrix | `branching-strategies/index.mdx` |
| Git Flow | `gitflow/index.mdx` |
| Trunk-Based Development | `trunk-based-dev/index.mdx` |

**What to add:** Exercises and quizzes (currently no hands-on activities)

---

### 8. Git Comprehensive Reference → Distribute across all git lessons

**Source:** `Git/git.md` (18,430 words, 205 code blocks)

This is a comprehensive reference. Extract sections into the appropriate lessons:
- Command reference → appendix or cheat sheet page
- Advanced topics → fill gaps in Day 1-4 content
- Tips and tricks → `<Callout type="tip">` in relevant lessons

---

### 9. Linux Administration Reference

**Source:** `Linux-Shell_Scripting/linux_administration.md` (11,326 words, 93 code blocks)

Complements the hands-on files. Use to fill gaps and add theory to practical lessons.

---

## Migration Steps per File

For each source file:

1. **Read and section** — Identify natural lesson boundaries
2. **Create lesson directories** — `scripts/new-lesson.sh <path> <module> <slug>`
3. **Convert to MDX** — Apply frontmatter, wrap in components
4. **Add missing components:**
   - `<Callout type="story">` at the start
   - `<Exercise>` with `<CollapsibleSolution>` for hands-on parts
   - `<Quiz>` / `<QuizQuestion>` at the end
   - `<TabGroup>` for multi-platform instructions
   - `<Terminal>` for interactive examples
   - Key Takeaways bullet list
   - "What's Next?" section
5. **Create quiz JSON** — `content/quizzes/<path>/<module>/<lesson>.json`
6. **Validate** — Run `pnpm --filter @devops-engineers/content-validator start`
7. **Test** — Build and verify lesson renders correctly

## Estimated Total Effort

| Content Area | Files | Words | Lessons | Effort |
|-------------|-------|-------|---------|--------|
| Git (foundations/git) | 6 | 35,200 | ~12 lessons | 3-4 days |
| Linux (foundations/linux) | 2 | 35,600 | ~9 lessons | 3-4 days |
| Linux Admin (foundations/linux-admin) | 2 | 32,700 | ~9 lessons | 3-4 days |
| Shell Scripting (foundations/shell-scripting) | 1 | 21,700 | ~11 lessons | 2-3 days |
| **Total** | **10** | **107,400** | **~41 lessons** | **11-15 days** |

## Style Changes Required

Every migrated lesson needs these transformations:

1. **Add frontmatter** — title, description, order, xpReward, estimatedMinutes, prerequisites, objectives, tags
2. **Add story opener** — Convert dry introductions to relatable scenarios
3. **Wrap exercises** — Use `<Exercise>` and `<CollapsibleSolution>` components
4. **Add quizzes** — 3-5 questions per lesson testing key concepts
5. **Modernize code blocks** — Add comments, expected output, copy-friendly formatting
6. **Add cross-references** — Link related lessons, prerequisites
7. **Responsive tables** — Ensure all tables work on mobile
8. **Consistent voice** — Second person ("you"), encouraging, practical
