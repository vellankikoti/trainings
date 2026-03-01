# Operations Runbook

## Quick Reference

| Service | Dashboard | Status |
|---------|-----------|--------|
| App (Vercel) | vercel.com/dashboard | Check deployments |
| Database (Supabase) | supabase.com/dashboard | Check health |
| Auth (Clerk) | clerk.com/dashboard | Check users |
| Errors (Sentry) | sentry.io | Check error rates |
| Health Check | `GET /api/health` | Should return 200 |

## Deployment

### Standard Deployment

Deployments are automated via Vercel:

1. Push to `main` branch triggers production deployment
2. Push to any other branch triggers preview deployment
3. Monitor build in Vercel Dashboard

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs <deployment-url>
```

### Rollback

If a deployment causes issues:

1. **Vercel Dashboard > Deployments** — find the last working deployment
2. Click **"Promote to Production"** on the last known good deployment
3. This is instant (no rebuild required)

Alternatively via CLI:
```bash
# List recent deployments
vercel ls

# Promote a specific deployment to production
vercel promote <deployment-url>
```

## Health Checks

### Application Health

```bash
# Check health endpoint
curl -s https://devops-engineers.com/api/health | jq .

# Expected response (healthy):
# {
#   "status": "healthy",
#   "timestamp": "2026-03-01T00:00:00Z",
#   "version": "1.0.0",
#   "checks": {
#     "database": "connected",
#     "auth": "configured"
#   }
# }
```

### Database Health

```bash
# Check via Supabase dashboard or:
curl -s https://<project-ref>.supabase.co/rest/v1/ \
  -H "apikey: <anon-key>" \
  -H "Authorization: Bearer <anon-key>"
```

## Common Issues

### 1. 503 Service Unavailable

**Symptoms:** Users see 503 errors, health check returns degraded status

**Possible causes:**
- Supabase database is down or rate-limited
- Vercel function cold start timeout
- Environment variables misconfigured

**Resolution:**
1. Check `/api/health` — look at which check is failing
2. Check Supabase Dashboard for database status
3. Check Vercel Dashboard for function errors
4. Verify environment variables in Vercel project settings

### 2. Authentication Errors

**Symptoms:** Users cannot sign in, 401 errors on API routes

**Possible causes:**
- Clerk service disruption
- Clerk API keys rotated but not updated in Vercel
- Middleware misconfiguration

**Resolution:**
1. Check Clerk status page
2. Verify `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in Vercel env vars
3. Check middleware.ts for correct route matchers

### 3. Slow Page Loads

**Symptoms:** TTFB > 3 seconds, users report slow loading

**Possible causes:**
- Database queries slow (missing indexes)
- Large MDX content not cached
- Vercel function cold starts

**Resolution:**
1. Check Vercel Analytics for slow routes
2. Check Supabase Dashboard > SQL Editor for slow queries
3. Review Sentry performance traces for bottlenecks

### 4. Rate Limiting Triggering for Legitimate Users

**Symptoms:** Users report 429 Too Many Requests

**Resolution:**
1. Check the rate limit configuration in `apps/web/lib/rate-limit.ts`
2. Adjust limits if they're too aggressive
3. The in-memory rate limiter resets on deployment (Vercel function restart)

### 5. Quiz Submission Failures

**Symptoms:** Users report quiz scores not saving

**Possible causes:**
- Rate limit hit
- Database write failure
- Invalid quiz data

**Resolution:**
1. Check Sentry for errors on `/api/quiz/submit`
2. Verify quiz JSON files are valid
3. Check Supabase RLS policies on `quiz_attempts` table

## Accessing Logs

### Vercel Function Logs

```bash
# View real-time logs
vercel logs --follow

# View logs for specific deployment
vercel logs <deployment-url>
```

Or via Vercel Dashboard > Project > Logs

### Supabase Logs

- **Dashboard > Logs > API** — REST API request logs
- **Dashboard > Logs > Postgres** — Database query logs
- **Dashboard > Logs > Auth** — Authentication event logs

### Sentry Error Logs

- **Issues** — Grouped errors with frequency and affected users
- **Performance** — Transaction traces with timing breakdown
- **Releases** — Errors per deployment/release

## Environment Variables

### Required (Server-side)

| Variable | Description | Where to Set |
|----------|-------------|-------------|
| `CLERK_SECRET_KEY` | Clerk backend key | Vercel env vars |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key | Vercel env vars |
| `CLERK_WEBHOOK_SECRET` | Webhook signature secret | Vercel env vars |

### Required (Client-side)

| Variable | Description | Where to Set |
|----------|-------------|-------------|
| `NEXT_PUBLIC_APP_URL` | Application URL | Vercel env vars |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key | Vercel env vars |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Vercel env vars |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Vercel env vars |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | Vercel env vars |

### Managing Environment Variables

```bash
# List all env vars
vercel env ls

# Add a new env var
vercel env add VARIABLE_NAME

# Remove an env var
vercel env rm VARIABLE_NAME
```

**Important:** After changing env vars, trigger a new deployment for changes to take effect.

## Monitoring Dashboards

### Key Metrics to Watch

| Metric | Normal Range | Alert Threshold |
|--------|-------------|-----------------|
| Error rate | < 0.5% | > 1% |
| API p95 latency | < 500ms | > 1000ms |
| Health check | 200 | 503 |
| Active users | Varies | Sudden drop > 50% |

### Sentry Alerts (Configured)

- Error rate exceeds 1% of transactions
- New unhandled exception appears
- 5xx response rate exceeds 0.5%
