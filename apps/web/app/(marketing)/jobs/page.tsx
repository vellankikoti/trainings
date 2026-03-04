import { PublicJobBoard } from "./public-job-board";

export const metadata = {
  title: "DevOps Jobs — Find Your Next Role",
  description:
    "Browse DevOps, SRE, Cloud, and Kubernetes engineering jobs. Remote and on-site positions from top companies.",
};

export default function PublicJobBoardPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          DevOps & Cloud Jobs
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Discover opportunities from top companies. Updated daily.
        </p>
      </div>
      <PublicJobBoard />
    </section>
  );
}
