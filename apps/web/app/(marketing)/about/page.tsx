import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about the DEVOPS ENGINEERS mission to train 1 million engineers.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold">About DEVOPS ENGINEERS</h1>
      <div className="mt-8 space-y-6 text-lg text-muted-foreground">
        <p>
          DEVOPS ENGINEERS is an open-source learning platform with one
          ambitious mission: <strong>train 1 million people</strong> to become
          world-class DevOps, Cloud, and SRE engineers — regardless of their
          starting point.
        </p>
        <p>
          We believe that great DevOps education should be accessible to
          everyone. Whether you&apos;re a student, a career changer, or a developer
          looking to level up, our story-driven curriculum meets you where you
          are and takes you to production-ready.
        </p>
        <h2 className="text-2xl font-bold text-foreground">Our Approach</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Story-driven learning:</strong> Every concept is explained
            through real-world analogies and mentor-voice narration.
          </li>
          <li>
            <strong>Hands-on labs:</strong> Practice with real tools in your
            browser or local environment. Break things safely.
          </li>
          <li>
            <strong>Project-based mastery:</strong> Build real infrastructure
            that proves your skills to employers.
          </li>
          <li>
            <strong>Community-powered:</strong> Open source, community
            contributed, and always free.
          </li>
        </ul>
        <h2 className="text-2xl font-bold text-foreground">Built by the Community</h2>
        <p>
          This platform is built and maintained by DevOps engineers who
          understand the journey. We&apos;re committed to keeping core content
          free and open source under the MIT license.
        </p>
      </div>
    </div>
  );
}
