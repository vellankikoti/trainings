import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import { generateCertificate } from "@/lib/certificates";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { certificateGenerateSchema, validateBody } from "@/lib/validations";
import { apiErrors, withLogging } from "@/lib/api-helpers";

export const POST = withLogging(async (request: Request) => {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return apiErrors.unauthorized();
  }

  // Rate limit: 3 requests/hour per user
  const rl = await rateLimit(`cert-generate:${clerkId}`, RATE_LIMITS.certificateGenerate);
  if (!rl.success) {
    return rateLimitResponse(rl);
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return apiErrors.notFound("Profile");
  }

  const body = await request.json();
  const validated = validateBody(certificateGenerateSchema, body);
  if (validated.error) {
    return apiErrors.badRequest(validated.error);
  }

  const { type, title, pathSlug, moduleSlug, description } = validated.data as any;

  try {
    const result = await generateCertificate(profileId, type, title, {
      pathSlug,
      moduleSlug,
      description,
    });
    return NextResponse.json(result);
  } catch (err) {
    return apiErrors.badRequest(
      err instanceof Error ? err.message : "Failed to generate certificate",
    );
  }
});
