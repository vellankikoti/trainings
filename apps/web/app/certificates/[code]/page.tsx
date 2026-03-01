import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCertificateByCode } from "@/lib/certificates";

interface CertificatePageProps {
  params: { code: string };
}

export async function generateMetadata({
  params,
}: CertificatePageProps): Promise<Metadata> {
  const cert = await getCertificateByCode(params.code);
  if (!cert) return { title: "Certificate Not Found" };

  const profile = cert.profiles as any;
  const name = profile?.display_name || "Learner";

  return {
    title: `${cert.title} — Certificate`,
    description: `${name} earned the ${cert.title} certificate on DEVOPS ENGINEERS.`,
    openGraph: {
      title: `${cert.title} — DEVOPS ENGINEERS Certificate`,
      description: `${name} earned this certificate by completing ${cert.title}.`,
    },
  };
}

export default async function CertificatePage({
  params,
}: CertificatePageProps) {
  const cert = await getCertificateByCode(params.code);
  if (!cert) notFound();

  const profile = cert.profiles as any;
  const name = profile?.display_name || profile?.username || "Learner";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-lg border-2 border-primary/20 bg-card p-8 text-center shadow-lg">
        <div className="mb-4 text-sm font-medium tracking-wider text-primary">
          DEVOPS ENGINEERS
        </div>
        <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
          Certificate of Completion
        </div>

        <h1 className="mt-6 text-3xl font-bold">{cert.title}</h1>

        {cert.description && (
          <p className="mt-2 text-muted-foreground">{cert.description}</p>
        )}

        <div className="mt-8">
          <div className="text-lg">Awarded to</div>
          <div className="mt-1 text-2xl font-semibold">{name}</div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div>
            <div className="font-medium text-foreground">Issued</div>
            <div>
              {new Date(cert.issued_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
          <div>
            <div className="font-medium text-foreground">Verification</div>
            <div className="font-mono">{cert.verification_code}</div>
          </div>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-1 text-sm text-green-600">
          Verified
        </div>
      </div>
    </div>
  );
}
