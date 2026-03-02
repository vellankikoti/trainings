"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { mdxComponents } from "@/lib/mdx-components";

interface LessonContentProps {
  source: MDXRemoteSerializeResult;
}

export function LessonContent({ source }: LessonContentProps) {
  return (
    <article className="prose prose-lg prose-neutral dark:prose-invert max-w-[42rem] prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h4:text-lg prose-p:leading-relaxed prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-pre:my-6 prose-pre:p-0 prose-pre:rounded-xl prose-pre:bg-[hsl(215,28%,10%)] prose-code:before:content-[''] prose-code:after:content-[''] prose-code:bg-primary/10 prose-code:text-primary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[0.875em] prose-code:font-medium prose-pre:overflow-x-auto prose-table:overflow-x-auto prose-img:rounded-xl prose-li:marker:text-primary prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:rounded-r-lg prose-hr:border-border">
      <MDXRemote {...source} components={mdxComponents as any} />
    </article>
  );
}
