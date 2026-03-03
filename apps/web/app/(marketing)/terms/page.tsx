import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | DevOps Engineers",
  description:
    "Terms and conditions for using the DevOps Engineers training platform.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: March 4, 2026
      </p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-xl font-semibold text-foreground">
            1. Acceptance of Terms
          </h2>
          <p className="mt-3">
            By accessing or using DevOps Engineers (&quot;the Platform&quot;),
            you agree to be bound by these Terms of Service. If you do not agree
            to these terms, please do not use the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            2. Description of Service
          </h2>
          <p className="mt-3">
            DevOps Engineers is an open-source training platform that provides
            DevOps engineering education through learning paths, interactive
            labs, quizzes, and certifications. The platform includes features
            for learners, trainers, institutes, and organizations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            3. User Accounts
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              You must provide accurate information when creating an account
            </li>
            <li>
              You are responsible for maintaining the security of your account
              credentials
            </li>
            <li>
              You must be at least 13 years old to create an account
            </li>
            <li>
              One account per person — sharing accounts is not permitted
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            4. Content & Intellectual Property
          </h2>
          <p className="mt-3">
            Learning content on the Platform is licensed under the MIT License
            unless otherwise noted. You may use the content for personal
            learning and reference. You may not redistribute the content for
            commercial purposes without attribution.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            5. Acceptable Use
          </h2>
          <p className="mt-3">You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              Attempt to gain unauthorized access to other accounts or systems
            </li>
            <li>
              Use automated tools to scrape content or abuse the platform
            </li>
            <li>
              Share lab environments or attempt to escape container sandboxes
            </li>
            <li>
              Submit false or misleading information in profiles or job postings
            </li>
            <li>
              Harass, abuse, or discriminate against other users in discussions
            </li>
            <li>
              Use the Platform for any illegal purpose
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            6. Paid Plans & Subscriptions
          </h2>
          <p className="mt-3">
            Some features may require a paid subscription. Payments are
            processed through Stripe. Subscription terms, pricing, and
            cancellation policies are presented at the time of purchase.
            Refund requests are handled on a case-by-case basis.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            7. Certifications
          </h2>
          <p className="mt-3">
            Certifications issued by the Platform verify completion of specific
            learning paths and assessments. They represent demonstrated
            knowledge within the platform&apos;s curriculum and are not
            accredited by any external certification body.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            8. Trainer & Institute Roles
          </h2>
          <p className="mt-3">
            Trainers and institutes are responsible for managing their batches
            and students in compliance with applicable laws. Student data
            shared with trainers and institutes is governed by our Privacy
            Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            9. Limitation of Liability
          </h2>
          <p className="mt-3">
            The Platform is provided &quot;as is&quot; without warranties of any
            kind. We are not liable for any damages arising from the use of
            the Platform, including but not limited to loss of data, service
            interruptions, or security incidents. Lab environments are
            sandboxed but are used at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            10. Termination
          </h2>
          <p className="mt-3">
            We may suspend or terminate accounts that violate these terms. You
            may delete your account at any time through the Settings page.
            Upon termination, your learning data may be retained for a
            reasonable period for backup purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            11. Changes to Terms
          </h2>
          <p className="mt-3">
            We may update these terms from time to time. Continued use of the
            Platform after changes constitutes acceptance of the new terms.
            Significant changes will be communicated via email or in-app
            notification.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            12. Contact
          </h2>
          <p className="mt-3">
            For questions about these terms, please open an issue on our{" "}
            <a
              href="https://github.com/vellankikoti/trainings"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              GitHub repository
            </a>{" "}
            or contact the maintainers directly.
          </p>
        </section>
      </div>
    </div>
  );
}
