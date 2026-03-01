# DevOps Engineers — Production Deployment Guide

> **Goal**: Deploy the platform to `vellanki.in` using Coolify + Hetzner for ~$6/month total.
> **Stack**: Next.js 14 + Coolify + Hetzner + Supabase + Clerk + Cloudflare + Stripe + Resend + Sentry

---

## Cost Breakdown

| Service | Purpose | Tier | Cost |
|---------|---------|------|------|
| **Hetzner CX22** | VPS (2 vCPU, 4 GB RAM) | Cloud | ~$5/mo |
| **Coolify** | Deployment Platform | Open Source (self-hosted) | $0/mo |
| **Supabase** | PostgreSQL Database | Free | $0/mo |
| **Clerk** | Authentication | Free (10k MAU) | $0/mo |
| **Cloudflare** | DNS & DDoS Protection | Free | $0/mo |
| **GitHub** | Version Control & CI/CD | Free | $0/mo |
| **Resend** | Transactional Email | Free (3k emails/mo) | $0/mo |
| **Sentry** | Error Tracking | Developer (Free) | $0/mo |
| **Stripe** | Payments | Pay-as-you-go | 2.9% + 30c per txn |
| **Domain** | vellanki.in | Cloudflare Registrar | ~$12/yr ($1/mo) |
| | | **Total** | **~$6/mo** |

> **Why not Vercel?** Vercel's free Hobby tier prohibits commercial use and lacks cron jobs. Their Pro plan is $20/mo per seat. With Coolify on Hetzner, you get a full VPS with push-to-deploy, auto-SSL, and no cold starts for ~$5/mo — and you own the infrastructure.

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
                  │  Hetzner CX22     │
                  │  ┌──────────────┐ │
                  │  │   Coolify    │ │
                  │  │  ┌────────┐  │ │
                  │  │  │Next.js │  │ │
                  │  │  │  App   │  │ │
                  │  │  │ :3000  │  │ │
                  │  │  └────────┘  │ │
                  │  │   Traefik    │ │
                  │  │   (SSL/LB)   │ │
                  │  └──────────────┘ │
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
- [ ] Hetzner account (sign up below)
- [ ] SSH key pair (for server access)

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

> You've already added `vellanki.in` to Cloudflare. After creating the Hetzner server, you'll add DNS records.

### Cloudflare Settings (Configure Now)

1. **SSL/TLS** → Set to **Full (Strict)**
2. **Speed → Optimization** → Enable Auto Minify (HTML, CSS, JS)
3. **Caching** → Set Browser Cache TTL to **4 hours**
4. **Security** → Set Security Level to **Medium**

---

## Step 4: Hetzner — Create a VPS

### 4.1 Sign Up

1. Go to [hetzner.com/cloud](https://www.hetzner.com/cloud/) and create an account
2. Hetzner requires a one-time €20 verification charge (refunded to your account as credit)
3. Verify your identity (usually takes minutes)

### 4.2 Add Your SSH Key

1. Go to **Security → SSH Keys → Add SSH Key**
2. Paste your public key:
   ```bash
   # If you don't have one yet:
   ssh-keygen -t ed25519 -C "your@email.com"
   cat ~/.ssh/id_ed25519.pub
   ```
3. Name it (e.g., `my-laptop`)

### 4.3 Create the Server

1. Click **"Add Server"**
2. Configure:

| Setting | Value |
|---------|-------|
| **Location** | Ashburn (ash) — closest to US users |
| **Image** | Ubuntu 24.04 |
| **Type** | Shared vCPU → **CX22** (2 vCPUs, 4 GB RAM, 40 GB SSD) |
| **Networking** | Public IPv4 + IPv6 |
| **SSH Key** | Select the key you just added |
| **Name** | `devops-engineers` |

3. Click **"Create & Buy Now"**
4. Note the **server IP address** (e.g., `65.109.xxx.xxx`)

> **Cost**: CX22 = €4.49/mo (~$5/mo). This includes 20 TB of outbound traffic.

### 4.4 Basic Server Hardening

SSH into your server:

```bash
ssh root@YOUR_SERVER_IP
```

Run basic security setup:

```bash
# Update system
apt update && apt upgrade -y

# Set up automatic security updates
apt install unattended-upgrades -y
dpkg-reconfigure -plow unattended-upgrades

# Set up firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8000/tcp    # Coolify dashboard
ufw enable
```

---

## Step 5: Coolify — Install & Configure

### 5.1 Install Coolify

Still SSH'd into your server:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

This installs Docker, Traefik (reverse proxy), and the Coolify UI. Takes ~2 minutes.

When complete, you'll see:

```
Coolify is ready! Access it at: http://YOUR_SERVER_IP:8000
```

### 5.2 Initial Setup

1. Open `http://YOUR_SERVER_IP:8000` in your browser
2. Create your admin account (email + password)
3. Complete the setup wizard:
   - **Server**: `localhost` (already configured)
   - **Validate**: Let Coolify verify Docker is running

### 5.3 Connect GitHub

1. Go to **Sources → Add → GitHub App**
2. Click **"Register a GitHub App"**
3. Follow the wizard:
   - Coolify will redirect you to GitHub to create a GitHub App
   - Authorize it to access your repositories
   - Select `vellankikoti/trainings` (or all repositories)
4. Back in Coolify, verify the source shows as connected

### 5.4 Set Up the Domain

1. Go to **Settings → General**
2. Under "Instance's Domain", set: `http://YOUR_SERVER_IP:8000` (or a subdomain like `coolify.vellanki.in`)

---

## Step 6: Deploy the Application

### 6.1 Create a New Project

1. In Coolify, click **Projects → Add**
2. Name: `DevOps Engineers`
3. Click on the project → click **"Production"** environment → **Add New Resource**

### 6.2 Configure the Application

1. Select **Application** → **Public Repository** or **GitHub App** (if connected)
2. Select repository: `vellankikoti/trainings`
3. Branch: `main`

Configure the build:

| Setting | Value |
|---------|-------|
| **Build Pack** | Dockerfile |
| **Dockerfile Location** | `/Dockerfile` |
| **Port** | 3000 |
| **Domain** | `vellanki.in` |

### 6.3 Set Environment Variables

In your application → **Environment Variables**, add each variable:

**Required:**
```
NEXT_PUBLIC_APP_URL=https://vellanki.in
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_OUTPUT_MODE=standalone
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

### 6.4 Deploy

1. Click **Deploy** — Coolify builds the Docker image using the Dockerfile
2. Build takes ~3-5 minutes on first deploy (subsequent deploys are faster due to layer caching)
3. Watch the build logs for any errors

### 6.5 Configure DNS

After the app is deployed, add DNS records in Cloudflare:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `YOUR_SERVER_IP` | DNS only (grey cloud) |
| A | `www` | `YOUR_SERVER_IP` | DNS only (grey cloud) |

> **Important**: Keep proxy mode as "DNS only" (grey cloud) so Coolify's Traefik can handle SSL via Let's Encrypt. Once SSL is working, you can optionally switch to orange cloud (Cloudflare proxy) for additional caching.

### 6.6 SSL Certificate

Coolify automatically provisions a Let's Encrypt SSL certificate for `vellanki.in` once DNS propagates. This usually takes 1-5 minutes.

Verify SSL:
```bash
curl -I https://vellanki.in
# Should show HTTP/2 200 with valid SSL
```

---

## Step 7: Configure Webhooks

Now that `vellanki.in` is live, update your webhook endpoints.

### 7.1 Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks**
2. Edit your endpoint (or create a new one):
   - **URL**: `https://vellanki.in/api/webhooks/clerk`
   - **Events**: `user.created`, `user.updated`, `user.deleted`
3. Copy the **Signing Secret** → update `CLERK_WEBHOOK_SECRET` in Coolify

### 7.2 Stripe Webhook (if using)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers → Webhooks**
2. **Add endpoint**:
   - **URL**: `https://vellanki.in/api/webhooks/stripe`
   - **Events**: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
3. Copy the **Signing Secret** → update `STRIPE_WEBHOOK_SECRET` in Coolify

---

## Step 8: Resend — Email Setup (Optional)

### 8.1 Create Account & Add Domain

1. Go to [resend.com](https://resend.com) → Sign up (free — 3,000 emails/month)
2. Go to **Domains → Add Domain** → `vellanki.in`
3. Add the DNS records Resend provides to Cloudflare:

| Type | Name | Content |
|------|------|---------|
| TXT | `@` | SPF record from Resend |
| CNAME | various | DKIM records from Resend |
| TXT | `_dmarc` | DMARC record from Resend |

4. Click **Verify** in Resend dashboard

### 8.2 Get API Key

1. **API Keys → Create API Key**
2. Name: `production`
3. Permission: Sending access for `vellanki.in`
4. Copy key → add `RESEND_API_KEY` to Coolify environment variables

---

## Step 9: Sentry — Error Tracking (Optional)

1. Go to [sentry.io](https://sentry.io) → Sign up (free — 5,000 events/month)
2. Create project: Platform = Next.js, Name = `devops-engineers`
3. Copy the DSN → add `NEXT_PUBLIC_SENTRY_DSN` to Coolify environment variables

---

## Step 10: Stripe — Payments (Optional)

### 10.1 Create Products

In [Stripe Dashboard](https://dashboard.stripe.com) → **Products**, create:

| Product | Monthly Price | Annual Price |
|---------|--------------|-------------|
| DevOps Engineers Premium | $9/mo | $79/yr |
| DevOps Engineers Team | $29/mo per seat | $279/yr per seat |

Copy each Price ID (starts with `price_`).

### 10.2 Set Environment Variables

Add to Coolify:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_...
STRIPE_TEAM_MONTHLY_PRICE_ID=price_...
STRIPE_TEAM_ANNUAL_PRICE_ID=price_...
```

---

## Step 11: Set Up Health Monitoring

Since Coolify doesn't have built-in cron jobs like Vercel, set up monitoring separately.

### Option A: Coolify's Built-in Health Checks

Coolify monitors your container health automatically. If the container crashes, it restarts.

### Option B: UptimeRobot (Free — Keeps Supabase Alive)

Supabase free tier pauses after 7 days of inactivity. Prevent this with a free uptime monitor:

1. Go to [uptimerobot.com](https://uptimerobot.com) → Sign up (free — 50 monitors)
2. Add monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://vellanki.in/api/health`
   - **Interval**: 5 minutes
3. This pings your health endpoint every 5 minutes, which queries Supabase, keeping it active

### Option C: Cron Job on the Server

SSH into your Hetzner server and add a cron job:

```bash
# Add to crontab
crontab -e

# Ping health endpoint every 5 minutes
*/5 * * * * curl -s https://vellanki.in/api/health > /dev/null 2>&1

# Trigger email job daily at 9 AM UTC
0 9 * * * curl -s https://vellanki.in/api/cron/emails > /dev/null 2>&1
```

---

## Step 12: Post-Deployment Verification

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

Coolify automatically deploys when you push to `main`. The flow:

```
Push to main
    │
    ▼
GitHub webhook fires → Coolify receives
    │
    ▼
Coolify builds Docker image (Dockerfile)
    │
    ▼
Health check passes → Old container stopped
    │
    ▼
New container starts on :3000
    │
    ▼
Traefik routes vellanki.in → container
    │
    ▼
Live at https://vellanki.in
```

### CI/CD with GitHub Actions

The existing `.github/workflows/ci.yml` runs lint, type-check, build, and tests on every PR. Only code that passes CI gets merged to `main`, which triggers Coolify deploy.

```
PR created → GitHub Actions (lint, type-check, build, test)
    │
    ▼ (passes)
Merge to main → Coolify auto-deploy to vellanki.in
```

---

## Managing Your Server

### Useful SSH Commands

```bash
# SSH into the server
ssh root@YOUR_SERVER_IP

# View running containers
docker ps

# View app logs
docker logs -f $(docker ps -q --filter "name=devops")

# Check disk space
df -h

# Check memory usage
free -m

# Check CPU usage
htop
```

### Coolify Dashboard

Access at `http://YOUR_SERVER_IP:8000` to:
- View deployment history and logs
- Roll back to a previous deployment
- Update environment variables (triggers redeploy)
- Monitor resource usage (CPU, memory, network)
- Manage SSL certificates

### Backup Strategy

```bash
# Coolify stores its config in /data/coolify
# Back it up periodically:
tar -czf coolify-backup-$(date +%F).tar.gz /data/coolify

# Database backups are handled by Supabase (cloud)
# Your code is in GitHub
# Only server config needs backup
```

---

## Scaling Path

| Milestone | Action | Cost |
|-----------|--------|------|
| **Starting out** | Hetzner CX22 (2 vCPU, 4 GB) | $5/mo |
| **Growing traffic** | Upgrade to CX32 (4 vCPU, 8 GB) | $9/mo |
| **High traffic** | CX42 (8 vCPU, 16 GB) or add a second server | $17/mo |
| **500 DB connections** | Supabase Pro (8 GB, daily backups) | +$25/mo |
| **10k+ MAU** | Clerk Pro | +$25/mo |
| **3k+ emails/mo** | Resend Pro | +$20/mo |

> **Scaling on Hetzner is easy**: Just resize the server in the Hetzner dashboard (takes ~30 seconds, brief downtime).

---

## Troubleshooting

### Build Fails in Coolify

```
Error: Missing required environment variables
```
**Fix**: Ensure `NEXT_OUTPUT_MODE=standalone` is set in Coolify environment variables. The Dockerfile sets `SKIP_ENV_VALIDATION=true` during build, so other env vars aren't needed at build time.

### SSL Certificate Not Issuing

**Fix**: Ensure DNS records are set to "DNS only" (grey cloud) in Cloudflare, not "Proxied" (orange cloud). Coolify's Traefik needs direct access to issue Let's Encrypt certificates.

### Clerk Webhook Returning 400/401

**Fix**: Verify `CLERK_WEBHOOK_SECRET` in Coolify matches the signing secret in Clerk Dashboard → Webhooks. Redeploy after updating.

### Database Connection Error

```
{"status":"degraded","checks":{"database":"unreachable"}}
```
**Fix**: Check if Supabase project is paused (free tier pauses after 7 days of inactivity). Resume it in the Supabase dashboard. Set up UptimeRobot (Step 11) to prevent this.

### Container Keeps Restarting

```bash
# Check container logs
docker logs $(docker ps -aq --filter "name=devops" | head -1)
```
**Fix**: Usually an environment variable issue. Check Coolify dashboard → Application → Logs.

### Out of Disk Space

```bash
# Clean up old Docker images
docker system prune -a --volumes
```

### Port 3000 Conflict

Coolify uses Traefik as a reverse proxy. Your app runs on port 3000 inside the container, and Traefik routes external traffic (443/80) to it. No port conflicts possible since each container has its own network.

---

## Quick Reference — All Environment Variables

```bash
# === REQUIRED ===
NEXT_PUBLIC_APP_URL=https://vellanki.in
NEXT_OUTPUT_MODE=standalone

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

- [Coolify Docs — Next.js](https://coolify.io/docs/applications/nextjs)
- [Self-Hosting Next.js with Hetzner and Coolify](https://jb.desishub.com/blog/deploy-nextjs-using-coolify-and-hezner)
- [Hosting Next.js on Hetzner VPS via Coolify](https://deepakness.com/raw/nextjs-on-hetzner-vps/)
- [Coolify GitHub](https://github.com/coollabsio/coolify)
- [Hetzner Cloud](https://www.hetzner.com/cloud/)
- [Vercel vs Coolify Cost Analysis](https://leonstaff.com/blogs/vercel-vs-coolify-cost-analysis/)

For alternative hosting options (Railway, Render, Fly.io), see [hosting-alternatives.md](./hosting-alternatives.md).

---

*DevOps Engineers — Training 1 Million Engineers, One Story at a Time.*
