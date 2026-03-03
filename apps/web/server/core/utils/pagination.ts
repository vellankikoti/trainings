/**
 * Cursor-Based Pagination
 *
 * Provides stable pagination that doesn't break when data is
 * inserted or deleted between page requests.
 *
 * Cursor is an opaque base64-encoded JSON string. The client
 * treats it as a black box — just passes it back for the next page.
 *
 * Usage:
 *   const { cursor, limit } = parsePagination(req);
 *   const decoded = decodeCursor(cursor);
 *   // ... use decoded.id or decoded.created_at in WHERE clause
 *   const nextCursor = encodeCursor({ id: lastItem.id });
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PaginationParams {
  cursor: string | null;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    cursor: string | null;
    hasMore: boolean;
    total?: number;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Parse pagination params from a URL's search params.
 */
export function parsePagination(req: Request): PaginationParams {
  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor") || null;
  const rawLimit = url.searchParams.get("limit");
  const limit = rawLimit
    ? Math.min(Math.max(1, parseInt(rawLimit, 10) || DEFAULT_LIMIT), MAX_LIMIT)
    : DEFAULT_LIMIT;

  return { cursor, limit };
}

// ---------------------------------------------------------------------------
// Cursor encoding/decoding
// ---------------------------------------------------------------------------

/**
 * Encode a cursor object to an opaque string.
 */
export function encodeCursor(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data)).toString("base64url");
}

/**
 * Decode an opaque cursor string back to an object.
 * Returns null if the cursor is invalid.
 */
export function decodeCursor<T extends Record<string, unknown>>(
  cursor: string | null
): T | null {
  if (!cursor) return null;

  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf-8");
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

/**
 * Build a paginated response object.
 *
 * Convention: query for `limit + 1` items. If you get `limit + 1` items,
 * there are more pages. Return only `limit` items and set hasMore = true.
 */
export function buildPaginatedResponse<T extends { id: string }>(
  items: T[],
  limit: number,
  total?: number
): PaginatedResponse<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const lastItem = data[data.length - 1];

  return {
    data,
    pagination: {
      cursor: hasMore && lastItem ? encodeCursor({ id: lastItem.id }) : null,
      hasMore,
      total,
    },
  };
}
