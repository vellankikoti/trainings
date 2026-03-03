# LMS Navigation Architecture Redesign

## Document Type: Structural UX Architecture Specification
## Status: Ready for Review

---

## 1. UX AUDIT — What's Broken and Why

### Critical Failure 1: Path Context Leaks Into Course/Lesson Views

**Current behavior:** When a user enters a lesson at `/learn/foundations/linux/01-the-linux-story`, the sidebar shows:
- "Back to Path" link
- "Foundations" title (the PATH, not the COURSE)
- Path-level progress bar (0% of 99 lessons across ALL modules)
- ALL 6 modules of the Foundations path, expandable
- User can navigate to any lesson in ANY module of the path

**Why this is wrong:** The user clicked "Start Course" on Linux Fundamentals. They are inside a COURSE. But the entire path structure is bleeding into their course experience. They can switch courses from inside a lesson. Path management is exposed in course context.

**Root cause:** `app/learn/[path]/layout.tsx` fetches ALL modules for the entire path and passes them to `LearningShell`. This layout wraps both Course Overview AND Lesson pages. There is no course-level layout isolation.

### Critical Failure 2: Header Shows Wrong Context

**Current behavior:** `LearningShell` passes `pathTitle` as `courseTitle` to `LearningHeader`.
- Header displays "Foundations" (the PATH name)
- Progress bar shows PATH progress (0% of 99 total lessons)
- "Course" back link goes to `/paths/foundations` (marketing page)

**Why this is wrong:** The user is inside "Linux Fundamentals" (a COURSE with 20 lessons). The header should show "Linux Fundamentals" with progress "0/20 completed". Instead it shows the macro PATH container with an overwhelming 0/99 denominator.

### Critical Failure 3: "Back to Path" Exits Learning Mode

**Current behavior:** Every "back" link in learning mode goes to `/paths/{slug}`, which is the MARKETING path detail page. This includes:
- Sidebar header "Back to Path"
- Learning header "Course" back link
- Lesson breadcrumb first link
- Course Overview back link

**Why this is wrong:** Clicking "back" from a lesson should keep you in learning mode. Going to a marketing page breaks the context, changes the layout, removes the sidebar, and shows sign-up CTAs. The user must re-enter learning mode manually.

### Critical Failure 4: No Course-Level Isolation

**Current behavior:** The sidebar is path-scoped. It shows all 6 modules with all their lessons. A user studying "Linux Fundamentals" can see and navigate to "Docker Fundamentals" lessons from the sidebar.

**Why this is wrong:** This violates focus. A course is an independent learning unit. While inside a course, the user should see ONLY that course's lessons. Switching courses is a path-level operation that belongs in a path dashboard.

### Critical Failure 5: No Learning Mode Path Dashboard

**Current behavior:** There is no `/learn/[path]` page. The path layout renders children directly. To see all courses in a path while in learning mode, the user must exit to the marketing page (`/paths/{slug}`).

**Why this is wrong:** The user has no "home base" within learning mode to manage their path. They're trapped in a course with no clean way to see sibling courses without breaking context.

### Critical Failure 6: Progress Denominators Are Misleading

**Current behavior:** Sidebar footer shows "0 of 99 lessons completed" when inside Linux Fundamentals.

**Why this is wrong:** The user is in a 20-lesson course. Showing 99 (the entire path count) makes progress feel insurmountable. The denominator should be 20. Path-level progress belongs on the Path Dashboard, not inside a course.

### Critical Failure 7: "Start Course" Has No Resume Intelligence

**Current behavior:** Course Overview "Start Course" button always links to the first incomplete lesson in that module. But the pathway into the course (from path detail page) links to the first module overview.

**Why this is wrong (partial):** The Course Overview page does handle resume correctly. But the path detail page "Explore Courses" CTA links to the first module overview rather than resuming the user's most recent course. This is a secondary issue.

### Critical Failure 8: Breadcrumbs Link to Marketing Pages

**Current behavior:** Lesson breadcrumb: `Foundations > Linux Fundamentals > The Linux Story`
- "Foundations" links to `/paths/foundations` (marketing page)
- "Linux Fundamentals" links to `/learn/foundations/linux` (course overview) — correct
- "The Linux Story" is current page

**Why this is wrong:** The first breadcrumb segment exits learning mode. Breadcrumbs in learning mode should NEVER navigate to marketing pages. They should stay within the learning context.

---

## 2. CORRECT INFORMATION ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    GLOBAL NAVIGATION                      │
│  Dashboard  |  Courses  |  Paths  |  [UserAvatar]        │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │  DASHBOARD   │ │ ALL COURSES │ │  ALL PATHS   │
   │ /dashboard   │ │ /courses    │ │ /paths       │
   │              │ │              │ │              │
   │ Continue     │ │ Browse all   │ │ Browse all   │
   │ Learning     │ │ courses      │ │ paths        │
   │ My Progress  │ │ globally     │ │              │
   └──────┬───────┘ └──────────────┘ └──────┬───────┘
          │                                  │
          ▼                                  ▼
   ┌──────────────────────────────────────────────┐
   │         LEARNING PATH DASHBOARD               │
   │         /learn/{path}                         │
   │                                               │
   │  Path Title + Description                     │
   │  Overall Path Progress (X/6 courses)          │
   │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
   │  │ Course 1 │ │ Course 2 │ │ Course 3 │     │
   │  │ Progress │ │ Progress │ │ Progress │     │
   │  │ [Resume] │ │ [Start]  │ │ [Start]  │     │
   │  └────┬─────┘ └──────────┘ └──────────┘     │
   │       │                                       │
   └───────┼───────────────────────────────────────┘
           │
           ▼  (User clicks Start/Resume Course)
   ┌──────────────────────────────────────────────┐
   │         COURSE MODE (ISOLATED)                │
   │                                               │
   │  ┌──────────┐  ┌───────────────────────────┐ │
   │  │ SIDEBAR   │  │  MAIN CONTENT              │ │
   │  │           │  │                            │ │
   │  │ Course    │  │  Course Overview           │ │
   │  │ Title     │  │  /learn/{path}/{module}    │ │
   │  │           │  │                            │ │
   │  │ Lessons:  │  │  OR                        │ │
   │  │ 01 ✓      │  │                            │ │
   │  │ 02 ▶      │  │  Lesson Page               │ │
   │  │ 03 ○      │  │  /learn/{path}/{mod}/{les} │ │
   │  │ ...       │  │                            │ │
   │  │           │  │                            │ │
   │  │ Course    │  │                            │ │
   │  │ Progress  │  │                            │ │
   │  │ 1/20      │  │                            │ │
   │  └──────────┘  └───────────────────────────┘ │
   │                                               │
   │  NO PATH CONTROLS.                            │
   │  NO "BACK TO PATH" PRIMARY.                   │
   │  NO PATH PROGRESS BAR.                        │
   │  NO MODULE SWITCHING.                         │
   └───────────────────────────────────────────────┘
```

---

## 3. NAVIGATION STATE MACHINE

```
States:
  [Dashboard]  [PathCatalog]  [CourseCatalog]
  [PathDashboard]  [CourseView]  [LessonView]

Transitions (arrows show allowed navigation):

  Dashboard ──────────► PathDashboard
       │                     │
       │                     ├──► CourseView
       │                     │       │
       │                     │       ├──► LessonView
       │                     │       │       │
       │                     │       │       ├──► LessonView (next/prev)
       │                     │       │       │
       │                     │       │       └──► CourseView (back/complete)
       │                     │       │
       │                     │       └──► PathDashboard (exit course)
       │                     │
       │                     └──► Dashboard (back)
       │
       ├──────────► PathCatalog ──► PathDashboard
       │
       └──────────► CourseCatalog ──► CourseView


FORBIDDEN transitions:
  ✗  LessonView → PathDashboard  (must go through CourseView)
  ✗  LessonView → PathCatalog    (must exit course first)
  ✗  LessonView → other Course   (must exit course, go to path, pick new course)
  ✗  CourseView → other Course   (must exit to PathDashboard first)
  ✗  Any learning view → Marketing page  (stay in learning mode)
```

### State Properties

| State | Layout | Sidebar | Header | URL Pattern |
|-------|--------|---------|--------|-------------|
| Dashboard | AppLayout | None | Global nav | `/dashboard` |
| PathCatalog | MarketingLayout | None | Global nav | `/paths` |
| CourseCatalog | MarketingLayout | None | Global nav | `/courses` |
| PathDashboard | LearningLayout | Path courses list | Path header | `/learn/{path}` |
| CourseView | CourseLayout | Course lessons only | Course header | `/learn/{path}/{module}` |
| LessonView | CourseLayout | Course lessons only | Course header | `/learn/{path}/{mod}/{les}` |

---

## 4. ROUTING ARCHITECTURE PROPOSAL

### Current (Broken)
```
/learn/[path]/                    → layout.tsx (PATH scope — wraps EVERYTHING)
  /learn/[path]/[module]/         → page.tsx (Course Overview)
  /learn/[path]/[module]/[lesson] → page.tsx (Lesson)
```
Problem: One layout for path scope. Course and lesson share path context.

### Proposed (Fixed)
```
/learn/[path]/                    → layout.tsx (PATH scope — light wrapper)
                                    page.tsx  (Path Dashboard — NEW)

/learn/[path]/[module]/           → layout.tsx (COURSE scope — NEW)
                                    page.tsx  (Course Overview)

/learn/[path]/[module]/[lesson]/  → page.tsx  (Lesson)
```

### Key Structural Changes

1. **NEW: `/learn/[path]/page.tsx`** — Learning Path Dashboard
   - Shows all courses in path with progress
   - User manages course selection HERE, not inside course
   - Path-level progress bar lives HERE

2. **NEW: `/learn/[path]/[module]/layout.tsx`** — Course Layout
   - Wraps CourseOverview AND Lesson pages
   - Provides COURSE-scoped sidebar (lessons of THIS module only)
   - Shows COURSE title and COURSE progress in header
   - Completely isolated from path context

3. **CHANGED: `/learn/[path]/layout.tsx`** — Simplified
   - Minimal wrapper: SkipToContent + slot for children
   - Does NOT render sidebar or learning header
   - Path Dashboard gets its own layout inline
   - Course Layout (in [module]) handles the full learning UI

---

## 5. LAYOUT RESPONSIBILITY MATRIX

| Layout | Renders | Sidebar | Header | Progress Scope | Back Link |
|--------|---------|---------|--------|---------------|-----------|
| `MarketingLayout` | Marketing pages | None | Global Header | None | N/A |
| `PathLayout` (learn/[path]) | Minimal wrapper | None | None | None | N/A |
| `PathDashboard` (learn/[path]/page) | Path courses | None (inline) | Learning header (path title) | Path level | ← Dashboard |
| `CourseLayout` (learn/[path]/[module]) | Course shell | Course lessons ONLY | Learning header (course title) | Course level (X/20) | ← Path Dashboard |
| Lesson Page (inside CourseLayout) | Lesson content | Inherited from CourseLayout | Inherited from CourseLayout | Inherited | Inherited |

### What Each Layer Is Responsible For

**PathLayout (`/learn/[path]/layout.tsx`)**
- Validates path exists → notFound() if not
- Provides pathSlug to children via layout
- Renders children directly (no shell)

**PathDashboard (`/learn/[path]/page.tsx`)** — NEW
- Fetches all modules for this path
- Fetches user's progress per module
- Renders course cards with progress
- "Resume" / "Start" / "Review" buttons per course
- Path-level progress summary
- Back link: ← Dashboard (`/dashboard`)

**CourseLayout (`/learn/[path]/[module]/layout.tsx`)** — NEW
- Fetches module metadata + lessons
- Fetches user's completed lessons for THIS module only
- Calculates course-level progress (X/20)
- Renders LearningHeader with COURSE title and COURSE progress
- Renders CourseSidebar with THIS module's lessons only
- No path modules. No path progress. No path switching.
- Back link in header: ← Path name (`/learn/{path}`)

**CourseOverview (`/learn/[path]/[module]/page.tsx`)**
- Rendered inside CourseLayout
- Shows syllabus, stats, CTA button
- Resume logic: first incomplete lesson

**LessonPage (`/learn/[path]/[module]/[lesson]/page.tsx`)**
- Rendered inside CourseLayout
- Inherits sidebar showing course lessons
- Breadcrumb: `Course Title > Lesson Title` (NO path link)
- Prev/Next navigation within course
- Completion flow with reflection modal

---

## 6. RESUME LOGIC FLOW

```
User clicks "Start Course" or "Continue" on any course card:

  1. Fetch lesson_progress WHERE user_id AND path_slug AND module_slug
  2. Get list of completed lesson slugs
  3. Get ordered lesson list from module metadata

  IF no completed lessons:
    → Navigate to /learn/{path}/{module}/{first-lesson}

  IF some completed, some remaining:
    → Find first lesson NOT in completed set (by order)
    → Navigate to /learn/{path}/{module}/{resume-lesson}

  IF all completed:
    → Navigate to /learn/{path}/{module} (Course Overview — review mode)
    → CTA button shows "Review Course"
```

### Resume Entry Points

| Entry Point | What Happens |
|-------------|-------------|
| Dashboard "Continue Learning" card | → Resume most recent path's most recent course's resume lesson |
| Path Dashboard course card "Continue" | → Resume that specific course's resume lesson |
| Course Overview "Continue" button | → Resume that course's first incomplete lesson |
| Direct URL `/learn/{path}/{module}/{lesson}` | → Shows that lesson (deep link works) |
| Direct URL `/learn/{path}/{module}` | → Shows Course Overview |
| Direct URL `/learn/{path}` | → Shows Path Dashboard |

---

## 7. PERMANENT FIX PLAN — Step-by-Step Refactor

### Step 1: Create Path Dashboard Page
**File:** `app/learn/[path]/page.tsx` (NEW)
- Server component
- Fetches path metadata + all modules
- Fetches user progress per module
- Renders grid of course cards with progress
- Resume/Start/Review button per course
- Back link to `/dashboard`
- NO sidebar, NO learning shell

### Step 2: Create Course Layout
**File:** `app/learn/[path]/[module]/layout.tsx` (NEW)
- Server component
- Fetches THIS module's metadata + lessons ONLY
- Fetches user's completed lessons for THIS module ONLY
- Calculates course-level progress
- Renders CourseShell (new client component) with:
  - CourseHeader (course title, course progress, back to path)
  - CourseSidebar (THIS course's lessons only)
  - Children slot for CourseOverview or LessonPage

### Step 3: Create CourseShell Component
**File:** `components/learn/CourseShell.tsx` (NEW, replaces LearningShell)
- Client component
- Props: moduleSlug, moduleTitle, pathSlug, pathTitle, lessons, completedLessons, courseProgress
- Manages sidebar state
- Renders CourseHeader + CourseSidebar + children
- CourseSidebar shows ONLY this course's lessons (flat list, no accordion)

### Step 4: Create CourseSidebar Component
**File:** `components/learn/CourseSidebar.tsx` (NEW, replaces LearningSidebar)
- Shows course title at top
- Flat lesson list with status indicators
- Course progress bar at top (X/20 lessons)
- Back link: ← {PathTitle} → `/learn/{path}` (Path Dashboard)
- Footer: "X of Y lessons completed" (course scope)
- NO modules. NO accordion. NO path switching.

### Step 5: Create CourseHeader Component
**File:** `components/layout/CourseHeader.tsx` (NEW, replaces LearningHeader)
- Left: Sidebar toggle + "← {PathTitle}" back link + Course title
- Right: Course progress (X/20) + Theme toggle + UserButton
- Back link goes to `/learn/{path}` (Path Dashboard, NOT marketing page)

### Step 6: Simplify Path Layout
**File:** `app/learn/[path]/layout.tsx` (MODIFIED)
- Remove LearningShell rendering
- Remove all module fetching for sidebar
- Become minimal wrapper: validate path exists, render children
- The CourseLayout (in [module]) handles the full shell

### Step 7: Update Course Overview Page
**File:** `app/learn/[path]/[module]/page.tsx` (MODIFIED)
- Remove breadcrumb back link to `/paths/{slug}`
- Remove redundant "< {PathTitle}" link (now in sidebar header)
- Remove redundant stats fetching (now done by CourseLayout)
- Simplify to just: syllabus + CTA + stats display
- Read context from CourseLayout props

### Step 8: Update Lesson Page
**File:** `app/learn/[path]/[module]/[lesson]/page.tsx` (MODIFIED)
- Breadcrumb: `{CourseTitle} > {LessonTitle}` (just 2 levels)
- Remove path link from breadcrumb (no `/paths/{slug}` link)
- Module badge links to `/learn/{path}/{module}` (course overview)
- Everything else stays the same

### Step 9: Update Marketing Path Detail Page
**File:** `app/(marketing)/paths/[path]/page.tsx` (MODIFIED)
- "Explore Courses" → links to `/learn/{path}` (Path Dashboard)
- Module cards → link to `/learn/{path}/{module}` (Course Overview)
- For authenticated users with progress: "Continue" → resume logic

### Step 10: Deprecate Old Components
- Mark `LearningShell.tsx` as deprecated → replaced by `CourseShell.tsx`
- Mark `LearningSidebar.tsx` as deprecated → replaced by `CourseSidebar.tsx`
- Mark `LearningHeader.tsx` as deprecated → replaced by `CourseHeader.tsx`
- Remove after confirming new system works

---

## 8. EDGE CASE HANDLING

### Deep Linking
**Scenario:** User shares URL `/learn/foundations/linux/05-terminal-mastery`
- Path layout validates `foundations` exists
- Course layout validates `linux` module exists and fetches its lessons
- Lesson page validates `05-terminal-mastery` exists
- Sidebar shows Linux Fundamentals lessons with lesson 5 highlighted
- User is in COURSE mode, not path mode
- Works correctly because CourseLayout is self-contained

### Browser Back Button
**Scenario:** User goes Dashboard → Path Dashboard → Course → Lesson → Back → Back → Back
- Lesson → Back → Course Overview (CourseLayout preserved)
- Course Overview → Back → Path Dashboard (exits CourseLayout)
- Path Dashboard → Back → Dashboard (exits learning mode)
- Predictable stack. No marketing page surprise.

### Module Not Found
**Scenario:** Invalid module slug in URL
- CourseLayout calls `getModule(pathSlug, moduleSlug)` → returns null
- Triggers `notFound()` → shows 404

### All Lessons Completed
**Scenario:** User completes every lesson in a course
- Course Overview shows "Review Course" button instead of "Continue"
- Button links to first lesson (review mode)
- Sidebar shows all green checkmarks
- Progress shows 20/20 (100%)

### User Not Authenticated
**Scenario:** Logged-out user accesses `/learn/foundations/linux/01-the-linux-story`
- Middleware catches `/learn(.*)` route
- Redirects to sign-in page
- After sign-in, user returns to exact URL they requested

### Path With Single Course
**Scenario:** A path has only 1 module
- Path Dashboard still shows as a single-card layout
- User clicks the one course card
- Enters CourseLayout normally
- No special case needed

### Mobile Sidebar
**Scenario:** User on phone toggles sidebar
- CourseSidebar opens as overlay with backdrop
- Clicking a lesson closes sidebar and navigates
- Escape key closes sidebar
- Same behavior as current but with course-scoped content

---

## 9. FINAL EXPECTED USER JOURNEY — Perfect Flow

### Journey 1: New User Starting First Course

```
1. User logs in
   → Redirected to /dashboard

2. Dashboard shows "Getting Started" prompt
   → User clicks "Explore Paths"
   → Navigates to /paths

3. User clicks "Foundations" path
   → Navigates to /paths/foundations (marketing overview)
   → Sees 6 courses, descriptions, time estimates
   → Clicks "Get Started" or course card

4. Enters /learn/foundations (Path Dashboard)
   ┌─────────────────────────────────────┐
   │  ← Dashboard                         │
   │  Foundations Path                     │
   │  0/6 courses started                 │
   │                                       │
   │  [Linux Fundamentals]  [Git]          │
   │   20 lessons • 55h      12 lessons   │
   │   [Start Course]        [Start]       │
   │                                       │
   │  [Networking]  [Shell Scripting]      │
   │   ...           ...                   │
   └─────────────────────────────────────┘

5. User clicks "Start Course" on Linux Fundamentals
   → Navigates to /learn/foundations/linux/01-the-linux-story

6. Enters Course Mode
   ┌──────────┬─────────────────────────┐
   │ SIDEBAR   │ LESSON CONTENT           │
   │           │                          │
   │ Linux     │ The Linux Story          │
   │ Fundmtls  │                          │
   │           │ Breadcrumb:              │
   │ 0/20      │ Linux Fundamentals >     │
   │ ━━━━○     │ The Linux Story          │
   │           │                          │
   │ ▶ 01 The  │ [content...]            │
   │   Linux   │                          │
   │   Story   │ [Mark Complete +25XP]    │
   │           │                          │
   │ ○ 02 Arch │ [Next: Linux Arch →]    │
   │ ○ 03 Boot │                          │
   │ ○ 04 Inst │                          │
   │ ...       │                          │
   │           │                          │
   │ ← Fndtns │                          │
   └──────────┴─────────────────────────┘

   NOTICE:
   - Sidebar shows ONLY Linux Fundamentals lessons
   - No Git lessons, no Networking lessons
   - Progress: 0/20 (not 0/99)
   - Header: "Linux Fundamentals" (not "Foundations")
   - Back link: "← Foundations" goes to /learn/foundations (Path Dashboard)
   - No marketing page links anywhere

7. User completes lesson, clicks "Next"
   → Navigates to /learn/foundations/linux/02-linux-architecture
   → Sidebar updates: lesson 01 shows ✓, lesson 02 shows ▶
   → Progress: 1/20

8. User wants to switch to Git course
   → Clicks "← Foundations" in sidebar
   → Returns to /learn/foundations (Path Dashboard)
   → Sees Linux Fundamentals: 1/20 progress
   → Clicks "Start Course" on Git
   → Enters /learn/foundations/git/01-the-git-story
   → Sidebar now shows ONLY Git lessons
```

### Journey 2: Returning User Resuming

```
1. User logs in
   → Redirected to /dashboard
   → Dashboard shows "Continue Learning" card:
     "Linux Fundamentals — Lesson 5 of 20"
     [Continue →]

2. User clicks Continue
   → Navigates to /learn/foundations/linux/05-terminal-mastery
   → Instantly in Course Mode
   → Sidebar: Linux Fundamentals, lessons 1-4 checked, lesson 5 current
   → Header: "Linux Fundamentals" • 4/20 • 20%
   → No path dashboard needed — they went straight to their lesson
```

### Journey 3: Browsing All Courses Globally

```
1. From dashboard nav, user clicks "Courses"
   → Navigates to /courses
   → Sees all courses across all paths
   → Filters by difficulty, searches

2. User clicks "Docker Fundamentals" course card
   → Navigates to /learn/containerization/docker-fundamentals
     (Course Overview within CourseLayout)
   → Sees syllabus, 15 lessons, estimated time
   → Clicks "Start Course"
   → Enters /learn/containerization/docker-fundamentals/01-the-docker-story
   → Sidebar: Docker Fundamentals lessons only
```

---

## Appendix: Component Mapping (Old → New)

| Old Component | New Component | Scope Change |
|---------------|---------------|-------------|
| `LearningShell` | `CourseShell` | Path scope → Course scope |
| `LearningSidebar` | `CourseSidebar` | All path modules → Single course lessons |
| `LearningHeader` | `CourseHeader` | Path title/progress → Course title/progress |
| `learn/[path]/layout.tsx` | `learn/[path]/layout.tsx` | Full shell → Minimal wrapper |
| (none) | `learn/[path]/page.tsx` | Path Dashboard (NEW) |
| (none) | `learn/[path]/[module]/layout.tsx` | Course Layout (NEW) |

## Appendix: Navigation Labels

| Location | Label | Destination | Context |
|----------|-------|-------------|---------|
| CourseSidebar top | ← {PathTitle} | `/learn/{path}` | Exit course → path dashboard |
| CourseHeader back | ← {PathTitle} | `/learn/{path}` | Exit course → path dashboard |
| PathDashboard back | ← Dashboard | `/dashboard` | Exit path → app dashboard |
| Lesson breadcrumb | {CourseTitle} | `/learn/{path}/{module}` | Course overview |
| Lesson breadcrumb | {LessonTitle} | (current) | Current page |
| Course Overview | Syllabus items | `/learn/{path}/{mod}/{les}` | Enter lesson |

---

End of specification.
