"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { mdxComponents } from "@/lib/mdx-components";

interface LessonContentProps {
  source: MDXRemoteSerializeResult;
}

export function LessonContent({ source }: LessonContentProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <MDXRemote {...source} components={mdxComponents as any} />
    </article>
  );
}
