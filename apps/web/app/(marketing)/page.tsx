import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LEARNING_PATHS = [
  {
    title: "Foundations",
    description: "Linux, Networking, Git, Shell Scripting",
    modules: 6,
    level: "Beginner",
    color: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  {
    title: "Containerization",
    description: "Docker, Podman, Container Security",
    modules: 5,
    level: "Intermediate",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  {
    title: "Orchestration",
    description: "Kubernetes, Helm, Service Mesh",
    modules: 6,
    level: "Intermediate",
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  },
  {
    title: "Infrastructure as Code",
    description: "Terraform, Ansible, Pulumi",
    modules: 5,
    level: "Intermediate",
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  },
  {
    title: "CI/CD & Automation",
    description: "GitHub Actions, Jenkins, ArgoCD, GitOps",
    modules: 6,
    level: "Intermediate",
    color: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
  {
    title: "Cloud & SRE",
    description: "AWS, GCP, Monitoring, Incident Response",
    modules: 8,
    level: "Advanced",
    color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
];

const STATS = [
  { value: "6", label: "Learning Paths" },
  { value: "40+", label: "Modules" },
  { value: "500+", label: "Lessons" },
  { value: "20+", label: "Technologies" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center md:py-32">
        <Badge variant="secondary" className="mb-4">
          Open Source &amp; Free Forever
        </Badge>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          From Zero to{" "}
          <span className="text-primary">Production-Ready</span>{" "}
          DevOps Engineer
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          The open-source platform that transforms anyone — regardless of
          background — into a confident DevOps, Cloud, and SRE engineer through
          story-driven learning, hands-on labs, and real-world projects.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/sign-up">Start Learning Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/paths">Explore Paths</Link>
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/50">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Paths */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold">6 Learning Paths. One Mission.</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Each path takes you from concept to production through hands-on
            projects and real-world scenarios.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {LEARNING_PATHS.map((path) => (
            <Card key={path.title} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{path.title}</h3>
                  <Badge variant="outline" className={path.color}>
                    {path.level}
                  </Badge>
                </div>
                <p className="mt-2 text-muted-foreground">
                  {path.description}
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  {path.modules} modules
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A proven approach to mastering DevOps.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Learn",
                description:
                  "Story-driven lessons that explain concepts with real-world analogies. No dry textbook content — every lesson feels like learning from a mentor.",
              },
              {
                step: "2",
                title: "Practice",
                description:
                  "Hands-on labs in your browser or local machine. Run real commands, break things safely, and build muscle memory through repetition.",
              },
              {
                step: "3",
                title: "Build",
                description:
                  "Apply what you learn to real projects. From containerizing apps to setting up CI/CD pipelines — build a portfolio that proves your skills.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold">
          Ready to Start Your DevOps Journey?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Join thousands of engineers leveling up their DevOps skills. Free,
          open-source, and built by the community.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/sign-up">Get Started Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link
              href="https://github.com/vellankikoti/trainings"
              target="_blank"
              rel="noopener noreferrer"
            >
              Star on GitHub
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
