# Local Development Setup & Testing Guide

> Everything you need to run DevOps Engineers locally — from zero to a working dev server.

---

## Prerequisites

| Tool | Minimum | Recommended | Install |
|------|---------|-------------|---------|
| **Node.js** | 20.x | 22.x | [nodejs.org](https://nodejs.org) or `nvm install 22` |
| **pnpm** | 9.x | 10.x | `npm install -g pnpm@10` |
| **Git** | 2.x | Latest | [git-scm.com](https://git-scm.com) |
| **Docker** | 20.x | Latest | [docker.com](https://docs.docker.com/get-docker) (optional — for local Supabase) |

Verify your setup:

```bash
node -v       # v22.x.x
pnpm -v       # 10.x.x
git --version # git version 2.x.x
docker -v     # Docker version 2x.x.x (optional)
```

---

## Quick Start (5 minutes)

```bash
# 1. Clone the repo
git clone https://github.com/vellankikoti/trainings.git
cd trainings

# 2. Run first-time setup
make setup

# 3. Configure environment variables
#    Edit apps/web/.env.local with your Clerk and Supabase keys
#    (see "Environment Variables" section below)

# 4. Start the dev server
make start

# 5. Open in browser
#    The URL will be printed — usually http://localhost:3000
```

That's it. The `make start` command automatically finds a free port if 3000 is occupied.

---

## Makefile Commands

The project includes a Makefile that handles port management, process tracking, and service orchestration.

### Core Commands

| Command | What It Does |
|---------|-------------|
| `make setup` | Install deps, create `.env.local`, run build |
| `make start` | Start dev server on first available port (3000-3010) |
| `make stop` | Stop all running services (graceful shutdown) |
| `make restart` | Stop + Start (picks up config changes) |
| `make status` | Show all running services with ports and PIDs |
| `make logs` | Tail the dev server log file in real-time |
| `make health` | Hit the health endpoint and show results |

### Development Commands

| Command | What It Does |
|---------|-------------|
| `make test` | Run all tests (Vitest) |
| `make test-watch` | Run tests in watch mode |
| `make lint` | Run ESLint + TypeScript type-check |
| `make build` | Run a production build |
| `make clean` | Remove all build artifacts + stop services |

### Database Commands (Requires Docker + Supabase CLI)

| Command | What It Does |
|---------|-------------|
| `make db-start` | Start local Supabase (PostgreSQL, Studio, API) |
| `make db-stop` | Stop local Supabase |
| `make db-reset` | Reset database + re-run all migrations |
| `make db-migrate` | Push pending migrations |

---

## Smart Port Management

The Makefile automatically handles port conflicts:

```
Default port: 3000

If 3000 is busy → tries 3001
If 3001 is busy → tries 3002
...continues through 3010
```

### How it works

1. On `make start`, the Makefile scans ports 3000-3010 using `lsof`
2. The first free port is selected and Next.js is started on it
3. The port is saved to `.pids/next-dev.port` for other commands to reference
4. `make stop` reads the saved port/PID to cleanly shut down the right process
5. Orphan Node/Next processes in the port range are also cleaned up

### Example scenarios

**Port 3000 free (normal case):**
```
$ make start
=== Starting Dev Server ===

  Web App:       http://localhost:3000
  Logs:          .logs/next-dev.log
  Stop:          make stop

✓ Dev server started (PID: 12345, Port: 3000)
```

**Port 3000 occupied (another service running):**
```
$ make start
=== Starting Dev Server ===

⚠  Port 3000 is in use — using port 3001 instead

  Web App:       http://localhost:3001
  Logs:          .logs/next-dev.log
  Stop:          make stop

✓ Dev server started (PID: 12346, Port: 3001)
```

**Already running (no duplicate starts):**
```
$ make start
Dev server is already running on port 3001
  Run make restart to restart, or make stop to stop.
```

---

## Environment Variables

Copy the example file and fill in your keys:

```bash
cp .env.example apps/web/.env.local
```

### Required Variables

You need at minimum **Clerk** and **Supabase** keys to run the app:

```bash
# App URL (auto-set by make start, but define it for env validation)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk — get from https://dashboard.clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Clerk Webhook Secret — only needed if testing webhook sync
# CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Supabase — get from https://app.supabase.com → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
```

### Optional Variables

These enable additional features but aren't required to run:

```bash
# Stripe — enables payment/subscription features
# STRIPE_SECRET_KEY=sk_test_xxxxx

# Resend — enables email sending
# RESEND_API_KEY=re_xxxxx

# Sentry — enables error tracking
# NEXT_PUBLIC_SENTRY_DSN=https://xxx@o0.ingest.sentry.io/0
```

### Using Local Supabase (No Cloud Account Needed)

If you have Docker, you can run Supabase entirely locally:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
make db-start

# The command will print your local keys — use these in .env.local:
# NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (printed by supabase start)
# SUPABASE_SERVICE_ROLE_KEY=eyJ... (printed by supabase start)
```

Local Supabase services:
- **Studio** (database UI): http://localhost:54323
- **API**: http://localhost:54321
- **PostgreSQL**: `localhost:54322` (user: `postgres`, password: `postgres`)

---

## Running the Full Stack Locally

### Option A: Cloud Supabase + Local Next.js (Simplest)

```bash
make start
# Uses your cloud Supabase instance from .env.local
# Only runs the Next.js dev server locally
```

### Option B: Everything Local (Full Offline)

```bash
# Terminal 1: Start Supabase
make db-start

# Terminal 2: Start the app
make start

# Both services running locally — no cloud dependencies except Clerk
```

> **Note**: Clerk authentication always requires internet. There's no local Clerk emulator.

---

## Testing

### Unit Tests

```bash
# Run all tests once
make test

# Run tests in watch mode (re-runs on file changes)
make test-watch
```

The project uses **Vitest** as the test runner. Test files are co-located with source files:

```
apps/web/
  lib/
    utils.ts
    __tests__/
      utils.test.ts
  components/
    dashboard/
      stats-card.tsx
      __tests__/
        stats-card.test.tsx
```

### Linting & Type Checking

```bash
# Run both lint and type-check
make lint

# Or separately via pnpm
pnpm lint        # ESLint
pnpm type-check  # TypeScript compiler (tsc --noEmit)
```

### Production Build Test

```bash
# Simulate what Vercel will build
make build

# If the build succeeds, your code is deploy-ready
```

### Health Check

```bash
# After make start, verify the app is healthy
make health

# Expected output:
#   ✓ Web App (port 3000)         200 OK
#   ✓ Health API                  healthy
```

### Manual API Testing

```bash
# Get the running port
PORT=$(cat .pids/next-dev.port)

# Health endpoint
curl http://localhost:$PORT/api/health | jq .

# Check a lesson page loads
curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/paths/foundations
```

---

## Common Workflows

### "I just pulled new changes"

```bash
pnpm install          # Install any new dependencies
make restart          # Restart the dev server
```

### "I changed environment variables"

```bash
make restart          # Next.js needs a restart to pick up env changes
```

### "I'm getting database errors"

```bash
# Check which Supabase you're pointing to
grep SUPABASE_URL apps/web/.env.local

# If using local Supabase, ensure it's running
make db-start

# Reset and re-run migrations if schema is out of sync
make db-reset
```

### "Port 3000 is stuck / zombie process"

```bash
# Stop everything cleanly (also kills orphan Node processes)
make stop

# Check what's running
make status

# Nuclear option: kill everything on port 3000
lsof -ti :3000 | xargs kill -9
```

### "I want to test the production build"

```bash
make build                                    # Build
cd apps/web && pnpm start                     # Start production server
# Opens on http://localhost:3000
```

### "I want to run a specific test file"

```bash
cd apps/web && pnpm exec vitest run lib/__tests__/utils.test.ts
```

---

## Project Structure

```
trainings/
├── Makefile                  ← Local dev orchestration
├── package.json              ← Root monorepo config
├── pnpm-workspace.yaml       ← Workspace definition
├── turbo.json                ← Turborepo task graph
├── .env.example              ← Template for env vars
├── .nvmrc                    ← Node.js version (22)
│
├── apps/
│   └── web/                  ← Next.js application
│       ├── app/              ← App Router pages & layouts
│       ├── components/       ← React components
│       ├── lib/              ← Utilities, Supabase client, env validation
│       ├── .env.local        ← Your local environment variables (gitignored)
│       └── next.config.mjs   ← Next.js configuration
│
├── content/                  ← Learning content (MDX lessons)
│   └── paths/                ← Learning paths (foundations, docker, etc.)
│
├── supabase/
│   ├── config.toml           ← Local Supabase configuration
│   └── migrations/           ← Database schema migrations
│
├── scripts/                  ← Utility scripts
├── docs/                     ← Documentation
├── labs/                     ← Hands-on lab environments
│
├── .pids/                    ← PID files (gitignored, created by Makefile)
└── .logs/                    ← Log files (gitignored, created by Makefile)
```

---

## Troubleshooting

### `make start` says "No free port found"

All ports 3000-3010 are occupied. Check what's using them:

```bash
make status
# Shows all processes on ports 3000-3010

# Kill everything in the range
make stop
```

### `SKIP_ENV_VALIDATION` errors during build

The build requires environment variables. The Makefile sets `SKIP_ENV_VALIDATION=true` automatically for `make build`, `make test`, and `make lint`. If running pnpm directly:

```bash
SKIP_ENV_VALIDATION=true pnpm build
```

### `Module not found` errors

Dependencies might be out of sync:

```bash
pnpm install
make restart
```

### Supabase won't start

```bash
# Ensure Docker is running
docker info

# Check for port conflicts
lsof -i :54321 -i :54322 -i :54323

# Full reset
supabase stop --no-backup
supabase start
```

### Hot reload not working

Next.js hot reload uses file watching. On Linux, you may need to increase the inotify watch limit:

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Tests fail with "Cannot find module"

Run a build first — some test files depend on generated types:

```bash
make build
make test
```

---

## Service URLs Reference

| Service | URL | When |
|---------|-----|------|
| Web App | `http://localhost:3000` (or next free port) | `make start` |
| Supabase Studio | `http://localhost:54323` | `make db-start` |
| Supabase API | `http://localhost:54321` | `make db-start` |
| PostgreSQL | `localhost:54322` | `make db-start` |

---

*For production deployment, see [deployment-guide.md](./deployment-guide.md).*
