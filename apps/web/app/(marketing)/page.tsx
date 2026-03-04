import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LEARNING_PATHS = [
  {
    slug: "foundations",
    title: "Foundations",
    description: "Linux, Networking, Git, Shell Scripting",
    modules: 6,
    level: "Beginner",
    color: "border-l-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    slug: "containerization",
    title: "Containerization",
    description: "Docker, Podman, Container Security",
    modules: 5,
    level: "Intermediate",
    color: "border-l-blue-500",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    slug: "platform-engineering",
    title: "Platform Engineering",
    description: "Platform Design, Developer Portals, Golden Paths",
    modules: 6,
    level: "Advanced",
    color: "border-l-violet-500",
    badgeClass: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  },
  {
    slug: "iac-cloud",
    title: "Infrastructure as Code",
    description: "Terraform, Ansible, Pulumi",
    modules: 5,
    level: "Intermediate",
    color: "border-l-amber-500",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  {
    slug: "cicd-gitops",
    title: "CI/CD & Automation",
    description: "GitHub Actions, Jenkins, ArgoCD, GitOps",
    modules: 6,
    level: "Intermediate",
    color: "border-l-rose-500",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  },
  {
    slug: "observability",
    title: "Cloud & SRE",
    description: "AWS, GCP, Monitoring, Incident Response",
    modules: 8,
    level: "Advanced",
    color: "border-l-cyan-500",
    badgeClass: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  },
];

const STATS = [
  { value: "6", label: "Learning Paths" },
  { value: "40+", label: "Modules" },
  { value: "500+", label: "Lessons" },
  { value: "20+", label: "Technologies" },
];

const STEPS = [
  {
    step: "1",
    title: "Learn",
    description:
      "Story-driven lessons that explain concepts with real-world analogies. No dry textbook content — every lesson feels like learning from a mentor.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    step: "2",
    title: "Practice",
    description:
      "Hands-on labs in your browser or local machine. Run real commands, break things safely, and build muscle memory through repetition.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  {
    step: "3",
    title: "Build",
    description:
      "Apply what you learn to real projects. From containerizing apps to setting up CI/CD pipelines — build a portfolio that proves your skills.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M12 12h.01" />
        <path d="M17 12h.01" />
        <path d="M7 12h.01" />
      </svg>
    ),
  },
];

export default async function HomePage() {
  /* ── Auth-aware redirect ──
   * Logged-in users are taken straight to their personalized Dashboard.
   * The marketing homepage is only for acquisition / logged-out visitors.
   */
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-cyan-50/30 dark:from-blue-950/30 dark:via-background dark:to-cyan-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(36,150,237,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(36,150,237,0.08),transparent)]" />
        <div className="container relative mx-auto px-4 py-24 text-center md:py-36">
          <Badge
            variant="secondary"
            className="mb-6 border border-blue-200/60 bg-blue-50 text-blue-700 dark:border-blue-800/40 dark:bg-blue-500/10 dark:text-blue-400"
          >
            Open Source &amp; Free Forever
          </Badge>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            From Zero to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400">
              Production-Ready
            </span>{" "}
            DevOps Engineer
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            The open-source platform that transforms anyone — regardless of
            background — into a confident DevOps, Cloud, and SRE engineer through
            story-driven learning, hands-on labs, and real-world projects.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/sign-up">
                Start Learning Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/paths">Explore Paths</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 py-14 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1.5 text-sm font-medium text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Paths */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            6 Learning Paths. One Mission.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Each path takes you from concept to production through hands-on
            projects and real-world scenarios.
          </p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {LEARNING_PATHS.map((path) => (
            <Link
              key={path.slug}
              href={`/paths/${path.slug}`}
              className={`group rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md ${path.color} border-l-4`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {path.title}
                </h3>
                <Badge
                  variant="secondary"
                  className={`shrink-0 text-[11px] ${path.badgeClass}`}
                >
                  {path.level}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {path.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {path.modules} modules
                </span>
                <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  View Path →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y bg-card">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
              A proven approach to mastering DevOps.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-3">
            {STEPS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
                  {item.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_110%,rgba(0,0,0,0.2),transparent)]" />
        <div className="container relative mx-auto px-4 py-20 text-center md:py-28">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Ready to Start Your DevOps Journey?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100/80">
            Join thousands of engineers leveling up their DevOps skills. Free,
            open-source, and built by the community.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button
              size="lg"
              asChild
              className="w-full bg-white text-blue-700 hover:bg-blue-50 sm:w-auto"
            >
              <Link href="/sign-up">Get Started Free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full border-white bg-white/10 text-white hover:bg-white/20 hover:text-white sm:w-auto"
            >
              <Link
                href="https://github.com/vellankikoti/trainings"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-1.5">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Star on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
