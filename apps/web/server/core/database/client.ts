/**
 * Database Client Factory
 *
 * Provides Supabase client instances with proper configuration:
 * - Admin client: uses service role key, bypasses RLS (for server-side business logic)
 * - User client: uses anon key with user JWT, respects RLS (for user-scoped queries)
 *
 * Both clients are singleton-per-configuration to avoid connection pool exhaustion.
 * Supabase JS client internally manages connection reuse.
 *
 * Usage:
 *   import { db } from '@/server/core/database/client';
 *
 *   // Admin operations (bypasses RLS)
 *   const { data } = await db.admin.from('profiles').select('*');
 *
 *   // User-scoped operations (respects RLS)
 *   const userDb = db.forUser(supabaseAccessToken);
 *   const { data } = await userDb.from('lesson_progress').select('*');
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { logger } from "../observability/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AdminClient = SupabaseClient<Database>;
export type UserClient = SupabaseClient<Database>;

// ---------------------------------------------------------------------------
// Singleton admin client
// ---------------------------------------------------------------------------

let adminInstance: AdminClient | null = null;

function getAdminClient(): AdminClient {
  if (adminInstance) return adminInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "FATAL: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
    );
  }

  adminInstance = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: "public",
    },
  });

  logger.info("Database admin client initialized", {
    module: "database",
    supabaseUrl: url.replace(/\/\/.*@/, "//***@"), // redact credentials in URL
  });

  return adminInstance;
}

// ---------------------------------------------------------------------------
// User-scoped client factory
// ---------------------------------------------------------------------------

function createUserClient(accessToken: string): UserClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "FATAL: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required"
    );
  }

  return createClient<Database>(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ---------------------------------------------------------------------------
// Transaction helper
// ---------------------------------------------------------------------------

/**
 * Execute a function within a Supabase RPC-based transaction boundary.
 *
 * Supabase JS client doesn't natively support multi-statement transactions.
 * For operations requiring atomicity, we use one of:
 *
 * 1. Single-statement atomicity (UPSERT with ON CONFLICT) — preferred
 * 2. RPC functions defined in PostgreSQL — for complex multi-step operations
 * 3. Multiple statements with rollback-on-error — for non-critical operations
 *
 * This helper wraps approach (3) — it executes a function and if any step
 * fails, the caller is responsible for compensating. Each individual
 * Supabase call is atomic, but the group is not.
 *
 * For true transactional guarantees, define a PostgreSQL function and call
 * it via db.admin.rpc('function_name', args).
 */
export async function withTransaction<T>(
  fn: (client: AdminClient) => Promise<T>
): Promise<T> {
  const client = getAdminClient();
  try {
    return await fn(client);
  } catch (error) {
    logger.error("Transaction failed", error, { module: "database" });
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/**
 * Execute a raw SQL query via Supabase RPC.
 * Use sparingly — prefer typed queries via the Supabase client.
 */
export async function rawQuery<T = unknown>(
  sql: string,
  params?: Record<string, unknown>
): Promise<T> {
  const client = getAdminClient();
  const { data, error } = await client.rpc("execute_sql" as never, {
    query: sql,
    ...params,
  } as never);

  if (error) {
    logger.error("Raw query failed", error, { module: "database", sql });
    throw error;
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Exported database accessor
// ---------------------------------------------------------------------------

export const db = {
  /** Admin client — bypasses RLS. Use for server-side business logic. */
  get admin(): AdminClient {
    return getAdminClient();
  },

  /** Create a user-scoped client that respects RLS policies. */
  forUser(accessToken: string): UserClient {
    return createUserClient(accessToken);
  },
};
