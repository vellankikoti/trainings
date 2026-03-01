import { z } from "zod";

/**
 * Server-side environment variables — never exposed to the browser.
 */
const serverSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // Stripe (optional — payment features disabled if not set)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PREMIUM_MONTHLY_PRICE_ID: z.string().optional(),
  STRIPE_PREMIUM_ANNUAL_PRICE_ID: z.string().optional(),
  STRIPE_TEAM_MONTHLY_PRICE_ID: z.string().optional(),
  STRIPE_TEAM_ANNUAL_PRICE_ID: z.string().optional(),
});

/**
 * Client-side environment variables — prefixed with NEXT_PUBLIC_ and
 * available in the browser bundle.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .default("http://localhost:3000"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default("/dashboard"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default("/onboarding"),
});

/**
 * Validate and export environment variables.
 *
 * We only validate when the variables are actually available (i.e. not during
 * static analysis / CI lint where env vars may not be set).  The `skipValidation`
 * escape hatch lets CI proceed without real keys.
 */
const skipValidation =
  process.env.SKIP_ENV_VALIDATION === "true" ||
  process.env.SKIP_ENV_VALIDATION === "1";

function validateServer() {
  if (skipValidation) {
    return process.env as unknown as z.infer<typeof serverSchema>;
  }

  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid server environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid server environment variables");
  }

  return parsed.data;
}

function validateClient() {
  if (skipValidation) {
    return process.env as unknown as z.infer<typeof clientSchema>;
  }

  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  });

  if (!parsed.success) {
    console.error(
      "❌ Invalid client environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid client environment variables");
  }

  return parsed.data;
}

/**
 * Usage:
 *   import { env } from "@/lib/env";
 *   env.server.CLERK_SECRET_KEY
 *   env.client.NEXT_PUBLIC_APP_URL
 */
export const env = {
  server: validateServer(),
  client: validateClient(),
};
