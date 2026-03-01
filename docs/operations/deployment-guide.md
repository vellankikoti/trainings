# DevOps Engineers — Production Deployment Guide

> **Goal**: Deploy the platform using free/open-source tools for ~$20/month total cost.
> **Stack**: Next.js 14 + Supabase + Clerk + Vercel + Cloudflare + Stripe + Resend + Sentry + Upstash

---

## Cost Breakdown

| Service | Purpose | Tier | Cost |
|---------|---------|------|------|
| **Vercel** | Hosting & CDN | Hobby (Free) | $0/mo |
| **Supabase** | PostgreSQL Database | Free | $0/mo |
| **Clerk** | Authentication | Free (10k MAU) | $0/mo |
| **Cloudflare** | DNS & CDN | Free | $0/mo |
| **GitHub** | Version Control & CI/CD | Free | $0/mo |
| **Resend** | Transactional Email | Free (3k emails/mo) | $0/mo |
| **Sentry** | Error Tracking | Developer (Free) | $0/mo |
| **Upstash** | Redis (Rate Limiting) | Free (10k commands/day) | $0/mo |
| **Stripe** | Payments | Pay-as-you-go | 2.9% + 30c per txn |
| **Domain** | Custom domain | Namecheap/Cloudflare | ~$12/yr ($1/mo) |
| | | **Total** | **~$1/mo** (+ Stripe fees on revenue) |

> **Note**: Vercel Hobby has limits (100GB bandwidth, 100 hrs build/mo, no cron jobs). Upgrade to Pro ($20/mo) when traffic grows or you need cron jobs for email automation.

---

## Prerequisites

Before starting, ensure you have:
- [ ] A GitHub account (your repo: `vellankikoti/trainings`)
- [ ] Node.js 22.x installed locally
- [ ] pnpm 10.x installed (`npm install -g pnpm@10`)
- [ ] Git configured with SSH or HTTPS access

---

## Step 1: Supabase — Database Setup

Supabase provides a managed PostgreSQL database with Row-Level Security, real-time subscriptions, and a REST API.

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **"New Project"**
3. Configure:
   - **Organization**: Create one or select existing
   - **Project name**: `devops-engineers`
   - **Database password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
4. Click **"Create new project"** — wait ~2 minutes for provisioning

### 1.2 Get Your API Keys

1. Go to **Settings → API** in your Supabase dashboard
2. Copy these values (you'll need them later):

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...  (the "anon public" key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  (the "service_role" key — KEEP SECRET)
```

> **IMPORTANT**: The `service_role` key bypasses Row-Level Security. Never expose it in client-side code.

### 1.3 Run Database Migrations

Option A — **Via Supabase Dashboard (Recommended for first setup)**:

1. Go to **SQL Editor** in your Supabase dashboard
2. Run each migration file in order:
   - Copy contents of `supabase/migrations/001_initial_schema.sql` → Execute
   - Copy contents of `supabase/migrations/002_add_subscriptions.sql` → Execute
   - Copy contents of `supabase/migrations/003_add_discussions.sql` → Execute
3. Verify tables were created under **Table Editor**

Option B — **Via Supabase CLI**:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase login
supabase link --project-ref YOUR_PROJECT_ID

# Push migrations
supabase db push
```

### 1.4 Verify Database

In the **Table Editor**, you should see these tables:
- `profiles`, `lesson_progress`, `exercise_progress`, `quiz_responses`
- `module_progress`, `daily_activity`, `achievements`, `user_achievements`
- `certificates`, `subscriptions`, `discussions`, `discussion_votes`

---

## Step 2: Clerk — Authentication Setup

Clerk handles user signup, login, OAuth (Google/GitHub), and session management.

### 2.1 Create a Clerk Application

1. Go to [clerk.com](https://clerk.com) and sign up (free — 10,000 monthly active users)
2. Click **"Create application"**
3. Configure:
   - **Application name**: `DevOps Engineers`
   - **Sign-in options**: Enable Email, Google, and GitHub
4. Click **"Create application"**

### 2.2 Get Your API Keys

1. Go to **API Keys** in the Clerk dashboard
2. Copy:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### 2.3 Configure Clerk Webhook

This syncs user data from Clerk to your Supabase `profiles` table.

1. Go to **Webhooks** in the Clerk dashboard
2. Click **"Add Endpoint"**
3. Configure:
   - **URL**: `https://YOUR_DOMAIN.com/api/webhooks/clerk`
     (Use a temporary URL for now — update after Vercel deployment)
   - **Events**: Select:
     - `user.created`
     - `user.updated`
     - `user.deleted`
4. Click **"Create"**
5. Copy the **Signing Secret**:

```
CLERK_WEBHOOK_SECRET=whsec_...
```

### 2.4 Configure OAuth Providers (Optional but Recommended)

**Google OAuth**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `https://YOUR_CLERK_DOMAIN/v1/oauth_callback`
5. Enter Client ID and Secret in Clerk Dashboard → **Social Connections → Google**

**GitHub OAuth**:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `https://YOUR_CLERK_DOMAIN/v1/oauth_callback`
4. Enter Client ID and Secret in Clerk Dashboard → **Social Connections → GitHub**

---

## Step 3: Cloudflare — DNS & CDN Setup

Cloudflare provides free DNS, CDN, DDoS protection, and SSL.

### 3.1 Register or Transfer Your Domain

Option A — **Buy from Cloudflare** (cheapest, at-cost pricing):
1. Go to [Cloudflare Registrar](https://dash.cloudflare.com/registrar)
2. Search for your domain → Purchase

Option B — **Buy from Namecheap** (~$12/yr) and point to Cloudflare:
1. Buy domain at [namecheap.com](https://namecheap.com)
2. In Namecheap, set custom nameservers to Cloudflare's (next step)

### 3.2 Set Up Cloudflare DNS

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Add a Site**
2. Enter your domain → Select **Free** plan
3. Cloudflare will give you nameservers (e.g., `aria.ns.cloudflare.com`)
4. Update your domain registrar to use these nameservers
5. Wait for propagation (up to 24 hours, usually minutes)

### 3.3 Configure DNS Records

Add these records in Cloudflare DNS (after Vercel setup in Step 4):

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `@` | `cname.vercel-dns.com` | DNS only (grey cloud) |
| CNAME | `www` | `cname.vercel-dns.com` | DNS only (grey cloud) |

> **Important**: Set proxy to "DNS only" (grey cloud) for Vercel. Vercel handles its own SSL and CDN.

### 3.4 Cloudflare Settings

1. **SSL/TLS** → Set to **Full (Strict)**
2. **Speed → Optimization** → Enable Auto Minify (HTML, CSS, JS)
3. **Caching** → Set Browser Cache TTL to **4 hours**
4. **Security** → Set Security Level to **Medium**

---

## Step 4: Vercel — Hosting & Deployment

Vercel is the native hosting platform for Next.js with automatic deployments from Git.

### 4.1 Create a Vercel Account

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Authorize Vercel to access your GitHub account

### 4.2 Import Your Project

1. Click **"Add New" → "Project"**
2. Select the `vellankikoti/trainings` repository
3. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave default — monorepo is handled by `vercel.json`)
   - **Build Command**: `pnpm build` (from vercel.json)
   - **Output Directory**: `apps/web/.next` (from vercel.json)
   - **Install Command**: `pnpm install` (from vercel.json)

### 4.3 Set Environment Variables

In Vercel → **Project Settings → Environment Variables**, add:

**Required (all environments)**:
```
NEXT_PUBLIC_APP_URL = https://yourdomain.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...
CLERK_SECRET_KEY = sk_live_...
CLERK_WEBHOOK_SECRET = whsec_...
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...
SKIP_ENV_VALIDATION = true
```

**Optional (enable when ready)**:
```
# Stripe
STRIPE_SECRET_KEY = sk_live_...
STRIPE_WEBHOOK_SECRET = whsec_...

# Resend
RESEND_API_KEY = re_...

# Sentry
NEXT_PUBLIC_SENTRY_DSN = https://...@o0.ingest.sentry.io/...

# Upstash Redis (upgrade from in-memory rate limiting)
UPSTASH_REDIS_REST_URL = https://...upstash.io
UPSTASH_REDIS_REST_TOKEN = AX...

# Cron secret (for email automation)
CRON_SECRET = generate-a-random-string-here
```

> **Tip**: Set `SKIP_ENV_VALIDATION=true` for the build environment to prevent validation errors during CI.

### 4.4 Deploy

1. Click **"Deploy"** — Vercel will build and deploy your project
2. Once deployed, you'll get a URL like `your-project.vercel.app`
3. Note this URL — you'll need it for webhook configuration

### 4.5 Add Custom Domain

1. Go to **Project Settings → Domains**
2. Add your domain: `yourdomain.com`
3. Add `www.yourdomain.com` (will redirect to root per vercel.json)
4. Vercel will show DNS configuration — these should match Step 3.3
5. SSL is automatically provisioned by Vercel

### 4.6 Update Webhook URLs

Now that you have your production URL:
1. **Clerk Dashboard → Webhooks**: Update endpoint URL to `https://yourdomain.com/api/webhooks/clerk`
2. **Stripe Dashboard → Webhooks** (if configured): Update to `https://yourdomain.com/api/webhooks/stripe`

### 4.7 Verify Deployment

```bash
# Health check
curl https://yourdomain.com/api/health

# Expected response:
# {"status":"healthy","timestamp":"...","version":"1.0.0","checks":{"database":"connected","auth":"configured"}}
```

---

## Step 5: Resend — Email Setup (Optional)

Resend handles transactional emails (welcome, certificates, streak reminders).

### 5.1 Create a Resend Account

1. Go to [resend.com](https://resend.com) → Sign up (free — 3,000 emails/month)
2. Verify your email address

### 5.2 Add Your Domain

1. Go to **Domains** → **Add Domain**
2. Enter your domain (e.g., `yourdomain.com`)
3. Add the DNS records Resend provides to Cloudflare:
   - SPF record (TXT)
   - DKIM records (CNAME)
   - DMARC record (TXT)
4. Click **"Verify"** — may take a few minutes

### 5.3 Get Your API Key

1. Go to **API Keys** → **Create API Key**
2. Name: `devops-engineers-production`
3. Permission: **Sending access** for your domain
4. Copy the key:

```
RESEND_API_KEY=re_...
```

5. Add to Vercel environment variables

---

## Step 6: Sentry — Error Tracking (Optional)

### 6.1 Create a Sentry Project

1. Go to [sentry.io](https://sentry.io) → Sign up (free — 5,000 events/month)
2. Create a new project:
   - **Platform**: Next.js
   - **Project name**: `devops-engineers`
3. Copy the DSN:

```
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

4. Add to Vercel environment variables

---

## Step 7: Upstash — Redis for Rate Limiting (Optional)

Upgrades the in-memory rate limiter to a distributed Redis-based solution.

### 7.1 Create an Upstash Database

1. Go to [upstash.com](https://upstash.com) → Sign up (free — 10,000 commands/day)
2. Click **"Create Database"**
3. Configure:
   - **Name**: `devops-engineers-ratelimit`
   - **Region**: Choose closest to your Vercel deployment
   - **Type**: Regional
4. Copy the REST credentials:

```
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...
```

5. Add to Vercel environment variables

> **Note**: The app currently uses in-memory rate limiting which works fine for single-instance Vercel deployments. Upstash is an upgrade path when you need distributed rate limiting across edge functions.

---

## Step 8: Stripe — Payments (Optional)

### 8.1 Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) → Sign up
2. Complete business verification (required for live payments)

### 8.2 Create Products and Prices

In **Stripe Dashboard → Products**, create:

**Product 1: Premium Plan**
- Name: `DevOps Engineers Premium`
- Price 1: $9/month (recurring, monthly)
- Price 2: $79/year (recurring, yearly)

**Product 2: Team Plan**
- Name: `DevOps Engineers Team`
- Price 1: $29/month per seat (recurring, monthly)
- Price 2: $279/year per seat (recurring, yearly)

Copy each Price ID (starts with `price_`).

### 8.3 Configure Webhook

1. Go to **Developers → Webhooks → Add endpoint**
2. URL: `https://yourdomain.com/api/webhooks/stripe`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the Signing Secret

### 8.4 Set Environment Variables

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_...
STRIPE_TEAM_MONTHLY_PRICE_ID=price_...
STRIPE_TEAM_ANNUAL_PRICE_ID=price_...
```

> **Tip**: Use `sk_test_` keys and test mode products for staging. Switch to `sk_live_` for production.

---

## Step 9: GitHub Actions — CI/CD Pipeline

### 9.1 Set GitHub Secrets

In your repository → **Settings → Secrets and variables → Actions**, add:

**Repository Secrets**:
```
VERCEL_ORG_ID = (from Vercel → Settings → General)
VERCEL_PROJECT_ID = (from Vercel → Project → Settings → General)
VERCEL_TOKEN = (from Vercel → Settings → Tokens → Create)
```

**Repository Variables** (Settings → Variables):
```
VERCEL_CONFIGURED = true
```

### 9.2 CI Pipeline

The existing `.github/workflows/ci.yml` automatically:
- Runs on every PR and push to `main`
- Lints, type-checks, builds, and tests
- PRs must pass CI before merge

### 9.3 Deployment Flow

```
Push to main → CI runs → Vercel auto-deploys production
Push to develop → CI runs → Vercel deploys to staging (if configured)
Create PR → CI runs → Vercel creates preview deployment
```

---

## Step 10: Post-Deployment Verification

Run through this checklist after deployment:

### Infrastructure
```bash
# 1. Health check
curl -s https://yourdomain.com/api/health | jq .
# Expect: {"status":"healthy","checks":{"database":"connected","auth":"configured"}}

# 2. Homepage loads
curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com
# Expect: 200

# 3. Lesson page loads
curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/paths/foundations
# Expect: 200

# 4. API rate limiting works
for i in {1..65}; do curl -s -o /dev/null -w "%{http_code}\n" https://yourdomain.com/api/health; done
# Expect: 200s then 429s after limit
```

### Authentication
1. Visit `https://yourdomain.com/sign-up` → Create an account
2. Verify redirect to `/onboarding`
3. Complete onboarding → Verify redirect to `/dashboard`
4. Check Supabase → `profiles` table has your user record
5. Visit `/settings` → Verify profile shows correctly
6. Sign out → Sign back in → Verify session works

### Content & Features
1. Browse to `/paths/foundations` → Verify learning path loads
2. Open a lesson → Verify MDX renders with code highlighting
3. Complete a lesson → Verify progress is saved
4. Take a quiz → Verify submission and results
5. Check `/dashboard` → Verify stats update

### Payments (if Stripe configured)
1. Visit `/pricing` → Verify plans display
2. Click "Subscribe" on a test plan (use Stripe test card `4242 4242 4242 4242`)
3. Verify webhook fires → Check `subscriptions` table in Supabase
4. Visit a premium feature → Verify access is granted

---

## Deployment Architecture

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   DNS & CDN     │
                    │   (Free)        │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Vercel      │
                    │   Next.js App   │
                    │   Edge Network  │
                    │   (Free/Pro)    │
                    └───┬────┬────┬───┘
                        │    │    │
           ┌────────────┤    │    ├────────────┐
           │            │    │    │            │
    ┌──────▼──────┐ ┌──▼────▼──┐ │   ┌───────▼──────┐
    │   Clerk     │ │ Supabase │ │   │   Stripe     │
    │   Auth      │ │ Database │ │   │   Payments   │
    │ (Free 10k)  │ │ (Free)   │ │   │  (2.9%/txn)  │
    └─────────────┘ └──────────┘ │   └──────────────┘
                                 │
                    ┌────────────┤
                    │            │
             ┌──────▼──────┐ ┌──▼──────────┐
             │   Resend    │ │   Sentry    │
             │   Email     │ │   Errors    │
             │ (Free 3k)   │ │ (Free 5k)   │
             └─────────────┘ └─────────────┘
```

---

## Scaling Path

When you outgrow free tiers, here's the upgrade path:

| Milestone | Upgrade | Cost |
|-----------|---------|------|
| **100+ daily users** | Vercel Pro (cron jobs, more bandwidth) | +$20/mo |
| **500 DB connections** | Supabase Pro (8GB, daily backups) | +$25/mo |
| **10k+ MAU** | Clerk Pro | +$25/mo |
| **3k+ emails/mo** | Resend Pro | +$20/mo |
| **5k+ errors/mo** | Sentry Team | +$26/mo |
| **High traffic** | Upstash Pro (more commands) | +$10/mo |

**Estimated costs at scale (10k users)**: ~$126/month

---

## Troubleshooting

### Build Fails on Vercel

```
Error: Missing required environment variables
```
**Fix**: Add `SKIP_ENV_VALIDATION=true` to Vercel environment variables.

### Clerk Webhook Not Firing

**Fix**: Ensure the webhook URL matches your deployed domain exactly. Check Clerk Dashboard → Webhooks → Recent Deliveries for errors.

### Database Connection Error

```
{"status":"degraded","checks":{"database":"unreachable"}}
```
**Fix**: Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct. Check Supabase project isn't paused (free tier pauses after 1 week of inactivity).

### Supabase Free Tier Pausing

Supabase pauses free-tier projects after 7 days of inactivity.
**Fix**: The health check cron job (`/api/health`) queries the database every 5 minutes, keeping it active. On Vercel Hobby (no cron), set up a free uptime monitor (e.g., [UptimeRobot](https://uptimerobot.com)) to ping `/api/health` every 5 minutes.

### 403 on Webhook Endpoints

**Fix**: Ensure webhook secrets match between the service (Clerk/Stripe) and your environment variables. Signatures are verified on every request.

### CSS/Styles Not Loading

**Fix**: Check Content-Security-Policy headers in `next.config.mjs`. Ensure CDN domains are whitelisted.

---

## Quick Start Commands (Local Development)

```bash
# Clone the repo
git clone https://github.com/vellankikoti/trainings.git
cd trainings

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and Clerk keys

# Start local Supabase (optional — for local database)
supabase start

# Start development server
pnpm dev

# Open http://localhost:3000
```

---

*DevOps Engineers — Training 1 Million Engineers, One Story at a Time.*
