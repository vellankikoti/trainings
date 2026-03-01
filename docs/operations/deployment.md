# Deployment Guide

## CI/CD Flow

```
Feature Branch → Pull Request → Review → Merge to main → Vercel Auto-Deploy
```

### Branch Strategy

| Branch | Purpose | Deploys To |
|--------|---------|-----------|
| `main` | Production code | Production (auto) |
| `develop` | Integration branch | Staging (if configured) |
| `feature/*` | Feature development | Preview (auto on PR) |
| `hotfix/*` | Emergency fixes | Production (via PR to main) |

## Deployment Process

### Standard Feature Deployment

1. **Develop** on a feature branch
2. **Create PR** against `main`
3. **CI checks** run automatically (lint, type-check, tests, build)
4. **Preview deployment** created by Vercel for the PR
5. **Review** the PR and preview deployment
6. **Merge** PR to `main`
7. **Production deployment** triggers automatically
8. **Monitor** Sentry and health check for 15 minutes

### Hotfix Deployment

For urgent production fixes:

1. Create `hotfix/description` branch from `main`
2. Implement the fix
3. Create PR with `[HOTFIX]` in the title
4. Get expedited review
5. Merge to `main`
6. Monitor deployment closely

### Database Migration Deployment

When a deployment includes database changes:

1. **Before merging:** Apply migration to staging
   ```bash
   supabase link --project-ref <staging-ref>
   supabase db push
   ```
2. **Verify** staging works correctly
3. **Apply to production**
   ```bash
   supabase link --project-ref <production-ref>
   supabase db push
   ```
4. **Then merge** the application code that uses the new schema
5. **Monitor** for any database errors

**Important:** Always deploy database changes before application changes that depend on them.

## Pre-Deployment Checklist

- [ ] All CI checks pass (lint, type-check, tests, build)
- [ ] Preview deployment reviewed and tested
- [ ] No unresolved review comments
- [ ] Database migrations applied (if applicable)
- [ ] Environment variables set (if new ones needed)
- [ ] No security vulnerabilities (`pnpm audit`)

## Post-Deployment Verification

After each production deployment:

1. **Health check:** `curl https://devops-engineers.com/api/health`
2. **Smoke test:** Visit homepage, sign in, navigate to a lesson
3. **Monitor Sentry:** Watch for new errors in the first 15 minutes
4. **Check Vercel Analytics:** Verify no performance regression

## Rollback

### Instant Rollback via Vercel

1. Go to **Vercel Dashboard > Deployments**
2. Find the last working deployment
3. Click the three-dot menu > **"Promote to Production"**
4. The rollback is instant (no rebuild)

### Code Rollback

If a Vercel rollback isn't sufficient:

```bash
# Revert the problematic commit
git revert <commit-hash>

# Push the revert
git push origin main
```

### Database Rollback

See [Database Migrations](./database-migrations.md) for rollback procedures.

## Environment Variable Management

### Adding New Environment Variables

1. Add to Vercel project settings (Production, Preview, Development)
2. Document in `apps/web/lib/env.ts` with Zod validation
3. Add to `.env.example` file
4. Update this documentation

### Rotating Secrets

1. Generate new secret in the provider's dashboard
2. Update in Vercel environment variables
3. Trigger a new deployment
4. Verify the old secret is no longer used
5. Revoke the old secret

## Feature Flags

For gradual rollouts, use environment variables as feature flags:

```typescript
// In your code
const isFeatureEnabled = process.env.NEXT_PUBLIC_FEATURE_X === "true";
```

Set `NEXT_PUBLIC_FEATURE_X=true` in Vercel to enable.
