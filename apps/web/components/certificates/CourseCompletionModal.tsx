"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface CourseCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  pathSlug: string;
  moduleSlug: string;
  pathTitle: string;
  xpEarned: number;
}

type Step = "congratulations" | "name-confirm" | "generating" | "certificate-ready";

interface CertificateResult {
  verificationCode: string;
  issuedAt: string;
  alreadyExisted: boolean;
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function CourseCompletionModal({
  open,
  onOpenChange,
  courseTitle,
  pathSlug,
  moduleSlug,
  pathTitle,
  xpEarned,
}: CourseCompletionModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("congratulations");
  const [displayName, setDisplayName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<CertificateResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch profile name when modal opens
  useEffect(() => {
    if (!open) return;
    setStep("congratulations");
    setError(null);
    setCertificate(null);
    setCopied(false);

    api.get<{ display_name?: string }>("/api/profile").then(({ data }) => {
      const name = data?.display_name || "";
      setDisplayName(name);
      setOriginalName(name);
    });
  }, [open]);

  const handleUpdateNameAndGenerate = useCallback(async () => {
    setError(null);
    setStep("generating");

    try {
      // Update name if changed
      if (displayName.trim() && displayName.trim() !== originalName) {
        const nameResult = await api.patch("/api/profile", {
          display_name: displayName.trim(),
        });
        if (nameResult.error) {
          setError(nameResult.error);
          setStep("name-confirm");
          return;
        }
      }

      // Generate certificate
      const certResult = await api.post<CertificateResult>(
        "/api/certificates/generate",
        {
          type: "module",
          title: courseTitle,
          pathSlug,
          moduleSlug,
          description: `Completed the ${courseTitle} course in the ${pathTitle} learning path.`,
        },
      );

      if (certResult.error) {
        setError(certResult.error);
        setStep("name-confirm");
        return;
      }

      if (certResult.data) {
        setCertificate(certResult.data);
        setStep("certificate-ready");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("name-confirm");
    }
  }, [displayName, originalName, courseTitle, pathSlug, moduleSlug, pathTitle]);

  const handleCopyLink = useCallback(async () => {
    if (!certificate) return;
    const url = `${window.location.origin}/certificates/${certificate.verificationCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [certificate]);

  const handleClose = useCallback(
    (value: boolean) => {
      if (!value) {
        router.refresh();
      }
      onOpenChange(value);
    },
    [onOpenChange, router],
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md overflow-hidden p-0 sm:max-w-lg">
        {/* ─── Step 1: Congratulations ─── */}
        {step === "congratulations" && (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            {/* Trophy icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-amber-500/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-500"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>

            <h3 className="mt-5 text-2xl font-bold text-foreground">
              Congratulations!
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You&apos;ve completed <strong className="text-foreground">{courseTitle}</strong>
            </p>

            {/* XP badge */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span className="text-sm font-bold text-primary">
                +{xpEarned} XP earned
              </span>
            </div>

            <button
              type="button"
              onClick={() => setStep("name-confirm")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
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
                <rect width="18" height="14" x="3" y="5" rx="2" />
                <path d="M3 10h18" />
              </svg>
              Get Your Certificate
            </button>

            <button
              type="button"
              onClick={() => handleClose(false)}
              className="mt-3 text-sm text-muted-foreground hover:text-foreground"
            >
              Maybe later
            </button>
          </div>
        )}

        {/* ─── Step 2: Name Confirmation ─── */}
        {step === "name-confirm" && (
          <>
            <div className="border-b border-border/60 bg-gradient-to-br from-primary/[0.04] to-transparent px-6 pt-6 pb-5">
              <DialogHeader>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold">
                      Confirm Your Name
                    </DialogTitle>
                    <DialogDescription className="mt-0.5 text-xs">
                      This name will appear on your certificate
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="space-y-4 px-6 py-5">
              <p className="text-sm text-muted-foreground">
                Your certificate will be shared publicly. Please use the name you&apos;d
                like others to see (e.g., your full official name).
              </p>

              <div>
                <label
                  htmlFor="cert-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-foreground/60"
                >
                  Full Name
                </label>
                <input
                  id="cert-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {error && (
                <p className="text-center text-sm text-destructive">{error}</p>
              )}
            </div>

            <div className="border-t border-border/60 bg-muted/20 px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep("congratulations")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!displayName.trim()}
                  onClick={handleUpdateNameAndGenerate}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all",
                    displayName.trim()
                      ? "bg-primary text-white shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
                      : "cursor-not-allowed bg-muted text-muted-foreground",
                  )}
                >
                  Generate Certificate
                </button>
              </div>
            </div>
          </>
        )}

        {/* ─── Step 3: Generating ─── */}
        {step === "generating" && (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <svg
              className="size-10 animate-spin text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Generating your certificate...
            </p>
          </div>
        )}

        {/* ─── Step 4: Certificate Ready ─── */}
        {step === "certificate-ready" && certificate && (
          <div className="flex flex-col items-center px-6 py-8 text-center">
            {/* Certificate preview */}
            <div className="w-full rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent p-6">
              <div className="text-xs font-medium tracking-wider text-primary">
                DEVOPS ENGINEERS
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                Certificate of Completion
              </div>
              <h4 className="mt-3 text-lg font-bold">{courseTitle}</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Awarded to <strong className="text-foreground">{displayName}</strong>
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                Issued{" "}
                {new Date(certificate.issuedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="mt-1 font-mono text-xs text-muted-foreground">
                {certificate.verificationCode}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex w-full flex-col gap-2">
              {/* Download PDF */}
              <a
                href={`/api/certificates/${certificate.verificationCode}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
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

              {/* Copy verification link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
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
                  {copied ? (
                    <path d="M20 6 9 17l-5-5" />
                  ) : (
                    <>
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </>
                  )}
                </svg>
                {copied ? "Link Copied!" : "Copy Verification Link"}
              </button>

              {/* View certificate */}
              <a
                href={`/certificates/${certificate.verificationCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
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
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" x2="21" y1="14" y2="3" />
                </svg>
                View Certificate Page
              </a>
            </div>

            <button
              type="button"
              onClick={() => handleClose(false)}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground"
            >
              Done
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
