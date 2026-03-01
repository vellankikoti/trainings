import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, tutorials, and news from the DEVOPS ENGINEERS team.",
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-2 text-4xl font-bold">Blog</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        Insights, tutorials, and news from the DevOps community.
      </p>

      {posts.length === 0 ? (
        <div className="rounded-lg border bg-muted/50 p-8 text-center">
          <h2 className="text-xl font-semibold">Coming Soon</h2>
          <p className="mt-2 text-muted-foreground">
            We&apos;re working on our first blog posts. Stay tuned!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block rounded-lg border p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span>{post.readingTime} min read</span>
              </div>
              <h2 className="mt-2 text-2xl font-semibold">{post.title}</h2>
              {post.description && (
                <p className="mt-2 text-muted-foreground">{post.description}</p>
              )}
              {post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-3 py-0.5 text-xs text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
