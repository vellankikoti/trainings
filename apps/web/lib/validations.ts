import { z } from "zod";

/**
 * Shared Zod schemas for API input validation.
 * All user-facing API endpoints should validate inputs using these schemas.
 */

/** Slug format: lowercase alphanumeric with hyphens */
const slug = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/);

export const lessonProgressSchema = z.object({
  pathSlug: slug,
  moduleSlug: slug,
  lessonSlug: slug,
  status: z.enum(["in_progress", "completed"]),
});

export const exerciseProgressSchema = z.object({
  lessonSlug: slug,
  exerciseId: z.string().min(1).max(200),
});

export const streakSchema = z.object({
  activityType: z.enum(["lesson", "exercise", "quiz"]),
  xpEarned: z.number().int().min(0).max(10000),
});

export const quizStartSchema = z.object({
  quizId: z.string().min(1).max(200),
  questionCount: z.number().int().min(1).max(100).optional(),
});

export const quizSubmitSchema = z.object({
  quizId: z.string().min(1).max(200),
  answers: z.record(z.string(), z.union([z.string(), z.number(), z.array(z.string())])),
  timeSpentSeconds: z.number().int().min(0).max(86400).optional(),
});

export const certificateGenerateSchema = z.object({
  type: z.enum(["module", "path", "capstone"]),
  title: z.string().min(1).max(200),
  pathSlug: slug.optional(),
  moduleSlug: slug.optional(),
  description: z.string().max(500).optional(),
});

export const profileUpdateSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().max(200).optional().or(z.literal("")),
  twitter_username: z.string().max(50).optional(),
  linkedin_url: z.string().url().max(200).optional().or(z.literal("")),
  experience_level: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .optional(),
  learning_goals: z.array(z.string().max(100)).max(10).optional(),
});

/**
 * Helper to validate request body against a Zod schema.
 * Returns the parsed data or null (with error response).
 */
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { data: any; error: string | null } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return { data: null, error: errors.join(", ") };
  }
  return { data: result.data, error: null };
}
