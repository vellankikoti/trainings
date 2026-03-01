import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/progress";
import { generateCertificate } from "@/lib/certificates";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { certificateGenerateSchema, validateBody } from "@/lib/validations";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 3 requests/hour per user
  const rl = rateLimit(`cert-generate:${clerkId}`, RATE_LIMITS.certificateGenerate);
  if (!rl.success) {
    return rateLimitResponse(rl);
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const body = await request.json();
  const validated = validateBody(certificateGenerateSchema, body);
  if (validated.error) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { type, title, pathSlug, moduleSlug, description } = validated.data;

  try {
    const result = await generateCertificate(profileId, type, title, {
      pathSlug,
      moduleSlug,
      description,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate certificate" },
      { status: 400 },
    );
  }
}
