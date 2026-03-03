# Setup Guide — External Service Keys & Infrastructure

**Budget Target:** $10/month or less
**Strategy:** Use free tiers + open-source alternatives. Only pay when you have paying users.

---

## Table of Contents

1. [Monthly Cost Breakdown](#1-monthly-cost-breakdown)
2. [Supabase Setup](#2-supabase-setup)
3. [Clerk Authentication](#3-clerk-authentication)
4. [Vercel Deployment](#4-vercel-deployment)
5. [Job Board APIs (Free)](#5-job-board-apis-free)
6. [Stripe Billing (Pay-per-use)](#6-stripe-billing-pay-per-use)
7. [Cron Jobs](#7-cron-jobs)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Alternative Free Stack (Self-Hosted)](#9-alternative-free-stack-self-hosted)

---

## 1. Monthly Cost Breakdown

### Current Stack — $0/month (Free Tiers)

| Service | Tier | Cost | Limits |
|---------|------|------|--------|
| **Supabase** | Free | $0 | 500 MB DB, 1 GB storage, 50K auth MAUs |
| **Clerk** | Free | $0 | 10,000 MAUs, social login, MFA |
| **Vercel** | Hobby | $0 | 100 GB bandwidth, 1M serverless invocations |
| **Stripe** | Pay-per-use | $0 base | 2.9% + $0.30 per transaction |
| **Remotive API** | Free | $0 | 2 req/min, refresh 4x/day |
| **Arbeitnow API** | Free | $0 | No API key needed |
| **Adzuna API** | Free | $0 | Free registration |
| **JSearch (RapidAPI)** | Free | $0 | ~500 requests/month |
| **Total** | | **$0/month** | |

### Important Caveats

- **Supabase Free Tier**: Projects auto-pause after 7 days of inactivity. Keep alive with a daily cron ping (covered in Section 7).
- **Vercel Hobby**: Technically for personal/non-commercial use. Upgrade to Pro ($20/mo) once you have paying users.
- **Stripe**: No monthly fee — you only pay when users pay you (~3.6% + $0.30 per charge).

### When You Start Making Money (Estimated)

| Service | Tier | Cost |
|---------|------|------|
| Supabase Pro | Production | $25/month |
| Vercel Pro | Commercial | $20/month |
| Clerk | Still free | $0 |
| Stripe | Per transaction | ~$0.66 per $10 charge |
| **Total** | | **~$45/month** |

This is funded by just 5 paying users at $10/month each.

---

## 2. Supabase Setup

### Step 1: Create Project

1. Go to [supabase.com](https://supabase.com) and sign up (GitHub login works).
2. Click **"New Project"**.
3. Choose a name (e.g., `trainings-prod`), set a strong database password, select the nearest region.
4. Wait for the project to provision (~2 minutes).

### Step 2: Get Connection Keys

1. Go to **Settings → API** in the Supabase dashboard.
2. Copy these values:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...    (the "anon" / "public" key)
SUPABASE_SERVICE_ROLE_KEY=eyJhb...        (the "service_role" key — KEEP SECRET)
```

### Step 3: Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Push all migrations
supabase db push
```

### Step 4: Prevent Auto-Pause (Free Tier)

The free tier pauses your DB after 7 days of no activity. Set up a daily ping:

```bash
# Add to your Vercel cron (vercel.json) or use a free cron service like cron-job.org
# The /api/health/ready endpoint keeps the DB alive
curl https://your-app.vercel.app/api/health/ready
```

### Free Tier Limits

| Resource | Limit |
|----------|-------|
| Database storage | 500 MB |
| File storage | 1 GB |
| Bandwidth | 2 GB/month |
| Auth MAUs | 50,000 |
| Edge Functions | 500K invocations/month |
| Realtime messages | 2 million/month |

---

## 3. Clerk Authentication

### Step 1: Create Application

1. Go to [clerk.com](https://clerk.com) and sign up.
2. Click **"Create Application"**.
3. Name it (e.g., `DevOps Engineers`).
4. Enable sign-in methods: **Email**, **Google**, **GitHub** (recommended for a DevOps platform).

### Step 2: Get API Keys

1. Go to **API Keys** in the Clerk dashboard.
2. Copy:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Step 3: Configure Webhooks

1. Go to **Webhooks** in the Clerk dashboard.
2. Add endpoint: `https://your-app.vercel.app/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret:

```
CLERK_WEBHOOK_SECRET=whsec_...
```

### Step 4: Configure URLs

In the Clerk dashboard under **Paths**:

```
Sign-in URL: /sign-in
Sign-up URL: /sign-up
After sign-in URL: /dashboard
After sign-up URL: /onboarding
```

### Free Tier Limits

| Resource | Limit |
|----------|-------|
| Monthly Active Users | 10,000 |
| Social connections | Unlimited |
| MFA | Included |
| Organizations | 100 MAO, 5 members/org |

---

## 4. Vercel Deployment

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub.
2. Click **"Import Project"** and select your repository.
3. Set the root directory to `apps/web`.
4. Framework: **Next.js** (auto-detected).

### Step 2: Set Environment Variables

In Vercel dashboard → Settings → Environment Variables, add all the keys from Section 8.

### Step 3: Deploy

```bash
# Or just push to main — Vercel auto-deploys
git push origin main
```

### Step 4: Custom Domain (Optional, Free)

1. Go to **Settings → Domains**.
2. Add your domain and update DNS records as instructed.

### Free Tier Limits

| Resource | Limit |
|----------|-------|
| Bandwidth | 100 GB/month |
| Serverless invocations | 1,000,000/month |
| Build minutes | 6,000/month |
| Serverless timeout | 60 seconds (Hobby) |
| Image optimizations | 5,000/month |

---

## 5. Job Board APIs (Free)

We use 4 free job APIs. All results are cached in Supabase and refreshed every 6-12 hours via cron, not per-request.

### 5A: Remotive API (Remote Tech Jobs) — NO KEY NEEDED

**Endpoint:** `https://remotive.com/api/remote-jobs`

No signup required. Just fetch:

```bash
# Test it
curl "https://remotive.com/api/remote-jobs?category=devops&limit=20"
```

**Rules:**
- Max 2 requests/minute
- Fetch at most 4 times/day (data updates daily)
- You MUST show attribution: "Powered by Remotive" with a link back
- Cannot submit jobs to Google Jobs, LinkedIn, etc.

**Integration:** Already scaffolded. Add a Remotive provider to `lib/jobs/aggregation.ts`.

### 5B: Arbeitnow API (EU Tech Jobs) — NO KEY NEEDED

**Endpoint:** `https://www.arbeitnow.com/api/job-board-api`

No signup, no API key:

```bash
# Test it
curl "https://www.arbeitnow.com/api/job-board-api"
```

Returns paginated JSON. Filter by remote/visa sponsorship.

**Integration:** Add an Arbeitnow provider to `lib/jobs/aggregation.ts`.

### 5C: Adzuna API (Global Jobs)

**Step 1: Register**

1. Go to [developer.adzuna.com](https://developer.adzuna.com)
2. Sign up for a free account
3. Go to **Dashboard → API Access**
4. Copy your credentials:

```
ADZUNA_APP_ID=your_app_id
ADZUNA_API_KEY=your_api_key
```

**Step 2: Test**

```bash
curl "https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=YOUR_ID&app_key=YOUR_KEY&what=devops"
```

**Covers:** US, UK, AU, DE, FR, NL, IN, and 10+ more countries.

**Integration:** Already implemented in `lib/jobs/aggregation.ts`.

### 5D: JSearch via RapidAPI (Google Jobs Aggregator)

**Step 1: Get Free API Key**

1. Go to [rapidapi.com](https://rapidapi.com) and sign up
2. Search for **"JSearch"** by letscrape
3. Subscribe to the **Basic (Free)** plan
4. Copy your RapidAPI key from the dashboard:

```
JSEARCH_API_KEY=your_rapidapi_key
```

**Step 2: Test**

```bash
curl -H "X-RapidAPI-Key: YOUR_KEY" \
     -H "X-RapidAPI-Host: jsearch.p.rapidapi.com" \
     "https://jsearch.p.rapidapi.com/search?query=devops+engineer&num_pages=1"
```

**Free Tier:** ~500 requests/month. Cache aggressively — run 2-3 queries per day max.

**Integration:** Already implemented in `lib/jobs/aggregation.ts`.

### Caching Strategy

All job APIs are fetched on a schedule (cron), NOT per user request:

```
Every 6 hours → fetch from all 4 APIs → deduplicate → upsert into job_postings table
Users search against the cached job_postings table (fast, no API calls)
```

This keeps API usage well within free limits:
- Remotive: 4 calls/day = 120/month (limit: ~120)
- Arbeitnow: 4 calls/day = 120/month (no hard limit)
- Adzuna: 4 calls/day × 3 queries = 360/month (generous free tier)
- JSearch: 4 calls/day × 3 queries = 360/month (limit: ~500)

---

## 6. Stripe Billing (Pay-per-use)

**Cost:** $0/month base. You only pay when users pay you.
**Fee:** ~3.6% + $0.30 per charge (2.9% card + 0.7% Billing).

### Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up.
2. Complete business verification (can be an individual).

### Step 2: Get API Keys

1. Go to **Developers → API Keys**.
2. Copy:

```
STRIPE_SECRET_KEY=sk_live_...           (for production)
STRIPE_PUBLISHABLE_KEY=pk_live_...      (for frontend, if needed)
```

For development, use the **test mode** keys:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Step 3: Create Products & Prices

In the Stripe Dashboard → Products:

**Learner Plans:**

| Plan | Price | Create in Stripe |
|------|-------|-----------------|
| Free | $0 | No Stripe product needed |
| Pro | $9/month | Create product → Add recurring price → Copy price ID |

**Organization Plans:**

| Plan | Price | Create in Stripe |
|------|-------|-----------------|
| Free | $0 | No Stripe product needed |
| Starter | $49/month | Create product → Copy price ID |
| Pro | $149/month | Create product → Copy price ID |
| Enterprise | $499/month | Create product → Copy price ID |

Copy each price ID (starts with `price_`):

```
STRIPE_LEARNER_PRO_PRICE_ID=price_...
STRIPE_ORG_STARTER_PRICE_ID=price_...
STRIPE_ORG_PRO_PRICE_ID=price_...
STRIPE_ORG_ENTERPRISE_PRICE_ID=price_...
```

### Step 4: Set Up Webhooks

1. Go to **Developers → Webhooks**.
2. Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the webhook signing secret:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Revenue Math

| Scenario | Revenue | Stripe Fees | You Keep |
|----------|---------|-------------|----------|
| 1 user at $9/mo | $9.00 | $0.56 | $8.44 |
| 5 users at $9/mo | $45.00 | $2.82 | $42.18 |
| 1 org at $49/mo | $49.00 | $2.12 | $46.88 |
| 10 users + 1 org | $139.00 | $5.93 | $133.07 |

You can easily cover the $45/month infrastructure costs with just 6 learner subscriptions.

---

## 7. Cron Jobs

### Option A: Vercel Cron (Free on Hobby)

Add to `vercel.json` in the project root:

```json
{
  "crons": [
    {
      "path": "/api/jobs/aggregate",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/health/ready",
      "schedule": "0 8 * * *"
    }
  ]
}
```

- Job aggregation runs every 6 hours
- Health check runs daily to prevent Supabase auto-pause

**Vercel Hobby limit:** 2 cron jobs, once/day minimum frequency.

To secure the cron endpoint, set a secret:

```
CRON_SECRET=generate-a-random-string-here
```

Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` to cron endpoints.

### Option B: Free External Cron (cron-job.org)

If you need more flexibility:

1. Go to [cron-job.org](https://cron-job.org) (free, 60-second intervals)
2. Create jobs pointing to your API endpoints
3. Add the `CRON_SECRET` as an Authorization header

### Option C: GitHub Actions (Free)

Create `.github/workflows/cron.yml`:

```yaml
name: Scheduled Jobs
on:
  schedule:
    - cron: '0 */6 * * *'
jobs:
  aggregate:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-app.vercel.app/api/jobs/aggregate
```

GitHub Actions free tier: 2,000 minutes/month (more than enough for cron).

---

## 8. Environment Variables Reference

### Required (App Won't Work Without These)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Optional — Job APIs (Enable One or More)

```bash
# JSearch (RapidAPI) — ~500 free requests/month
JSEARCH_API_KEY=your_rapidapi_key

# Adzuna — Free registration
ADZUNA_APP_ID=your_app_id
ADZUNA_API_KEY=your_api_key

# Remotive & Arbeitnow — No keys needed (free, open APIs)
```

### Optional — Billing (Add When Ready)

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_LEARNER_PRO_PRICE_ID=price_...
STRIPE_ORG_STARTER_PRICE_ID=price_...
STRIPE_ORG_PRO_PRICE_ID=price_...
STRIPE_ORG_ENTERPRISE_PRICE_ID=price_...
```

### Optional — Cron Security

```bash
CRON_SECRET=your-random-secret-string
```

### Setting Up in Vercel

```bash
# One-liner to add all env vars (or use the dashboard)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... repeat for each variable
```

Or in the Vercel dashboard: **Settings → Environment Variables → Add**

---

## 9. Alternative Free Stack (Self-Hosted)

If you want to go fully self-hosted to stay under $10/month:

### Option A: Railway ($5/month)

| Service | Cost |
|---------|------|
| Railway (Next.js + PostgreSQL) | $5/month (includes $5 free credit) |
| Clerk Free | $0 |
| Job APIs | $0 |
| **Total** | **$5/month** |

Railway gives you a managed PostgreSQL database (no auto-pause!) and app hosting. Replace Supabase with direct PostgreSQL + Prisma/Drizzle.

### Option B: Fly.io ($0-5/month)

| Service | Cost |
|---------|------|
| Fly.io (app + Postgres) | $0-5/month (generous free allowances) |
| Clerk Free | $0 |
| Job APIs | $0 |
| **Total** | **$0-5/month** |

Fly.io offers free Postgres (3GB) and free app hosting (3 shared VMs). No auto-pause.

### Option C: VPS + Coolify ($5-6/month)

| Service | Cost |
|---------|------|
| Hetzner VPS (CX22) | €4.51/month (~$5) |
| Coolify (self-hosted PaaS) | Free (open source) |
| PostgreSQL (on VPS) | $0 |
| **Total** | **~$5/month** |

Coolify is an open-source alternative to Vercel/Heroku. Run it on a cheap VPS with PostgreSQL, and you get:
- Auto-deploy from Git
- SSL certificates (Let's Encrypt)
- Docker-based deployments
- No vendor lock-in

This is the most cost-effective production option at scale.

---

## Quick Start Checklist

1. [ ] Create Supabase project → get URL + keys
2. [ ] Create Clerk application → get publishable + secret keys
3. [ ] Set up Clerk webhook → get webhook secret
4. [ ] Connect repo to Vercel → set all env vars
5. [ ] Run database migrations (`supabase db push`)
6. [ ] Register for Adzuna API → get app_id + api_key
7. [ ] Register for RapidAPI/JSearch → get API key
8. [ ] Set up Vercel cron jobs (vercel.json)
9. [ ] Test job aggregation: `POST /api/jobs/aggregate`
10. [ ] (Later) Create Stripe account → set up products + webhooks
