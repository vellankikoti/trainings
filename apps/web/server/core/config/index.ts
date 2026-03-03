/**
 * Strict Configuration System
 *
 * All environment variables are validated at import time using Zod.
 * In production, missing required variables cause a hard crash on startup
 * — fail fast, fail loud.
 *
 * Usage:
 *   import { config } from '@/server/core/config';
 *   config.supabase.url  // string (guaranteed valid URL)
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema definitions — every variable documented and constrained
// ---------------------------------------------------------------------------

const configSchema = z.object({
  // -- Environment --
  nodeEnv: z
    .enum(["development", "production", "test"])
    .default("development"),

  // -- Application --
  appUrl: z.string().url(),
  port: z.coerce.number().int().min(1).max(65535).default(3000),

  // -- Supabase (required) --
  supabase: z.object({
    url: z.string().url(),
    anonKey: z.string().min(1),
    serviceRoleKey: z.string().min(1),
  }),

  // -- Clerk (required) --
  clerk: z.object({
    publishableKey: z.string().min(1),
    secretKey: z.string().min(1),
    webhookSecret: z.string().optional(),
  }),

  // -- Redis (required in production) --
  redis: z.object({
    url: z.string().optional(),
    token: z.string().optional(),
  }),

  // -- Stripe (optional — payment features gate on presence) --
  stripe: z
    .object({
      secretKey: z.string().min(1),
      webhookSecret: z.string().min(1),
      premiumMonthlyPriceId: z.string().optional(),
      premiumAnnualPriceId: z.string().optional(),
      teamMonthlyPriceId: z.string().optional(),
      teamAnnualPriceId: z.string().optional(),
    })
    .optional(),

  // -- Resend (optional — email features gate on presence) --
  resend: z
    .object({
      apiKey: z.string().min(1),
      fromAddress: z.string().email().default("noreply@devopsengineer.com"),
    })
    .optional(),

  // -- Sentry (optional — error tracking gate on presence) --
  sentry: z
    .object({
      dsn: z.string().url(),
    })
    .optional(),

  // -- Labs (optional — lab features gate on presence) --
  labs: z
    .object({
      wsHost: z.string().default("localhost"),
      wsPort: z.coerce.number().int().default(8080),
    })
    .optional(),

  // -- Cron jobs --
  cronSecret: z.string().optional(),

  // -- Feature flags --
  features: z.object({
    labsEnabled: z.boolean().default(false),
    jobBoardEnabled: z.boolean().default(false),
    paymentsEnabled: z.boolean().default(false),
    emailEnabled: z.boolean().default(false),
  }),
});

export type Config = z.infer<typeof configSchema>;

// ---------------------------------------------------------------------------
// Build config object from process.env
// ---------------------------------------------------------------------------

function buildConfigFromEnv(): Config {
  const env = process.env;

  const hasStripe = !!env.STRIPE_SECRET_KEY;
  const hasResend = !!env.RESEND_API_KEY;
  const hasSentry = !!env.NEXT_PUBLIC_SENTRY_DSN;
  const hasLabs = !!env.LAB_WS_HOST;

  const raw = {
    nodeEnv: env.NODE_ENV,
    appUrl: env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    port: env.PORT ? Number(env.PORT) : 3000,

    supabase: {
      url: env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    },

    clerk: {
      publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      secretKey: env.CLERK_SECRET_KEY,
      webhookSecret: env.CLERK_WEBHOOK_SECRET,
    },

    redis: {
      url: env.UPSTASH_REDIS_REST_URL || env.REDIS_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    },

    stripe: hasStripe
      ? {
          secretKey: env.STRIPE_SECRET_KEY,
          webhookSecret: env.STRIPE_WEBHOOK_SECRET,
          premiumMonthlyPriceId: env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
          premiumAnnualPriceId: env.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
          teamMonthlyPriceId: env.STRIPE_TEAM_MONTHLY_PRICE_ID,
          teamAnnualPriceId: env.STRIPE_TEAM_ANNUAL_PRICE_ID,
        }
      : undefined,

    resend: hasResend
      ? {
          apiKey: env.RESEND_API_KEY,
          fromAddress: env.EMAIL_FROM,
        }
      : undefined,

    sentry: hasSentry
      ? {
          dsn: env.NEXT_PUBLIC_SENTRY_DSN,
        }
      : undefined,

    labs: hasLabs
      ? {
          wsHost: env.LAB_WS_HOST,
          wsPort: env.LAB_WS_PORT,
        }
      : undefined,

    cronSecret: env.CRON_SECRET,

    features: {
      labsEnabled: hasLabs,
      jobBoardEnabled: env.FEATURE_JOB_BOARD === "true",
      paymentsEnabled: hasStripe,
      emailEnabled: hasResend,
    },
  };

  return raw as Config;
}

// ---------------------------------------------------------------------------
// Validate and freeze — runs once at import time
// ---------------------------------------------------------------------------

function loadConfig(): Config {
  const skipValidation =
    process.env.SKIP_ENV_VALIDATION === "true" ||
    process.env.SKIP_ENV_VALIDATION === "1";

  const raw = buildConfigFromEnv();

  if (skipValidation) {
    return Object.freeze(raw) as Config;
  }

  const result = configSchema.safeParse(raw);

  if (!result.success) {
    const formatted = result.error.issues.map(
      (issue) => `  ${issue.path.join(".")}: ${issue.message}`
    );

    // In production, crash immediately. In dev, log and crash.
    const message = [
      "",
      "FATAL: Invalid environment configuration",
      "The following variables failed validation:",
      "",
      ...formatted,
      "",
      "Fix the .env file and restart the process.",
      "",
    ].join("\n");

    // eslint-disable-next-line no-console
    console.error(message);
    throw new Error("Invalid environment configuration");
  }

  return Object.freeze(result.data);
}

/**
 * Global application configuration.
 * Validated at import time. Frozen (immutable) after validation.
 */
export const config: Config = loadConfig();

// ---------------------------------------------------------------------------
// Convenience predicates
// ---------------------------------------------------------------------------

export function isProduction(): boolean {
  return config.nodeEnv === "production";
}

export function isDevelopment(): boolean {
  return config.nodeEnv === "development";
}

export function isTest(): boolean {
  return config.nodeEnv === "test";
}
