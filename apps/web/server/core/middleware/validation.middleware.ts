/**
 * Validation Middleware
 *
 * Validates request bodies against Zod schemas before the handler executes.
 * On validation success, attaches the typed body to ctx.body.
 * On validation failure, throws a ValidationError with field-level details.
 *
 * Usage:
 *   import { z } from 'zod';
 *
 *   const schema = z.object({ lessonSlug: z.string().min(1) });
 *
 *   export const POST = withValidation(schema, async (req, ctx) => {
 *     const { lessonSlug } = ctx.body as z.infer<typeof schema>;
 *     // lessonSlug is guaranteed to be a valid, non-empty string
 *   });
 */

import { NextRequest } from "next/server";
import { ZodType, ZodError } from "zod";
import { BadRequestError, ValidationError } from "../errors";
import type { RouteHandler, RequestContext } from "./types";

export function withValidation<T>(
  schema: ZodType<T>,
  handler: RouteHandler
): RouteHandler {
  return async (req: NextRequest, ctx: RequestContext): Promise<Response> => {
    let rawBody: unknown;

    try {
      rawBody = await req.json();
    } catch {
      throw new BadRequestError("Request body must be valid JSON");
    }

    // Parse with Zod — throws ZodError on failure (caught by error middleware)
    const result = schema.safeParse(rawBody);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        }))
      );
    }

    ctx.body = result.data;
    return handler(req, ctx);
  };
}

/**
 * Validate query parameters against a Zod schema.
 * Parsed values are attached to ctx.body.
 */
export function withQueryValidation<T>(
  schema: ZodType<T>,
  handler: RouteHandler
): RouteHandler {
  return async (req: NextRequest, ctx: RequestContext): Promise<Response> => {
    const url = new URL(req.url);
    const params: Record<string, string> = {};

    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const result = schema.safeParse(params);

    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        }))
      );
    }

    ctx.body = result.data;
    return handler(req, ctx);
  };
}
