export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          DEVOPS ENGINEERS
        </h1>
        <p className="mt-6 text-xl leading-8 text-muted-foreground">
          From Zero to Production-Ready DevOps Engineer
        </p>
        <p className="mt-4 text-lg text-muted-foreground">
          The open-source platform that transforms anyone into a confident
          DevOps, Cloud, and SRE engineer through story-driven learning,
          hands-on labs, and real-world projects.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/paths"
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Start Learning
          </a>
          <a
            href="https://github.com/vellankikoti/trainings"
            className="text-sm font-semibold leading-6"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </main>
  );
}
