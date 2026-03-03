import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | DevOps Engineers",
  description:
    "How DevOps Engineers collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: March 4, 2026
      </p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-xl font-semibold text-foreground">
            1. Information We Collect
          </h2>
          <p className="mt-3">
            When you create an account, we collect your name, email address, and
            profile information through our authentication provider (Clerk). As
            you use the platform, we collect learning progress data, quiz
            responses, lab session metadata, and usage analytics.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            2. How We Use Your Information
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Provide and personalize the learning experience</li>
            <li>Track your progress, XP, streaks, and certifications</li>
            <li>Generate skill assessments and learning recommendations</li>
            <li>Enable trainer and institute features (batch management, student monitoring)</li>
            <li>Enable organization features (candidate discovery, job matching)</li>
            <li>Send transactional emails (certificates, account updates)</li>
            <li>Improve platform performance and content quality</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            3. Data Storage & Security
          </h2>
          <p className="mt-3">
            Your data is stored securely using Supabase (PostgreSQL) with
            Row-Level Security (RLS) policies ensuring users can only access
            their own data. Authentication is handled by Clerk with
            industry-standard encryption. All data is transmitted over HTTPS
            with TLS 1.2+.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            4. Third-Party Services
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              <strong>Clerk</strong> — Authentication and user management
            </li>
            <li>
              <strong>Supabase</strong> — Database and storage
            </li>
            <li>
              <strong>Stripe</strong> — Payment processing (for paid plans)
            </li>
            <li>
              <strong>Resend</strong> — Transactional emails
            </li>
            <li>
              <strong>Vercel</strong> — Hosting and analytics
            </li>
            <li>
              <strong>Sentry</strong> — Error monitoring (anonymized)
            </li>
          </ul>
          <p className="mt-3">
            Each service has its own privacy policy. We do not sell your personal
            data to any third party.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            5. Profile Visibility
          </h2>
          <p className="mt-3">
            You can control your profile visibility in Settings. Public profiles
            display your username, bio, skills, badges, and certifications.
            Private profiles are not discoverable by other users or
            organizations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            6. Cookies & Analytics
          </h2>
          <p className="mt-3">
            We use essential cookies for authentication and session management.
            We use Vercel Web Analytics for aggregated, privacy-friendly usage
            statistics. We do not use third-party advertising cookies or
            cross-site tracking.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            7. Data Retention
          </h2>
          <p className="mt-3">
            Your learning progress, certifications, and account data are
            retained as long as your account is active. You may request
            deletion of your account and associated data by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            8. Your Rights
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Export your learning data</li>
            <li>Control your profile visibility</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            9. Open Source
          </h2>
          <p className="mt-3">
            DevOps Engineers is open-source software licensed under the MIT
            License. You can inspect the codebase, data models, and security
            practices on our{" "}
            <a
              href="https://github.com/vellankikoti/trainings"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              GitHub repository
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            10. Contact
          </h2>
          <p className="mt-3">
            For privacy inquiries or data requests, please open an issue on our
            GitHub repository or contact the maintainers directly.
          </p>
        </section>
      </div>
    </div>
  );
}
