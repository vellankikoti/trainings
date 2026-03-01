import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

/**
 * Generate a URL-safe verification code.
 */
function generateVerificationCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

/**
 * Generate a certificate for a user. Returns existing certificate if already earned.
 */
export async function generateCertificate(
  userId: string,
  type: "module" | "path" | "platform",
  title: string,
  options: {
    pathSlug?: string;
    moduleSlug?: string;
    description?: string;
  } = {},
): Promise<{
  id: string;
  verificationCode: string;
  issuedAt: string;
  alreadyExisted: boolean;
}> {
  const supabase = createAdminClient();

  // Check for existing certificate
  const query = supabase
    .from("certificates")
    .select("id, verification_code, issued_at")
    .eq("user_id", userId)
    .eq("certificate_type", type)
    .eq("title", title);

  if (options.pathSlug) query.eq("path_slug", options.pathSlug);
  if (options.moduleSlug) query.eq("module_slug", options.moduleSlug);

  const { data: existing } = await query.single();

  if (existing) {
    return {
      id: existing.id,
      verificationCode: existing.verification_code,
      issuedAt: existing.issued_at,
      alreadyExisted: true,
    };
  }

  // Verify completion requirements
  if (type === "module" && options.pathSlug && options.moduleSlug) {
    const { data: progress } = await supabase
      .from("module_progress")
      .select("percentage")
      .eq("user_id", userId)
      .eq("path_slug", options.pathSlug)
      .eq("module_slug", options.moduleSlug)
      .single();

    if (!progress || progress.percentage < 100) {
      throw new Error("Module not completed");
    }
  }

  if (type === "path" && options.pathSlug) {
    const { data: progress } = await supabase
      .from("path_progress")
      .select("percentage")
      .eq("user_id", userId)
      .eq("path_slug", options.pathSlug)
      .single();

    if (!progress || progress.percentage < 100) {
      throw new Error("Path not completed");
    }
  }

  const verificationCode = generateVerificationCode();

  const { data: cert, error } = await supabase
    .from("certificates")
    .insert({
      user_id: userId,
      certificate_type: type,
      title,
      description: options.description ?? null,
      path_slug: options.pathSlug ?? null,
      module_slug: options.moduleSlug ?? null,
      verification_code: verificationCode,
      public_url: `/certificates/${verificationCode}`,
    })
    .select("id, verification_code, issued_at")
    .single();

  if (error || !cert) {
    throw new Error("Failed to create certificate");
  }

  return {
    id: cert.id,
    verificationCode: cert.verification_code,
    issuedAt: cert.issued_at,
    alreadyExisted: false,
  };
}

/**
 * Get a certificate by verification code (public).
 */
export async function getCertificateByCode(code: string) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("certificates")
    .select("*, profiles(display_name, username, avatar_url)")
    .eq("verification_code", code)
    .single();

  return data;
}

/**
 * Get all certificates for a user.
 */
export async function getUserCertificates(userId: string) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });

  return data ?? [];
}
