# Hosting Alternatives — Beyond Vercel

> You've set up Supabase, Clerk, and Cloudflare DNS (`vellanki.in`).
> Now you need somewhere to run the Next.js app. Here are your best options.

---

## Quick Comparison

| Platform | Cost/mo | Setup Time | Cold Starts | Auto-Deploy | Difficulty |
|----------|---------|-----------|-------------|------------|------------|
| **Coolify + Hetzner** | ~$5 | 30 min | None | Yes (git push) | Medium |
| **Railway** | $5 | 5 min | None | Yes (git push) | Easy |
| **Render** | $7 | 5 min | Yes (free tier) | Yes (git push) | Easy |
| **Fly.io** | ~$5 | 15 min | None | Yes (CLI) | Medium |
| **AWS Amplify** | Free tier | 20 min | Yes | Yes (git push) | Medium |
| **Vercel** | $20 (Pro) | 5 min | None | Yes (git push) | Easy |

**Recommendation**: **Coolify + Hetzner** for best value, **Railway** for easiest setup.

---

## Option 1: Coolify + Hetzner (Recommended — $5/mo)

Coolify is an open-source, self-hosted PaaS that gives you the Vercel experience on your own VPS. Hetzner is a European cloud provider with the best price-to-performance ratio.

**What you get for ~$5/mo:**
- 2 vCPUs, 4 GB RAM, 40 GB SSD (Hetzner CX22)
- Push-to-deploy from GitHub (like Vercel)
- Automatic SSL via Let's Encrypt
- Deploy multiple apps on the same server
- No cold starts — your app is always running
- Full control over infrastructure

### Step 1: Create a Hetzner VPS

1. Sign up at [hetzner.com/cloud](https://www.hetzner.com/cloud/)
   - Hetzner requires a one-time $20 verification charge (refunded)

2. Click **"Add Server"** and configure:
   - **Location**: Nuremberg (nbg1) or Falkenstein (fsn1) — cheapest EU locations
     - Or Ashburn (ash) if most users are in the US
   - **Image**: Ubuntu 24.04
   - **Type**: Shared vCPU — **CX22** (2 vCPUs, 4 GB RAM) — **€4.49/mo (~$5)**
   - **SSH Key**: Add your public SSH key (recommended over password)
   - **Name**: `devops-engineers`

3. Click **"Create & Buy Now"**
4. Note the server IP address (e.g., `65.109.xxx.xxx`)

### Step 2: Install Coolify

SSH into your new server and run the Coolify installer:

```bash
ssh root@YOUR_SERVER_IP

# Install Coolify (installs Docker, Traefik, and Coolify UI)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Wait ~2 minutes. Coolify will print:

```
Coolify is ready! Access it at: http://YOUR_SERVER_IP:8000
```

### Step 3: Configure Coolify

1. Open `http://YOUR_SERVER_IP:8000` in your browser
2. Create your admin account
3. Go to **Settings → General**:
   - Set your instance domain (optional — you can use the IP)

### Step 4: Connect Your Domain

In **Cloudflare DNS** (`vellanki.in`), add:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `YOUR_SERVER_IP` | DNS only (grey cloud) |
| A | `www` | `YOUR_SERVER_IP` | DNS only (grey cloud) |

> **Important**: Use "DNS only" (grey cloud) so Coolify can issue SSL certificates via Let's Encrypt. You can enable Cloudflare proxy (orange cloud) later after SSL is set up.

### Step 5: Connect GitHub

1. In Coolify, go to **Sources → Add** → **GitHub App**
2. Follow the wizard to create a GitHub App and authorize it
3. Select the `vellankikoti/trainings` repository

### Step 6: Deploy the App

1. In Coolify, go to **Projects → Add** → **New Resource** → **Application**
2. Select your GitHub source → `vellankikoti/trainings` repo → `main` branch
3. Configure:
   - **Build Pack**: Dockerfile (auto-detected)
   - **Port**: 3000
   - **Domain**: `vellanki.in`

4. Go to **Environment Variables** and add:

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

5. Click **Deploy** — Coolify will build the Docker image and start the container

### Step 7: Verify

```bash
curl https://vellanki.in/api/health
# {"status":"healthy","checks":{"database":"connected","auth":"configured"}}
```

### Auto-Deploy on Push

Coolify automatically deploys when you push to `main`. You can configure:
- **Branch**: Which branch triggers deploy (default: `main`)
- **Preview Deployments**: Auto-deploy PRs with unique URLs
- **Webhooks**: GitHub webhooks are set up automatically by the GitHub App

### Coolify Dashboard

Access your Coolify dashboard at `http://YOUR_SERVER_IP:8000` to:
- View deployment logs
- Monitor CPU/memory usage
- Manage environment variables
- Roll back to previous deployments
- Set up cron jobs via Coolify's scheduler

---

## Option 2: Railway ($5/mo)

Railway is the easiest Vercel alternative. Connect GitHub, push, and your app is live.

### Step 1: Create a Railway Account

1. Go to [railway.com](https://railway.com) → Sign up with GitHub
2. You get $5 in free trial credits (no credit card required)
3. After trial, the Hobby plan is $5/mo with $5 in included usage

### Step 2: Create a New Project

1. Click **"New Project"** → **"Deploy from GitHub Repo"**
2. Select `vellankikoti/trainings`
3. Railway auto-detects the Dockerfile and starts building

### Step 3: Configure Environment Variables

In Railway → your service → **Variables**, add:

```
NEXT_PUBLIC_APP_URL=https://vellanki.in
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_OUTPUT_MODE=standalone
PORT=3000
```

### Step 4: Add Custom Domain

1. In Railway → your service → **Settings → Networking → Custom Domain**
2. Add `vellanki.in`
3. Railway will show a CNAME record to add in Cloudflare:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `@` | `your-project.up.railway.app` | DNS only |
| CNAME | `www` | `your-project.up.railway.app` | DNS only |

> **Note**: For root domains (`@`), Cloudflare supports CNAME flattening, so a CNAME record on `@` works.

### Step 5: Deploy

Railway auto-deploys on every push to `main`. First deployment takes ~3-5 minutes.

### Step 6: Verify

```bash
curl https://vellanki.in/api/health
```

### Railway Cost Estimate

With $5/mo Hobby plan:
- Your app uses ~256MB RAM and minimal CPU
- Estimated usage: **$2-4/month** (well within the $5 credit)
- You effectively pay **$5/month flat** for most hobby projects

---

## Option 3: Render ($7/mo)

### Quick Setup

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **"New" → "Web Service"**
3. Connect `vellankikoti/trainings`
4. Configure:
   - **Environment**: Docker
   - **Plan**: Starter ($7/mo) — free tier sleeps after 15 min of inactivity
5. Add environment variables (same as above)
6. Add custom domain in **Settings → Custom Domains**

Cloudflare DNS:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `@` | `your-app.onrender.com` | DNS only |

---

## Option 4: Fly.io (~$5/mo)

### Quick Setup

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Sign up and login
fly auth signup

# Launch from the project root (uses the Dockerfile)
cd trainings
fly launch

# Set environment variables
fly secrets set \
  NEXT_PUBLIC_APP_URL=https://vellanki.in \
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... \
  CLERK_SECRET_KEY=sk_live_... \
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... \
  SUPABASE_SERVICE_ROLE_KEY=eyJ... \
  NEXT_OUTPUT_MODE=standalone

# Deploy
fly deploy

# Add custom domain
fly certs add vellanki.in
```

Cloudflare DNS:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `(IP from fly certs show vellanki.in)` | DNS only |
| AAAA | `@` | `(IPv6 from fly certs show)` | DNS only |

---

## Cloudflare DNS Configuration Summary

Regardless of which host you choose, your Cloudflare DNS setup for `vellanki.in` follows the same pattern:

```
┌─────────────────────────────┐
│  Cloudflare DNS (vellanki.in)│
│                              │
│  @ → [hosting provider]     │
│  www → [hosting provider]   │
│                              │
│  SSL: Full (Strict)          │
│  Proxy: DNS Only (grey)      │
└──────────────┬───────────────┘
               │
    ┌──────────▼──────────┐
    │   Your Host          │
    │   (Coolify/Railway/  │
    │    Render/Fly.io)    │
    │                      │
    │   Next.js App (:3000)│
    └──────┬───┬───┬───────┘
           │   │   │
     ┌─────┘   │   └─────┐
     ▼         ▼         ▼
  Supabase   Clerk    Stripe
  (DB)       (Auth)   (Pay)
```

---

## Post-Deploy Checklist (All Platforms)

After deploying on any platform:

1. **Verify health**: `curl https://vellanki.in/api/health`
2. **Update Clerk webhook**: Dashboard → Webhooks → set endpoint to `https://vellanki.in/api/webhooks/clerk`
3. **Update Stripe webhook** (if using): set endpoint to `https://vellanki.in/api/webhooks/stripe`
4. **Test auth flow**: Sign up → verify redirect → check Supabase `profiles` table
5. **Test content**: Browse to `/paths/foundations` → verify lessons load
6. **Monitor**: Check Sentry for errors (if configured)

---

## Cost Summary for vellanki.in

| Service | Monthly Cost |
|---------|-------------|
| Supabase (Free) | $0 |
| Clerk (Free, 10k MAU) | $0 |
| Cloudflare DNS (Free) | $0 |
| Domain (vellanki.in) | ~$1 (yearly) |
| **Coolify + Hetzner** | **$5** |
| _or_ **Railway** | **$5** |
| _or_ **Render** | **$7** |
| | |
| **Total** | **$5-7/mo** |

---

## Sources

- [Coolify — Open Source PaaS](https://coolify.io/)
- [Self-Hosting Next.js with Hetzner and Coolify — Step-by-Step Guide](https://jb.desishub.com/blog/deploy-nextjs-using-coolify-and-hezner)
- [Coolify Next.js Docs](https://coolify.io/docs/applications/nextjs)
- [Hosting Next.js on Hetzner VPS via Coolify](https://deepakness.com/raw/nextjs-on-hetzner-vps/)
- [Railway Pricing](https://railway.com/pricing)
- [Render — Deploy Next.js with SSR and API Routes](https://render.com/articles/how-to-deploy-next-js-applications-with-ssr-and-api-routes)
- [10 Best Next.js Hosting Providers in 2026](https://makerkit.dev/blog/tutorials/best-hosting-nextjs)
- [Vercel Alternatives — DigitalOcean](https://www.digitalocean.com/resources/articles/vercel-alternatives)
- [Top 6 Vercel Alternatives — Snappify](https://snappify.com/blog/vercel-alternatives)
- [Vercel vs Coolify Cost Analysis](https://leonstaff.com/blogs/vercel-vs-coolify-cost-analysis/)
