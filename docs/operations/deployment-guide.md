# DevOps Engineers — Production Deployment Guide

> **Goal**: Deploy the platform to `vellanki.in` using Vercel.
> **Stack**: Next.js 14 + Vercel + Supabase + Clerk + Cloudflare + Stripe + Resend + Sentry

---

## Cost Breakdown

| Service | Purpose | Tier | Cost |
|---------|---------|------|------|
| **Vercel** | Hosting & Deployment | Hobby (Free) / Pro ($20/mo) | $0–$20/mo |
| **Supabase** | PostgreSQL Database | Free | $0/mo |
| **Clerk** | Authentication | Free (10k MAU) | $0/mo |
| **Cloudflare** | DNS & DDoS Protection | Free | $0/mo |
| **GitHub** | Version Control & CI/CD | Free | $0/mo |
| **Resend** | Transactional Email | Free (3k emails/mo) | $0/mo |
| **Sentry** | Error Tracking | Developer (Free) | $0/mo |
| **Stripe** | Payments | Pay-as-you-go | 2.9% + 30c per txn |
| **Domain** | vellanki.in | Cloudflare Registrar | ~$12/yr ($1/mo) |
| | | **Total** | **~$1/mo** (Hobby) or **~$21/mo** (Pro) |

---

## Architecture

```
                  ┌───────────────────┐
                  │  Cloudflare DNS   │
                  │  vellanki.in      │
                  │  (Free)           │
                  └────────┬──────────┘
                           │
                  ┌────────▼──────────┐
                  │     Vercel        │
                  │  ┌──────────────┐ │
                  │  │   Next.js    │ │
                  │  │   App        │ │
                  │  │  (Edge/Node) │ │
                  │  └──────────────┘ │
                  │  Auto SSL, CDN,   │
                  │  Serverless Fns   │
                  └───┬────┬────┬─────┘
                      │    │    │
         ┌────────────┘    │    └────────────┐
         │                 │                 │
  ┌──────▼──────┐  ┌──────▼──────┐  ┌───────▼──────┐
  │   Clerk     │  │  Supabase   │  │   Stripe     │
  │   Auth      │  │  PostgreSQL │  │   Payments   │
  │ (Free 10k)  │  │  (Free)     │  │  (2.9%/txn)  │
  └─────────────┘  └─────────────┘  └──────────────┘
```

---

## Prerequisites

Before starting, ensure you have:

- [x] GitHub account with repo `vellankikoti/trainings`
- [x] Domain `vellanki.in` added to Cloudflare
- [x] Supabase project created with migrations applied
- [x] Clerk application created with API keys
- [x] Vercel account linked to GitHub

---

## Step 1: Supabase — Database Setup (Done)

> You've already completed this step. For reference, your keys are:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...    (anon public key)
SUPABASE_SERVICE_ROLE_KEY=eyJ...        (service_role key — KEEP SECRET)
```

### Verify Migrations

Ensure these migration files have been run in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_add_subscriptions.sql`
3. `supabase/migrations/003_add_discussions.sql`

Verify in Supabase Dashboard → **Table Editor** that tables exist:
`profiles`, `lesson_progress`, `exercise_progress`, `quiz_responses`,
`module_progress`, `daily_activity`, `achievements`, `user_achievements`,
`certificates`, `subscriptions`, `discussions`, `discussion_votes`

---

## Step 2: Clerk — Authentication Setup (Done)

> You've already completed this step. Your keys are:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Webhook (Update After Deploy)

After deploying to `vellanki.in`, configure the Clerk webhook:
1. Clerk Dashboard → **Webhooks** → **Add Endpoint**
2. URL: `https://vellanki.in/api/webhooks/clerk`
3. Events: `user.created`, `user.updated`, `user.deleted`
4. Copy the Signing Secret → `CLERK_WEBHOOK_SECRET=whsec_...`

---

## Step 3: Cloudflare — DNS Setup (Done)

> You've already added `vellanki.in` to Cloudflare.

### Cloudflare Settings (Configure Now)

1. **SSL/TLS** → Set to **Full (Strict)**
2. **Speed → Optimization** → Enable Auto Minify (HTML, CSS, JS)
3. **Caching** → Set Browser Cache TTL to **4 hours**
4. **Security** → Set Security Level to **Medium**

---

## Step 4: Vercel — Import & Deploy

### 4.1 Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select **Import Git Repository** → choose `vellankikoti/trainings`
3. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/web` |
| **Build Command** | `cd ../.. && pnpm turbo build --filter=web` |
| **Install Command** | `pnpm install` |

### 4.2 Set Environment Variables

In Vercel → Project Settings → **Environment Variables**, add:

**Required:**
```
NEXT_PUBLIC_APP_URL=https://vellanki.in
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Optional (add when ready):**
```
# Stripe payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_...
STRIPE_TEAM_MONTHLY_PRICE_ID=price_...
STRIPE_TEAM_ANNUAL_PRICE_ID=price_...

# Resend email
RESEND_API_KEY=re_...
EMAIL_FROM=DevOps Engineers <noreply@vellanki.in>

# Sentry error tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxx@o0.ingest.sentry.io/0
```

### 4.3 Deploy

Click **Deploy** — Vercel builds and deploys automatically. First deploy takes ~2-3 minutes.

---

## Step 5: Custom Domain

### 5.1 Add Domain in Vercel

1. Vercel → Project → **Settings → Domains**
2. Add `vellanki.in`
3. Vercel will show the required DNS records

### 5.2 Configure DNS in Cloudflare

Add these records in Cloudflare DNS:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `@` | `cname.vercel-dns.com` | DNS only (grey cloud) |
| CNAME | `www` | `cname.vercel-dns.com` | DNS only (grey cloud) |

> **Important**: Keep proxy off (grey cloud) initially so Vercel can issue SSL. Once verified, you can optionally enable Cloudflare proxy (orange cloud).

### 5.3 Verify

Wait 1-5 minutes for DNS propagation, then:
```bash
curl -I https://vellanki.in
# Should show HTTP/2 200 with valid SSL
```

---

## Step 6: Configure Webhooks

Now that `vellanki.in` is live, update your webhook endpoints.

### 6.1 Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks**
2. Edit your endpoint (or create a new one):
   - **URL**: `https://vellanki.in/api/webhooks/clerk`
   - **Events**: `user.created`, `user.updated`, `user.deleted`
3. Copy the **Signing Secret** → update `CLERK_WEBHOOK_SECRET` in Vercel

### 6.2 Stripe Webhook (if using)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers → Webhooks**
2. **Add endpoint**:
   - **URL**: `https://vellanki.in/api/webhooks/stripe`
   - **Events**: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
3. Copy the **Signing Secret** → update `STRIPE_WEBHOOK_SECRET` in Vercel

---

## Step 7: Resend — Email Setup (Optional)

### 7.1 Create Account & Add Domain

1. Go to [resend.com](https://resend.com) → Sign up (free — 3,000 emails/month)
2. Go to **Domains → Add Domain** → `vellanki.in`
3. Add the DNS records Resend provides to Cloudflare:

| Type | Name | Content |
|------|------|---------|
| TXT | `@` | SPF record from Resend |
| CNAME | various | DKIM records from Resend |
| TXT | `_dmarc` | DMARC record from Resend |

4. Click **Verify** in Resend dashboard

### 7.2 Get API Key

1. **API Keys → Create API Key**
2. Name: `production`
3. Permission: Sending access for `vellanki.in`
4. Copy key → add `RESEND_API_KEY` to Vercel environment variables

---

## Step 8: Sentry — Error Tracking (Optional)

1. Go to [sentry.io](https://sentry.io) → Sign up (free — 5,000 events/month)
2. Create project: Platform = Next.js, Name = `devops-engineers`
3. Copy the DSN → add `NEXT_PUBLIC_SENTRY_DSN` to Vercel environment variables

---

## Step 9: Stripe — Payments (Optional)

### 9.1 Create Products

In [Stripe Dashboard](https://dashboard.stripe.com) → **Products**, create:

| Product | Monthly Price | Annual Price |
|---------|--------------|-------------|
| DevOps Engineers Premium | $9/mo | $79/yr |
| DevOps Engineers Team | $29/mo per seat | $279/yr per seat |

Copy each Price ID (starts with `price_`).

### 9.2 Set Environment Variables

Add to Vercel:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_...
STRIPE_TEAM_MONTHLY_PRICE_ID=price_...
STRIPE_TEAM_ANNUAL_PRICE_ID=price_...
```

---

## Step 10: Health Monitoring

### Vercel Cron Jobs

Vercel supports cron jobs via `vercel.json`. Already configured:

```json
{
  "crons": [
    { "path": "/api/cron/health", "schedule": "*/5 * * * *" },
    { "path": "/api/cron/emails", "schedule": "0 9 * * *" }
  ]
}
```

> **Note**: Cron jobs require Vercel Pro ($20/mo). On the Hobby tier, use UptimeRobot instead.

### UptimeRobot (Free Alternative)

Supabase free tier pauses after 7 days of inactivity. Prevent this:

1. Go to [uptimerobot.com](https://uptimerobot.com) → Sign up (free — 50 monitors)
2. Add monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://vellanki.in/api/health`
   - **Interval**: 5 minutes
3. This pings your health endpoint every 5 minutes, keeping Supabase active

---

## Step 11: Post-Deployment Verification

### Infrastructure Checks

```bash
# 1. Health check
curl -s https://vellanki.in/api/health | python3 -m json.tool
# Expect: {"status":"healthy","checks":{"database":"connected","auth":"configured"}}

# 2. Homepage loads
curl -s -o /dev/null -w "%{http_code}" https://vellanki.in
# Expect: 200

# 3. Lesson content loads
curl -s -o /dev/null -w "%{http_code}" https://vellanki.in/paths/foundations
# Expect: 200

# 4. SSL certificate valid
curl -vI https://vellanki.in 2>&1 | grep "SSL certificate"
# Expect: SSL certificate verify ok

# 5. www redirect works
curl -s -o /dev/null -w "%{http_code}" -L https://www.vellanki.in
# Expect: 200 (redirects to vellanki.in)
```

### Authentication Flow

1. Visit `https://vellanki.in/sign-up` → Create an account
2. Verify redirect to `/onboarding`
3. Complete onboarding → Verify redirect to `/dashboard`
4. Check Supabase → `profiles` table has your user record
5. Visit `/settings` → Verify profile shows correctly
6. Sign out → Sign back in → Verify session works

### Content & Features

1. Browse to `/paths/foundations` → Verify learning path loads
2. Open a lesson → Verify MDX content renders with code highlighting
3. Complete a lesson → Verify progress is saved
4. Take a quiz → Verify submission and results
5. Check `/dashboard` → Verify stats update

### Payments (if Stripe configured)

1. Visit `/pricing` → Verify plans display
2. Click "Subscribe" → Use test card `4242 4242 4242 4242`
3. Verify webhook fires → Check `subscriptions` table in Supabase
4. Visit a premium feature → Verify access is granted

---

## Auto-Deploy from GitHub

Vercel automatically deploys when you push to `main`:

```
Push to main
    │
    ▼
Vercel detects change → Builds Next.js app
    │
    ▼
Build passes → Deployed to production
    │
    ▼
Live at https://vellanki.in
```

### Preview Deployments

Every PR gets a unique preview URL (e.g., `trainings-abc123.vercel.app`) — great for testing changes before merging.

### CI/CD with GitHub Actions

The existing `.github/workflows/ci.yml` runs lint, type-check, build, and tests on every PR. Only code that passes CI gets merged to `main`, which triggers Vercel deploy.

```
PR created → GitHub Actions (lint, type-check, build, test)
    │               + Vercel Preview Deploy
    ▼ (passes)
Merge to main → Vercel auto-deploy to vellanki.in
```

---

## Vercel Dashboard

Access at [vercel.com/dashboard](https://vercel.com/dashboard) to:
- View deployment history and logs
- Roll back to a previous deployment (instant)
- Update environment variables (triggers redeploy)
- Monitor performance (Web Vitals, function logs)
- Manage domains and SSL certificates
- View analytics and usage

---

## Scaling Path

| Milestone | Action | Cost |
|-----------|--------|------|
| **Starting out** | Vercel Hobby (free) | $0/mo |
| **Commercial use** | Vercel Pro | $20/mo |
| **500 DB connections** | Supabase Pro (8 GB, daily backups) | +$25/mo |
| **10k+ MAU** | Clerk Pro | +$25/mo |
| **3k+ emails/mo** | Resend Pro | +$20/mo |

---

## Troubleshooting

### Build Fails on Vercel

```
Error: Could not find a production build
```
**Fix**: Ensure the Root Directory is set to `apps/web` and the Build Command uses turbo: `cd ../.. && pnpm turbo build --filter=web`

### Environment Variables Not Available

**Fix**: Verify variables are set for the correct environment (Production, Preview, Development) in Vercel → Settings → Environment Variables. Redeploy after changes.

### Clerk Webhook Returning 400/401

**Fix**: Verify `CLERK_WEBHOOK_SECRET` in Vercel matches the signing secret in Clerk Dashboard → Webhooks. Redeploy after updating.

### Database Connection Error

```
{"status":"degraded","checks":{"database":"unreachable"}}
```
**Fix**: Check if Supabase project is paused (free tier pauses after 7 days of inactivity). Resume it in the Supabase dashboard. Set up UptimeRobot (Step 10) to prevent this.

### Custom Domain Not Working

**Fix**: Check DNS records in Cloudflare. Ensure CNAME `@` points to `cname.vercel-dns.com`. Start with proxy off (grey cloud), then enable after verification.

### Function Timeout (Hobby: 10s / Pro: 60s)

**Fix**: If API routes timeout, optimize queries or consider Supabase Edge Functions for heavy operations.

---

## Quick Reference — All Environment Variables

```bash
# === REQUIRED ===
NEXT_PUBLIC_APP_URL=https://vellanki.in

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# === OPTIONAL ===

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_...
STRIPE_TEAM_MONTHLY_PRICE_ID=price_...
STRIPE_TEAM_ANNUAL_PRICE_ID=price_...

# Resend Email
RESEND_API_KEY=re_...
EMAIL_FROM=DevOps Engineers <noreply@vellanki.in>

# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxx@o0.ingest.sentry.io/0
```

---

## References

- [Vercel — Next.js Deployment](https://vercel.com/docs/frameworks/nextjs)
- [Vercel — Custom Domains](https://vercel.com/docs/projects/domains)
- [Vercel — Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel — Monorepos](https://vercel.com/docs/monorepos)

---

*DevOps Engineers — Training 1 Million Engineers, One Story at a Time.*
