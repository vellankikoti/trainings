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

  const certUrl = `${(process.env.NEXT_PUBLIC_APP_URL || "https://devopsengineers.in").replace(/[\r\n]+$/, "")}/certificates/${cert.verification_code}`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just earned the "${cert.title}" certificate on DEVOPS ENGINEERS!`)}&url=${encodeURIComponent(certUrl)}`;

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Verified
        </div>
      </div>

      {/* Actions row */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {/* Download PDF */}
        <a
          href={`/api/certificates/${cert.verification_code}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          Download PDF
        </a>

        {/* Share on LinkedIn */}
        <a
          href={linkedInShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-[#0A66C2]"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          Share on LinkedIn
        </a>

        {/* Share on X/Twitter */}
        <a
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </a>
      </div>
    </div>
  );
}
