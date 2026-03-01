import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfileByClerkId } from "@/lib/profile";
import { getUserCertificates } from "@/lib/certificates";

export const metadata: Metadata = {
  title: "My Certificates",
  description: "View all your earned certificates.",
};

export default async function CertificatesPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const profile = await getProfileByClerkId(clerkId);
  if (!profile) redirect("/onboarding");

  const certificates = await getUserCertificates(profile.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">My Certificates</h1>

      {certificates.length === 0 ? (
        <div className="rounded-lg border bg-muted/50 p-8 text-center">
          <h2 className="text-xl font-semibold">No certificates yet</h2>
          <p className="mt-2 text-muted-foreground">
            Complete a learning path to earn your first certificate.
          </p>
          <Link
            href="/paths"
            className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Browse Learning Paths
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((cert) => (
            <Link
              key={cert.id}
              href={`/certificates/${cert.verification_code}`}
              className="rounded-lg border p-6 transition-shadow hover:shadow-md"
            >
              <div className="text-xs font-medium uppercase tracking-wider text-primary">
                {cert.certificate_type} Certificate
              </div>
              <h3 className="mt-2 text-lg font-semibold">{cert.title}</h3>
              {cert.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {cert.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Issued{" "}
                  {new Date(cert.issued_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="font-mono text-xs">
                  {cert.verification_code}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
