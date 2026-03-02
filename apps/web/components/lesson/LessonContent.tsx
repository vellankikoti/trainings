"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { mdxComponents } from "@/lib/mdx-components";

interface LessonContentProps {
  source: MDXRemoteSerializeResult;
}

export function LessonContent({ source }: LessonContentProps) {
  return (
    <article className="prose prose-lg prose-neutral dark:prose-invert max-w-[42rem] prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-[1.8] prose-p:text-foreground/85 prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-strong:font-bold prose-pre:my-8 prose-pre:p-0 prose-pre:rounded-xl prose-pre:bg-[hsl(215,28%,10%)] prose-code:before:content-[''] prose-code:after:content-[''] prose-code:bg-primary/[0.08] prose-code:text-primary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[0.875em] prose-code:font-semibold prose-pre:overflow-x-auto prose-img:rounded-xl prose-hr:border-none">
      <MDXRemote {...source} components={mdxComponents as any} />
    </article>
  );
}
